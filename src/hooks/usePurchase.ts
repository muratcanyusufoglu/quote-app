import React, { useCallback, useMemo } from "react";
import { purchaseService } from "../services/PurchaseService";
import { usePurchaseSelectors } from "../store/usePurchaseStore";
import { useQuoteSelectors } from "../store/useQuoteStore";

// Hook that provides purchase functionality to UI components
export function usePurchase() {
  // Get state from stores
  const isPremium = usePurchaseSelectors.isPremium();
  const products = usePurchaseSelectors.products();
  const isLoading = usePurchaseSelectors.isLoading();
  const error = usePurchaseSelectors.error();
  const hasHydrated = usePurchaseSelectors.hasHydrated();

  const dailyReads = useQuoteSelectors.dailyReads();

  const actions = usePurchaseSelectors.actions();

  // Purchase methods
  const purchaseMethods = useMemo(
    () => ({
      // Purchase premium
      purchasePremium: async (productId: string): Promise<boolean> => {
        purchaseService.trackPaywallShown("manual_purchase");
        return await actions.purchaseProduct(productId);
      },

      // Restore purchases
      restorePurchases: async (): Promise<void> => {
        await actions.restorePurchases();
      },

      // Check if user can read story
      canReadStory: (): boolean => {
        return purchaseService.canReadStory(dailyReads, isPremium);
      },

      // Get remaining story reads for free users
      getRemainingStoryReads: (): number => {
        return purchaseService.getRemainingStoryReads(dailyReads, isPremium);
      },

      // Check if user can access category
      canAccessCategory: (categoryIsPremium: boolean): boolean => {
        return purchaseService.canAccessCategory(isPremium, categoryIsPremium);
      },

      // Get premium benefits
      getPremiumBenefits: (): string[] => {
        return purchaseService.getPremiumBenefits();
      },

      // Get premium features for upsell
      getPremiumFeatures: (): Array<{
        icon: string;
        title: string;
        description: string;
      }> => {
        return purchaseService.getPremiumFeatures();
      },

      // Calculate savings
      calculateSavings: () => {
        return purchaseService.calculateSavings();
      },

      // Get upsell message based on context
      getUpsellMessage: (
        context: "story_limit" | "premium_category" | "feature_locked"
      ) => {
        return purchaseService.getUpsellMessage(context);
      },

      // Track premium feature usage
      trackPremiumFeatureUsed: (feature: string) => {
        purchaseService.trackPremiumFeatureUsed(feature);
      },

      // Track paywall shown
      trackPaywallShown: (trigger: string) => {
        purchaseService.trackPaywallShown(trigger);
      },
    }),
    [actions, dailyReads, isPremium]
  );

  // Computed values
  const computed = useMemo(
    () => ({
      // Purchase state
      purchaseState: {
        isPremium,
        isLoading,
        error,
        hasProducts: products.length > 0,
        hasHydrated,
      },

      // Free tier info
      freeTierInfo: purchaseService.getFreeTierInfo(),

      // Check if story limit reached
      isStoryLimitReached: !purchaseService.canReadStory(dailyReads, isPremium),

      // Remaining reads for today
      remainingReads: purchaseService.getRemainingStoryReads(
        dailyReads,
        isPremium
      ),

      // Primary purchase product (lifetime)
      primaryProduct: products.find((p) => p.identifier === "premium_lifetime"),

      // All products
      availableProducts: products,
    }),
    [isPremium, isLoading, error, products, dailyReads, hasHydrated]
  );

  return {
    // State
    isPremium,
    products,
    isLoading,
    error,
    hasHydrated,
    dailyReads,

    // Methods
    ...purchaseMethods,

    // Computed values
    ...computed,

    // Actions
    setPremium: actions.setPremium,
    setProducts: actions.setProducts,
    setLoading: actions.setLoading,
    setError: actions.setError,
  };
}

// Specialized hook for paywall/upsell screens
export function usePaywall(
  trigger: "story_limit" | "premium_category" | "feature_locked"
) {
  const purchase = usePurchase();

  // Track paywall shown on mount
  React.useEffect(() => {
    purchase.trackPaywallShown(trigger);
  }, [trigger, purchase]);

  return {
    ...purchase,
    upsellMessage: purchase.getUpsellMessage(trigger),
    shouldShowPaywall: !purchase.isPremium,
  };
}

// Hook for purchase button component
export function usePurchaseButton(productId: string) {
  const purchase = usePurchase();

  const product = useMemo(
    () => purchase.products.find((p) => p.identifier === productId),
    [purchase.products, productId]
  );

  const handlePurchase = useCallback(async () => {
    if (!product) return false;
    return await purchase.purchasePremium(product.identifier);
  }, [product, purchase]);

  return {
    product,
    isLoading: purchase.isLoading,
    error: purchase.error,
    isPremium: purchase.isPremium,
    handlePurchase,
    isDisabled: !product || purchase.isLoading || purchase.isPremium,
  };
}

// Hook for premium feature gates
export function usePremiumFeature(featureName: string) {
  const purchase = usePurchase();

  const canAccess = purchase.isPremium;

  const requestAccess = useCallback(() => {
    if (!canAccess) {
      purchase.trackPaywallShown(`feature_${featureName}`);
      return false;
    }
    purchase.trackPremiumFeatureUsed(featureName);
    return true;
  }, [canAccess, featureName, purchase]);

  return {
    canAccess,
    requestAccess,
    isPremium: purchase.isPremium,
    isLoading: purchase.isLoading,
  };
}

// Hook for story reading with limits
export function useStoryReading() {
  const purchase = usePurchase();

  const canRead = purchase.canReadStory();
  const remainingReads = purchase.getRemainingStoryReads();

  const requestRead = useCallback(() => {
    if (!canRead && !purchase.isPremium) {
      purchase.trackPaywallShown("story_limit");
      return false;
    }
    return true;
  }, [canRead, purchase]);

  return {
    canRead,
    remainingReads,
    requestRead,
    isPremium: purchase.isPremium,
    isStoryLimitReached: purchase.isStoryLimitReached,
    upsellMessage: purchase.getUpsellMessage("story_limit"),
  };
}

export default usePurchase;
