import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_LIMIT_KEY = "daily_quote_limit";
const FREE_USER_DAILY_LIMIT = 20;

interface DailyLimitData {
  date: string;
  count: number;
  lastResetDate: string;
}

export class DailyLimitService {
  private static instance: DailyLimitService;

  static getInstance(): DailyLimitService {
    if (!DailyLimitService.instance) {
      DailyLimitService.instance = new DailyLimitService();
    }
    return DailyLimitService.instance;
  }

  private constructor() {}

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Load daily limit data from storage
   */
  private async loadDailyLimitData(): Promise<DailyLimitData> {
    try {
      const data = await AsyncStorage.getItem(DAILY_LIMIT_KEY);
      if (data) {
        const parsed = JSON.parse(data) as DailyLimitData;
        return parsed;
      }
    } catch (error) {
      console.error("Error loading daily limit data:", error);
    }

    // Return default data if nothing found or error occurred
    const today = this.getTodayDate();
    return {
      date: today,
      count: 0,
      lastResetDate: today,
    };
  }

  /**
   * Save daily limit data to storage
   */
  private async saveDailyLimitData(data: DailyLimitData): Promise<void> {
    try {
      await AsyncStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving daily limit data:", error);
    }
  }

  /**
   * Check if we need to reset the daily count (new day)
   */
  private async checkAndResetIfNewDay(): Promise<DailyLimitData> {
    const data = await this.loadDailyLimitData();
    const today = this.getTodayDate();

    // If it's a new day, reset the count
    if (data.date !== today) {
      const resetData: DailyLimitData = {
        date: today,
        count: 0,
        lastResetDate: today,
      };
      await this.saveDailyLimitData(resetData);
      console.log(`📅 Daily quote limit reset for new day: ${today}`);
      return resetData;
    }

    return data;
  }

  /**
   * Get current daily quote count
   */
  async getCurrentCount(): Promise<number> {
    const data = await this.checkAndResetIfNewDay();
    return data.count;
  }

  /**
   * Get remaining quotes for today
   */
  async getRemainingQuotes(): Promise<number> {
    const currentCount = await this.getCurrentCount();
    return Math.max(0, FREE_USER_DAILY_LIMIT - currentCount);
  }

  /**
   * Check if user has reached daily limit
   */
  async hasReachedLimit(): Promise<boolean> {
    const currentCount = await this.getCurrentCount();
    return currentCount >= FREE_USER_DAILY_LIMIT;
  }

  /**
   * Increment quote view count
   * Returns true if increment was successful (under limit)
   * Returns false if limit has been reached
   */
  async incrementQuoteView(): Promise<boolean> {
    const data = await this.checkAndResetIfNewDay();

    // Check if already at limit
    if (data.count >= FREE_USER_DAILY_LIMIT) {
      console.log(
        `🚫 Daily quote limit reached: ${data.count}/${FREE_USER_DAILY_LIMIT}`
      );
      return false;
    }

    // Increment count
    data.count += 1;
    await this.saveDailyLimitData(data);

    console.log(
      `📊 Quote view incremented: ${data.count}/${FREE_USER_DAILY_LIMIT}`
    );
    return true;
  }

  /**
   * Reset daily count (for testing or admin purposes)
   */
  async resetDailyCount(): Promise<void> {
    const today = this.getTodayDate();
    const resetData: DailyLimitData = {
      date: today,
      count: 0,
      lastResetDate: today,
    };
    await this.saveDailyLimitData(resetData);
    console.log("🔄 Daily quote limit manually reset");
  }

  /**
   * Get daily limit info for display
   */
  async getDailyLimitInfo(): Promise<{
    currentCount: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  }> {
    const currentCount = await this.getCurrentCount();
    const remaining = Math.max(0, FREE_USER_DAILY_LIMIT - currentCount);
    const hasReachedLimit = currentCount >= FREE_USER_DAILY_LIMIT;

    return {
      currentCount,
      limit: FREE_USER_DAILY_LIMIT,
      remaining,
      hasReachedLimit,
    };
  }

  /**
   * Get the daily limit constant
   */
  getDailyLimit(): number {
    return FREE_USER_DAILY_LIMIT;
  }
}

// Export singleton instance
export const dailyLimitService = DailyLimitService.getInstance();

