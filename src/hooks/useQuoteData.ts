import { useMemo } from "react";
import { quoteService } from "../services/QuoteService";
import { useOnboardingSelectors } from "../store/useOnboardingStore";
import { usePurchaseSelectors } from "../store/usePurchaseStore";
import { useQuoteSelectors } from "../store/useQuoteStore";
import { getPreferredLanguage, SupportedLanguage } from "../utils/language";

// Single responsibility: Handle core quote data access
export function useQuoteData() {
  const quotes = useQuoteSelectors.quotes();
  const categories = useQuoteSelectors.categories();
  const isPremium = usePurchaseSelectors.isPremium();
  const userPreferences = useOnboardingSelectors.userPreferences();

  // Get user's preferred language
  const language = useMemo(() => {
    return getPreferredLanguage(userPreferences?.language as SupportedLanguage);
  }, [userPreferences?.language]);

  // Check if all data is ready
  const isReady =
    useQuoteSelectors.hasHydrated() &&
    usePurchaseSelectors.hasHydrated() &&
    useOnboardingSelectors.hasHydrated();

  // Get available categories based on premium status
  const availableCategories = useMemo(() => {
    if (!isReady) return [];
    return quoteService.getAvailableCategories(isPremium, language);
  }, [isPremium, language, isReady]);

  // Get filtered quotes based on user access
  const getFilteredQuotes = useMemo(() => {
    return (selectedCategories?: string[]) => {
      if (!isReady) return [];
      return quoteService.getFilteredQuotes(
        isPremium,
        language,
        selectedCategories
      );
    };
  }, [isPremium, language, isReady]);

  return {
    quotes,
    categories,
    availableCategories,
    isPremium,
    userPreferences,
    language,
    isReady,
    getFilteredQuotes,
  };
}
