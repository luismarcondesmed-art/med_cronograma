import { GoogleGenAI, Type } from "@google/genai";
import { AILessonContent, QuizItem } from "../types";

// A chave será injetada pelo Vite (local) ou Vercel (produção) via 'define' no vite.config.ts
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.length > 0) {
  ai = new GoogleGenAI({ apiKey: apiKey });
} else {
  console.warn("Gemini API Key is missing or empty. AI features will be disabled.");
}

const BASE_SYSTEM_PROMPT = `
  Você é um preceptor de residência médica de excelência.
  Baseie-se em evidências (UpToDate, SBP, Nelson).
  Seja direto, técnico e didático.
`;

export async function generateStudyContent(topic: string, pdfBase64?: string): Promise<AILessonContent | null> {
  if (!ai) {
    console.error("AI Service not initialized: Missing API Key");
    return null;
  }

  try {
    const parts: any[] = [];
    const prompt = `
      Gere uma revisão completa sobre: "${topic}".
      Estrutura: Epidemiologia, Fisiopatologia, Quadro Clínico, Exame Físico, Diagnóstico, Tratamento, Prognóstico, Evidências Recentes, Resumo.
      Inclua 3 perguntas de fixação simples no final.
    `;

    if (pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
      parts.push({ text: "Analise o PDF e integre na revisão. " + prompt });
    } else {
      parts.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: { parts: parts },
      config: {
        systemInstruction: BASE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            epidemiology: { type: Type.STRING },
            pathophysiology: { type: Type.STRING },
            clinicalPicture: { type: Type.STRING },
            physicalExam: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            treatment: { type: Type.STRING },
            prognosis: { type: Type.STRING },
            recentEvidence: { type: Type.STRING },
            summary: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            }
          },
          required: ["summary", "clinicalPicture", "diagnosis", "treatment"]
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as AILessonContent;
    return null;

  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function generateResidencyQuiz(topic: string): Promise<QuizItem[] | null> {
  if (!ai) return null;

  try {
    const prompt = `
      Crie uma prova de residência médica simulada sobre "${topic}".
      Requisitos: 10 Questões de múltipla escolha (estilo USP, UNIFESP), Nível Difícil.
      A "answer" deve conter a alternativa correta e explicação.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as QuizItem[];
    return null;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
}