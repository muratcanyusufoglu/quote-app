import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { purchaseService } from "../services/PurchaseService";
import revenueCatService from "../services/revenueCat";
import { PurchaseProduct, PurchaseStore } from "../types";

// Keep a singleton unsubscribe for RevenueCat updates in module scope
let unsubscribeRevenueCatUpdates: (() => void) | null = null;

// PurchaseStore slice for managing premium features and purchases
const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      // State
      isPremium: false,
      isCheckingPremium: false, // NEW: Loading state for premium checks
      lastPremiumCheck: null, // NEW: Timestamp of last successful check
      products: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      setPremium: (isPremium: boolean) => {
        set({
          isPremium,
          lastPremiumCheck: Date.now(),
          isCheckingPremium: false,
        });
        console.log(
          `Premium status updated: ${isPremium} at ${new Date().toISOString()}`
        );
      },

      setCheckingPremium: (isChecking: boolean) => {
        set({ isCheckingPremium: isChecking });
      },

      // NEW: Centralized premium status verification
      verifyPremiumStatus: async (): Promise<boolean> => {
        const state = get();

        // Prevent concurrent checks
        if (state.isCheckingPremium) {
          console.log("🔄 Premium check already in progress");
          return state.isPremium;
        }

        set({ isCheckingPremium: true });

        try {
          console.log("🔄 Verifying premium status with RevenueCat...");
          const actualIsPremium = await revenueCatService.isPremiumUser();

          // Update state with verified status
          set({
            isPremium: actualIsPremium,
            isCheckingPremium: false,
            lastPremiumCheck: Date.now(),
            error: null,
          });

          console.log(`✅ Premium status verified: ${actualIsPremium}`);
          return actualIsPremium;
        } catch (error) {
          console.error("❌ Failed to verify premium status:", error);

          // On error, keep current status but log the issue
          set({
            isCheckingPremium: false,
            error:
              error instanceof Error
                ? error.message
                : "Premium verification failed",
          });

          // Return current status as fallback
          return state.isPremium;
        }
      },

      setProducts: (products: PurchaseProduct[]) => {
        set({ products });
        console.log(`Products updated: ${products.length} products loaded`);
      },

      purchaseProduct: async (productId: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        console.log(`Purchasing product: ${productId}`);

        try {
          // Use the purchase service to handle the actual purchase
          const result = await purchaseService.purchasePremium(productId);

          if (result.success) {
            set({ isPremium: true, isLoading: false });
            console.log(`Purchase successful for product: ${productId}`);
            return true;
          } else {
            set({ isLoading: false, error: result.error || "Purchase failed" });
            console.log(`Purchase failed for product: ${productId}`);
            return false;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Purchase failed";
          set({ isLoading: false, error: errorMessage });
          console.error(`Purchase error for product ${productId}:`, error);
          return false;
        }
      },

      restorePurchases: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        console.log("Restoring purchases");

        try {
          const result = await purchaseService.restorePurchases();
          if (result.success) {
            set({
              isPremium: result.hasPremium,
              isLoading: false,
              error: null,
            });
            console.log(
              `Purchases restored. Premium status: ${result.hasPremium}`
            );
          } else {
            set({
              isLoading: false,
              error: result.error || "Failed to restore purchases",
            });
            console.log("Restore purchases failed:", result.error);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to restore purchases";
          set({ isLoading: false, error: errorMessage });
          console.error("Restore purchases error:", error);
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: "purchase-store",
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error(
              "Error loading purchase data from AsyncStorage:",
              error
            );
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error("Error saving purchase data to AsyncStorage:", error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error(
              "Error removing purchase data from AsyncStorage:",
              error
            );
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log("Purchase store hydration started");
        if (state) {
          state.setHasHydrated(true);
          console.log("Purchase store hydration completed");

          // Initialize products on hydration
          purchaseService
            .getProducts()
            .then((products: PurchaseProduct[]) => {
              if (products.length > 0) {
                state.setProducts(products);
              }
            })
            .catch((error: any) => {
              console.error("Failed to initialize purchases:", error);
            });

          // ENHANCED: Check and sync premium status with RevenueCat after hydration
          // Force verification to ensure accurate status
          console.log(
            "🔄 Starting premium status verification after hydration..."
          );
          state
            .verifyPremiumStatus()
            .then((isPremium: boolean) => {
              console.log(
                `✅ Premium status verified after hydration: ${isPremium}`
              );
            })
            .catch((error: any) => {
              console.error(
                "❌ Failed to verify premium status after hydration:",
                error
              );
            });

          // Subscribe to RevenueCat customer info updates to keep state in sync
          try {
            if (!unsubscribeRevenueCatUpdates) {
              console.log("👂 Subscribing to RevenueCat customer info updates");
              unsubscribeRevenueCatUpdates =
                revenueCatService.addCustomerInfoUpdateListener((isPremium) => {
                  usePurchaseStore.setState({
                    isPremium,
                    lastPremiumCheck: Date.now(),
                    isCheckingPremium: false,
                    error: null,
                  });
                  console.log(
                    `🔔 Premium status updated from listener: ${isPremium}`
                  );
                });
            }
          } catch (e) {
            console.error("❌ Failed to subscribe to RevenueCat updates:", e);
          }
        }
      },
      partialize: (state) => ({
        // Don't persist isPremium - always get from RevenueCat
        // Don't persist checking states or timestamps
        products: state.products,
      }),
    }
  )
);

// Stable selectors using useShallow to prevent infinite loops
export const usePremiumStatus = () =>
  usePurchaseStore((state) => state.isPremium);
export const useIsPremium = () => usePurchaseStore((state) => state.isPremium);
export const useIsCheckingPremium = () =>
  usePurchaseStore((state) => state.isCheckingPremium);
export const useLastPremiumCheck = () =>
  usePurchaseStore((state) => state.lastPremiumCheck);
export const usePurchaseProducts = () =>
  usePurchaseStore(useShallow((state) => state.products));
export const usePurchaseLoading = () =>
  usePurchaseStore((state) => state.isLoading);
export const usePurchaseError = () => usePurchaseStore((state) => state.error);
export const usePurchaseHydrated = () =>
  usePurchaseStore((state) => state._hasHydrated);

export const usePurchaseActions = () =>
  usePurchaseStore(
    useShallow((state) => ({
      setPremium: state.setPremium,
      setCheckingPremium: state.setCheckingPremium,
      verifyPremiumStatus: state.verifyPremiumStatus,
      setProducts: state.setProducts,
      purchaseProduct: state.purchaseProduct,
      restorePurchases: state.restorePurchases,
      setLoading: state.setLoading,
      setError: state.setError,
      setHasHydrated: state.setHasHydrated,
    }))
  );

// Legacy selector object for backward compatibility
export const usePurchaseSelectors = {
  isPremium: usePremiumStatus,
  isCheckingPremium: useIsCheckingPremium,
  lastPremiumCheck: useLastPremiumCheck,
  products: usePurchaseProducts,
  isLoading: usePurchaseLoading,
  error: usePurchaseError,
  hasHydrated: usePurchaseHydrated,
  actions: usePurchaseActions,
};

export default usePurchaseStore;
