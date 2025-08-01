import { useEffect, useRef } from "react";
import { notificationService } from "../services/NotificationService";
import { useUserPreferences } from "../store/useOnboardingStore";
import { useIsPremium } from "../store/usePurchaseStore";

export function useNotifications() {
  const userPreferences = useUserPreferences();
  const isPremium = useIsPremium();
  const isSchedulingRef = useRef(false);

  // Update last visit on app startup
  useEffect(() => {
    const updateLastVisit = async () => {
      try {
        await notificationService.updateLastVisit();
        console.log("📅 Last visit updated on app startup");
      } catch (error) {
        console.error("❌ Failed to update last visit:", error);
      }
    };

    updateLastVisit();
  }, []); // Run only once on app startup

  // Single useEffect to handle all notification scheduling
  useEffect(() => {
    // Only proceed if we have user preferences and premium status is defined
    if (!userPreferences || typeof isPremium !== "boolean") {
      return;
    }

    // Prevent multiple simultaneous scheduling attempts
    if (isSchedulingRef.current) {
      console.log(
        "🔔 Notification scheduling already in progress, skipping..."
      );
      return;
    }

    const scheduleNotifications = async () => {
      isSchedulingRef.current = true;

      try {
        console.log("🔔 Setting up notifications with preferences:", {
          count: userPreferences.notificationCount,
          timeRange: userPreferences.notificationTimeRange,
          categories: userPreferences.selectedCategories,
          isPremium,
        });

        await notificationService.scheduleNotifications(
          userPreferences,
          isPremium
        );
        console.log("✅ Notifications scheduled successfully");
      } catch (error) {
        console.error("❌ Failed to schedule notifications:", error);
      } finally {
        isSchedulingRef.current = false;
      }
    };

    scheduleNotifications();
  }, [userPreferences, isPremium]);

  return {
    scheduleNotifications: () => {
      if (userPreferences && !isSchedulingRef.current) {
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
      console.log("🔧 Manual notification scheduling triggered");
      await notificationService.scheduleNotifications(
        userPreferences,
        isPremium
      );
    }
  };

  const cancelNotifications = async () => {
    console.log("🔕 Manual notification cancellation triggered");
    await notificationService.cancelAllNotifications();
  };

  const getScheduledNotifications = async () => {
    return await notificationService.getScheduledNotifications();
  };

  return {
    scheduleNotifications,
    cancelNotifications,
    getScheduledNotifications,
    userPreferences,
    isPremium,
  };
}
