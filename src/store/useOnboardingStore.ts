import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { OnboardingAnswer, OnboardingStore, UserPreferences } from "../types";
import { getSystemLanguage, SupportedLanguage } from "../utils/language";

const ONBOARDING_STORE_VERSION = "2.1.0"; // Updated for system language detection

// OnboardingStore slice for managing onboarding flow and user preferences
const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // State
      isCompleted: false,
      currentStep: 0,
      answers: [],
      userPreferences: null,
      _hasHydrated: false,

      // Actions
      setCompleted: (completed: boolean) => {
        set({ isCompleted: completed });
        console.log(`Onboarding completion status: ${completed}`);
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
        console.log(`Onboarding step updated: ${step}`);
      },

      addAnswer: (answer: OnboardingAnswer) => {
        const state = get();
        const existingIndex = state.answers.findIndex(
          (a) => a.questionId === answer.questionId
        );

        let newAnswers: OnboardingAnswer[];
        if (existingIndex >= 0) {
          // Update existing answer
          newAnswers = [...state.answers];
          newAnswers[existingIndex] = answer;
        } else {
          // Add new answer
          newAnswers = [...state.answers, answer];
        }

        set({ answers: newAnswers });
        console.log(
          `Answer added/updated for question: ${answer.questionId}`,
          answer.value
        );
      },

      updateAnswer: (questionId: string, value: string | string[] | number) => {
        const state = get();
        const existingIndex = state.answers.findIndex(
          (a) => a.questionId === questionId
        );

        const answer: OnboardingAnswer = { questionId, value };

        let newAnswers: OnboardingAnswer[];
        if (existingIndex >= 0) {
          newAnswers = [...state.answers];
          newAnswers[existingIndex] = answer;
        } else {
          newAnswers = [...state.answers, answer];
        }

        set({ answers: newAnswers });
        console.log(`Answer updated for question: ${questionId}`, value);
      },

      generatePreferences: () => {
        const state = get();
        const answers = state.answers;
        const systemLanguage = getSystemLanguage();

        console.log(
          `🌍 Generating preferences with system language: ${systemLanguage}`
        );

        // Transform answers into user preferences
        const preferences: UserPreferences = {
          selectedCategories: [],
          favoriteQuotes: [],
          seenQuotes: [],
          language: systemLanguage, // Use system language as default
          motivationStyle: "balanced",
          stressResponse: "reflection",
          preferredTime: "morning",
          readingLength: "medium",
          topics: [],
          frequency: "daily",
          preferredLanguages: [systemLanguage], // Include system language
        };

        // Process each answer to build preferences
        answers.forEach((answer) => {
          switch (answer.questionId) {
            case "motivation_style":
              if (typeof answer.value === "string") {
                preferences.motivationStyle = answer.value as
                  | "gentle"
                  | "strong"
                  | "balanced";
              }
              break;

            case "stress_response":
              if (typeof answer.value === "string") {
                preferences.stressResponse = answer.value as
                  | "meditation"
                  | "action"
                  | "reflection";
              }
              break;

            case "preferred_time":
              if (typeof answer.value === "string") {
                preferences.preferredTime = answer.value as
                  | "morning"
                  | "afternoon"
                  | "evening";
              }
              break;

            case "reading_length":
              if (typeof answer.value === "string") {
                preferences.readingLength = answer.value as
                  | "short"
                  | "medium"
                  | "long";
              }
              break;

            case "topics":
              if (Array.isArray(answer.value)) {
                preferences.topics = answer.value;
                // Map topics to categories based on language
                const topicToCategoryMap: Record<string, string[]> =
                  systemLanguage === "tr"
                    ? {
                        success: ["basari", "motivasyon"],
                        happiness: ["mutluluk"],
                        wisdom: ["bilgelik"],
                        love: ["ask"],
                        growth: ["gelisim"],
                        peace: ["huzur"],
                        strength: ["guc"],
                      }
                    : {
                        success: ["success", "motivation"],
                        happiness: ["happiness"],
                        wisdom: ["wisdom"],
                        love: ["love"],
                        growth: ["growth"],
                        peace: ["peace"],
                        strength: ["strength"],
                      };

                const selectedCategories: string[] = [];
                answer.value.forEach((topic) => {
                  const categories = topicToCategoryMap[topic.toLowerCase()];
                  if (categories) {
                    selectedCategories.push(...categories);
                  }
                });
                preferences.selectedCategories = [
                  ...new Set(selectedCategories),
                ];
              }
              break;

            case "frequency":
              if (typeof answer.value === "string") {
                preferences.frequency = answer.value as
                  | "daily"
                  | "weekly"
                  | "occasional";
              }
              break;

            case "languages":
              if (Array.isArray(answer.value)) {
                preferences.preferredLanguages =
                  answer.value as SupportedLanguage[];
                preferences.language =
                  (answer.value[0] as SupportedLanguage) || systemLanguage;
              }
              break;

            default:
              // Handle other question types
              break;
          }
        });

        // Ensure at least some default categories are selected based on language
        if (preferences.selectedCategories.length === 0) {
          preferences.selectedCategories =
            preferences.language === "tr"
              ? ["motivasyon", "basari", "mutluluk"]
              : ["motivation", "success", "happiness"];
        }

        set({ userPreferences: preferences });
        console.log(
          "✅ User preferences generated with language:",
          preferences.language,
          preferences
        );
      },

      resetOnboarding: () => {
        set({
          isCompleted: false,
          currentStep: 0,
          answers: [],
          userPreferences: null,
        });
        console.log("Onboarding reset");
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: "onboarding-store",
      version: 1, // Zustand persist version
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            if (!value) return null;

            const parsed = JSON.parse(value);

            // Check if we need to migrate data
            if (parsed?.state?.version !== ONBOARDING_STORE_VERSION) {
              console.log(
                "🔄 Onboarding: Detected old data format, clearing for language migration..."
              );
              await AsyncStorage.removeItem(name);
              return null; // This will trigger fresh data load with system language
            }

            return parsed;
          } catch (error) {
            console.error(
              "Error loading onboarding data from AsyncStorage:",
              error
            );
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            // Add version to the stored data
            const valueWithVersion = {
              ...value,
              state: {
                ...value.state,
                version: ONBOARDING_STORE_VERSION,
              },
            };
            await AsyncStorage.setItem(name, JSON.stringify(valueWithVersion));
          } catch (error) {
            console.error(
              "Error saving onboarding data to AsyncStorage:",
              error
            );
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error(
              "Error removing onboarding data from AsyncStorage:",
              error
            );
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log("Onboarding store hydration started");
        if (state) {
          state.setHasHydrated(true);
          console.log("Onboarding store hydration completed");

          // Generate preferences if onboarding is completed but preferences don't exist
          if (
            state.isCompleted &&
            !state.userPreferences &&
            state.answers.length > 0
          ) {
            state.generatePreferences();
          }

          // Set default preferences if none exist (for testing without onboarding)
          if (!state.userPreferences) {
            const systemLanguage = getSystemLanguage();
            console.log(
              `🌍 Setting default preferences with system language: ${systemLanguage}`
            );

            const defaultPreferences: UserPreferences = {
              selectedCategories:
                systemLanguage === "tr"
                  ? ["motivasyon", "basari", "mutluluk"]
                  : ["motivation", "success", "happiness"],
              favoriteQuotes: [],
              seenQuotes: [],
              language: systemLanguage,
              motivationStyle: "balanced",
              stressResponse: "reflection",
              preferredTime: "morning",
              readingLength: "medium",
              topics: ["success", "happiness", "wisdom"],
              frequency: "daily",
              preferredLanguages: [systemLanguage],
            };
            state.userPreferences = defaultPreferences;
            console.log(
              "✅ Default user preferences set with language:",
              systemLanguage
            );
          }
        }
      },
      partialize: (state) => ({
        isCompleted: state.isCompleted,
        currentStep: state.currentStep,
        answers: state.answers,
        userPreferences: state.userPreferences,
        version: ONBOARDING_STORE_VERSION, // Store the version
      }),
    }
  )
);

// Stable selectors using useShallow to prevent infinite loops
export const useOnboardingCompleted = () =>
  useOnboardingStore((state) => state.isCompleted);
export const useOnboardingStep = () =>
  useOnboardingStore((state) => state.currentStep);
export const useOnboardingAnswers = () =>
  useOnboardingStore(useShallow((state) => state.answers));
export const useUserPreferences = () =>
  useOnboardingStore((state) => state.userPreferences);
export const useOnboardingHydrated = () =>
  useOnboardingStore((state) => state._hasHydrated);

export const useOnboardingActions = () =>
  useOnboardingStore(
    useShallow((state) => ({
      setCompleted: state.setCompleted,
      setCurrentStep: state.setCurrentStep,
      addAnswer: state.addAnswer,
      updateAnswer: state.updateAnswer,
      generatePreferences: state.generatePreferences,
      resetOnboarding: state.resetOnboarding,
      setHasHydrated: state.setHasHydrated,
    }))
  );

// Legacy selector object for backward compatibility
export const useOnboardingSelectors = {
  isCompleted: useOnboardingCompleted,
  currentStep: useOnboardingStep,
  answers: useOnboardingAnswers,
  userPreferences: useUserPreferences,
  hasHydrated: useOnboardingHydrated,
  actions: useOnboardingActions,
};

export default useOnboardingStore;
