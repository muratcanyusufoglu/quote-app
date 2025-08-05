import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { getStoreReviewService } from "../services/StoreReviewService";
import { usePremium } from "./usePremium";

interface UseStoreReviewReturn {
  // Check if we should request review
  shouldRequestReview: () => Promise<boolean>;

  // Request review (shows native dialog)
  requestReview: () => Promise<boolean>;

  // Data tracking
  incrementQuotesRead: () => Promise<void>;
  getReviewStats: () => Promise<any>;

  // Development helpers
  resetReviewData: () => Promise<void>;
}

/**
 * Hook for managing store review requests
 *
 * Conservative Strategy:
 * - Only ask PREMIUM users after purchase
 * - Wait for 10 quotes read + 3 days of usage
 * - 6-month cooldown between requests
 * - Max 2 requests per year
 * - Uses native expo-store-review dialog
 *
 * Usage:
 * const storeReview = useStoreReview();
 *
 * // After purchase success:
 * if (await storeReview.shouldRequestReview()) {
 *   await storeReview.requestReview();
 * }
 */
export function useStoreReview(): UseStoreReviewReturn {
  const { isPremium } = usePremium();
  const [quotesReadCount, setQuotesReadCount] = useState(0);
  const [daysSinceFirstLaunch, setDaysSinceFirstLaunch] = useState(0);

  const storeReviewService = getStoreReviewService();

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  /**
   * Initialize quotes count and days since first launch
   */
  const initializeData = useCallback(async () => {
    try {
      // Get quotes read count
      const quotesCount = await getQuotesReadCount();
      setQuotesReadCount(quotesCount);

      // Calculate days since first launch
      const days = await getDaysSinceFirstLaunch();
      setDaysSinceFirstLaunch(days);

      console.log(
        `📱 StoreReview: Initialized - ${quotesCount} quotes, ${days} days`
      );
    } catch (error) {
      console.error("❌ StoreReview: Error initializing data:", error);
    }
  }, []);

  /**
   * Check if we should show review request
   * Only for premium users who meet criteria
   */
  const shouldRequestReview = useCallback(async (): Promise<boolean> => {
    try {
      // ✅ Only premium users get review requests
      if (!isPremium) {
        console.log(
          "📱 StoreReview: User is not premium, skipping review request"
        );
        return false;
      }

      // ✅ Get latest data
      const currentQuotesRead = await getQuotesReadCount();
      const currentDaysSinceFirstLaunch = await getDaysSinceFirstLaunch();

      // ✅ Check with service
      return await storeReviewService.shouldRequestReview(
        currentQuotesRead,
        currentDaysSinceFirstLaunch
      );
    } catch (error) {
      console.error(
        "❌ StoreReview: Error checking if should request review:",
        error
      );
      return false;
    }
  }, [isPremium, storeReviewService]);

  /**
   * Request review from user (shows native expo-store-review dialog)
   */
  const requestReview = useCallback(async (): Promise<boolean> => {
    try {
      console.log("✅ StoreReview: Triggering native review request");
      return await storeReviewService.requestReview();
    } catch (error) {
      console.error("❌ StoreReview: Error requesting review:", error);
      return false;
    }
  }, [storeReviewService]);

  /**
   * Increment quotes read count (call when user reads a quote)
   */
  const incrementQuotesRead = useCallback(async (): Promise<void> => {
    try {
      const newCount = quotesReadCount + 1;
      await AsyncStorage.setItem("@quotes_read_count", newCount.toString());
      setQuotesReadCount(newCount);

      // Only log every 5 quotes to avoid spam
      if (newCount % 5 === 0) {
        console.log(`📚 StoreReview: Quotes read count: ${newCount}`);
      }
    } catch (error) {
      console.error("❌ StoreReview: Error incrementing quotes read:", error);
    }
  }, [quotesReadCount]);

  /**
   * Get current review statistics for debugging
   */
  const getReviewStats = useCallback(async () => {
    try {
      const stats = await storeReviewService.getReviewStats();
      return {
        ...stats,
        currentQuotesRead: await getQuotesReadCount(),
        currentDaysSinceFirstLaunch: await getDaysSinceFirstLaunch(),
        isPremium,
      };
    } catch (error) {
      console.error("❌ StoreReview: Error getting stats:", error);
      return null;
    }
  }, [storeReviewService, isPremium]);

  /**
   * Reset all review data (development only)
   */
  const resetReviewData = useCallback(async (): Promise<void> => {
    try {
      await storeReviewService.resetReviewData();
      await AsyncStorage.removeItem("@quotes_read_count");
      await AsyncStorage.removeItem("@first_launch_date");

      setQuotesReadCount(0);
      setDaysSinceFirstLaunch(0);

      console.log("🔄 StoreReview: All data reset");
    } catch (error) {
      console.error("❌ StoreReview: Error resetting data:", error);
    }
  }, [storeReviewService]);

  return {
    shouldRequestReview,
    requestReview,
    incrementQuotesRead,
    getReviewStats,
    resetReviewData,
  };
}

/**
 * Helper: Get total quotes read count
 */
async function getQuotesReadCount(): Promise<number> {
  try {
    const count = await AsyncStorage.getItem("@quotes_read_count");
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("❌ Error getting quotes read count:", error);
    return 0;
  }
}

/**
 * Helper: Get days since first app launch
 */
async function getDaysSinceFirstLaunch(): Promise<number> {
  try {
    let firstLaunchDate = await AsyncStorage.getItem("@first_launch_date");

    // Set first launch date if not exists
    if (!firstLaunchDate) {
      const now = Date.now().toString();
      await AsyncStorage.setItem("@first_launch_date", now);
      firstLaunchDate = now;
    }

    const daysDiff =
      (Date.now() - parseInt(firstLaunchDate, 10)) / (1000 * 60 * 60 * 24);
    return Math.floor(daysDiff);
  } catch (error) {
    console.error("❌ Error getting days since first launch:", error);
    return 0;
  }
}
