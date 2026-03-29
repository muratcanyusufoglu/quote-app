import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { streakService, StreakStatus } from "../services/StreakService";
import { useQuoteSelectors } from "../store/useQuoteStore";
import { useAnalytics } from "./useAnalytics";

// Global state for debug panel access
let globalStreakFunctions: {
  showStreakContinue: (count?: number) => void;
  showStreakBreak: (count?: number) => void;
} | null = null;

export interface StreakModalState {
  visible: boolean;
  streakCount: number;
  isStreakContinued: boolean;
}

export function useStreak() {
  const [modalState, setModalState] = useState<StreakModalState>({
    visible: false,
    streakCount: 0,
    isStreakContinued: true,
  });

  const currentStreak = useQuoteSelectors.currentStreak();
  const lastReadDate = useQuoteSelectors.lastReadDate();
  const hasHydrated = useQuoteSelectors.hasHydrated();
  const actions = useQuoteSelectors.actions();

  const { trackDailyStreak, trackUserAction } = useAnalytics();

  // Check streak status when app becomes active and show modal if needed
  const checkStreakOnAppOpen = useCallback(async () => {
    if (!hasHydrated) return;

    try {
      console.log("🔥 Checking streak on app open...");

      const streakStatus: StreakStatus =
        await streakService.checkStreakOnAppOpen(currentStreak, lastReadDate);

      console.log("🔥 Streak status on app open:", streakStatus);

      // Show modal if needed (especially for break situations)
      if (streakStatus.shouldShowModal) {
        // Ensure streak count is always at least 1 for display
        const displayStreakCount = Math.max(
          1,
          streakStatus.currentStreak || currentStreak || 1
        );
        
        console.log("🔥 Setting modal state:", {
          displayStreakCount,
          originalStreak: streakStatus.currentStreak,
          currentStreak,
          isStreakContinued: streakStatus.isStreakContinued,
        });

        setModalState({
          visible: true,
          streakCount: displayStreakCount,
          isStreakContinued: streakStatus.isStreakContinued,
        });

        // Track analytics
        if (streakStatus.isStreakContinued) {
          trackDailyStreak(streakStatus.currentStreak || currentStreak);
          trackUserAction({
            action_type: "favorite_add",
            item_id: "streak_continued",
            new_value: (streakStatus.currentStreak || currentStreak).toString(),
          });
        } else {
          trackUserAction({
            action_type: "favorite_remove",
            item_id: "streak_broken",
            old_value: currentStreak.toString(),
          });
        }

        // Mark modal as shown
        await streakService.markModalShown();
      }
    } catch (error) {
      console.error("Error checking streak on app open:", error);
    }
  }, [
    hasHydrated,
    currentStreak,
    lastReadDate,
    trackDailyStreak,
    trackUserAction,
  ]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App became active, check streak
        checkStreakOnAppOpen();
      }
    };

    // Check streak immediately when hook mounts and store is hydrated
    if (hasHydrated) {
      checkStreakOnAppOpen();
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [hasHydrated, checkStreakOnAppOpen]);

  // Handle streak update when user reads a quote (no modal)
  const updateStreakOnRead = useCallback(async () => {
    try {
      // Önceki streak değerini kaydet
      const previousStreak = currentStreak;

      // Store'daki streak'i güncelle
      actions.updateStreak();

      // StreakService'den modal bilgisini al (şimdilik basit tutalım)
      const result = await streakService.updateStreakOnRead(
        lastReadDate,
        previousStreak
      );

      console.log("🔥 Streak update on read:", {
        previousStreak,
        newStreak: result.newStreak,
        isBreak: result.isBreak,
        lastReadDate,
      });

      // Okuma yaptığında modal göstermiyoruz - sadece app açıldığında gösteriyoruz
      // Analytics için track edelim ama modal gösterme

      // Track analytics silently
      if (!result.isBreak) {
        trackDailyStreak(result.newStreak);
        trackUserAction({
          action_type: "favorite_add",
          item_id: "streak_continued",
          new_value: result.newStreak.toString(),
        });
      } else {
        trackUserAction({
          action_type: "favorite_remove",
          item_id: "streak_broken",
          old_value: previousStreak.toString(),
        });
      }

      return result.newStreak;
    } catch (error) {
      console.error("Error updating streak on read:", error);
      return currentStreak;
    }
  }, [lastReadDate, currentStreak, trackDailyStreak, trackUserAction, actions]);

  // Close modal
  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));

    trackUserAction({
      action_type: "favorite_remove", // Using existing action type as placeholder
      item_id: "streak_modal_closed",
    });
  }, [trackUserAction]);

  // Get streak statistics
  const getStreakStats = useCallback(async () => {
    return await streakService.getStreakStats();
  }, []);

  // Check if streak warning should be sent
  const shouldSendStreakWarning = useCallback(async () => {
    return await streakService.shouldSendStreakWarning();
  }, []);

  // Reset daily tracking (useful for testing or admin purposes)
  const resetDailyTracking = useCallback(async () => {
    await streakService.resetDailyTracking();
  }, []);

  // Manual trigger functions for debugging/testing
  const showStreakContinue = useCallback((count: number = 3) => {
    const displayCount = Math.max(1, count);
    console.log(
      "🔥 useStreak: Showing streak continue modal with count:",
      displayCount
    );
    setModalState({
      visible: true,
      streakCount: displayCount,
      isStreakContinued: true,
    });

    // Mark modal as shown for testing
    streakService.markModalShown();
  }, []);

  const showStreakBreak = useCallback((count: number = 0) => {
    // Always show at least 1 even for break
    const displayCount = Math.max(1, count);
    console.log("💔 useStreak: Showing streak break modal with count:", displayCount);
    setModalState({
      visible: true,
      streakCount: displayCount,
      isStreakContinued: false,
    });

    // Mark modal as shown for testing
    streakService.markModalShown();
  }, []);

  // Update global functions for debug panel access
  useEffect(() => {
    globalStreakFunctions = {
      showStreakContinue,
      showStreakBreak,
    };
  }, [showStreakContinue, showStreakBreak]);

  return {
    // Modal state
    modalState,
    closeModal,

    // Current streak info
    currentStreak,
    lastReadDate,

    // Actions
    updateStreakOnRead,
    checkStreakOnAppOpen,

    // Debug/Manual triggers
    showStreakContinue,
    showStreakBreak,

    // Utils
    getStreakStats,
    shouldSendStreakWarning,
    resetDailyTracking,

    // State
    isReady: hasHydrated,
  };
}

// Export global functions for debug panel access
export const getGlobalStreakFunctions = () => globalStreakFunctions;
