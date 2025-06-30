import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { LocalizedQuote, UserPreferences } from "../types";
import { DataService } from "./DataService";

// Notification behavior configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  quoteId: string;
  category: string;
  type: "daily_quote";
  [key: string]: unknown;
}

export class NotificationService {
  private static instance: NotificationService;
  private dataService: DataService;

  private constructor() {
    this.dataService = new DataService();
    this.setupNotificationListeners();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Setup notification listeners for when user taps on notification
   */
  private setupNotificationListeners() {
    // Handle notification tap when app is running
    Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationResponse(response);
    });

    // Handle notification tap when app is opened from background
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        this.handleNotificationResponse(response);
      }
    });
  }

  /**
   * Handle notification tap - navigate to quote detail
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const data = response.notification.request.content.data as NotificationData;

    if (data?.quoteId && data?.type === "daily_quote") {
      console.log("📱 Opening quote from notification:", data.quoteId);
      // Navigate to quote detail page
      router.push(`/quote-detail/${data.quoteId}`);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Notification permission denied");
        return false;
      }

      console.log("✅ Notification permission granted");
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Get random quotes based on user preferences and premium status
   */
  private async getRandomQuotes(
    userPreferences: UserPreferences,
    isPremium: boolean,
    count: number
  ): Promise<LocalizedQuote[]> {
    let availableCategories: string[] = [];

    if (!isPremium) {
      // Non-premium users only get general category
      availableCategories = ["general", "genel"];
    } else {
      // Premium users
      if (
        userPreferences.selectedCategories &&
        userPreferences.selectedCategories.length > 0
      ) {
        // Use selected categories
        availableCategories = userPreferences.selectedCategories;
      } else {
        // No categories selected, use all categories
        const allCategories = await this.dataService.getCategories(
          userPreferences.language
        );
        availableCategories = allCategories.map((cat) => cat.id);
      }
    }

    console.log(
      "🎯 Available categories for notifications:",
      availableCategories
    );

    // Get quotes from available categories
    const allQuotes: LocalizedQuote[] = [];

    for (const categoryId of availableCategories) {
      try {
        const categoryQuotes = await this.dataService.getQuotesByCategory(
          categoryId,
          userPreferences.language
        );
        allQuotes.push(...categoryQuotes);
      } catch (error) {
        console.warn(
          `Failed to load quotes for category ${categoryId}:`,
          error
        );
      }
    }

    if (allQuotes.length === 0) {
      console.warn("⚠️ No quotes available for notifications");
      return [];
    }

    // Shuffle and return requested count
    const shuffled = allQuotes.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Schedule notifications based on user preferences
   */
  async scheduleNotifications(
    userPreferences: UserPreferences,
    isPremium: boolean
  ): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("❌ Cannot schedule notifications without permission");
        return;
      }

      // Get random quotes for notifications
      const quotes = await this.getRandomQuotes(
        userPreferences,
        isPremium,
        userPreferences.notificationCount || 3
      );

      if (quotes.length === 0) {
        console.log("❌ No quotes available for notifications");
        return;
      }

      // Parse time range
      const startTime = this.parseTime(
        userPreferences.notificationTimeRange.start
      );
      const endTime = this.parseTime(userPreferences.notificationTimeRange.end);

      // Calculate intervals between notifications
      const totalMinutes = this.calculateMinutesBetween(startTime, endTime);
      const intervalMinutes = Math.floor(
        totalMinutes / userPreferences.notificationCount
      );

      console.log(
        `📅 Scheduling ${quotes.length} notifications between ${userPreferences.notificationTimeRange.start} - ${userPreferences.notificationTimeRange.end}`
      );
      console.log(`⏱️ Interval: ${intervalMinutes} minutes`);
      console.log(
        `🌍 User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
      );

      // Development mode info
      if (__DEV__) {
        console.log(
          `🚧 Running in DEVELOPMENT mode. Notifications may behave differently than in production build.`
        );
      }

      // Schedule each notification
      for (let i = 0; i < quotes.length; i++) {
        const quote = quotes[i];
        const notificationTime = this.addMinutes(
          startTime,
          intervalMinutes * i
        );

        await this.scheduleQuoteNotification(quote, notificationTime, i);
      }

      console.log(`✅ Successfully scheduled ${quotes.length} notifications`);

      // Log scheduled notifications for debugging
      const scheduled = await this.getScheduledNotifications();
      console.log(`📋 Total scheduled notifications: ${scheduled.length}`);

      if (__DEV__ && scheduled.length > 0) {
        console.log(
          "🔍 Scheduled notifications details:",
          scheduled.map((n: Notifications.NotificationRequest) => ({
            id: n.identifier,
            trigger: n.trigger,
          }))
        );
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  /**
   * Schedule a single quote notification
   */
  private async scheduleQuoteNotification(
    quote: LocalizedQuote,
    time: { hour: number; minute: number },
    index: number
  ): Promise<void> {
    // Get user's local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const notificationData: NotificationData = {
      quoteId: quote.id,
      category: quote.category,
      type: "daily_quote",
    };

    const notificationContent: Notifications.NotificationContentInput = {
      title:
        quote.language === "tr" ? "✨ Günlük İlham" : "✨ Daily Inspiration",
      body: this.truncateText(quote.text, 100),
      data: notificationData,
      sound: true,
    };

    // Use calendar trigger with timezone support for precise local time scheduling
    const trigger = {
      hour: time.hour,
      minute: time.minute,
      repeats: true,
      timezone: timezone, // ← Bu yerel saat dilimini kullanır
    } as Notifications.CalendarTriggerInput;

    await Notifications.scheduleNotificationAsync({
      identifier: `daily_quote_${index}`,
      content: notificationContent,
      trigger,
    });

    console.log(
      `📱 Scheduled notification ${index + 1} at ${time.hour}:${time.minute
        .toString()
        .padStart(2, "0")} (Timezone: ${timezone})`
    );

    // Development mode warning
    if (__DEV__) {
      console.warn(
        `🚧 DEVELOPMENT MODE: Notifications may not work properly in Expo Go. ` +
          `For accurate timing, test with production build (expo build / eas build).`
      );
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🗑️ All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  // Helper methods

  private parseTime(timeString: string): { hour: number; minute: number } {
    const [hour, minute] = timeString.split(":").map(Number);
    return { hour, minute };
  }

  private calculateMinutesBetween(
    start: { hour: number; minute: number },
    end: { hour: number; minute: number }
  ): number {
    const startMinutes = start.hour * 60 + start.minute;
    let endMinutes = end.hour * 60 + end.minute;

    // Handle overnight case
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }

    return endMinutes - startMinutes;
  }

  private addMinutes(
    time: { hour: number; minute: number },
    minutesToAdd: number
  ): { hour: number; minute: number } {
    const totalMinutes = time.hour * 60 + time.minute + minutesToAdd;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    return { hour, minute };
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Update notification schedule when user preferences change
   */
  async updateNotificationSchedule(
    userPreferences: UserPreferences,
    isPremium: boolean
  ): Promise<void> {
    console.log("🔄 Updating notification schedule...");
    await this.scheduleNotifications(userPreferences, isPremium);
  }

  /**
   * Disable all notifications
   */
  async disableNotifications(): Promise<void> {
    await this.cancelAllNotifications();
    console.log("🔕 All notifications disabled");
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
