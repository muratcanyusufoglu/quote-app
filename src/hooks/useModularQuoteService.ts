import { useCallback, useEffect, useMemo } from "react";
import { modularQuoteService } from "../services/ModularQuoteService";
import { useOnboardingSelectors } from "../store/useOnboardingStore";
import { usePurchaseSelectors } from "../store/usePurchaseStore";
import { useQuoteSelectors } from "../store/useQuoteStore";
import { LocalizedCategory, LocalizedQuote } from "../types";
import { getTimeOfDay } from "../utils/dailyReset";
import { getPreferredLanguage, SupportedLanguage } from "../utils/language";

// Modern hook for modular quote service with async operations
export function useModularQuoteService() {
  // Get state from stores
  const seenQuotes = useQuoteSelectors.seenQuotes();
  const favoriteQuotes = useQuoteSelectors.favoriteQuotes();
  const dailyReads = useQuoteSelectors.dailyReads();
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();

  const isPremium = usePurchaseSelectors.isPremium();
  const purchaseStoreHydrated = usePurchaseSelectors.hasHydrated();

  const userPreferences = useOnboardingSelectors.userPreferences();
  const onboardingStoreHydrated = useOnboardingSelectors.hasHydrated();

  const actions = useQuoteSelectors.actions();

  // Check if all stores are hydrated
  const isReady =
    quoteStoreHydrated && purchaseStoreHydrated && onboardingStoreHydrated;

  // Get user's preferred language
  const language = useMemo(() => {
    const preferredLang = getPreferredLanguage(
      userPreferences?.language as SupportedLanguage
    );
    console.log("🌍 Language selection:", preferredLang);
    return preferredLang;
  }, [userPreferences?.language]);

  // Stable references for async operations
  const stableSeenQuotes = useMemo(() => seenQuotes, [seenQuotes.length]);
  const stableFavoriteQuotes = useMemo(
    () => favoriteQuotes,
    [favoriteQuotes.length]
  );

  // Core async methods
  const quoteMethods = useMemo(
    () => ({
      // Get available categories
      getAvailableCategories: useCallback(async (): Promise<
        LocalizedCategory[]
      > => {
        if (!isReady) return [];
        return await modularQuoteService.getAvailableCategories(
          isPremium,
          language
        );
      }, [isPremium, language, isReady]),

      // Get home feed quotes with personalization
      getHomeFeedQuotes: useCallback(
        async (count: number = 10): Promise<LocalizedQuote[]> => {
          if (!isReady) return [];

          console.log(`🏠 Getting home feed quotes for language: ${language}`);

          if (!userPreferences) {
            const quotes = await modularQuoteService.getRandomUnseenQuotes(
              count,
              stableSeenQuotes,
              isPremium,
              language
            );
            console.log(
              `📚 No preferences, loaded ${quotes.length} quotes in ${language}`
            );
            return quotes;
          }

          const quotes = await modularQuoteService.getPersonalizedQuotes(
            count,
            { ...userPreferences, language },
            stableSeenQuotes,
            isPremium
          );
          console.log(
            `👤 With preferences, loaded ${quotes.length} quotes in ${language}`
          );
          return quotes;
        },
        [isReady, userPreferences, stableSeenQuotes, isPremium, language]
      ),

      // Get explore quotes by categories
      getExploreQuotes: useCallback(
        async (
          selectedCategories: string[],
          count: number = 20
        ): Promise<LocalizedQuote[]> => {
          if (!isReady) return [];

          console.log(`🔍 Getting explore quotes for language: ${language}`);
          const quotes = await modularQuoteService.getRandomUnseenQuotes(
            count,
            stableSeenQuotes,
            isPremium,
            language,
            selectedCategories
          );
          console.log(
            `🔍 Loaded ${quotes.length} explore quotes in ${language}`
          );
          return quotes;
        },
        [isReady, stableSeenQuotes, isPremium, language]
      ),

      // Get time-based quotes
      getTimeBasedQuotes: useCallback(
        async (count: number = 5): Promise<LocalizedQuote[]> => {
          if (!isReady) return [];

          const timeOfDay = getTimeOfDay();
          const quotes = await modularQuoteService.getTimeBasedQuotes(
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
        [isReady, stableSeenQuotes, isPremium, language]
      ),

      // Get trending quotes
      getTrendingQuotes: useCallback(
        async (count: number = 10): Promise<LocalizedQuote[]> => {
          if (!isReady) return [];

          const quotes = await modularQuoteService.getTrendingQuotes(
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
        [isReady, stableFavoriteQuotes, isPremium, language]
      ),

      // Search quotes
      searchQuotes: useCallback(
        async (query: string): Promise<LocalizedQuote[]> => {
          if (!isReady || !query.trim()) return [];

          const quotes = await modularQuoteService.searchQuotes(
            query,
            isPremium,
            language
          );
          console.log(
            `🔎 Search "${query}" returned ${quotes.length} quotes in ${language}`
          );
          return quotes;
        },
        [isReady, isPremium, language]
      ),

      // Get quote by ID
      getQuoteById: useCallback(
        async (id: string): Promise<LocalizedQuote | undefined> => {
          if (!isReady) return undefined;
          return await modularQuoteService.getQuoteById(id, language);
        },
        [isReady, language]
      ),

      // Get category by ID
      getCategoryById: useCallback(
        async (id: string): Promise<LocalizedCategory | undefined> => {
          if (!isReady) return undefined;
          return await modularQuoteService.getCategoryById(id, language);
        },
        [isReady, language]
      ),

      // Check if user can access a quote
      canAccessQuote: useCallback(
        async (quote: LocalizedQuote): Promise<boolean> => {
          return await modularQuoteService.canAccessQuote(quote, isPremium);
        },
        [isPremium]
      ),
    }),
    [
      isReady,
      isPremium,
      language,
      userPreferences,
      stableSeenQuotes,
      stableFavoriteQuotes,
    ]
  );

  // Computed values
  const computed = useMemo(
    () => ({
      // Check if quote is favorite
      isQuoteFavorite: (quoteId: string) =>
        stableFavoriteQuotes.includes(quoteId),

      // Check if quote has been seen
      isQuoteSeen: (quoteId: string) => stableSeenQuotes.includes(quoteId),

      // Reading stats
      readingStats: {
        totalFavorites: stableFavoriteQuotes.length,
        totalSeen: stableSeenQuotes.length,
        dailyReads,
        hasReadToday: dailyReads > 0,
      },

      // Service stats
      cacheStats: modularQuoteService.getCacheStats(),
    }),
    [stableFavoriteQuotes, stableSeenQuotes, dailyReads]
  );

  // Preload important categories on mount
  useEffect(() => {
    if (isReady) {
      const importantCategories = ["general", "motivation"];
      modularQuoteService.preloadCategories(importantCategories);
    }
  }, [isReady]);

  return {
    // State
    seenQuotes: stableSeenQuotes,
    favoriteQuotes: stableFavoriteQuotes,
    dailyReads,
    isPremium,
    userPreferences,
    language,
    isReady,

    // Async Methods
    ...quoteMethods,

    // Computed values
    ...computed,

    // Actions
    markAsRead: actions.markAsRead,
    addToFavorites: actions.addToFavorites,
    removeFromFavorites: actions.removeFromFavorites,
    setLoading: actions.setLoading,
    setError: actions.setError,

    // Service controls
    clearCache: modularQuoteService.clearCache.bind(modularQuoteService),
    preloadCategories:
      modularQuoteService.preloadCategories.bind(modularQuoteService),
  };
}

// Specialized hooks for specific use cases
export function useModularHomeQuotes(count: number = 10) {
  const { getHomeFeedQuotes, isReady } = useModularQuoteService();

  const loadQuotes = useCallback(async () => {
    if (!isReady) return [];
    return await getHomeFeedQuotes(count);
  }, [getHomeFeedQuotes, count, isReady]);

  return { loadQuotes, isReady };
}

export function useModularExploreQuotes() {
  const { getExploreQuotes, isReady } = useModularQuoteService();

  const loadQuotes = useCallback(
    async (selectedCategories: string[] = [], count: number = 20) => {
      if (!isReady) return [];
      return await getExploreQuotes(selectedCategories, count);
    },
    [getExploreQuotes, isReady]
  );

  return { loadQuotes, isReady };
}

export function useModularFavoriteQuotes() {
  const { language, favoriteQuotes, isReady } = useModularQuoteService();

  const loadFavoriteQuotes = useCallback(async (): Promise<
    LocalizedQuote[]
  > => {
    if (!isReady || favoriteQuotes.length === 0) return [];

    const favoriteQuoteObjects: LocalizedQuote[] = [];

    // Load favorite quotes by ID
    for (const quoteId of favoriteQuotes) {
      const quote = await modularQuoteService.getQuoteById(quoteId, language);
      if (quote) {
        favoriteQuoteObjects.push(quote);
      }
    }

    return favoriteQuoteObjects;
  }, [favoriteQuotes, isReady, language]);

  return { loadFavoriteQuotes, isReady, favoriteCount: favoriteQuotes.length };
}

export function useModularQuoteCategories() {
  const { getAvailableCategories, language, isReady } =
    useModularQuoteService();

  const loadCategories = useCallback(async () => {
    if (!isReady) return { availableCategories: [], allCategories: [] };

    const availableCategories = await getAvailableCategories();
    const allCategories = await modularQuoteService.getLocalizedCategories(
      language
    );

    return { availableCategories, allCategories };
  }, [getAvailableCategories, language, isReady]);

  return { loadCategories, isReady };
}

// Hook for quote detail screen
export function useModularQuoteDetail(quoteId: string) {
  const {
    getQuoteById,
    getCategoryById,
    canAccessQuote,
    isQuoteFavorite,
    isQuoteSeen,
    markAsRead,
    addToFavorites,
    removeFromFavorites,
    isReady,
  } = useModularQuoteService();

  const loadQuoteDetail = useCallback(async () => {
    if (!isReady || !quoteId) return null;

    const quote = await getQuoteById(quoteId);
    if (!quote) return null;

    const category = await getCategoryById(quote.category);
    const canAccess = await canAccessQuote(quote);
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
    isReady,
  ]);

  return { loadQuoteDetail, isReady };
}

// Hook for search functionality
export function useModularQuoteSearch() {
  const { searchQuotes, isReady } = useModularQuoteService();

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !isReady) return [];
      return await searchQuotes(query);
    },
    [searchQuotes, isReady]
  );

  return { performSearch, isReady };
}
