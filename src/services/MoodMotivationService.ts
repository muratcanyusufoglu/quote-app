import { httpsCallable } from "firebase/functions";
import { Language } from "../types";
import { functions } from "./firebase";

export interface MoodRequest {
  mood: string;
  energy: string;
  affecting: string;
  language: Language;
  userName?: string; // User's name for personalization
}

export interface MoodResponse {
  message: string;
  timestamp: string;
  mood: string;
  energy: string;
  affecting: string;
  language: Language;
  userName?: string; // User's name for personalization
}

class MoodMotivationService {
  private generateMoodMotivation = httpsCallable<MoodRequest, MoodResponse>(
    functions,
    "generateMoodMotivation"
  );

  async generateMotivation(request: MoodRequest): Promise<string> {
    try {
      console.log("🧠 Generating mood-based motivation...", request);

      const result = await this.generateMoodMotivation(request);
      const response = result.data;

      console.log(
        "✅ Generated motivation:",
        response.message.substring(0, 100) + "..."
      );
      return response.message;
    } catch (error) {
      console.error("❌ Failed to generate motivation:", error);

      // Fallback messages in different languages
      const fallbackMessages: Record<Language, string> = {
        en: "You have the strength to overcome any challenge. Take a deep breath and take the first small step forward. 💪",
        tr: "Her zorluğun üstesinden gelecek güce sahipsin. Derin bir nefes al ve ileriye doğru küçük bir adım at. 💪",
        fr: "Tu as la force de surmonter tout défi. Respire profondément et fais le premier petit pas en avant. 💪",
        es: "Tienes la fuerza para superar cualquier desafío. Respira profundamente y da el primer pequeño paso adelante. 💪",
        de: "Du hast die Kraft, jede Herausforderung zu meistern. Atme tief durch und mache den ersten kleinen Schritt vorwärts. 💪",
        it: "Hai la forza di superare qualsiasi sfida. Respira profondamente e fai il primo piccolo passo avanti. 💪",
        pt: "Você tem a força para superar qualquer desafio. Respire fundo e dê o primeiro pequeno passo em frente. 💪",
        ru: "У тебя есть сила преодолеть любой вызов. Сделай глубокий вдох и сделай первый маленький шаг вперёд. 💪",
        nl: "Je hebt de kracht om elke uitdaging te overwinnen. Adem diep in en zet de eerste kleine stap voorwaarts. 💪",
        id: "Kamu memiliki kekuatan untuk mengatasi tantangan apapun. Tarik napas dalam dan ambil langkah kecil pertama ke depan. 💪",
        ja: "どんな困難も乗り越える力があなたにはあります。深呼吸をして、前向きな小さな一歩を踏み出しましょう。💪",
        th: "คุณมีพลังที่จะเอาชนะความท้าทายใดๆ สูดลมหายใจลึกๆ แล้วก้าวแรกเล็กๆ ไปข้างหน้า 💪",
        ms: "Anda mempunyai kekuatan untuk mengatasi sebarang cabaran. Tarik nafas dalam-dalam dan ambil langkah kecil pertama ke hadapan. 💪",
      };

      return fallbackMessages[request.language] || fallbackMessages.en;
    }
  }
}

export const moodMotivationService = new MoodMotivationService();
