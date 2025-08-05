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

  // Check streak status when app becomes active
  const checkStreakOnAppOpen = useCallback(async () => {
    if (!hasHydrated) return;

    try {
      console.log("🔥 Checking streak on app open...");

      const streakStatus: StreakStatus =
        await streakService.checkStreakOnAppOpen(currentStreak, lastReadDate);

      console.log("🔥 Streak status:", streakStatus);

      // Update store if streak changed
      if (streakStatus.currentStreak !== currentStreak) {
        // Note: We don't directly update the store here as it should be done
        // when user actually reads a quote, but we can track analytics
        console.log(
          `🔥 Streak would change from ${currentStreak} to ${streakStatus.currentStreak}`
        );
      }

      // Show modal if needed
      if (streakStatus.shouldShowModal) {
        setModalState({
          visible: true,
          streakCount: streakStatus.currentStreak || currentStreak,
          isStreakContinued: streakStatus.isStreakContinued,
        });

        // Track analytics
        if (streakStatus.isStreakContinued) {
          trackDailyStreak(streakStatus.currentStreak || currentStreak);
          trackUserAction({
            action_type: "favorite_add", // Using existing action type as placeholder
            item_id: "streak_continued",
            new_value: (streakStatus.currentStreak || currentStreak).toString(),
          });
        } else {
          trackUserAction({
            action_type: "favorite_remove", // Using existing action type as placeholder
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

  // Handle streak update when user reads a quote
  const updateStreakOnRead = useCallback(async () => {
    try {
      const result = await streakService.updateStreakOnRead(
        lastReadDate,
        currentStreak
      );

      if (result.shouldShowModal) {
        setModalState({
          visible: true,
          streakCount: result.newStreak,
          isStreakContinued: true, // Always true when reading
        });

        // Track analytics
        trackDailyStreak(result.newStreak);
        trackUserAction({
          action_type: "favorite_add", // Using existing action type as placeholder
          item_id: "streak_updated",
          new_value: result.newStreak.toString(),
        });

        // Mark modal as shown
        await streakService.markModalShown();
      }

      return result.newStreak;
    } catch (error) {
      console.error("Error updating streak on read:", error);
      return currentStreak;
    }
  }, [lastReadDate, currentStreak, trackDailyStreak, trackUserAction]);

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
    console.log(
      "🔥 useStreak: Showing streak continue modal with count:",
      count
    );
    setModalState({
      visible: true,
      streakCount: count,
      isStreakContinued: true,
    });
  }, []);

  const showStreakBreak = useCallback((count: number = 0) => {
    console.log("💔 useStreak: Showing streak break modal with count:", count);
    setModalState({
      visible: true,
      streakCount: count,
      isStreakContinued: false,
    });
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
