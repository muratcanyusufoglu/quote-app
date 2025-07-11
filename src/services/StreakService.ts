import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayString, getYesterdayString } from "../utils/dailyReset";

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
   * Check streak status when app opens
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
      const shouldShowModal = modalShownToday !== today;

      let newStreak = currentStreak;
      let isStreakContinued = true;
      let isNewStreak = false;

      console.log("🔥 Checking streak status:", {
        today,
        yesterday,
        lastReadDate,
        currentStreak,
        modalShownToday,
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

      if (lastReadDate === today) {
        // User already read today - streak continues
        console.log("✅ User already read today - streak continues");
        isStreakContinued = true;
      } else if (lastReadDate === yesterday) {
        // User read yesterday but not today yet - streak can continue
        console.log("⏰ User read yesterday - streak can continue");
        isStreakContinued = true;
      } else {
        // User missed a day - streak is broken
        console.log("💔 User missed a day - streak is broken");
        newStreak = 0;
        isStreakContinued = false;
      }

      // Determine if this is a new streak start
      if (newStreak === 1 && lastReadDate === today) {
        isNewStreak = true;
      }

      const result: StreakStatus = {
        currentStreak: newStreak,
        isStreakContinued,
        shouldShowModal:
          shouldShowModal && (newStreak > 0 || !isStreakContinued),
        isNewStreak,
      };

      console.log("🔥 Streak status result:", result);
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
  ): Promise<{ newStreak: number; shouldShowModal: boolean }> {
    try {
      const today = getTodayString();
      const yesterday = getYesterdayString();

      let newStreak = currentStreak;
      let shouldShowModal = false;

      if (lastReadDate !== today) {
        // User is reading for the first time today
        if (lastReadDate === yesterday) {
          // Consecutive day - increment streak
          newStreak = currentStreak + 1;
          shouldShowModal = true;
        } else if (!lastReadDate) {
          // First ever read
          newStreak = 1;
          shouldShowModal = true;
        } else {
          // Missed days - start new streak
          newStreak = 1;
          shouldShowModal = true;
        }

        // Check if modal was already shown today
        const modalShownToday = await AsyncStorage.getItem(
          STREAK_MODAL_SHOWN_KEY
        );
        if (modalShownToday === today) {
          shouldShowModal = false;
        }
      }

      console.log("📖 Streak updated on read:", {
        lastReadDate,
        today,
        currentStreak,
        newStreak,
        shouldShowModal,
      });

      return { newStreak, shouldShowModal };
    } catch (error) {
      console.error("Error updating streak on read:", error);
      return { newStreak: currentStreak, shouldShowModal: false };
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
