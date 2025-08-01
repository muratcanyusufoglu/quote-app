import { useCallback, useState } from "react";
import {
  moodMotivationService,
  MoodRequest,
} from "../services/MoodMotivationService";

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
      const message = await moodMotivationService.generateMotivation(request);
      setGeneratedMessage(message);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate motivation";
      setError(errorMessage);
      console.error("❌ Mood motivation error:", err);
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
