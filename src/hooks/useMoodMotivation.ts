import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { aiService } from "../services/AIService";
import { MoodRequest } from "../services/MoodMotivationService";

export interface UseMoodMotivationReturn {
  isLoading: boolean;
  generatedMessage: string | null;
  error: string | null;
  generateMotivation: (request: MoodRequest) => Promise<void>;
  clearMessage: () => void;
}

const STORAGE_KEY = "mood_motivation_usage"; // { date: 'YYYY-MM-DD', count: number }
const MAX_DAILY_USES = 5;

export function useMoodMotivation(): UseMoodMotivationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const incrementDailyUsage = async (): Promise<{
    allowed: boolean;
    remaining: number;
  }> => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let data: { date: string; count: number } = raw
        ? JSON.parse(raw)
        : { date: today, count: 0 };

      if (data.date !== today) {
        data = { date: today, count: 0 };
      }

      if (data.count >= MAX_DAILY_USES) {
        return { allowed: false, remaining: 0 };
      }

      data.count += 1;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return {
        allowed: true,
        remaining: Math.max(0, MAX_DAILY_USES - data.count),
      };
    } catch (e) {
      // On storage failure, fail open but don't crash UI
      return { allowed: true, remaining: MAX_DAILY_USES };
    }
  };

  const getRemainingForToday = async (): Promise<number> => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return MAX_DAILY_USES;
      const data = JSON.parse(raw) as { date: string; count: number };
      if (data.date !== today) return MAX_DAILY_USES;
      return Math.max(0, MAX_DAILY_USES - data.count);
    } catch {
      return MAX_DAILY_USES;
    }
  };

  const generateMotivation = useCallback(async (request: MoodRequest) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMessage(null);

    try {
      // Enforce per-day limit
      const remainingBefore = await getRemainingForToday();
      if (remainingBefore <= 0) {
        const limitMsg: Record<string, string> = {
          en: "You've reached today's AI motivation limit (5). Try again tomorrow.",
          tr: "Bugünkü AI motivasyon limitine (5) ulaştın. Yarın tekrar dene.",
        };
        setGeneratedMessage(limitMsg[request.language] || limitMsg.en);
        setIsLoading(false);
        return;
      }

      const { allowed } = await incrementDailyUsage();
      if (!allowed) {
        const limitMsg: Record<string, string> = {
          en: "You've reached today's AI motivation limit (5). Try again tomorrow.",
          tr: "Bugünkü AI motivasyon limitine (5) ulaştın. Yarın tekrar dene.",
        };
        setGeneratedMessage(limitMsg[request.language] || limitMsg.en);
        setIsLoading(false);
        return;
      }

      console.log(
        "🧠 Generating mood-based motivation via AIService...",
        request
      );

      // Convert MoodRequest to format expected by AIService (MoodResponse format)
      const moodResponse = {
        message: "", // Not used in buildPrompt
        timestamp: new Date().toISOString(),
        mood: request.mood,
        energy: request.energy,
        affecting: request.affecting,
        language: request.language,
      };

      const result = await aiService.generateMoodBasedMotivation(moodResponse);

      if (result.success && result.message) {
        setGeneratedMessage(result.message);
        console.log(
          "✅ AI generated motivation successfully:",
          result.message.substring(0, 100) + "..."
        );
      } else {
        console.error("❌ AI generation failed:", result.error);
        throw new Error(result.error || "Failed to generate motivation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate motivation";
      setError(errorMessage);
      console.error("❌ Mood motivation error:", err);

      // Show clear error message to indicate API configuration needed
      const apiErrorMessages: Record<string, string> = {
        en: "🔧 AI motivation is being configured. Until then, here's your reminder: You have the strength to overcome any challenge. Take a deep breath and take the first small step forward. 💪",
        tr: "🔧 AI motivasyon sistemi yapılandırılıyor. O zamana kadar şunu unutma: Her zorluğun üstesinden gelecek güce sahipsin. Derin bir nefes al ve ileriye doğru küçük bir adım at. 💪",
      };

      const configMessage =
        apiErrorMessages[request.language] || apiErrorMessages.en;
      setGeneratedMessage(configMessage);
      console.log("🔄 Using configuration message - API key needed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setGeneratedMessage(null);
    setError(null);
  }, []);

  return {
    isLoading,
    generatedMessage,
    error,
    generateMotivation,
    clearMessage,
  };
}
