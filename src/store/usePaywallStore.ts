import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { PaywallStore, PaywallTriggerSource } from "../types";

const ACTION_LIMIT = 15;
const PAYWALL3_SWIPE_THRESHOLD = 5; // 5 swipe sonra 3. paywall

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
      hasSeenSecondDiscountPaywall: false,
      userInteractionCount: 0,
      swipeCountForPaywall3: 0, // session-only, not persisted
      onboardingCompletedDate: null,

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

        if (newActionCount >= ACTION_LIMIT && !isVisible) {
          console.log(`🎯 Action limit reached (${ACTION_LIMIT}), showing paywall`);
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
          userInteractionCount: 0,
          swipeCountForPaywall3: 0,
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

      // Paywall #2 artık PaywallModal'ın handleClose() içinden tetikleniyor.
      // Bu metot geriye dönük uyumluluk için bırakıldı.
      trackUserInteraction: () => {
        const { userInteractionCount } = get();
        set({ userInteractionCount: userInteractionCount + 1 });
        console.log(`🎯 User interaction tracked: ${userInteractionCount + 1}`);
      },

      // Paywall #3 — Swipe tracker (5 swipe sonra 3. paywall)
      trackSwipeForPaywall3: () => {
        const {
          hasSeenFirstTimePaywall,
          hasSeenDiscountPaywall,
          hasSeenSecondDiscountPaywall,
          swipeCountForPaywall3,
          isVisible,
        } = get();

        // Sadece ilk 2 paywall görülmüş ama 3. görülmemişse takip et
        if (
          !hasSeenFirstTimePaywall ||
          !hasSeenDiscountPaywall ||
          hasSeenSecondDiscountPaywall ||
          isVisible
        ) {
          return;
        }

        const newCount = swipeCountForPaywall3 + 1;
        set({ swipeCountForPaywall3: newCount });
        console.log(
          `📖 Swipe for paywall3: ${newCount}/${PAYWALL3_SWIPE_THRESHOLD}`
        );

        if (newCount >= PAYWALL3_SWIPE_THRESHOLD) {
          console.log(`💸 Showing 3rd paywall (second_discount) after ${newCount} swipes`);
          set({
            hasSeenSecondDiscountPaywall: true,
            swipeCountForPaywall3: 0,
          });
          // Swipe'ın ortasında değil, kısa delay ile göster
          setTimeout(() => {
            get().showPaywall3();
          }, 1500);
        }
      },

      showPaywall3: () => {
        const { isVisible } = get();
        if (!isVisible) {
          get().showPaywall("second_discount");
        }
      },

      resetProgressivePaywall: () => {
        set({
          hasSeenFirstTimePaywall: false,
          hasSeenDiscountPaywall: false,
          hasSeenSecondDiscountPaywall: false,
          userInteractionCount: 0,
          swipeCountForPaywall3: 0,
          onboardingCompletedDate: null,
        });
        console.log(`🔄 Progressive paywall state reset`);
      },

      resetInteractionCountForDiscount: () => {
        set({
          userInteractionCount: 0,
          hasSeenDiscountPaywall: false,
        });
        console.log(`🎯 Interaction count reset for delayed discount tracking`);
      },

      // Getters
      isFirstTimePaywall: () => {
        const { triggerSource } = get();
        return triggerSource === "first_time";
      },

      isDiscountedPaywall: () => {
        const { triggerSource } = get();
        return triggerSource === "discounted";
      },

      isSecondDiscountPaywall: () => {
        const { triggerSource } = get();
        return triggerSource === "second_discount";
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
            console.error("Error loading paywall data from AsyncStorage:", error);
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
            console.error("Error removing paywall data from AsyncStorage:", error);
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
        hasSeenSecondDiscountPaywall: state.hasSeenSecondDiscountPaywall,
        userInteractionCount: state.userInteractionCount,
        onboardingCompletedDate: state.onboardingCompletedDate,
        // swipeCountForPaywall3 intentionally NOT persisted (session-only)
      }),
    }
  )
);

// Stable selectors
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
  hasHydrated: () =>
    usePaywallStore(useShallow((state) => state._hasHydrated)),

  // Progressive paywall selectors
  hasSeenFirstTime: () =>
    usePaywallStore(useShallow((state) => state.hasSeenFirstTimePaywall)),
  hasSeenDiscount: () =>
    usePaywallStore(useShallow((state) => state.hasSeenDiscountPaywall)),
  hasSeenSecondDiscount: () =>
    usePaywallStore(useShallow((state) => state.hasSeenSecondDiscountPaywall)),
  userInteractionCount: () =>
    usePaywallStore(useShallow((state) => state.userInteractionCount)),
  isFirstTimePaywall: () =>
    usePaywallStore(useShallow((state) => state.isFirstTimePaywall())),
  isDiscountedPaywall: () =>
    usePaywallStore(useShallow((state) => state.isDiscountedPaywall())),
  isSecondDiscountPaywall: () =>
    usePaywallStore(useShallow((state) => state.isSecondDiscountPaywall())),

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
        trackSwipeForPaywall3: state.trackSwipeForPaywall3,
        showPaywall3: state.showPaywall3,
        resetProgressivePaywall: state.resetProgressivePaywall,
        resetInteractionCountForDiscount:
          state.resetInteractionCountForDiscount,
      }))
    ),
};

export default usePaywallStore;
