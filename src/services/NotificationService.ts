import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { LocalizedQuote, UserPreferences } from "../types";
import { DataService } from "./DataService";

// Storage keys
const UNREAD_QUOTES_KEY = "unread_quotes";
const NEXT_QUOTES_KEY = "next_quotes";
const LAST_VISIT_KEY = "last_visit";

// App name constant
const APP_NAME = "QuoteSpark";

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
  quoteId?: string;
  category?: string;
  type: "daily_quote" | "streak_warning";
  date: string; // Add date to track when this quote was scheduled for
  [key: string]: unknown;
}

interface StoredQuoteSchedule {
  quotes: Array<{
    quote: LocalizedQuote;
    scheduledFor: string; // ISO date string
    timeSlot: { hour: number; minute: number };
  }>;
  lastUpdated: string;
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
   * Handle notification tap - navigate to quote detail and mark as read
   */
  private async handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const data = response.notification.request.content.data as NotificationData;

    if (data?.quoteId && data?.type === "daily_quote") {
      console.log("📱 Opening quote from notification:", data.quoteId);

      // Mark quote as read
      await this.markQuoteAsRead(data.quoteId);

      // Navigate to quote detail page
      router.push(`/quote-detail/${data.quoteId}`);
    }
  }

  /**
   * Mark a quote as read in storage
   */
  private async markQuoteAsRead(quoteId: string) {
    try {
      const unreadQuotes = await this.getUnreadQuotes();
      const updatedUnread = unreadQuotes.filter((q) => q !== quoteId);
      await AsyncStorage.setItem(
        UNREAD_QUOTES_KEY,
        JSON.stringify(updatedUnread)
      );
    } catch (error) {
      console.error("Error marking quote as read:", error);
    }
  }

  /**
   * Get list of unread quote IDs
   */
  private async getUnreadQuotes(): Promise<string[]> {
    try {
      const unreadQuotes = await AsyncStorage.getItem(UNREAD_QUOTES_KEY);
      return unreadQuotes ? JSON.parse(unreadQuotes) : [];
    } catch (error) {
      console.error("Error getting unread quotes:", error);
      return [];
    }
  }

  /**
   * Add quotes to unread list
   */
  private async addUnreadQuotes(quoteIds: string[]) {
    try {
      const currentUnread = await this.getUnreadQuotes();
      const newUnread = [...new Set([...currentUnread, ...quoteIds])];
      await AsyncStorage.setItem(UNREAD_QUOTES_KEY, JSON.stringify(newUnread));
    } catch (error) {
      console.error("Error adding unread quotes:", error);
    }
  }

  /**
   * Get stored quote schedule
   */
  private async getStoredSchedule(): Promise<StoredQuoteSchedule | null> {
    try {
      const stored = await AsyncStorage.getItem(NEXT_QUOTES_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error getting stored schedule:", error);
      return null;
    }
  }

  /**
   * Store quote schedule
   */
  private async storeSchedule(schedule: StoredQuoteSchedule) {
    try {
      await AsyncStorage.setItem(NEXT_QUOTES_KEY, JSON.stringify(schedule));
    } catch (error) {
      console.error("Error storing schedule:", error);
    }
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

      // Parse time range
      const startTime = this.parseTime(
        userPreferences.notificationTimeRange.start
      );
      const endTime = this.parseTime(userPreferences.notificationTimeRange.end);

      // Calculate total available minutes
      const totalMinutes = this.calculateMinutesBetween(startTime, endTime);

      // Calculate intervals between notifications (excluding first and last)
      const intervalsNeeded = Math.max(
        1,
        userPreferences.notificationCount - 1
      );
      const intervalMinutes = Math.floor(totalMinutes / intervalsNeeded);

      // Generate base time slots (same for all days)
      const baseTimeSlots: Array<{ hour: number; minute: number }> = [];

      // First notification at start time
      baseTimeSlots.push({ ...startTime });

      // Generate middle time slots with equal intervals
      let currentTime = { ...startTime };
      for (let i = 1; i < userPreferences.notificationCount - 1; i++) {
        currentTime = this.addMinutes(startTime, i * intervalMinutes);
        baseTimeSlots.push({ ...currentTime });
      }

      // Last notification at end time
      baseTimeSlots.push({ ...endTime });

      // Get quotes for the next 3 days (changed from 7 to 3)
      const daysToSchedule = 3; // Changed from 7 to 3
      const quotesNeeded = userPreferences.notificationCount * daysToSchedule;
      let quotes = await this.getRandomQuotes(
        userPreferences,
        isPremium,
        quotesNeeded
      );

      if (quotes.length === 0) {
        console.log("❌ No quotes available for notifications");
        return;
      }

      // Create schedule for available days
      const now = new Date();
      const schedule: StoredQuoteSchedule = {
        quotes: [],
        lastUpdated: now.toISOString(),
      };

      // Schedule notifications for each day (3 days)
      for (let day = 0; day < daysToSchedule; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);

        // For each time slot in the day
        for (let slotIndex = 0; slotIndex < baseTimeSlots.length; slotIndex++) {
          // If we're out of quotes, get fresh quotes
          if (quotes.length === 0) {
            console.log("📚 Refreshing quotes pool...");
            quotes = await this.getRandomQuotes(
              userPreferences,
              isPremium,
              quotesNeeded
            );

            if (quotes.length === 0) {
              console.log("❌ No quotes available after refresh");
              break;
            }
          }

          // Get next quote and remove it from the pool
          const quote = quotes.shift()!;
          const timeSlot = baseTimeSlots[slotIndex];

          schedule.quotes.push({
            quote,
            scheduledFor: date.toISOString(),
            timeSlot,
          });

          console.log(
            `📅 Scheduled "${quote.id}" for ${date.toLocaleDateString()} at ${
              timeSlot.hour
            }:${String(timeSlot.minute).padStart(2, "0")}`
          );
        }
      }

      // Store schedule
      await this.storeSchedule(schedule);

      // Add quotes to unread list
      const scheduledQuoteIds = schedule.quotes.map((sq) => sq.quote.id);
      await this.addUnreadQuotes(scheduledQuoteIds);

      // Schedule notifications
      for (const { quote, scheduledFor, timeSlot } of schedule.quotes) {
        await this.scheduleQuoteNotification(quote, timeSlot, scheduledFor);
      }

      console.log(
        `✅ Successfully scheduled ${schedule.quotes.length} notifications across ${daysToSchedule} days`
      );
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      throw error;
    }
  }

  /**
   * Schedule a single quote notification
   */
  private async scheduleQuoteNotification(
    quote: LocalizedQuote,
    time: { hour: number; minute: number },
    scheduledFor: string
  ): Promise<void> {
    // Get user's local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const notificationData: NotificationData = {
      quoteId: quote.id,
      category: quote.category,
      type: "daily_quote",
      date: scheduledFor,
    };

    const notificationContent: Notifications.NotificationContentInput = {
      title: `${APP_NAME} ✨`,
      body: this.truncateText(quote.text, 100),
      data: notificationData,
      sound: true,
    };

    // Parse scheduled date
    const scheduledDate = new Date(scheduledFor);
    scheduledDate.setHours(time.hour, time.minute, 0, 0);

    // Only schedule if the time hasn't passed
    const now = new Date();
    if (scheduledDate > now) {
      const trigger: Notifications.DateTriggerInput = {
        date: scheduledDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      };

      const identifier = `quote_${quote.id}_${scheduledFor}`;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger,
      });

      console.log(
        `📱 Scheduled notification for quote ${
          quote.id
        } at ${scheduledDate.toLocaleString()} (${timezone})`
      );
    }
  }

  /**
   * Check and update last visit time
   */
  async updateLastVisit(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_VISIT_KEY, now);
    } catch (error) {
      console.error("Error updating last visit:", error);
    }
  }

  /**
   * Check if user hasn't opened the app for 3 days
   */
  private async shouldSendStreakWarning(): Promise<boolean> {
    try {
      const lastVisitStr = await AsyncStorage.getItem(LAST_VISIT_KEY);
      if (!lastVisitStr) return false;

      const lastVisit = new Date(lastVisitStr);
      const now = new Date();
      const daysSinceLastVisit = Math.floor(
        (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceLastVisit >= 3;
    } catch (error) {
      console.error("Error checking streak warning:", error);
      return false;
    }
  }

  /**
   * Schedule streak warning notification
   */
  private async scheduleStreakWarning(
    userPreferences: UserPreferences
  ): Promise<void> {
    try {
      const shouldWarn = await this.shouldSendStreakWarning();
      if (!shouldWarn) return;

      // Get translations
      const translations = await this.dataService.getTranslations(
        userPreferences.language
      );

      const notificationData: NotificationData = {
        type: "streak_warning",
        date: new Date().toISOString(),
      };

      const notificationContent: Notifications.NotificationContentInput = {
        title: translations.notifications.streak_warning.title,
        body: translations.notifications.streak_warning.body,
        data: notificationData,
        sound: true,
      };

      // Schedule for next preferred notification time
      const now = new Date();
      const preferredTime = this.parseTime(
        userPreferences.notificationTimeRange.start
      );
      const scheduledDate = new Date(now);
      scheduledDate.setHours(preferredTime.hour, preferredTime.minute, 0, 0);

      // If preferred time has passed, schedule for tomorrow
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const trigger: Notifications.DateTriggerInput = {
        date: scheduledDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      };

      const identifier = `streak_warning_${scheduledDate.toISOString()}`;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger,
      });

      console.log(
        `⚠️ Scheduled streak warning notification for ${scheduledDate.toLocaleString()}`
      );
    } catch (error) {
      console.error("Error scheduling streak warning:", error);
    }
  }

  /**
   * Update notifications daily
   * Call this when app opens or at midnight
   */
  async updateDailySchedule(
    userPreferences: UserPreferences,
    isPremium: boolean
  ): Promise<void> {
    try {
      const storedSchedule = await this.getStoredSchedule();
      if (!storedSchedule) {
        // No schedule exists, create new one
        await this.scheduleNotifications(userPreferences, isPremium);
        await this.scheduleStreakWarning(userPreferences);
        return;
      }

      // Check if schedule needs update (older than 24 hours)
      const lastUpdated = new Date(storedSchedule.lastUpdated);
      const now = new Date();
      const hoursSinceUpdate =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate >= 24) {
        // Time to update schedule
        await this.scheduleNotifications(userPreferences, isPremium);
        await this.scheduleStreakWarning(userPreferences);
      } else {
        console.log("📅 Notification schedule is up to date");
      }
    } catch (error) {
      console.error("Error updating daily schedule:", error);
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

  /**
   * Check if time1 is after time2
   */
  private isTimeAfter(
    time1: { hour: number; minute: number },
    time2: { hour: number; minute: number }
  ): boolean {
    const minutes1 = time1.hour * 60 + time1.minute;
    const minutes2 = time2.hour * 60 + time2.minute;
    return minutes1 > minutes2;
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
