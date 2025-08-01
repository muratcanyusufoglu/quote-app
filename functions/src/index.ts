import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineString } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";

// Environment variable tanımlama
const geminiApiKey = defineString("GEMINI_API_KEY");

interface MoodRequest {
  mood: string;
  energy: string;
  affecting: string;
  language:
    | "en"
    | "tr"
    | "fr"
    | "es"
    | "de"
    | "it"
    | "pt"
    | "ru"
    | "nl"
    | "id"
    | "ja"
    | "th"
    | "ms";
}

export const generateMoodMotivation = onCall<MoodRequest>(
  {
    cors: true,
    memory: "512MiB",
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  async (request) => {
    try {
      // Optional authentication check (can be enabled in production)
      const userId = request.auth?.uid || "anonymous";

      console.log(`Request from user: ${userId}`);

      const { mood, energy, affecting, language } = request.data;

      // Input validation
      if (!mood || !energy || !affecting || !language) {
        throw new HttpsError("invalid-argument", "Missing required fields");
      }

      console.log(
        `Generating motivation for user ${userId}: ${mood}, ${energy}, ${affecting}, ${language}`
      );

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create personalized prompt
      const prompt = createMoodPrompt(mood, energy, affecting, language);

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const message = response.text();

      console.log(`Generated motivation: ${message.substring(0, 100)}...`);

      return {
        message: message,
        timestamp: new Date().toISOString(),
        mood: mood,
        energy: energy,
        affecting: affecting,
        language: language,
      };
    } catch (error: any) {
      console.error("Mood motivation generation error:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to generate motivation message");
    }
  }
);

function createMoodPrompt(
  mood: string,
  energy: string,
  affecting: string,
  language: string
): string {
  const prompts: Record<string, string> = {
    en: `You are a wise, empathetic life coach. Create a personalized, uplifting message for someone who:
- Is feeling: ${mood}
- Has energy level: ${energy}  
- Is most affected by: ${affecting} today

Requirements:
- 2-3 sentences maximum
- Encouraging and actionable
- Acknowledge their current state
- Provide practical next step
- Warm, supportive tone

Generate the motivational message:`,

    tr: `Sen bilge, anlayışlı bir yaşam koçusun. Şu durumda olan birisi için kişiselleştirilmiş, cesaret verici bir mesaj oluştur:
- Hissediyor: ${mood}
- Enerji seviyesi: ${energy}
- Bugün en çok etkileyen: ${affecting}

Gereksinimler:
- En fazla 2-3 cümle
- Cesaret verici ve uygulanabilir
- Mevcut durumunu kabul et
- Pratik bir sonraki adım ver
- Sıcak, destekleyici ton

Motivasyon mesajını oluştur:`,

    fr: `Tu es un coach de vie sage et empathique. Crée un message personnalisé et encourageant pour quelqu'un qui:
- Se sent: ${mood}
- A un niveau d'énergie: ${energy}
- Est le plus affecté par: ${affecting} aujourd'hui

Exigences:
- 2-3 phrases maximum
- Encourageant et actionnable
- Reconnaître leur état actuel
- Fournir une étape pratique suivante
- Ton chaleureux et de soutien

Génère le message motivationnel:`,

    es: `Eres un coach de vida sabio y empático. Crea un mensaje personalizado y alentador para alguien que:
- Se siente: ${mood}
- Tiene nivel de energía: ${energy}
- Está más afectado por: ${affecting} hoy

Requisitos:
- Máximo 2-3 oraciones
- Alentador y accionable
- Reconocer su estado actual
- Proporcionar un paso práctico siguiente
- Tono cálido y de apoyo

Genera el mensaje motivacional:`,

    de: `Du bist ein weiser, einfühlsamer Lebenscoach. Erstelle eine personalisierte, aufbauende Nachricht für jemanden, der:
- Sich fühlt: ${mood}
- Energielevel hat: ${energy}
- Am meisten betroffen ist von: ${affecting} heute

Anforderungen:
- Maximal 2-3 Sätze
- Ermutigend und umsetzbar
- Aktuellen Zustand anerkennen
- Praktischen nächsten Schritt geben
- Warmer, unterstützender Ton

Generiere die Motivationsnachricht:`,

    // Diğer diller için benzer pattern...
  };

  return prompts[language] || prompts.en;
}
