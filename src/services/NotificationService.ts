import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Language, LocalizedQuote, UserPreferences } from "../types";
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
  type?: "daily_quote" | "streak_warning";
  date?: string;
  language?: Language; // Add language to notification data
  [key: string]: unknown; // Add index signature for Expo compatibility
}

interface StoredQuoteSchedule {
  quotes: Array<{
    quote: LocalizedQuote;
    scheduledFor: string;
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

    // Get localized app name and notification content based on quote language
    const getLocalizedNotificationContent = (language: Language) => {
      const translations = {
        en: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        tr: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        fr: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        es: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        de: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        it: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        pt: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        ru: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        nl: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        id: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        ja: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        th: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
        ms: {
          appName: "QuoteSpark",
          title: "Quote Spark",
        },
      };

      return translations[language] || translations.en;
    };

    const localizedContent = getLocalizedNotificationContent(quote.language);

    const notificationData: NotificationData = {
      quoteId: quote.id,
      category: quote.category,
      type: "daily_quote",
      date: scheduledFor,
      language: quote.language, // Include language in notification data
    };

    const notificationContent: Notifications.NotificationContentInput = {
      title: localizedContent.title,
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

      const identifier = `quote_${quote.id}_${scheduledFor}_${quote.language}`;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger,
      });

      console.log(
        `📱 Scheduled notification for quote ${quote.id} in ${
          quote.language
        } at ${scheduledDate.toLocaleString()} (${timezone})`
      );
    }
  }

  /**
   * Cancel all scheduled streak warning notifications
   */
  private async cancelStreakWarnings(): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      // Filter and cancel only streak warning notifications
      const streakWarningNotifications = scheduledNotifications.filter(
        (notification) => notification.identifier.startsWith("streak_warning_")
      );

      for (const notification of streakWarningNotifications) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }

      console.log(
        `🔕 Cancelled ${streakWarningNotifications.length} streak warning notifications`
      );
    } catch (error) {
      console.error("Error cancelling streak warnings:", error);
    }
  }

  /**
   * Check and update last visit time
   */
  async updateLastVisit(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_VISIT_KEY, now);

      // Cancel any pending streak warnings since user is back
      await this.cancelStreakWarnings();

      console.log("📅 Last visit updated and streak warnings cancelled");
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
   * Schedule streak warning notifications (2 per day until user returns)
   */
  private async scheduleStreakWarning(
    userPreferences: UserPreferences
  ): Promise<void> {
    try {
      const shouldWarn = await this.shouldSendStreakWarning();
      if (!shouldWarn) {
        console.log("📅 No streak warning needed - user is active");
        return;
      }

      // Get localized streak warning content
      const getStreakWarningContent = (
        language: Language,
        isSecond: boolean = false
      ) => {
        const translations = {
          en: {
            title: isSecond
              ? "Your Streak Needs You! ⚡"
              : "Don't Break Your Streak! 🔥",
            body: isSecond
              ? "Your daily inspiration streak is waiting! Come back and continue your journey."
              : "We miss you! Open the app to keep your daily quote streak going.",
          },
          tr: {
            title: isSecond
              ? "Seriniz Sizi Bekliyor! ⚡"
              : "Serinizi Bozmayın! 🔥",
            body: isSecond
              ? "Günlük ilham seriniz beklemede! Geri dönün ve yolculuğunuza devam edin."
              : "Sizi özledik! Günlük alıntı serinizi devam ettirmek için uygulamayı açın.",
          },
          fr: {
            title: isSecond
              ? "Votre Série Vous Attend! ⚡"
              : "Ne Cassez Pas Votre Série! 🔥",
            body: isSecond
              ? "Votre série d'inspiration quotidienne vous attend! Revenez et continuez votre voyage."
              : "Vous nous manquez! Ouvrez l'app pour maintenir votre série de citations quotidiennes.",
          },
          es: {
            title: isSecond
              ? "¡Tu Racha Te Necesita! ⚡"
              : "¡No Rompas Tu Racha! 🔥",
            body: isSecond
              ? "¡Tu racha de inspiración diaria te espera! Regresa y continúa tu viaje."
              : "¡Te extrañamos! Abre la app para mantener tu racha de citas diarias.",
          },
          de: {
            title: isSecond
              ? "Deine Serie Braucht Dich! ⚡"
              : "Brich Deine Serie Nicht! 🔥",
            body: isSecond
              ? "Deine tägliche Inspirationsserie wartet auf dich! Komm zurück und setze deine Reise fort."
              : "Du fehlst uns! Öffne die App, um deine tägliche Zitate-Serie fortzusetzen.",
          },
          it: {
            title: isSecond
              ? "La Tua Serie Ti Aspetta! ⚡"
              : "Non Spezzare La Tua Serie! 🔥",
            body: isSecond
              ? "La tua serie di ispirazione quotidiana ti sta aspettando! Torna e continua il tuo viaggio."
              : "Ci manchi! Apri l'app per mantenere la tua serie di citazioni quotidiane.",
          },
          pt: {
            title: isSecond
              ? "Sua Sequência Precisa de Você! ⚡"
              : "Não Quebre Sua Sequência! 🔥",
            body: isSecond
              ? "Sua sequência de inspiração diária está esperando! Volte e continue sua jornada."
              : "Sentimos sua falta! Abra o app para manter sua sequência de citações diárias.",
          },
          ru: {
            title: isSecond
              ? "Ваша Серия Ждет Вас! ⚡"
              : "Не Нарушайте Серию! 🔥",
            body: isSecond
              ? "Ваша серия ежедневного вдохновения ждет! Вернитесь и продолжайте свой путь."
              : "Мы скучаем по вам! Откройте приложение, чтобы сохранить серию ежедневных цитат.",
          },
          nl: {
            title: isSecond
              ? "Je Reeks Heeft Je Nodig! ⚡"
              : "Breek Je Reeks Niet! 🔥",
            body: isSecond
              ? "Je dagelijkse inspiratiereeks wacht op je! Kom terug en zet je reis voort."
              : "We missen je! Open de app om je dagelijkse citatenreeks voort te zetten.",
          },
          id: {
            title: isSecond
              ? "Streak Anda Menunggu! ⚡"
              : "Jangan Putuskan Streak Anda! 🔥",
            body: isSecond
              ? "Streak inspirasi harian Anda sedang menunggu! Kembali dan lanjutkan perjalanan Anda."
              : "Kami merindukan Anda! Buka aplikasi untuk menjaga streak kutipan harian Anda.",
          },
          ja: {
            title: isSecond
              ? "あなたの連続記録があなたを待っています! ⚡"
              : "連続記録を途切れさせないで! 🔥",
            body: isSecond
              ? "毎日のインスピレーション連続記録があなたを待っています！戻ってきて旅を続けてください。"
              : "お久しぶりです！毎日の名言連続記録を維持するためにアプリを開いてください。",
          },
          th: {
            title: isSecond
              ? "สตรีคของคุณรอคุณอยู่! ⚡"
              : "อย่าทำให้สตรีคขาด! 🔥",
            body: isSecond
              ? "สตรีคแรงบันดาลใจประจำวันของคุณรอคุณอยู่! กลับมาและทำต่อการเดินทางของคุณ"
              : "เราคิดถึงคุณ! เปิดแอปเพื่อรักษาสตรีคคำคมประจำวันของคุณ",
          },
          ms: {
            title: isSecond
              ? "Streak Anda Menunggu Anda! ⚡"
              : "Jangan Putuskan Streak Anda! 🔥",
            body: isSecond
              ? "Streak inspirasi harian anda sedang menunggu! Kembali dan teruskan perjalanan anda."
              : "Kami rindu anda! Buka aplikasi untuk mengekalkan streak petikan harian anda.",
          },
        };

        return translations[language] || translations.en;
      };

      // Parse user's notification time range
      const startTime = this.parseTime(
        userPreferences.notificationTimeRange.start
      );
      const endTime = this.parseTime(userPreferences.notificationTimeRange.end);

      // Calculate total minutes in the range
      const totalMinutes = this.calculateMinutesBetween(startTime, endTime);

      // Calculate times for 2 notifications (divide range into 3 parts, use middle points)
      const firstNotificationMinutes = Math.floor(totalMinutes / 3);
      const secondNotificationMinutes = Math.floor((totalMinutes * 2) / 3);

      const firstTime = this.addMinutes(startTime, firstNotificationMinutes);
      const secondTime = this.addMinutes(startTime, secondNotificationMinutes);

      console.log(
        `🕐 Streak warning times: ${firstTime.hour}:${String(
          firstTime.minute
        ).padStart(2, "0")} and ${secondTime.hour}:${String(
          secondTime.minute
        ).padStart(2, "0")}`
      );

      // Schedule streak warnings for the next 7 days (user will come back eventually)
      const daysToSchedule = 7;
      const now = new Date();

      for (let day = 0; day < daysToSchedule; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);

        // Schedule first notification of the day
        await this.scheduleSingleStreakWarning(
          getStreakWarningContent(userPreferences.language, false),
          firstTime,
          date,
          userPreferences.language,
          1
        );

        // Schedule second notification of the day
        await this.scheduleSingleStreakWarning(
          getStreakWarningContent(userPreferences.language, true),
          secondTime,
          date,
          userPreferences.language,
          2
        );
      }

      console.log(
        `⚠️ Scheduled ${
          daysToSchedule * 2
        } streak warning notifications over ${daysToSchedule} days`
      );
    } catch (error) {
      console.error("Error scheduling streak warning:", error);
    }
  }

  /**
   * Schedule a single streak warning notification
   */
  private async scheduleSingleStreakWarning(
    content: { title: string; body: string },
    time: { hour: number; minute: number },
    date: Date,
    language: Language,
    notificationIndex: number
  ): Promise<void> {
    const notificationData: NotificationData = {
      type: "streak_warning",
      date: date.toISOString(),
      language: language,
    };

    const notificationContent: Notifications.NotificationContentInput = {
      title: content.title,
      body: content.body,
      data: notificationData,
      sound: true,
    };

    // Set the specific time for this notification
    const scheduledDate = new Date(date);
    scheduledDate.setHours(time.hour, time.minute, 0, 0);

    // Only schedule if the time hasn't passed
    const now = new Date();
    if (scheduledDate > now) {
      const trigger: Notifications.DateTriggerInput = {
        date: scheduledDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      };

      const identifier = `streak_warning_${
        date.toISOString().split("T")[0]
      }_${notificationIndex}_${language}`;
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger,
      });

      console.log(
        `⚠️ Scheduled streak warning ${notificationIndex}/2 for ${scheduledDate.toLocaleString()} in ${language}`
      );
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
      // If user inactive for a long time, stop regular quote notifications
      const lastVisitStr = await AsyncStorage.getItem(LAST_VISIT_KEY);
      if (lastVisitStr) {
        const lastVisit = new Date(lastVisitStr);
        const now = new Date();
        const daysSinceLastVisit = Math.floor(
          (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Soft stop after 7+ days: cancel regular quotes, keep streak warnings
        if (daysSinceLastVisit >= 7) {
          await this.cancelOnlyQuoteNotifications();
          await this.scheduleStreakWarning(userPreferences);
          console.log(
            `🔕 User inactive (${daysSinceLastVisit}d). Stopped quote notifications; streak warnings scheduled.`
          );
          return;
        }
      }

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
   * Cancel only quote notifications (keep streak warnings)
   */
  private async cancelOnlyQuoteNotifications(): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const quoteNotifications = scheduledNotifications.filter((n) =>
        n.identifier.startsWith("quote_")
      );
      for (const n of quoteNotifications) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
      console.log(
        `🗑️ Cancelled ${quoteNotifications.length} quote notifications (streak warnings preserved)`
      );
    } catch (error) {
      console.error("Error cancelling only quote notifications:", error);
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

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Found ${scheduled.length} scheduled notifications`);
      return scheduled;
    } catch (error) {
      console.error("❌ Failed to get scheduled notifications:", error);
      return [];
    }
  }

  // Helper methods

  private parseTime(timeString: string): { hour: number; minute: number } {
    // Import parseTimeToMilitary for consistent parsing
    const { parseTimeToMilitary } = require("../utils/language");
    return parseTimeToMilitary(timeString);
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

  /**
   * Schedule trial reminder notification
   * Schedules a reminder 1 day before trial ends (on day 2 of 3-day trial)
   */
  async scheduleTrialReminder(
    trialStartDate: Date,
    freeTrialDays: number,
    language: Language = "en"
  ): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("❌ Cannot schedule trial reminder without permission");
        return;
      }

      // Calculate reminder date (1 day before trial ends)
      const reminderDate = new Date(trialStartDate);
      reminderDate.setDate(reminderDate.getDate() + (freeTrialDays - 1));

      // Set reminder time to 10:00 AM
      reminderDate.setHours(10, 0, 0, 0);

      // Only schedule if the date hasn't passed
      const now = new Date();
      if (reminderDate <= now) {
        console.log("⚠️ Trial reminder date has already passed, skipping");
        return;
      }

      // Get translation texts
      const translations = await this.getTrialReminderTexts(language);
      
      const notificationData: NotificationData = {
        type: "trial_reminder",
        date: reminderDate.toISOString(),
        language: language,
      };

      const notificationContent: Notifications.NotificationContentInput = {
        title: translations.title,
        body: translations.body,
        data: notificationData,
        sound: true,
      };

      const trigger: Notifications.DateTriggerInput = {
        date: reminderDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      };

      const identifier = `trial_reminder_${reminderDate.toISOString().split("T")[0]}_${language}`;
      
      // Cancel any existing trial reminder first
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {
        // Ignore if notification doesn't exist
      });

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: notificationContent,
        trigger,
      });

      console.log(
        `📅 Scheduled trial reminder for ${reminderDate.toLocaleString()} in ${language}`
      );
    } catch (error) {
      console.error("❌ Error scheduling trial reminder:", error);
    }
  }

  /**
   * Get trial reminder texts based on language
   */
  private async getTrialReminderTexts(
    language: Language
  ): Promise<{ title: string; body: string }> {
    // Import translations dynamically
    const enTranslations = require("../data/translations/en.json");
    const trTranslations = require("../data/translations/tr.json");

    const translations =
      language === "tr" ? trTranslations : enTranslations;

    return {
      title:
        translations.notifications?.streak_warning?.title_second ||
        "Your Trial Awaits! ⚡",
      body:
        translations.paywall?.modern?.timeline_reminder_description ||
        "We'll let you know when your trial is ending",
    };
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
