import AsyncStorage from "@react-native-async-storage/async-storage";
import {getTodayString, getYesterdayString} from "../utils/dailyReset";

// Storage keys
const LAST_STREAK_CHECK_KEY = "last_streak_check";
const LAST_APP_OPEN_KEY = "last_app_open";
const STREAK_MODAL_SHOWN_KEY = "streak_modal_shown_today";

export interface StreakStatus {
  currentStreak: number;
  isStreakContinued: boolean;
  shouldShowModal: boolean;
  isNewStreak: boolean;
}

export class StreakService {
  private static instance: StreakService;

  private constructor() {}

  static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  /**
   * Check streak status when app opens and show modal if needed
   */
  async checkStreakOnAppOpen(
    currentStreak: number,
    lastReadDate: string
  ): Promise<StreakStatus> {
    try {
      const today = getTodayString();
      const yesterday = getYesterdayString();

      // Update last app open time
      await AsyncStorage.setItem(LAST_APP_OPEN_KEY, today);

      // Check if we already showed modal today
      const modalShownToday = await AsyncStorage.getItem(
        STREAK_MODAL_SHOWN_KEY
      );
      const hasModalShownToday = modalShownToday === today;

      console.log("🔥 Checking streak status on app open:", {
        today,
        yesterday,
        lastReadDate,
        currentStreak,
        hasModalShownToday,
      });

      if (!lastReadDate) {
        // First time user - no streak yet
        console.log("🌟 First time user - no streak to check");
        return {
          currentStreak: 0,
          isStreakContinued: true,
          shouldShowModal: false,
          isNewStreak: false,
        };
      }

      let newStreak = currentStreak;
      let isStreakContinued = true;
      let shouldShowModal = false;

      if (lastReadDate === today) {
        // User read today - streak continues
        // If streak is 0 or undefined, it means first read today, so streak = 1
        // If streak > 0, it means consecutive days, so keep the current streak
        // The streak should already be updated in the store when user reads
        newStreak = Math.max(1, currentStreak);
        isStreakContinued = true;
        console.log("✅ User read today - streak continues:", newStreak);
        // Bugün okuma yapmışsa ve modal bugün gösterilmemişse modal göster
        shouldShowModal = !hasModalShownToday;
      } else if (lastReadDate === yesterday) {
        // User read yesterday but not today yet
        // Streak should be 1 (yesterday was first day or continuation)
        // When they read today, it will become 2
        newStreak = Math.max(1, currentStreak);
        isStreakContinued = true;
        console.log("⏰ User read yesterday - can continue streak:", newStreak);
        // Dün okuma yapmışsa ve modal bugün gösterilmemişse modal göster
        shouldShowModal = !hasModalShownToday;
      } else {
        // User missed a day - streak is broken
        console.log("💔 User missed a day - streak is broken");
        // For display purposes, show 1 even when broken
        newStreak = 1;
        isStreakContinued = false;
        // Break durumu - modal göster
        shouldShowModal = !hasModalShownToday;
      }

      const result: StreakStatus = {
        currentStreak: newStreak,
        isStreakContinued,
        shouldShowModal,
        isNewStreak: false,
      };

      console.log("🔥 Streak status on app open result:", result);
      return result;
    } catch (error) {
      console.error("Error checking streak status:", error);
      return {
        currentStreak,
        isStreakContinued: true,
        shouldShowModal: false,
        isNewStreak: false,
      };
    }
  }

  /**
   * Mark streak modal as shown for today
   */
  async markModalShown(): Promise<void> {
    try {
      const today = getTodayString();
      await AsyncStorage.setItem(STREAK_MODAL_SHOWN_KEY, today);
      console.log("✅ Streak modal marked as shown for today");
    } catch (error) {
      console.error("Error marking modal as shown:", error);
    }
  }

  /**
   * Check if user should get a streak warning notification
   */
  async shouldSendStreakWarning(): Promise<boolean> {
    try {
      const lastAppOpen = await AsyncStorage.getItem(LAST_APP_OPEN_KEY);
      if (!lastAppOpen) return false;

      const today = new Date();
      const lastOpenDate = new Date(lastAppOpen);
      const daysDifference = Math.floor(
        (today.getTime() - lastOpenDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send warning if user hasn't opened app for 3+ days
      return daysDifference >= 3;
    } catch (error) {
      console.error("Error checking streak warning:", error);
      return false;
    }
  }

  /**
   * Calculate streak based on reading pattern
   */
  calculateStreak(lastReadDate: string, currentStreak: number): number {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (lastReadDate === today) {
      // Already read today, keep current streak
      return currentStreak;
    } else if (lastReadDate === yesterday) {
      // Read yesterday, can increment streak when they read today
      return currentStreak;
    } else {
      // Missed a day, reset streak
      return 0;
    }
  }

  /**
   * Update streak when user reads a quote
   */
  async updateStreakOnRead(
    lastReadDate: string,
    currentStreak: number
  ): Promise<{newStreak: number; shouldShowModal: boolean; isBreak: boolean}> {
    try {
      const today = getTodayString();
      const yesterday = getYesterdayString();

      let newStreak = currentStreak;
      let shouldShowModal = false;
      let isBreak = false;

      console.log("📖 StreakService.updateStreakOnRead called:", {
        lastReadDate,
        today,
        yesterday,
        currentStreak,
      });

      if (lastReadDate !== today) {
        // User is reading for the first time today
        if (lastReadDate === yesterday) {
          // Consecutive day - increment streak
          newStreak = currentStreak + 1;
          shouldShowModal = true;
          console.log("🔥 Consecutive day - streak incremented to:", newStreak);
        } else if (!lastReadDate) {
          // First ever read
          newStreak = 1;
          shouldShowModal = true;
          console.log("🌟 First ever read - streak started at 1");
        } else {
          // Missed days - check if it's a break
          if (currentStreak > 1) {
            isBreak = true;
            console.log("💔 Streak broken! Previous streak:", currentStreak);
          }
          newStreak = 1;
          shouldShowModal = true;
          console.log("💔 Missed days - streak reset to 1");
        }

        // Check if modal was already shown today
        const modalShownToday = await AsyncStorage.getItem(
          STREAK_MODAL_SHOWN_KEY
        );
        if (modalShownToday === today) {
          shouldShowModal = false;
          console.log("📱 Modal already shown today, won't show again");
        }
      } else {
        console.log("✅ Already read today, no streak update needed");
      }

      console.log("📖 Streak updated on read result:", {
        lastReadDate,
        today,
        currentStreak,
        newStreak,
        shouldShowModal,
        isBreak,
      });

      return {newStreak, shouldShowModal, isBreak};
    } catch (error) {
      console.error("Error updating streak on read:", error);
      return {newStreak: currentStreak, shouldShowModal: false, isBreak: false};
    }
  }

  /**
   * Reset daily modal tracking (can be called at midnight)
   */
  async resetDailyTracking(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STREAK_MODAL_SHOWN_KEY);
      console.log("🔄 Daily modal tracking reset");
    } catch (error) {
      console.error("Error resetting daily tracking:", error);
    }
  }

  /**
   * Get streak statistics for analytics
   */
  async getStreakStats(): Promise<{
    lastAppOpen: string | null;
    modalShownToday: boolean;
  }> {
    try {
      const lastAppOpen = await AsyncStorage.getItem(LAST_APP_OPEN_KEY);
      const modalShownKey = await AsyncStorage.getItem(STREAK_MODAL_SHOWN_KEY);
      const today = getTodayString();

      return {
        lastAppOpen,
        modalShownToday: modalShownKey === today,
      };
    } catch (error) {
      console.error("Error getting streak stats:", error);
      return {
        lastAppOpen: null,
        modalShownToday: false,
      };
    }
  }
}

// Export singleton instance
export const streakService = StreakService.getInstance();
