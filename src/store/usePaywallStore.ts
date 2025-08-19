import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { PaywallStore, PaywallTriggerSource } from "../types";

const ACTION_LIMIT = 15; // Her 15 aksiyonda bir paywall göster
const SECOND_PAYWALL_INTERACTION_COUNT = 5; // İkinci paywall için gerekli interaction sayısı (daha uzun gecikme)

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

      // Progressive paywall tracking
      hasSeenFirstTimePaywall: false,
      hasSeenDiscountPaywall: false,
      userInteractionCount: 0,
      onboardingCompletedDate: null,

      // Actions
      showPaywall: (source: PaywallTriggerSource) => {
        // Premium kontrolü yaparak gereksiz paywall gösterimini engelle
        // Note: Bu kontrol sadece store seviyesinde bir güvenlik önlemi,
        // asıl kontrol PaywallModal component'inde yapılıyor
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

      // Progressive paywall methods
      markOnboardingCompleted: () => {
        const today = new Date().toISOString();
        set({
          onboardingCompletedDate: today,
          userInteractionCount: 0, // Reset interaction count
        });
        console.log(`✅ Onboarding completed, ready for first-time paywall`);
      },

      showFirstTimePaywall: () => {
        const { hasSeenFirstTimePaywall, isVisible } = get();

        if (!hasSeenFirstTimePaywall && !isVisible) {
          console.log(`🎉 Showing first-time paywall after onboarding`);
          set({ hasSeenFirstTimePaywall: true });
          get().showPaywall("first_time");
        }
      },

      trackUserInteraction: () => {
        const {
          userInteractionCount,
          hasSeenFirstTimePaywall,
          hasSeenDiscountPaywall,
          isVisible,
        } = get();

        const newCount = userInteractionCount + 1;
        set({ userInteractionCount: newCount });

        console.log(
          `🎯 User interaction tracked: ${newCount}/${SECOND_PAYWALL_INTERACTION_COUNT}`
        );

        // Show discounted paywall after specific interactions
        if (
          hasSeenFirstTimePaywall &&
          !hasSeenDiscountPaywall &&
          newCount >= SECOND_PAYWALL_INTERACTION_COUNT &&
          !isVisible
        ) {
          console.log(
            `💸 Showing discounted paywall after ${newCount} interactions`
          );
          set({
            hasSeenDiscountPaywall: true,
            userInteractionCount: 0, // Reset for potential future use
          });
          get().showPaywall("discounted");
        }
      },

      resetProgressivePaywall: () => {
        set({
          hasSeenFirstTimePaywall: false,
          hasSeenDiscountPaywall: false,
          userInteractionCount: 0,
          onboardingCompletedDate: null,
        });
        console.log(`🔄 Progressive paywall state reset`);
      },

      // Reset just the interaction count for delayed discount tracking
      resetInteractionCountForDiscount: () => {
        set({
          userInteractionCount: 0,
          hasSeenDiscountPaywall: false,
        });
        console.log(`🎯 Interaction count reset for delayed discount tracking`);
      },

      // Getters for paywall version detection
      isFirstTimePaywall: () => {
        const { triggerSource } = get();
        return triggerSource === "first_time";
      },

      isDiscountedPaywall: () => {
        const { triggerSource } = get();
        return triggerSource === "discounted";
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
        hasSeenFirstTimePaywall: state.hasSeenFirstTimePaywall,
        hasSeenDiscountPaywall: state.hasSeenDiscountPaywall,
        userInteractionCount: state.userInteractionCount,
        onboardingCompletedDate: state.onboardingCompletedDate,
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

export const usePaywallSelectors = {
  isVisible: () => usePaywallStore(useShallow((state) => state.isVisible)),
  triggerSource: () =>
    usePaywallStore(useShallow((state) => state.triggerSource)),
  actionCount: () => usePaywallStore(useShallow((state) => state.actionCount)),
  hasSeenWelcome: () =>
    usePaywallStore(useShallow((state) => state.hasSeenWelcomePaywall)),
  hasHydrated: () => usePaywallStore(useShallow((state) => state._hasHydrated)),

  // Progressive paywall selectors
  hasSeenFirstTime: () =>
    usePaywallStore(useShallow((state) => state.hasSeenFirstTimePaywall)),
  hasSeenDiscount: () =>
    usePaywallStore(useShallow((state) => state.hasSeenDiscountPaywall)),
  userInteractionCount: () =>
    usePaywallStore(useShallow((state) => state.userInteractionCount)),
  isFirstTimePaywall: () =>
    usePaywallStore(useShallow((state) => state.isFirstTimePaywall())),
  isDiscountedPaywall: () =>
    usePaywallStore(useShallow((state) => state.isDiscountedPaywall())),

  actions: () =>
    usePaywallStore(
      useShallow((state) => ({
        showPaywall: state.showPaywall,
        hidePaywall: state.hidePaywall,
        trackAction: state.trackAction,
        resetActionCount: state.resetActionCount,
        markWelcomePaywallSeen: state.markWelcomePaywallSeen,
        setHasHydrated: state.setHasHydrated,

        // Progressive paywall actions
        markOnboardingCompleted: state.markOnboardingCompleted,
        showFirstTimePaywall: state.showFirstTimePaywall,
        trackUserInteraction: state.trackUserInteraction,
        resetProgressivePaywall: state.resetProgressivePaywall,
        resetInteractionCountForDiscount:
          state.resetInteractionCountForDiscount,
      }))
    ),
};

export default usePaywallStore;
