import { useCallback, useState } from "react";
import { aiService } from "../services/AIService";
import { useTranslation } from "./useTranslation";

interface MoodResponse {
  feeling: string;
  energy: string;
  affecting: string;
}

interface UseMoodMotivationReturn {
  isModalVisible: boolean;
  isGenerating: boolean;
  generatedMessage: string;
  showModal: () => void;
  hideModal: () => void;
  handleMoodComplete: (moodResponse: MoodResponse) => Promise<void>;
  handleTryDifferent: () => Promise<void>;
  handleShare: () => void;
  handleClose: () => void;
  lastMoodResponse: MoodResponse | null;
}

export function useMoodMotivation(): UseMoodMotivationReturn {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [lastMoodResponse, setLastMoodResponse] = useState<MoodResponse | null>(
    null
  );
  const { t } = useTranslation();

  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    setGeneratedMessage("");
    setLastMoodResponse(null);
  }, []);

  const generateMessage = useCallback(
    async (moodResponse: MoodResponse): Promise<string> => {
      setIsGenerating(true);

      try {
        const result = await aiService.generateMoodBasedMotivation(
          moodResponse
        );

        if (result.success && result.message) {
          return result.message;
        } else {
          throw new Error(result.error || "Failed to generate message");
        }
      } catch (error) {
        console.error("Error generating mood-based motivation:", error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const handleMoodComplete = useCallback(
    async (moodResponse: MoodResponse) => {
      try {
        setLastMoodResponse(moodResponse);
        setIsModalVisible(false);

        const message = await generateMessage(moodResponse);
        setGeneratedMessage(message);

        console.log("✅ Mood-based motivation generated:", message);
      } catch (error) {
        console.error("❌ Failed to generate mood-based motivation:", error);
        // You could show an error toast here
      }
    },
    [generateMessage]
  );

  const handleTryDifferent = useCallback(async () => {
    if (!lastMoodResponse) {
      console.warn("No previous mood response to retry with");
      return;
    }

    try {
      const message = await generateMessage(lastMoodResponse);
      setGeneratedMessage(message);

      console.log("✅ New mood-based motivation generated:", message);
    } catch (error) {
      console.error("❌ Failed to generate new mood-based motivation:", error);
      // You could show an error toast here
    }
  }, [lastMoodResponse, generateMessage]);

  const handleShare = useCallback(() => {
    // Share functionality is handled in the AIMessageCard component
    console.log("📤 Sharing mood-based motivation message");
  }, []);

  const handleClose = useCallback(() => {
    setGeneratedMessage("");
    setLastMoodResponse(null);
  }, []);

  return {
    isModalVisible,
    isGenerating,
    generatedMessage,
    showModal,
    hideModal,
    handleMoodComplete,
    handleTryDifferent,
    handleShare,
    handleClose,
    lastMoodResponse,
  };
}
