import categoriesData from "../data/categories.json";
import { getAllQuotes } from "../data/quotes";
import {
  Category,
  LocalizedCategory,
  LocalizedQuote,
  Quote,
  UserPreferences,
} from "../types";
import { getRandomItems, getWeightedRandomItems } from "../utils/shuffle";
import { localizationService } from "./LocalizationService";
import { quoteFilterService } from "./QuoteFilterService";

// Legacy QuoteService - maintains synchronous interface for backward compatibility
class LegacyQuoteService {
  private quotes: Quote[] = [];
  private categories: Category[] = [];
  private isInitialized = false;

  constructor() {
    this.loadDataSync();
  }

  // Synchronously load data from static imports
  private loadDataSync(): void {
    try {
      console.log("🔄 Loading legacy data synchronously...");

      // Load categories
      this.categories = categoriesData.categories as Category[];

      // Load all quotes from static imports
      this.quotes = getAllQuotes();

      this.isInitialized = true;
      console.log(
        `✅ Legacy service loaded: ${this.categories.length} categories, ${this.quotes.length} quotes`
      );
    } catch (error) {
      console.error("❌ Failed to load legacy data:", error);
      this.quotes = [];
      this.categories = [];
    }
  }

  // Helper function to localize a quote (keeping original interface)
  public localizeQuote(quote: any, language: "en" | "tr"): LocalizedQuote {
    return localizationService.localizeQuote(quote, language);
  }

  // Helper function to localize a category (keeping original interface)
  private localizeCategory(
    category: any,
    language: "en" | "tr"
  ): LocalizedCategory {
    return localizationService.localizeCategory(category, language);
  }

  // Get all quotes (synchronous)
  getAllQuotes(): Quote[] {
    return [...this.quotes];
  }

  // Get all categories (synchronous)
  getAllCategories(): Category[] {
    return [...this.categories];
  }

  // Get localized quotes for a specific language
  getLocalizedQuotes(language: "en" | "tr"): LocalizedQuote[] {
    return this.quotes.map((quote) => this.localizeQuote(quote, language));
  }

  // Get localized categories for a specific language
  getLocalizedCategories(language: "en" | "tr"): LocalizedCategory[] {
    return this.categories.map((category) =>
      this.localizeCategory(category, language)
    );
  }

  // Get categories filtered by premium status and language
  getAvailableCategories(
    isPremium: boolean,
    language: "en" | "tr"
  ): LocalizedCategory[] {
    return this.categories
      .filter((category) => isPremium || !category.isPremium)
      .map((category) => this.localizeCategory(category, language));
  }

  // Get free categories only
  getFreeCategories(language: "en" | "tr"): LocalizedCategory[] {
    return this.categories
      .filter((category) => !category.isPremium)
      .map((category) => this.localizeCategory(category, language));
  }

  // Get premium categories only
  getPremiumCategories(language: "en" | "tr"): LocalizedCategory[] {
    return this.categories
      .filter((category) => category.isPremium)
      .map((category) => this.localizeCategory(category, language));
  }

  // Get quotes by category
  getQuotesByCategory(
    categoryId: string,
    language: "en" | "tr"
  ): LocalizedQuote[] {
    return this.quotes
      .filter((quote) => quote.category === categoryId)
      .map((quote) => this.localizeQuote(quote, language));
  }

  // Get quotes by multiple categories
  getQuotesByCategories(
    categoryIds: string[],
    language: "en" | "tr"
  ): LocalizedQuote[] {
    if (categoryIds.length === 0) return [];
    return this.quotes
      .filter((quote) => categoryIds.includes(quote.category))
      .map((quote) => this.localizeQuote(quote, language));
  }

  // Get filtered quotes based on user access and preferences
  getFilteredQuotes(
    isPremium: boolean,
    language: "en" | "tr",
    selectedCategories?: string[]
  ): LocalizedQuote[] {
    let availableQuotes = this.quotes;

    console.log(`🔍 Filtering quotes for language: ${language}`);
    console.log(`📚 Total quotes before filtering: ${availableQuotes.length}`);
    console.log(`💎 isPremium: ${isPremium}`);

    // Filter by premium access
    if (!isPremium) {
      const freeCategories = this.getFreeCategories(language);
      const freeCategoryIds = freeCategories.map((cat) => cat.id);
      console.log(`🆓 Free category IDs: ${freeCategoryIds.join(", ")}`);

      // Log quotes by category before filtering
      const quotesByCategory: Record<string, number> = {};
      availableQuotes.forEach((quote) => {
        quotesByCategory[quote.category] =
          (quotesByCategory[quote.category] || 0) + 1;
      });
      console.log(`📊 Quotes by category:`, quotesByCategory);

      availableQuotes = availableQuotes.filter((quote) =>
        freeCategoryIds.includes(quote.category)
      );
      console.log(
        `💰 After premium filtering: ${availableQuotes.length} quotes`
      );
    }

    // Filter by selected categories if provided (no mapping needed, selectedCategories are already proper IDs)
    if (selectedCategories && selectedCategories.length > 0) {
      console.log(
        `🎯 LegacyService filtering by selected categories:`,
        selectedCategories
      );

      availableQuotes = availableQuotes.filter((quote) =>
        selectedCategories.includes(quote.category)
      );
      console.log(
        `🏷️ After category filtering: ${availableQuotes.length} quotes`
      );
    }

    // Convert to localized quotes with language check
    const localizedQuotes = availableQuotes
      .map((quote) => this.localizeQuote(quote, language))
      .filter((quote) => {
        // Ensure we have valid content in the target language
        const hasValidText = quote.text && quote.text.trim().length > 0;
        const hasValidAuthor = quote.author && quote.author.trim().length > 0;
        return hasValidText && hasValidAuthor;
      });

    console.log(
      `✅ Final localized quotes for ${language}: ${localizedQuotes.length}`
    );

    return localizedQuotes;
  }

  // Get random unseen quotes with fallback to seen quotes if needed
  getRandomUnseenQuotes(
    count: number,
    seenQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr",
    selectedCategories?: string[]
  ): LocalizedQuote[] {
    const availableQuotes = this.getFilteredQuotes(
      isPremium,
      language,
      selectedCategories
    );

    // For category-specific requests, use more aggressive fallback
    const isSpecificCategory =
      selectedCategories && selectedCategories.length > 0;
    const fallbackThreshold = isSpecificCategory ? 1 : 3; // More aggressive for categories

    // Use fallback logic if insufficient unseen quotes
    const { quotes: quotesToUse, fallbackUsed } =
      quoteFilterService.getQuotesWithFallback(
        availableQuotes,
        seenQuoteIds,
        fallbackThreshold
      );

    if (fallbackUsed) {
      console.log(
        `🔄 Legacy service fallback activated for ${
          isSpecificCategory ? "category-specific" : "general"
        } quotes: Including previously seen quotes`
      );
    }

    const seenQuotes = quotesToUse.filter((quote) =>
      seenQuoteIds.includes(quote.id)
    );

    return getRandomItems(quotesToUse, count, seenQuotes, (quote) => quote.id);
  }

  // Get personalized quotes based on user preferences
  getPersonalizedQuotes(
    count: number,
    userPreferences: UserPreferences,
    seenQuoteIds: string[],
    isPremium: boolean
  ): LocalizedQuote[] {
    const availableQuotes = this.getFilteredQuotes(
      isPremium,
      userPreferences.language,
      userPreferences.selectedCategories
    );

    // Map user's selected categories for weight calculation
    const mappedSelectedCategories = userPreferences.selectedCategories;

    // Create weight function based on user preferences
    const weightFunction = (quote: LocalizedQuote): number => {
      let weight = 1; // Base weight

      // Increase weight for selected categories - use mapped categories
      if (mappedSelectedCategories.includes(quote.category)) {
        weight += 2;
        console.log(
          `🎯 LegacyService weight boost for category match: ${quote.category}`
        );
      }

      // Increase weight for preferred topics
      const matchingTags = quote.tags.filter((tag) =>
        userPreferences.topics.some(
          (topic) =>
            topic.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(topic.toLowerCase())
        )
      );
      weight += matchingTags.length * 0.5;

      // Adjust weight based on reading length preference
      if (userPreferences.readingLength === "short" && quote.readTime <= 2) {
        weight += 1;
      } else if (
        userPreferences.readingLength === "medium" &&
        quote.readTime <= 4
      ) {
        weight += 1;
      } else if (
        userPreferences.readingLength === "long" &&
        quote.readTime > 4
      ) {
        weight += 1;
      }

      // Ensure weight is positive
      return Math.max(weight, 0.1);
    };

    // Use fallback logic if insufficient unseen quotes
    const { quotes: quotesToUse, fallbackUsed } =
      quoteFilterService.getQuotesWithFallback(availableQuotes, seenQuoteIds);

    if (fallbackUsed) {
      console.log(
        "🔄 Legacy personalized quotes fallback activated: Including previously seen quotes"
      );
    }

    const seenQuotes = quotesToUse.filter((quote) =>
      seenQuoteIds.includes(quote.id)
    );

    return getWeightedRandomItems(
      quotesToUse,
      count,
      weightFunction,
      seenQuotes,
      (quote) => quote.id
    );
  }

  // Get quote by ID
  getQuoteById(id: string): Quote | undefined {
    return this.quotes.find((quote) => quote.id === id);
  }

  // Get localized quote by ID
  getLocalizedQuoteById(
    id: string,
    language: "en" | "tr"
  ): LocalizedQuote | undefined {
    const quote = this.getQuoteById(id);
    return quote ? this.localizeQuote(quote, language) : undefined;
  }

  // Get category by ID
  getCategoryById(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  // Get localized category by ID
  getLocalizedCategoryById(
    id: string,
    language: "en" | "tr"
  ): LocalizedCategory | undefined {
    const category = this.getCategoryById(id);
    return category ? this.localizeCategory(category, language) : undefined;
  }

  // Search quotes by text or author
  searchQuotes(
    query: string,
    isPremium: boolean,
    language: "en" | "tr"
  ): LocalizedQuote[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const availableQuotes = this.getFilteredQuotes(isPremium, language);
    return quoteFilterService.searchQuotes(availableQuotes, query);
  }

  // Get quotes for specific time of day
  getTimeBasedQuotes(
    timeOfDay: "morning" | "afternoon" | "evening",
    count: number,
    seenQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr"
  ): LocalizedQuote[] {
    // Define categories that work well for different times
    const timeBasedCategories = {
      morning: ["motivation", "success", "creativity"],
      afternoon: ["success", "creativity", "wisdom"],
      evening: ["happiness", "love", "wisdom"],
    };

    const preferredCategories = timeBasedCategories[timeOfDay] || [];
    const availableQuotes = this.getFilteredQuotes(isPremium, language);

    // First try to get quotes from preferred categories
    const timeAppropriateQuotes = availableQuotes.filter((quote) =>
      preferredCategories.includes(quote.category)
    );

    if (timeAppropriateQuotes.length > 0) {
      // Use fallback logic for time-appropriate quotes
      const { quotes: quotesToUse, fallbackUsed } =
        quoteFilterService.getQuotesWithFallback(
          timeAppropriateQuotes,
          seenQuoteIds
        );

      if (fallbackUsed) {
        console.log(
          "🔄 Time-based quotes fallback activated: Including previously seen quotes"
        );
      }

      const seenQuotes = quotesToUse.filter((quote) =>
        seenQuoteIds.includes(quote.id)
      );

      return getRandomItems(
        quotesToUse,
        count,
        seenQuotes,
        (quote) => quote.id
      );
    }

    // Fallback to regular random quotes (already includes fallback logic)
    return this.getRandomUnseenQuotes(count, seenQuoteIds, isPremium, language);
  }

  // Get trending quotes (most favorited or recently added)
  getTrendingQuotes(
    count: number,
    favoriteQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr"
  ): LocalizedQuote[] {
    const availableQuotes = this.getFilteredQuotes(isPremium, language);

    // Sort by favorites count (simulated) and recent additions
    const sortedQuotes = availableQuotes.sort((a, b) => {
      const aIsFavorite = favoriteQuoteIds.includes(a.id);
      const bIsFavorite = favoriteQuoteIds.includes(b.id);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      // Secondary sort by ID (newer quotes have higher IDs)
      return b.id.localeCompare(a.id);
    });

    return sortedQuotes.slice(0, count);
  }

  // Validate quote access for premium features
  canAccessQuote(quote: LocalizedQuote, isPremium: boolean): boolean {
    const category = this.getCategoryById(quote.category);
    if (!category) return false;

    return isPremium || !category.isPremium;
  }

  // Get reading statistics
  getReadingStats(readQuoteIds: string[]): {
    totalQuotes: number;
    categoriesRead: number;
    averageReadTime: number;
    languageDistribution: { en: number; tr: number };
  } {
    const readQuotes = this.quotes.filter((quote) =>
      readQuoteIds.includes(quote.id)
    );

    const uniqueCategories = new Set(readQuotes.map((quote) => quote.category));

    // Calculate total read time for both languages
    const totalReadTime = readQuotes.reduce((sum, quote) => {
      const enTime = quote.stories?.en?.readTime || 0;
      const trTime = quote.stories?.tr?.readTime || 0;
      return sum + quote.readTime + enTime + trTime;
    }, 0);

    // This is simplified - in a real app you'd track which language was actually read
    const languageDistribution = { en: 0, tr: 0 };
    readQuotes.forEach((quote) => {
      // Assume equal distribution for now
      languageDistribution.en += 0.5;
      languageDistribution.tr += 0.5;
    });

    return {
      totalQuotes: readQuotes.length,
      categoriesRead: uniqueCategories.size,
      averageReadTime:
        readQuotes.length > 0 ? totalReadTime / readQuotes.length : 0,
      languageDistribution,
    };
  }
}

// Export singleton instance following the Singleton pattern
export const legacyQuoteService = new LegacyQuoteService();
export default LegacyQuoteService;
