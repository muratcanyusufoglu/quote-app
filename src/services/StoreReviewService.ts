import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";
import { analyticsService } from "./AnalyticsService";

interface ReviewRequestData {
  lastRequestDate: number;
  requestCount: number;
  hasDeclinedPermanently: boolean;
  hasRatedApp: boolean;
}

interface StoreReviewConfig {
  // Conservative strategy settings
  minQuotesRead: number;
  minDaysSinceFirstLaunch: number;
  cooldownDays: number;
  maxRequestsPerYear: number;
}

class StoreReviewService {
  private static instance: StoreReviewService;
  private readonly STORAGE_KEY = "@store_review_data";

  private config: StoreReviewConfig = {
    // Conservative approach: 10 quotes + 3 days, then 6 months cooldown
    minQuotesRead: 10,
    minDaysSinceFirstLaunch: 3,
    cooldownDays: 180, // 6 months
    maxRequestsPerYear: 2,
  };

  public static getInstance(): StoreReviewService {
    if (!StoreReviewService.instance) {
      StoreReviewService.instance = new StoreReviewService();
    }
    return StoreReviewService.instance;
  }

  /**
   * Check if we should request a review from the user
   * ONLY called for premium users after successful purchase
   */
  async shouldRequestReview(
    quotesReadCount: number,
    daysSinceFirstLaunch: number
  ): Promise<boolean> {
    try {
      const data = await this.getReviewData();

      // ✅ User already rated the app
      if (data.hasRatedApp) {
        console.log("📱 StoreReview: User already rated the app");
        return false;
      }

      // ✅ User permanently declined
      if (data.hasDeclinedPermanently) {
        console.log("📱 StoreReview: User permanently declined reviews");
        return false;
      }

      // ✅ Check minimum requirements (Conservative strategy)
      if (quotesReadCount < this.config.minQuotesRead) {
        console.log(
          `📱 StoreReview: Need ${this.config.minQuotesRead} quotes, currently ${quotesReadCount}`
        );
        return false;
      }

      if (daysSinceFirstLaunch < this.config.minDaysSinceFirstLaunch) {
        console.log(
          `📱 StoreReview: Need ${this.config.minDaysSinceFirstLaunch} days, currently ${daysSinceFirstLaunch}`
        );
        return false;
      }

      // ✅ Check cooldown period
      const daysSinceLastRequest =
        (Date.now() - data.lastRequestDate) / (1000 * 60 * 60 * 24);
      if (daysSinceLastRequest < this.config.cooldownDays) {
        console.log(
          `📱 StoreReview: Cooldown active, ${Math.ceil(
            this.config.cooldownDays - daysSinceLastRequest
          )} days remaining`
        );
        return false;
      }

      // ✅ Check annual limit
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      if (
        data.lastRequestDate > oneYearAgo &&
        data.requestCount >= this.config.maxRequestsPerYear
      ) {
        console.log(
          `📱 StoreReview: Annual limit reached (${data.requestCount}/${this.config.maxRequestsPerYear})`
        );
        return false;
      }

      console.log(
        "✅ StoreReview: All conditions met, ready to request review"
      );
      return true;
    } catch (error) {
      console.error(
        "❌ StoreReview: Error checking review eligibility:",
        error
      );
      return false;
    }
  }

  /**
   * Request review from user using native expo-store-review
   * Premium users only, triggered after purchase
   */
  async requestReview(): Promise<boolean> {
    try {
      // ✅ Track review request attempt
      await analyticsService.trackEvent({
        name: "store_review_requested",
        parameters: {
          platform: Platform.OS,
          method: "native_expo_store_review",
        },
      });

      // ✅ Check if review is available
      const isAvailable = await StoreReview.isAvailableAsync();
      console.log("📱 StoreReview: isAvailable", isAvailable);

      if (isAvailable) {
        // ✅ Update request tracking before showing prompt
        await this.updateRequestData();

        // ✅ Show native review dialog
        console.log("✅ StoreReview: Requesting native review dialog...");
        await StoreReview.requestReview().then(async () => {
          // ✅ Mark user as having rated the app
          await this.setUserRatedApp();

          console.log("✅ StoreReview: User completed review dialog");
        });

        // ✅ Track successful request
        await analyticsService.trackEvent({
          name: "store_review_dialog_shown",
          parameters: {
            platform: Platform.OS,
            type: "native_expo",
          },
        });

        return true;
      } else {
        console.log(
          "⚠️ StoreReview: Native review not available on this device/platform"
        );

        await analyticsService.trackEvent({
          name: "store_review_not_available",
          parameters: {
            platform: Platform.OS,
          },
        });

        return false;
      }
    } catch (error) {
      console.error("❌ StoreReview: Error requesting review:", error);

      await analyticsService.trackEvent({
        name: "store_review_error",
        parameters: {
          platform: Platform.OS,
          error: error instanceof Error ? error.message : "unknown",
        },
      });

      return false;
    }
  }

  /**
   * Mark user as having rated the app (called after successful review)
   */
  private async setUserRatedApp(): Promise<void> {
    try {
      const data = await this.getReviewData();
      const updatedData: ReviewRequestData = {
        ...data,
        hasRatedApp: true,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));

      await analyticsService.trackEvent({
        name: "store_review_completed",
        parameters: {
          platform: Platform.OS,
        },
      });

      console.log("✅ StoreReview: User marked as having rated the app");
    } catch (error) {
      console.error("❌ StoreReview: Error setting user rated app:", error);
    }
  }

  /**
   * User declined review (called if we had custom handling)
   */
  async setUserDeclinedPermanently(): Promise<void> {
    try {
      const data = await this.getReviewData();
      const updatedData: ReviewRequestData = {
        ...data,
        hasDeclinedPermanently: true,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));

      await analyticsService.trackEvent({
        name: "store_review_declined_permanently",
        parameters: {
          platform: Platform.OS,
          previous_requests: data.requestCount,
        },
      });

      console.log("🚫 StoreReview: User permanently opted out of reviews");
    } catch (error) {
      console.error("❌ StoreReview: Error setting permanent decline:", error);
    }
  }

  /**
   * Get current review request data from storage
   */
  private async getReviewData(): Promise<ReviewRequestData> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("❌ StoreReview: Error reading storage:", error);
    }

    // Default data for new users
    return {
      lastRequestDate: 0,
      requestCount: 0,
      hasDeclinedPermanently: false,
      hasRatedApp: false,
    };
  }

  /**
   * Update request data after showing review dialog
   */
  private async updateRequestData(): Promise<void> {
    try {
      const data = await this.getReviewData();
      const now = Date.now();

      // Reset count if more than a year has passed
      const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
      const requestCount =
        data.lastRequestDate < oneYearAgo ? 1 : data.requestCount + 1;

      const updatedData: ReviewRequestData = {
        ...data,
        lastRequestDate: now,
        requestCount,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      console.log(
        `📱 StoreReview: Updated request data (count: ${requestCount})`
      );
    } catch (error) {
      console.error("❌ StoreReview: Error updating request data:", error);
    }
  }

  /**
   * Reset all review data (for testing/debugging)
   */
  async resetReviewData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log("🔄 StoreReview: Reset all review data");
    } catch (error) {
      console.error("❌ StoreReview: Error resetting data:", error);
    }
  }

  /**
   * Get review statistics for debugging
   */
  async getReviewStats(): Promise<ReviewRequestData> {
    return await this.getReviewData();
  }
}

export const getStoreReviewService = () => StoreReviewService.getInstance();
