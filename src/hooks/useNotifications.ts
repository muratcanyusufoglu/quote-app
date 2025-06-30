import { useEffect } from "react";
import { notificationService } from "../services/NotificationService";
import { useUserPreferences } from "../store/useOnboardingStore";
import { useIsPremium } from "../store/usePurchaseStore";

export function useNotifications() {
  const userPreferences = useUserPreferences();
  const isPremium = useIsPremium();

  // Setup notifications when preferences are available
  useEffect(() => {
    if (userPreferences) {
      console.log("🔔 Setting up notifications with preferences:", {
        count: userPreferences.notificationCount,
        timeRange: userPreferences.notificationTimeRange,
        categories: userPreferences.selectedCategories,
        isPremium,
      });

      notificationService.scheduleNotifications(userPreferences, isPremium);
    }
  }, [userPreferences, isPremium]);

  // Update notifications when premium status changes
  useEffect(() => {
    if (userPreferences && typeof isPremium === "boolean") {
      console.log(
        "💎 Premium status changed, updating notifications:",
        isPremium
      );
      notificationService.updateNotificationSchedule(
        userPreferences,
        isPremium
      );
    }
  }, [isPremium, userPreferences]);

  return {
    scheduleNotifications: () => {
      if (userPreferences) {
        return notificationService.scheduleNotifications(
          userPreferences,
          isPremium
        );
      }
    },
    cancelNotifications: () => notificationService.cancelAllNotifications(),
    getScheduledNotifications: () =>
      notificationService.getScheduledNotifications(),
  };
}

// Hook for manually triggering notification setup (useful for settings page)
export function useNotificationControl() {
  const userPreferences = useUserPreferences();
  const isPremium = useIsPremium();

  const scheduleNotifications = async () => {
    if (userPreferences) {
      await notificationService.scheduleNotifications(
        userPreferences,
        isPremium
      );
      return true;
    }
    return false;
  };

  const cancelAllNotifications = async () => {
    await notificationService.cancelAllNotifications();
  };

  const updateNotificationSchedule = async () => {
    if (userPreferences) {
      await notificationService.updateNotificationSchedule(
        userPreferences,
        isPremium
      );
      return true;
    }
    return false;
  };

  const getScheduledNotifications = async () => {
    return await notificationService.getScheduledNotifications();
  };

  // Test function - schedule a notification in 10 seconds
  const scheduleTestNotification = async () => {
    try {
      const { notificationService: service } = await import(
        "../services/NotificationService"
      );
      const now = new Date();
      const testTime = new Date(now.getTime() + 10000); // 10 seconds from now

      await service.requestPermissions();

      const result = await import("expo-notifications").then((Notifications) =>
        Notifications.scheduleNotificationAsync({
          identifier: "test_notification",
          content: {
            title: "🧪 Test Notification",
            body: "Bu test bildirimi! Uygulama kapalıyken de çalışıyor.",
            sound: true,
          },
          trigger: {
            date: testTime,
          } as any,
        })
      );

      console.log(
        "🧪 Test notification scheduled for:",
        testTime.toLocaleTimeString()
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to schedule test notification:", error);
      throw error;
    }
  };

  return {
    scheduleNotifications,
    cancelAllNotifications,
    updateNotificationSchedule,
    getScheduledNotifications,
    scheduleTestNotification,
    userPreferences,
    isPremium,
  };
}
