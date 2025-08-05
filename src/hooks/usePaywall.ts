// usePaywall.ts - Custom hook for paywall management
// Provides easy access to paywall functionality throughout the app

import { useCallback } from "react";
import { Alert } from "react-native";
import {
  getPaywallService,
  SubscriptionStatus,
} from "../services/PaywallService";
import { usePaywallSelectors } from "../store/usePaywallStore";
import { PaywallTriggerSource } from "../types";
import { usePremium } from "./usePremium";

export interface PaywallHook {
  // State
  isVisible: boolean;
  triggerSource: PaywallTriggerSource | null;
  actionCount: number;
  hasSeenWelcome: boolean;

  // Actions
  showPaywall: (source: PaywallTriggerSource) => void;
  hidePaywall: () => void;
  trackAction: () => void;
  resetActionCount: () => void;

  // Subscription Management
  purchaseSubscription: (packageId?: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<SubscriptionStatus | null>;
  hasActiveSubscription: () => Promise<boolean>;
  isInTrialPeriod: () => Promise<boolean>;

  // Convenience Methods
  showWelcomePaywall: () => void;
  showPremiumCategoryPaywall: () => void;
  showStoryLimitPaywall: () => void;
  showActionLimitPaywall: () => void;
  showRealPurchasePaywall: () => void;
}

export const usePaywall = (): PaywallHook => {
  // Store selectors
  const isVisible = usePaywallSelectors.isVisible();
  const triggerSource = usePaywallSelectors.triggerSource();
  const actionCount = usePaywallSelectors.actionCount();
  const hasSeenWelcome = usePaywallSelectors.hasSeenWelcome();
  const hasHydrated = usePaywallSelectors.hasHydrated();
  const {
    showPaywall: showPaywallAction,
    hidePaywall: hidePaywallAction,
    trackAction: trackActionAction,
    resetActionCount: resetActionCountAction,
    markWelcomePaywallSeen,
  } = usePaywallSelectors.actions();

  // UNIFIED: Use unified premium system instead of usePurchaseSelectors
  const { isPremium, hasPremiumAccess } = usePremium();

  const showPaywall = useCallback(
    (source: PaywallTriggerSource) => {
      // Premium kullanıcılar için paywall gösterme
      if (isPremium) {
        console.log(
          `🚫 Premium user, not showing paywall for source: ${source}`
        );
        return;
      }

      console.log(`💰 Showing paywall with source: ${source}`);
      showPaywallAction(source);
    },
    [isPremium, showPaywallAction]
  );

  const hidePaywall = useCallback(() => {
    console.log("📱 Hiding paywall");
    hidePaywallAction();
  }, [hidePaywallAction]);

  const trackAction = useCallback(() => {
    trackActionAction();
  }, [trackActionAction]);

  const resetActionCount = useCallback(() => {
    resetActionCountAction();
  }, [resetActionCountAction]);

  // Subscription management methods
  const purchaseSubscription = useCallback(
    async (packageId?: string): Promise<boolean> => {
      try {
        const paywallService = getPaywallService();

        if (!packageId) {
          // Get the first available package if none specified
          const packages = await paywallService.getSubscriptionPackages();
          if (packages.length === 0) {
            Alert.alert("Error", "No subscription packages available");
            return false;
          }
          packageId = packages[0].id;
        }

        const result = await paywallService.purchaseSubscription(packageId);

        if (result.success) {
          console.log("🎉 Subscription purchased successfully");
          hidePaywall();
          return true;
        } else {
          console.error("❌ Subscription purchase failed:", result.error);
          Alert.alert("Purchase Failed", result.error || "Please try again.");
          return false;
        }
      } catch (error) {
        console.error("❌ Subscription purchase error:", error);
        Alert.alert("Error", "An unexpected error occurred during purchase.");
        return false;
      }
    },
    [hidePaywall]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const paywallService = getPaywallService();
      const result = await paywallService.restorePurchases();

      if (result.success) {
        console.log("✅ Purchases restored successfully");
        hidePaywall();
        return true;
      } else {
        console.log("ℹ️ No purchases found to restore");
        Alert.alert(
          "No Purchases Found",
          "No previous purchases were found to restore."
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Restore purchases error:", error);
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
      return false;
    }
  }, [hidePaywall]);

  const checkSubscriptionStatus =
    useCallback(async (): Promise<SubscriptionStatus | null> => {
      try {
        const paywallService = getPaywallService();
        return await paywallService.getSubscriptionStatus();
      } catch (error) {
        console.error("❌ Error checking subscription status:", error);
        return null;
      }
    }, []);

  const hasActiveSubscription = useCallback(async (): Promise<boolean> => {
    try {
      const paywallService = getPaywallService();
      return await paywallService.hasActiveSubscription();
    } catch (error) {
      console.error("❌ Error checking active subscription:", error);
      return false;
    }
  }, []);

  const isInTrialPeriod = useCallback(async (): Promise<boolean> => {
    try {
      const paywallService = getPaywallService();
      return await paywallService.isInTrialPeriod();
    } catch (error) {
      console.error("❌ Error checking trial period:", error);
      return false;
    }
  }, []);

  // Convenience methods for different paywall contexts
  const showWelcomePaywall = useCallback(() => {
    if (isPremium) {
      console.log(`🚫 Premium user, not showing welcome paywall`);
      return;
    }
    showPaywall("welcome");
  }, [showPaywall, isPremium]);

  const showPremiumCategoryPaywall = useCallback(() => {
    if (isPremium) {
      console.log(`🚫 Premium user, not showing premium category paywall`);
      return;
    }
    showPaywall("premium_category");
  }, [showPaywall, isPremium]);

  const showStoryLimitPaywall = useCallback(() => {
    if (isPremium) {
      console.log(`🚫 Premium user, not showing story limit paywall`);
      return;
    }
    showPaywall("story_limit");
  }, [showPaywall, isPremium]);

  const showActionLimitPaywall = useCallback(() => {
    if (isPremium) {
      console.log(`🚫 Premium user, not showing action limit paywall`);
      return;
    }
    showPaywall("action_limit");
  }, [showPaywall, isPremium]);

  const showRealPurchasePaywall = useCallback(() => {
    if (isPremium) {
      console.log(`🚫 Premium user, not showing real purchase paywall`);
      return;
    }
    showPaywall("real_purchase");
  }, [showPaywall, isPremium]);

  return {
    // State
    isVisible,
    triggerSource,
    actionCount,
    hasSeenWelcome,

    // Actions
    showPaywall,
    hidePaywall,
    trackAction,
    resetActionCount,

    // Subscription Management
    purchaseSubscription,
    restorePurchases,
    checkSubscriptionStatus,
    hasActiveSubscription,
    isInTrialPeriod,

    // Convenience Methods
    showWelcomePaywall,
    showPremiumCategoryPaywall,
    showStoryLimitPaywall,
    showActionLimitPaywall,
    showRealPurchasePaywall,
  };
};

// Additional utility hooks for specific use cases

// Hook for automatic action tracking
export const usePaywallActionTracker = () => {
  const { trackAction } = usePaywall();

  const trackUserAction = useCallback(
    (actionType: string) => {
      console.log(`📊 Tracking action: ${actionType}`);
      trackAction();
    },
    [trackAction]
  );

  return { trackUserAction };
};

// Hook for subscription status checking
export const useSubscriptionStatus = () => {
  const { checkSubscriptionStatus, hasActiveSubscription, isInTrialPeriod } =
    usePaywall();

  const getDetailedStatus = useCallback(async () => {
    const [status, isActive, inTrial] = await Promise.all([
      checkSubscriptionStatus(),
      hasActiveSubscription(),
      isInTrialPeriod(),
    ]);

    return {
      status,
      isActive,
      inTrial,
      isPremium: isActive || inTrial,
    };
  }, [checkSubscriptionStatus, hasActiveSubscription, isInTrialPeriod]);

  return {
    checkSubscriptionStatus,
    hasActiveSubscription,
    isInTrialPeriod,
    getDetailedStatus,
  };
};

// Hook for premium feature access control
export const usePremiumAccess = () => {
  const { hasActiveSubscription, isInTrialPeriod, showPremiumCategoryPaywall } =
    usePaywall();

  const checkPremiumAccess = useCallback(async (): Promise<boolean> => {
    const [isActive, inTrial] = await Promise.all([
      hasActiveSubscription(),
      isInTrialPeriod(),
    ]);

    return isActive || inTrial;
  }, [hasActiveSubscription, isInTrialPeriod]);

  const requirePremiumAccess = useCallback(
    async (onAccessGranted: () => void, onAccessDenied?: () => void) => {
      const hasAccess = await checkPremiumAccess();

      if (hasAccess) {
        onAccessGranted();
      } else {
        showPremiumCategoryPaywall();
        onAccessDenied?.();
      }
    },
    [checkPremiumAccess, showPremiumCategoryPaywall]
  );

  return {
    checkPremiumAccess,
    requirePremiumAccess,
  };
};
