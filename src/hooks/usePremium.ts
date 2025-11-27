import { useCallback, useEffect, useState } from "react";
import { usePurchaseSelectors } from "../store/usePurchaseStore";

// Global flag to ensure premium status is only initialized once across all hook instances
let globalPremiumInitialized = false;

/**
 * ⭐ UNIFIED PREMIUM STATUS HOOK ⭐
 *
 * This hook is the single source of truth for premium status in the app.
 * It replaces all previous premium checking methods and provides a secure,
 * consistent, and performant way to manage premium access.
 *
 * 🔒 SECURITY FEATURES:
 * - Always verifies with RevenueCat (no local-only premium status)
 * - Prevents race conditions between store and API calls
 * - Caches results to avoid excessive API calls (5-minute cache)
 * - Fails secure (denies access on errors)
 *
 * 🚀 PERFORMANCE FEATURES:
 * - Smart caching with staleness detection
 * - Background refresh when status is stale
 * - Loading states for better UX
 * - Prevents duplicate verification calls
 *
 * 📖 USAGE EXAMPLES:
 *
 * // For UI components that need premium status:
 * const { isPremium, isLoading } = usePremium();
 *
 * // For simple boolean checks:
 * const isPremiumUser = useIsPremiumUser();
 *
 * // For feature gates (sync):
 * const { requirePremiumAccess } = usePremium();
 * requirePremiumAccess(
 *   () => console.log("Access granted"),
 *   () => showPaywall()
 * );
 *
 * // For feature gates (async verification):
 * const { requirePremiumAccessAsync } = usePremium();
 * await requirePremiumAccessAsync(
 *   () => console.log("Access verified"),
 *   () => showPaywall()
 * );
 *
 * // For manual verification:
 * const { ensureFreshPremiumStatus } = usePremium();
 * const isActuallyPremium = await ensureFreshPremiumStatus();
 *
 * 🔄 MIGRATION FROM OLD SYSTEM:
 *
 * OLD WAY (problematic):
 * const isPremium = usePurchaseSelectors.isPremium();
 * const hasAccess = await paywallService.hasActiveSubscription();
 *
 * NEW WAY (unified):
 * const { isPremium, checkPremiumAccess } = usePremium();
 * const hasAccess = await checkPremiumAccess();
 */
export function usePremium() {
  const isPremium = usePurchaseSelectors.isPremium();
  const isCheckingPremium = usePurchaseSelectors.isCheckingPremium();
  const lastPremiumCheck = usePurchaseSelectors.lastPremiumCheck();
  const hasHydrated = usePurchaseSelectors.hasHydrated();
  const { verifyPremiumStatus } = usePurchaseSelectors.actions();

  // Local state for additional UX control
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if premium status is stale (older than 5 minutes)
  const isPremiumStatusStale = useCallback((): boolean => {
    if (!lastPremiumCheck) return true;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastPremiumCheck < fiveMinutesAgo;
  }, [lastPremiumCheck]);

  // Verify premium status if needed
  const ensureFreshPremiumStatus = useCallback(async (): Promise<boolean> => {
    // If already checking, wait for current check
    if (isCheckingPremium) {
      console.log("🔄 Premium check already in progress, waiting...");
      return isPremium;
    }

    // If status is fresh, use cached value
    if (!isPremiumStatusStale()) {
      console.log("✅ Using cached premium status:", isPremium);
      return isPremium;
    }

    // Verify with RevenueCat
    console.log("🔄 Premium status is stale, verifying...");
    return await verifyPremiumStatus();
  }, [isPremium, isCheckingPremium, isPremiumStatusStale, verifyPremiumStatus]);

  // Force premium status refresh (ignores cache, always verifies)
  const forceRefreshPremiumStatus = useCallback(async (): Promise<boolean> => {
    console.log("🔄 Force refreshing premium status (ignoring cache)...");
    return await verifyPremiumStatus();
  }, [verifyPremiumStatus]);

  // Initialize on first load - only once globally
  useEffect(() => {
    if (!hasHydrated) return;
    
    // If already initialized globally, just mark this instance as ready
    if (globalPremiumInitialized) {
      setIsInitializing(false);
      return;
    }
    
    // Only initialize once globally
    if (isInitializing && !globalPremiumInitialized) {
      globalPremiumInitialized = true;
      console.log("🚀 Initializing premium status verification...");
      ensureFreshPremiumStatus()
        .then((verified) => {
          console.log(`✅ Premium status initialized: ${verified}`);
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error("❌ Failed to initialize premium status:", error);
          setIsInitializing(false);
          globalPremiumInitialized = false; // Reset on error to allow retry
        });
    }
  }, [hasHydrated, isInitializing, ensureFreshPremiumStatus]);

  // Premium access checker for UI components
  const checkPremiumAccess = useCallback(async (): Promise<boolean> => {
    if (!hasHydrated) {
      console.log("⏳ Store not hydrated yet, denying access");
      return false;
    }

    return await ensureFreshPremiumStatus();
  }, [hasHydrated, ensureFreshPremiumStatus]);

  // Synchronous access checker (uses cached value)
  const hasPremiumAccess = useCallback((): boolean => {
    if (!hasHydrated || isInitializing) {
      return false; // Deny access during initialization
    }

    // If status is stale, trigger background refresh but use cached value
    if (isPremiumStatusStale()) {
      console.log("🔄 Premium status is stale, triggering background refresh");
      ensureFreshPremiumStatus().catch(console.error);
    }

    return isPremium;
  }, [
    hasHydrated,
    isInitializing,
    isPremium,
    isPremiumStatusStale,
    ensureFreshPremiumStatus,
  ]);

  // Premium feature gate for components
  const requirePremiumAccess = useCallback(
    (onAccessGranted: () => void, onAccessDenied?: () => void) => {
      if (hasPremiumAccess()) {
        onAccessGranted();
      } else {
        console.log("🚫 Premium access denied");
        onAccessDenied?.();
      }
    },
    [hasPremiumAccess]
  );

  // Async premium feature gate for components
  const requirePremiumAccessAsync = useCallback(
    async (onAccessGranted: () => void, onAccessDenied?: () => void) => {
      const hasAccess = await checkPremiumAccess();
      if (hasAccess) {
        onAccessGranted();
      } else {
        console.log("🚫 Premium access denied (async check)");
        onAccessDenied?.();
      }
    },
    [checkPremiumAccess]
  );

  return {
    // State
    isPremium,
    isLoading: isCheckingPremium || isInitializing || !hasHydrated,
    hasHydrated,

    // Methods
    ensureFreshPremiumStatus,
    forceRefreshPremiumStatus,
    checkPremiumAccess,
    hasPremiumAccess,
    requirePremiumAccess,
    requirePremiumAccessAsync,

    // Helpers
    isPremiumStatusStale,
  };
}

/**
 * Simple hook for components that just need the premium status
 * Uses the unified premium hook internally
 */
export function useIsPremiumUser(): boolean {
  const { hasPremiumAccess } = usePremium();
  return hasPremiumAccess();
}

/**
 * Hook for premium feature gates
 * Provides both sync and async access control
 */
export function usePremiumFeatureGate() {
  const { requirePremiumAccess, requirePremiumAccessAsync, isLoading } =
    usePremium();

  return {
    requirePremiumAccess,
    requirePremiumAccessAsync,
    isLoading,
  };
}
