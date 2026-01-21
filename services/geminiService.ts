import { GoogleGenAI, Type } from "@google/genai";
import { AILessonContent, QuizItem } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

console.log("[DEBUG] Inicializando Gemini Service. API Key presente:", !!apiKey);

if (apiKey && apiKey.length > 0) {
  ai = new GoogleGenAI({ apiKey: apiKey });
} else {
  console.error("[CRITICAL] Gemini API Key is missing or empty.");
}

const BASE_SYSTEM_PROMPT = `
  Você é um preceptor sênior de residência médica de pediatria.
  Seu objetivo é ensinar estudantes de medicina e residentes com precisão técnica.
  
  REGRAS DE OURO:
  1. FOCO TOTAL NO TÓPICO: O conteúdo gerado deve ser EXCLUSIVAMENTE sobre o tópico solicitado.
  2. Baseie-se em evidências (SBP, UpToDate, Nelson, Ministério da Saúde).
  3. Retorne APENAS JSON válido. O JSON deve ser puro, sem blocos de markdown.
`;

// Helper para limpar a resposta do Gemini
function cleanJsonResponse(text: string): string {
  let clean = text.replace(/```json/g, "").replace(/```/g, "");
  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');
  
  let startIndex = 0;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIndex = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIndex = firstBrace;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
  }
  
  return clean.substring(startIndex).trim();
}

export async function generateStudyContent(topic: string): Promise<AILessonContent | null> {
  if (!ai) {
    console.error("[Gemini Error] Serviço AI não inicializado.");
    return null;
  }

  console.log(`[Gemini Request] Iniciando geração de RESUMO para: ${topic}`);

  try {
    const promptText = `
      TÓPICO DA AULA: "${topic}".
      Gere um RESUMO estruturado e didático para estudo sobre este tópico.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction: BASE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo do tópico." },
            epidemiology: { type: Type.STRING },
            pathophysiology: { type: Type.STRING },
            clinicalPicture: { type: Type.STRING },
            physicalExam: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            treatment: { type: Type.STRING },
            prognosis: { type: Type.STRING },
            recentEvidence: { type: Type.STRING },
          },
          required: ["summary", "clinicalPicture", "diagnosis", "treatment"]
        }
      }
    });

    if (response.text) {
      try {
        const cleanText = cleanJsonResponse(response.text);
        const data = JSON.parse(cleanText) as AILessonContent;
        console.log(`[Gemini Success] Resumo gerado com sucesso.`);
        return data;
      } catch (parseError) {
        console.error("[Gemini JSON Parse Error]", parseError, "Response Text:", response.text);
        return null;
      }
    } else {
      console.warn("[Gemini Warning] Resposta vazia recebida.");
    }
    return null;

  } catch (error: any) {
    console.error("[Gemini API Error - Content]", error.message, error);
    return null;
  }
}

export async function generateResidencyQuiz(topic: string): Promise<QuizItem[] | null> {
  if (!ai) return null;

  console.log(`[Gemini Request] Iniciando geração de QUIZ para: ${topic}`);

  try {
    const promptText = `
      TÓPICO: "${topic}".
      Crie 5 questões de múltipla escolha estilo PROVA DE RESIDÊNCIA (R1 ou R3) EXCLUSIVAMENTE sobre "${topic}".
      REQUISITOS: Dificuldade alta, cenários clínicos, alternativas claras.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: promptText }] },
      config: {
        systemInstruction: BASE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de 4 ou 5 alternativas de resposta."
              },
              correctAnswer: { type: Type.STRING, description: "O texto exato da alternativa correta." },
              explanation: { type: Type.STRING, description: "Comentário detalhado sobre o gabarito." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    if (response.text) {
      try {
        const cleanText = cleanJsonResponse(response.text);
        const data = JSON.parse(cleanText) as QuizItem[];
        console.log(`[Gemini Success] Quiz gerado com sucesso (${data.length} questões).`);
        return data;
      } catch (parseError) {
        console.error("[Gemini Quiz JSON Parse Error]", parseError, response.text);
        return null;
      }
    }
    return null;
  } catch (error: any) {
    console.error("[Gemini API Error - Quiz]", error.message, error);
    return null;
  }
}