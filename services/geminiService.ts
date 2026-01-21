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
  Você é um preceptor sênior de residência médica de pediatria em um hospital universitário de ponta.
  
  DIRETRIZES DE CONTEÚDO:
  1. Baseie-se estritamente em evidências (UpToDate, Tratado SBP, Nelson, Protocolos Ministério da Saúde).
  2. Seja extremamente técnico, mas didático. Use termos médicos precisos.
  3. Estruture o texto como "Anotações de Aula de Alta Performance": use tópicos, bullet points e hierarquia clara de conceitos.
  4. Se um PDF for fornecido, extraia TODAS as informações relevantes dele, integrando com seu conhecimento prévio. O PDF é a fonte primária.
`;

export async function generateStudyContent(topic: string, pdfBase64?: string): Promise<AILessonContent | null> {
  if (!ai) {
    console.error("AI Service not initialized: Missing API Key");
    return null;
  }

  try {
    const parts: any[] = [];
    
    let promptText = `
      Gere um RESUMO DE ESTUDO COMPLETO sobre: "${topic}".
      
      ESTRUTURA OBRIGATÓRIA (Siga esta ordem):
      1. Resumo Executivo (Conceitos chave em 1 parágrafo).
      2. Epidemiologia & Fatores de Risco.
      3. Fisiopatologia (Mecanismos detalhados).
      4. Quadro Clínico (Sinais, sintomas, apresentações típicas e atípicas).
      5. Exame Físico (O que buscar ativamente).
      6. Diagnóstico (Critérios, exames complementares, ouro padrão).
      7. Tratamento & Conduta (Doses, fluxogramas, primeira linha, segunda linha).
      8. Prognóstico & Seguimento.
      9. Evidências Recentes / Atualizações (Últimos 5 anos).
    `;

    if (pdfBase64) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
      promptText += `
        \nCONTEXTO DO PDF ANEXADO:
        O usuário anexou um material de estudo (ex: slide de aula, capítulo de livro).
        Sua prioridade máxima é extrair, organizar e explicar o conteúdo deste PDF.
        Se o PDF mencionar fluxogramas ou classificações específicas, transcreva-os em formato de texto estruturado.
        Complemente lacunas do PDF com literatura médica padrão ouro, mas sinalize o que veio do material.
      `;
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Usando modelo mais rápido e capaz para textos longos
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
          },
          required: ["summary", "clinicalPicture", "diagnosis", "treatment", "pathophysiology"]
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

export async function generateResidencyQuiz(topic: string, pdfBase64?: string): Promise<QuizItem[] | null> {
  if (!ai) return null;

  try {
    const parts: any[] = [];

    const prompt = `
      Crie um SIMULADO DE PROVA DE RESIDÊNCIA MÉDICA sobre "${topic}".
      
      REQUISITOS:
      1. Gere exatamente 5 questões de múltipla escolha.
      2. Nível: Difícil (R1/R3). Estilo USP-SP, UNIFESP, IAMSPE.
      3. O formato deve ser estruturado para renderização no front-end.
      4. As alternativas devem ser plausíveis (distratores inteligentes).
      5. A explicação deve ser DETALHADA e DIDÁTICA, explicando por que a correta é correta e por que as outras estão erradas.
    `;

    if (pdfBase64) {
       parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
       parts.push({ text: prompt + " Utilize o conteúdo do PDF anexo como base para formular as questões, cobrindo os pontos principais abordados no material." });
    } else {
       parts.push({ text: prompt });
    }

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
              question: { type: Type.STRING, description: "O enunciado da questão." },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista com 4 ou 5 alternativas de resposta."
              },
              correctAnswer: { type: Type.STRING, description: "Apenas o texto da alternativa correta (deve ser idêntico a uma das options)." },
              explanation: { type: Type.STRING, description: "Explicação detalhada do gabarito." }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
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