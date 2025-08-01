import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { purchaseService } from "../services/PurchaseService";
import revenueCatService from "../services/revenueCat";
import { PurchaseProduct, PurchaseStore } from "../types";

// PurchaseStore slice for managing premium features and purchases
const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      // State
      isPremium: false,
      products: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      setPremium: (isPremium: boolean) => {
        set({ isPremium });
        console.log(`Premium status updated: ${isPremium}`);
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

          // Check and sync premium status with RevenueCat after hydration
          revenueCatService
            .isPremiumUser()
            .then((isPremium: boolean) => {
              console.log(`🔄 RevenueCat premium status synced: ${isPremium}`);
              if (isPremium !== state.isPremium) {
                state.setPremium(isPremium);
                console.log(
                  `✅ Premium status updated from RevenueCat: ${isPremium}`
                );
              }
            })
            .catch((error: any) => {
              console.error(
                "Failed to sync premium status with RevenueCat:",
                error
              );
            });
        }
      },
      partialize: (state) => ({
        isPremium: state.isPremium,
        products: state.products,
        // Don't persist loading states or errors
      }),
    }
  )
);

// Stable selectors using useShallow to prevent infinite loops
export const usePremiumStatus = () =>
  usePurchaseStore((state) => state.isPremium);
export const useIsPremium = () => usePurchaseStore((state) => state.isPremium);
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
  products: usePurchaseProducts,
  isLoading: usePurchaseLoading,
  error: usePurchaseError,
  hasHydrated: usePurchaseHydrated,
  actions: usePurchaseActions,
};

export default usePurchaseStore;
