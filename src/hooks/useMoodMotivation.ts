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

export function useMoodMotivation(): UseMoodMotivationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMotivation = useCallback(async (request: MoodRequest) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMessage(null);

    try {
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
