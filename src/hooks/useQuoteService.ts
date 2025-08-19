import { useMemo } from "react";
import { legacyQuoteService } from "../services/LegacyQuoteService";
import { useOnboardingSelectors } from "../store/useOnboardingStore";
import { usePurchaseSelectors } from "../store/usePurchaseStore";
import { useQuoteSelectors } from "../store/useQuoteStore";
import { LocalizedCategory, LocalizedQuote } from "../types";
import { getTimeOfDay } from "../utils/dailyReset";
import { getPreferredLanguage, SupportedLanguage } from "../utils/language";
import { usePremium } from "./usePremium";

// Hook that provides quote data to UI components using legacy service for backward compatibility
export function useQuoteService() {
  // Get state from stores using individual selectors to avoid unnecessary re-renders
  const quotes = useQuoteSelectors.quotes();
  const categories = useQuoteSelectors.categories();
  const seenQuotes = useQuoteSelectors.seenQuotes();
  const favoriteQuotes = useQuoteSelectors.favoriteQuotes();
  const dailyReads = useQuoteSelectors.dailyReads();
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();

  // UNIFIED: Use unified premium system instead of usePurchaseSelectors
  const { isPremium } = usePremium();
  const purchaseStoreHydrated = usePurchaseSelectors.hasHydrated();

  const userPreferences = useOnboardingSelectors.userPreferences();
  const onboardingStoreHydrated = useOnboardingSelectors.hasHydrated();

  const actions = useQuoteSelectors.actions();

  // Check if all stores are hydrated
  const isReady =
    quoteStoreHydrated && purchaseStoreHydrated && onboardingStoreHydrated;

  // Get user's preferred language with smart detection
  const language = useMemo(() => {
    const preferredLang = getPreferredLanguage(
      userPreferences?.language as SupportedLanguage
    );
    if (__DEV__) console.log("🌍 Final language selection:", preferredLang);
    return preferredLang;
  }, [userPreferences?.language]);

  // Stable references to avoid infinite loops
  const stableQuotes = useMemo(() => quotes, [quotes.length]);
  const stableSeenQuotes = useMemo(() => seenQuotes, [seenQuotes.length]);
  const stableFavoriteQuotes = useMemo(
    () => favoriteQuotes,
    [favoriteQuotes.length]
  );

  // Memoized quote service methods with stable dependencies - all using legacy service
  const quoteMethods = useMemo(
    () => ({
      // Get available categories based on premium status and language
      getAvailableCategories: (): LocalizedCategory[] => {
        return legacyQuoteService.getAvailableCategories(isPremium, language);
      },

      // Get personalized home feed quotes
      getHomeFeedQuotes: (count: number = 10): LocalizedQuote[] => {
        if (__DEV__) {
          console.log(`🏠 Getting home feed quotes for language: ${language}`);
          console.log(
            `🏠 isPremium: ${isPremium}, seenQuotes: ${stableSeenQuotes.length}`
          );
          console.log(`🏠 userPreferences:`, userPreferences);
        }

        // For non-premium users, always use general quotes regardless of preferences
        if (!isPremium) {
          if (__DEV__)
            console.log(`🏠 Non-premium user - using general quotes only`);
          const quotes = legacyQuoteService.getRandomUnseenQuotes(
            count,
            stableSeenQuotes,
            isPremium,
            language
            // No selectedCategories - this will default to all accessible categories (only general)
          );
          if (__DEV__)
            console.log(
              `📚 Non-premium, loaded ${quotes.length} quotes in ${language}`
            );
          return quotes;
        }

        if (!userPreferences) {
          if (__DEV__)
            console.log(
              `🏠 Premium user, no preferences - using getRandomUnseenQuotes`
            );
          const quotes = legacyQuoteService.getRandomUnseenQuotes(
            count,
            stableSeenQuotes,
            isPremium,
            language
          );
          if (__DEV__)
            console.log(
              `📚 Premium no preferences, loaded ${quotes.length} quotes in ${language}`
            );
          return quotes;
        }
        console.log(
          `🏠 Premium user with preferences - using getPersonalizedQuotes`
        );
        const quotes = legacyQuoteService.getPersonalizedQuotes(
          count,
          { ...userPreferences, language }, // Ensure language is set in preferences
          stableSeenQuotes,
          isPremium
        );
        console.log(
          `👤 Premium with preferences, loaded ${quotes.length} quotes in ${language}`
        );
        return quotes;
      },

      // Get quotes for explore screen by categories
      getExploreQuotes: (
        selectedCategories: string[],
        count: number = 20
      ): LocalizedQuote[] => {
        console.log(`🔍 Getting explore quotes for language: ${language}`);
        const quotes = legacyQuoteService.getRandomUnseenQuotes(
          count,
          stableSeenQuotes,
          isPremium,
          language,
          selectedCategories
        );
        console.log(`🔍 Loaded ${quotes.length} explore quotes in ${language}`);
        return quotes;
      },

      // Get time-based quotes (morning motivation, evening reflection, etc.)
      getTimeBasedQuotes: (count: number = 5): LocalizedQuote[] => {
        const timeOfDay = getTimeOfDay();
        const quotes = legacyQuoteService.getTimeBasedQuotes(
          timeOfDay,
          count,
          stableSeenQuotes,
          isPremium,
          language
        );
        console.log(
          `⏰ Loaded ${quotes.length} time-based quotes for ${timeOfDay} in ${language}`
        );
        return quotes;
      },

      // Get trending quotes
      getTrendingQuotes: (count: number = 10): LocalizedQuote[] => {
        const quotes = legacyQuoteService.getTrendingQuotes(
          count,
          stableFavoriteQuotes,
          isPremium,
          language
        );
        console.log(
          `📈 Loaded ${quotes.length} trending quotes in ${language}`
        );
        return quotes;
      },

      // Search quotes
      searchQuotes: (query: string): LocalizedQuote[] => {
        const quotes = legacyQuoteService.searchQuotes(
          query,
          isPremium,
          language
        );
        console.log(
          `🔎 Search "${query}" returned ${quotes.length} quotes in ${language}`
        );
        return quotes;
      },

      // Get quote by ID
      getQuoteById: (id: string): LocalizedQuote | undefined => {
        return legacyQuoteService.getLocalizedQuoteById(id, language);
      },

      // Get category by ID
      getCategoryById: (id: string): LocalizedCategory | undefined => {
        return legacyQuoteService.getLocalizedCategoryById(id, language);
      },

      // Check if user can access a quote
      canAccessQuote: (quote: LocalizedQuote): boolean => {
        return legacyQuoteService.canAccessQuote(quote, isPremium);
      },

      // Get reading statistics
      getReadingStats: () => {
        return legacyQuoteService.getReadingStats(stableSeenQuotes);
      },
    }),
    [
      isPremium,
      language,
      userPreferences,
      stableSeenQuotes,
      stableFavoriteQuotes,
    ]
  );

  // Computed values with stable dependencies
  const computed = useMemo(
    () => ({
      // Check if quote is favorite
      isQuoteFavorite: (quoteId: string) =>
        stableFavoriteQuotes.includes(quoteId),

      // Check if quote has been seen
      isQuoteSeen: (quoteId: string) => stableSeenQuotes.includes(quoteId),

      // Get available categories
      availableCategories: quoteMethods.getAvailableCategories(),

      // Get free categories
      freeCategories: legacyQuoteService.getFreeCategories(language),

      // Get premium categories
      premiumCategories: legacyQuoteService.getPremiumCategories(language),

      // Reading stats
      readingStats: {
        totalFavorites: stableFavoriteQuotes.length,
        totalSeen: stableSeenQuotes.length,
        dailyReads,
        hasReadToday: dailyReads > 0,
      },
    }),
    [stableFavoriteQuotes, stableSeenQuotes, dailyReads, language, quoteMethods]
  );

  return {
    // State
    quotes: stableQuotes,
    categories,
    seenQuotes: stableSeenQuotes,
    favoriteQuotes: stableFavoriteQuotes,
    dailyReads,
    isPremium,
    userPreferences,
    language,
    isReady,

    // Methods
    ...quoteMethods,

    // Computed values
    ...computed,

    // Actions
    markAsRead: actions.markAsRead,
    addToFavorites: actions.addToFavorites,
    removeFromFavorites: actions.removeFromFavorites,
    setLoading: actions.setLoading,
    setError: actions.setError,
  };
}

// Specialized hooks for specific use cases with proper memoization
export function useHomeQuotes(count: number = 10) {
  const { getHomeFeedQuotes, isReady } = useQuoteService();

  return useMemo(() => {
    console.log(
      `🏠 useHomeQuotes called - isReady: ${isReady}, count: ${count}`
    );
    if (!isReady) {
      console.log(`⏳ useHomeQuotes - not ready yet`);
      return [];
    }
    const quotes = getHomeFeedQuotes(count);
    console.log(`🏠 useHomeQuotes - returning ${quotes.length} quotes`);
    return quotes;
  }, [getHomeFeedQuotes, count, isReady]);
}

export function useExploreQuotes(
  selectedCategories: string[] = [],
  count: number = 20
) {
  const { getExploreQuotes, isReady } = useQuoteService();
  const categoriesString = selectedCategories.join(",");

  return useMemo(() => {
    if (!isReady) return [];
    return getExploreQuotes(selectedCategories, count);
  }, [getExploreQuotes, categoriesString, count, isReady]);
}

export function useFavoriteQuotes() {
  const { language } = useQuoteService();
  const quotes = useQuoteSelectors.quotes();
  const favoriteQuotes = useQuoteSelectors.favoriteQuotes();
  const isReady = useQuoteSelectors.hasHydrated();

  return useMemo(() => {
    if (!isReady || quotes.length === 0) return [];
    return quotes
      .filter((quote) => favoriteQuotes.includes(quote.id))
      .map((quote) => legacyQuoteService.localizeQuote(quote, language));
  }, [quotes, favoriteQuotes, isReady, language]);
}

export function useQuoteCategories() {
  const {
    categories,
    availableCategories,
    freeCategories,
    premiumCategories,
    language,
  } = useQuoteService();

  return useMemo(
    () => ({
      allCategories: legacyQuoteService.getLocalizedCategories(language),
      availableCategories,
      freeCategories,
      premiumCategories,
    }),
    [
      categories,
      availableCategories,
      freeCategories,
      premiumCategories,
      language,
    ]
  );
}

// Hook for quote detail screen
export function useQuoteDetail(quoteId: string) {
  const {
    getQuoteById,
    getCategoryById,
    canAccessQuote,
    isQuoteFavorite,
    isQuoteSeen,
    markAsRead,
    addToFavorites,
    removeFromFavorites,
  } = useQuoteService();

  return useMemo(() => {
    const quote = getQuoteById(quoteId);
    if (!quote) return null;

    const category = getCategoryById(quote.category);
    const canAccess = canAccessQuote(quote);
    const isFavorite = isQuoteFavorite(quote.id);
    const isSeen = isQuoteSeen(quote.id);

    return {
      quote,
      category,
      canAccess,
      isFavorite,
      isSeen,
      toggleFavorite: () => {
        if (isFavorite) {
          removeFromFavorites(quote.id);
        } else {
          addToFavorites(quote.id);
        }
      },
      markAsRead: () => markAsRead(quote),
    };
  }, [
    quoteId,
    getQuoteById,
    getCategoryById,
    canAccessQuote,
    isQuoteFavorite,
    isQuoteSeen,
    markAsRead,
    addToFavorites,
    removeFromFavorites,
  ]);
}

// Hook for search functionality
export function useQuoteSearch(query: string) {
  const { searchQuotes, isReady } = useQuoteService();

  return useMemo(() => {
    if (!query.trim() || !isReady) return [];
    return searchQuotes(query);
  }, [query, searchQuotes, isReady]);
}
