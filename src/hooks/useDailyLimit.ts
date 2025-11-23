import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { dailyLimitService } from "../services/DailyLimitService";
import { usePaywallSelectors } from "../store/usePaywallStore";
import { usePremium } from "./usePremium";
import { useTranslation } from "./useTranslation";

interface DailyLimitInfo {
  currentCount: number;
  limit: number;
  remaining: number;
  hasReachedLimit: boolean;
}

export function useDailyLimit() {
  const [limitInfo, setLimitInfo] = useState<DailyLimitInfo>({
    currentCount: 0,
    limit: 20,
    remaining: 20,
    hasReachedLimit: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { isPremium } = usePremium();
  const { showPaywall } = usePaywallSelectors.actions();
  const { t } = useTranslation();

  // Load initial limit info
  const loadLimitInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await dailyLimitService.getDailyLimitInfo();
      setLimitInfo(info);
    } catch (error) {
      console.error("Error loading daily limit info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load limit info on mount
  useEffect(() => {
    loadLimitInfo();
  }, [loadLimitInfo]);

  /**
   * Check if user can view a quote
   * For premium users, always return true
   * For free users, check daily limit
   */
  const canViewQuote = useCallback(async (): Promise<boolean> => {
    // Premium users have unlimited access
    if (isPremium) {
      return true;
    }

    // Check if free user has reached limit
    return !(await dailyLimitService.hasReachedLimit());
  }, [isPremium]);

  /**
   * Show alert when daily limit is reached
   */
  const showDailyLimitAlert = useCallback(() => {
    Alert.alert(
      t("paywall.daily_limit.title"),
      t("paywall.daily_limit.subtitle"),
      [
        {
          text: t("paywall.daily_limit.button"),
          onPress: () => showPaywall("daily_limit"),
          style: "default",
        },
        {
          text: t("common.ok"),
          style: "cancel",
        },
      ]
    );
  }, [showPaywall, t]);

  /**
   * Attempt to view a quote
   * Returns true if successful, false if limit reached
   * Shows alert instead of paywall for better UX
   */
  const tryViewQuote = useCallback(async (): Promise<boolean> => {
    // Premium users can always view quotes
    if (isPremium) {
      console.log("👑 Premium user - unlimited quote access");
      return true;
    }

    // Try to increment for free users
    const canIncrement = await dailyLimitService.incrementQuoteView();

    if (canIncrement) {
      // Successfully incremented, update local state
      await loadLimitInfo();
      console.log("✅ Quote view allowed - count incremented");
      return true;
    } else {
      // Limit reached, show alert instead of paywall
      console.log("🚫 Daily quote limit reached - showing alert");
      showDailyLimitAlert();
      return false;
    }
  }, [isPremium, loadLimitInfo, showDailyLimitAlert]);

  /**
   * Get remaining quotes for free users
   * Premium users get unlimited (returns -1)
   */
  const getRemainingQuotes = useCallback((): number => {
    if (isPremium) {
      return -1; // Unlimited
    }
    return limitInfo.remaining;
  }, [isPremium, limitInfo.remaining]);

  /**
   * Check if user has reached daily limit
   * Premium users never reach limit
   */
  const hasReachedDailyLimit = useCallback((): boolean => {
    if (isPremium) {
      return false;
    }
    return limitInfo.hasReachedLimit;
  }, [isPremium, limitInfo.hasReachedLimit]);

  /**
   * Reset daily count (for testing purposes)
   */
  const resetDailyCount = useCallback(async () => {
    await dailyLimitService.resetDailyCount();
    await loadLimitInfo();
    console.log("🔄 Daily count reset");
  }, [loadLimitInfo]);

  /**
   * Show daily limit paywall
   */
  const showDailyLimitPaywall = useCallback(() => {
    showPaywall("daily_limit");
  }, [showPaywall]);

  /**
   * Get limit status message for UI
   */
  const getLimitStatusMessage = useCallback((): string => {
    if (isPremium) {
      return (
        t("common.premium_status") +
        " - " +
        t("paywall.features.unlimited_access")
      );
    }

    if (limitInfo.hasReachedLimit) {
      return (
        t("paywall.daily_limit.limit_reached") +
        " - " +
        t("paywall.daily_limit.upgrade_to_premium")
      );
    }

    return `${limitInfo.remaining} ${t("home.swipe_for_more")} ${t(
      "common.today"
    )}`;
  }, [isPremium, limitInfo, t]);

  return {
    // State
    limitInfo,
    isLoading,
    isPremium,

    // Methods
    canViewQuote,
    tryViewQuote,
    getRemainingQuotes,
    hasReachedDailyLimit,
    resetDailyCount,
    showDailyLimitPaywall,
    showDailyLimitAlert,
    getLimitStatusMessage,

    // Utilities
    refreshLimitInfo: loadLimitInfo,
  };
}
