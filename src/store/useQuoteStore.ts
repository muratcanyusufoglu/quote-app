import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { legacyQuoteService } from "../services/LegacyQuoteService";
import { Category, LocalizedQuote, Quote, QuoteStore } from "../types";
import { shouldResetDailyReads } from "../utils/dailyReset";

const STORE_VERSION = "2.1.0"; // Updated for system language detection

// QuoteStore slice for managing quotes, categories, and reading progress
const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      // State
      quotes: [],
      categories: [],
      favoriteQuotes: [],
      seenQuotes: [],
      lastReadQuotes: [],
      dailyReads: 0,
      currentStreak: 0,
      lastReadDate: "",
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Actions
      setQuotes: (quotes: Quote[]) => {
        set({ quotes });
        console.log(`Quotes updated: ${quotes.length} quotes loaded`);
      },

      setCategories: (categories: Category[]) => {
        set({ categories });
        console.log(
          `Categories updated: ${categories.length} categories loaded`
        );
      },

      addToFavorites: (quoteId: string) => {
        const state = get();
        if (!state.favoriteQuotes.includes(quoteId)) {
          const newFavorites = [...state.favoriteQuotes, quoteId];
          set({ favoriteQuotes: newFavorites });
          console.log(`Quote added to favorites: ${quoteId}`);
        }
      },

      removeFromFavorites: (quoteId: string) => {
        const state = get();
        const newFavorites = state.favoriteQuotes.filter(
          (id) => id !== quoteId
        );
        set({ favoriteQuotes: newFavorites });
        console.log(`Quote removed from favorites: ${quoteId}`);
      },

      markAsRead: (quote: LocalizedQuote) => {
        const state = get();
        const today = new Date().toISOString().split("T")[0]; // ISO format kullan

        // Check if we need to reset daily reads
        if (shouldResetDailyReads(state.lastReadDate)) {
          set({
            dailyReads: 1,
            lastReadDate: today,
            seenQuotes: [...state.seenQuotes, quote.id],
            lastReadQuotes: [quote],
          });
          console.log("Daily reads reset. Quote marked as read:", quote.id);

          // Streak'i sadece yeni gün başladığında güncelle
          get().updateStreak();
        } else {
          // Add to seen quotes if not already seen
          const newSeenQuotes = state.seenQuotes.includes(quote.id)
            ? state.seenQuotes
            : [...state.seenQuotes, quote.id];

          // Update last read quotes (keep last 10)
          const newLastReadQuotes = [
            quote,
            ...state.lastReadQuotes.slice(0, 9),
          ];

          set({
            dailyReads: state.dailyReads + 1,
            lastReadDate: today,
            seenQuotes: newSeenQuotes,
            lastReadQuotes: newLastReadQuotes,
          });
          console.log(
            `Quote marked as read: ${quote.id}. Daily reads: ${
              state.dailyReads + 1
            }`
          );
        }
      },

      addToSeen: (quoteId: string) => {
        const state = get();
        if (state.seenQuotes.includes(quoteId)) return;
        set({ seenQuotes: [...state.seenQuotes, quoteId] });
      },

      resetSeenQuotes: () => {
        set({ seenQuotes: [] });
        console.log("🔄 Seen quotes reset - starting fresh cycle");
      },

      resetDailyReads: () => {
        const today = new Date().toISOString().split("T")[0]; // ISO format kullan
        set({
          dailyReads: 0,
          lastReadDate: today,
        });
        console.log("Daily reads reset manually");
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split("T")[0]; // ISO format kullan
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        console.log("🔥 Updating streak:", {
          currentStreak: state.currentStreak,
          lastReadDate: state.lastReadDate,
          today,
          yesterday: yesterdayStr,
        });

        if (state.lastReadDate === today) {
          // Already read today, streak continues
          console.log(
            "✅ Already read today, streak continues:",
            state.currentStreak
          );
          return;
        } else if (state.lastReadDate === yesterdayStr) {
          // Read yesterday, increment streak
          const newStreak = state.currentStreak + 1;
          set({ currentStreak: newStreak });
          console.log(
            `🔥 Streak incremented: ${state.currentStreak} → ${newStreak}`
          );
        } else if (state.lastReadDate && state.lastReadDate < yesterdayStr) {
          // Missed a day, reset streak
          set({ currentStreak: 1 });
          console.log("💔 Streak reset to 1 - missed reading yesterday");
        } else {
          // First read, start streak
          set({ currentStreak: 1 });
          console.log("🌟 Streak started: 1");
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
      name: "quote-store",
      version: 1, // Zustand persist version
      storage: {
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            if (!value) return null;

            const parsed = JSON.parse(value);

            // Check if we need to migrate data
            if (parsed?.state?.version !== STORE_VERSION) {
              console.log(
                "🔄 Detected old data format, clearing store for migration..."
              );
              await AsyncStorage.removeItem(name);
              return null; // This will trigger fresh data load
            }

            return parsed;
          } catch (error) {
            console.error("Error loading quote data from AsyncStorage:", error);
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
                version: STORE_VERSION,
              },
            };
            await AsyncStorage.setItem(name, JSON.stringify(valueWithVersion));
          } catch (error) {
            console.error("Error saving quote data to AsyncStorage:", error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error(
              "Error removing quote data from AsyncStorage:",
              error
            );
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log("Quote store hydration started");
        if (state) {
          state.setHasHydrated(true);
          console.log("Quote store hydration completed");

          // Check if daily reads need to be reset
          if (shouldResetDailyReads(state.lastReadDate)) {
            state.resetDailyReads();
          }

          // Always reload quotes and categories to ensure we have latest multilingual format
          try {
            console.log(
              "🔄 Loading fresh multilingual data with legacy service..."
            );

            // Use legacy service for synchronous loading
            const quotes = legacyQuoteService.getAllQuotes();
            const categories = legacyQuoteService.getAllCategories();

            console.log("📚 Quotes loaded:", quotes.length);
            console.log("🏷️ Categories loaded:", categories.length);

            if (quotes.length > 0) {
              state.setQuotes(quotes);
            }
            if (categories.length > 0) {
              state.setCategories(categories);
            }
          } catch (error) {
            console.error("Failed to initialize quotes and categories:", error);
            state.setError("Failed to load quotes");
          }
        }
      },
      partialize: (state) => ({
        favoriteQuotes: state.favoriteQuotes,
        seenQuotes: state.seenQuotes,
        lastReadQuotes: state.lastReadQuotes,
        dailyReads: state.dailyReads,
        currentStreak: state.currentStreak,
        lastReadDate: state.lastReadDate,
        version: STORE_VERSION, // Store the version
        // Don't persist quotes and categories as they should be loaded fresh
        // Don't persist loading states or errors
      }),
    }
  )
);

// Stable selectors using useShallow to prevent infinite loops
export const useQuotes = () =>
  useQuoteStore(useShallow((state) => state.quotes));
export const useCategories = () =>
  useQuoteStore(useShallow((state) => state.categories));
export const useFavoriteQuoteIds = () =>
  useQuoteStore(useShallow((state) => state.favoriteQuotes));
export const useSeenQuoteIds = () =>
  useQuoteStore(useShallow((state) => state.seenQuotes));
export const useLastReadQuotes = () =>
  useQuoteStore(useShallow((state) => state.lastReadQuotes));
export const useDailyReads = () => useQuoteStore((state) => state.dailyReads);
export const useCurrentStreak = () =>
  useQuoteStore((state) => state.currentStreak);
export const useLastReadDate = () =>
  useQuoteStore((state) => state.lastReadDate);
export const useQuoteLoading = () => useQuoteStore((state) => state.isLoading);
export const useQuoteError = () => useQuoteStore((state) => state.error);
export const useQuoteHydrated = () =>
  useQuoteStore((state) => state._hasHydrated);
export const useHasHydrated = () =>
  useQuoteStore((state) => state._hasHydrated);
export const useFavoriteQuotes = () =>
  useQuoteStore(useShallow((state) => state.favoriteQuotes));
export const useSeenQuotes = () =>
  useQuoteStore(useShallow((state) => state.seenQuotes));

export const useQuoteActions = () =>
  useQuoteStore(
    useShallow((state) => ({
      setQuotes: state.setQuotes,
      setCategories: state.setCategories,
      addToFavorites: state.addToFavorites,
      removeFromFavorites: state.removeFromFavorites,
      markAsRead: state.markAsRead,
      addToSeen: state.addToSeen,
      resetSeenQuotes: state.resetSeenQuotes,
      resetDailyReads: state.resetDailyReads,
      updateStreak: state.updateStreak,
      setLoading: state.setLoading,
      setError: state.setError,
      setHasHydrated: state.setHasHydrated,
    }))
  );

export const useActions = () =>
  useQuoteStore(
    useShallow((state) => ({
      setQuotes: state.setQuotes,
      setCategories: state.setCategories,
      addToFavorites: state.addToFavorites,
      removeFromFavorites: state.removeFromFavorites,
      markAsRead: state.markAsRead,
      addToSeen: state.addToSeen,
      resetSeenQuotes: state.resetSeenQuotes,
      resetDailyReads: state.resetDailyReads,
      updateStreak: state.updateStreak,
      setLoading: state.setLoading,
      setError: state.setError,
      setHasHydrated: state.setHasHydrated,
    }))
  );

// Legacy selector object for backward compatibility
export const useQuoteSelectors = {
  quotes: useQuotes,
  categories: useCategories,
  favoriteQuotes: useFavoriteQuoteIds,
  seenQuotes: useSeenQuoteIds,
  lastReadQuotes: useLastReadQuotes,
  dailyReads: useDailyReads,
  currentStreak: useCurrentStreak,
  lastReadDate: useLastReadDate,
  isLoading: useQuoteLoading,
  error: useQuoteError,
  hasHydrated: useQuoteHydrated,
  actions: useQuoteActions,
};

export default useQuoteStore;
