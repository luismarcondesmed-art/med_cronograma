import { GoogleGenAI, Type } from "@google/genai";
import { AILessonContent, QuizItem } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.length > 0) {
  ai = new GoogleGenAI({ apiKey: apiKey });
} else {
  console.warn("Gemini API Key is missing or empty. AI features will be disabled.");
}

const BASE_SYSTEM_PROMPT = `
  Você é um preceptor sênior de residência médica de pediatria.
  Seu objetivo é ensinar estudantes de medicina e residentes com precisão técnica.
  
  REGRAS DE OURO:
  1. FOCO TOTAL NO TÓPICO: O conteúdo gerado deve ser EXCLUSIVAMENTE sobre o tópico solicitado. Se o tópico for "Aleitamento Materno", NÃO gere questões sobre pneumonia, mesmo que o PDF contenha outros assuntos.
  2. Baseie-se em evidências (SBP, UpToDate, Nelson, Ministério da Saúde).
  3. Retorne APENAS JSON válido. O JSON deve ser puro, sem blocos de markdown (\`\`\`json).
`;

// Helper para limpar a resposta do Gemini
function cleanJsonResponse(text: string): string {
  // Remove blocos de código markdown se existirem (```json ... ```)
  let clean = text.replace(/```json/g, "").replace(/```/g, "");
  // Remove qualquer texto antes do primeiro '{' ou '[' (caso o modelo explique algo antes)
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

export async function generateStudyContent(topic: string, pdfBase64?: string): Promise<AILessonContent | null> {
  if (!ai) {
    console.error("AI Service not initialized");
    return null;
  }

  try {
    const parts: any[] = [];
    
    let promptText = `
      TÓPICO DA AULA: "${topic}".
      
      Gere um RESUMO estruturado e didático para estudo sobre este tópico.
    `;

    if (pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
      promptText += "\n\nO usuário anexou um PDF. Priorize as informações deste arquivo SE elas forem pertinentes ao TÓPICO DA AULA. Caso contrário, priorize a literatura médica padrão.";
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: parts },
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
        return JSON.parse(cleanText) as AILessonContent;
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", parseError, response.text);
        return null;
      }
    }
    return null;

  } catch (error) {
    console.error("Gemini Content Error:", error);
    return null;
  }
}

export async function generateResidencyQuiz(topic: string, pdfBase64?: string): Promise<QuizItem[] | null> {
  if (!ai) return null;

  try {
    const parts: any[] = [];

    let promptText = `
      TÓPICO: "${topic}".
      
      Crie 5 questões de múltipla escolha estilo PROVA DE RESIDÊNCIA (R1 ou R3) EXCLUSIVAMENTE sobre "${topic}".
      
      REQUISITOS:
      1. As questões devem ser difíceis, com cenários clínicos ou cobrança de protocolos específicos.
      2. NUNCA gere questões sobre outros temas. Se o tópico é "${topic}", todas as 5 questões devem ser sobre isso.
      3. As alternativas devem ser claras.
    `;

    if (pdfBase64) {
       parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
       promptText += " Utilize o conteúdo do PDF anexo APENAS se estiver relacionado ao tópico.";
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: parts },
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
        return JSON.parse(cleanText) as QuizItem[];
      } catch (parseError) {
        console.error("Failed to parse Gemini Quiz JSON:", parseError, response.text);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
}