import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { PaywallStore, PaywallTriggerSource } from "../types";

const ACTION_LIMIT = 15; // Her 15 aksiyonda bir paywall göster

// PaywallStore slice for managing paywall modal and triggers
const usePaywallStore = create<PaywallStore>()(
  persist(
    (set, get) => ({
      // State
      isVisible: false,
      actionCount: 0,
      lastShownDate: "",
      triggerSource: null,
      hasSeenWelcomePaywall: false,
      _hasHydrated: false,

      // Actions
      showPaywall: (source: PaywallTriggerSource) => {
        const today = new Date().toDateString();
        set({
          isVisible: true,
          triggerSource: source,
          lastShownDate: today,
        });
        console.log(`💰 Paywall shown with source: ${source}`);
      },

      hidePaywall: () => {
        set({
          isVisible: false,
          triggerSource: null,
        });
        console.log(`💰 Paywall hidden`);
      },

      trackAction: () => {
        const { actionCount, isVisible } = get();
        const newActionCount = actionCount + 1;

        set({ actionCount: newActionCount });
        console.log(`📊 Action tracked: ${newActionCount}/${ACTION_LIMIT}`);

        // Show paywall every ACTION_LIMIT actions (but not if already visible)
        if (newActionCount >= ACTION_LIMIT && !isVisible) {
          console.log(
            `🎯 Action limit reached (${ACTION_LIMIT}), showing paywall`
          );
          get().showPaywall("action_limit");
          get().resetActionCount();
        }
      },

      resetActionCount: () => {
        set({ actionCount: 0 });
        console.log(`🔄 Action count reset`);
      },

      markWelcomePaywallSeen: () => {
        set({ hasSeenWelcomePaywall: true });
        console.log(`✅ Welcome paywall marked as seen`);
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: "paywall-store",
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error(
              "Error loading paywall data from AsyncStorage:",
              error
            );
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error("Error saving paywall data to AsyncStorage:", error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error(
              "Error removing paywall data from AsyncStorage:",
              error
            );
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log("Paywall store hydration started");
        if (state) {
          state.setHasHydrated(true);
          console.log("Paywall store hydration completed");
        }
      },
      partialize: (state) => ({
        actionCount: state.actionCount,
        lastShownDate: state.lastShownDate,
        hasSeenWelcomePaywall: state.hasSeenWelcomePaywall,
        // Don't persist modal visibility or trigger source
      }),
    }
  )
);

// Stable selectors using useShallow to prevent infinite loops
export const usePaywallVisible = () =>
  usePaywallStore((state) => state.isVisible);
export const usePaywallActionCount = () =>
  usePaywallStore((state) => state.actionCount);
export const usePaywallTriggerSource = () =>
  usePaywallStore((state) => state.triggerSource);
export const usePaywallHasSeenWelcome = () =>
  usePaywallStore((state) => state.hasSeenWelcomePaywall);
export const usePaywallHydrated = () =>
  usePaywallStore((state) => state._hasHydrated);

export const usePaywallActions = () =>
  usePaywallStore(
    useShallow((state) => ({
      showPaywall: state.showPaywall,
      hidePaywall: state.hidePaywall,
      trackAction: state.trackAction,
      resetActionCount: state.resetActionCount,
      markWelcomePaywallSeen: state.markWelcomePaywallSeen,
      setHasHydrated: state.setHasHydrated,
    }))
  );

// Selector object for backward compatibility
export const usePaywallSelectors = {
  isVisible: usePaywallVisible,
  actionCount: usePaywallActionCount,
  triggerSource: usePaywallTriggerSource,
  hasSeenWelcome: usePaywallHasSeenWelcome,
  hasHydrated: usePaywallHydrated,
  actions: usePaywallActions,
};

export default usePaywallStore;
