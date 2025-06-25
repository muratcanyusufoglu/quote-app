import {
  Category,
  LocalizedCategory,
  LocalizedQuote,
  UserPreferences,
} from "../types";
import { getRandomItems, getWeightedRandomItems } from "../utils/shuffle";
import { dataService } from "./DataService";
import { localizationService } from "./LocalizationService";
import { quoteFilterService } from "./QuoteFilterService";

// Modern modular quote service with lazy loading and caching
export class ModularQuoteService {
  private isInitialized = false;

  constructor() {
    this.initializeAsync();
  }

  // Initialize service asynchronously
  private async initializeAsync(): Promise<void> {
    try {
      console.log("🚀 Initializing ModularQuoteService...");

      // Validate data integrity
      const validation = await dataService.validateData();
      if (!validation.isValid) {
        console.warn("⚠️ Data validation warnings:", validation.errors);
      }

      this.isInitialized = true;
      console.log("✅ ModularQuoteService initialized");
    } catch (error) {
      console.error("❌ Failed to initialize ModularQuoteService:", error);
    }
  }

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    return await dataService.loadCategories();
  }

  // Get localized categories
  async getLocalizedCategories(
    language: "en" | "tr"
  ): Promise<LocalizedCategory[]> {
    const categories = await this.getAllCategories();
    return localizationService.localizeCategories(categories, language);
  }

  // Get available categories based on premium status
  async getAvailableCategories(
    isPremium: boolean,
    language: "en" | "tr"
  ): Promise<LocalizedCategory[]> {
    const categories = await this.getAllCategories();
    const filteredCategories = quoteFilterService.filterCategoriesByAccess(
      categories,
      isPremium
    );
    return localizationService.localizeCategories(filteredCategories, language);
  }

  // Get quotes for specific categories
  async getQuotesForCategories(
    categoryIds: string[],
    language: "en" | "tr"
  ): Promise<LocalizedQuote[]> {
    const quotes = await dataService.loadQuotesForCategories(categoryIds);
    const localizedQuotes = localizationService.localizeQuotes(
      quotes,
      language
    );
    return localizationService.filterValidLocalizedQuotes(localizedQuotes);
  }

  // Get filtered quotes based on user access and preferences
  async getFilteredQuotes(
    isPremium: boolean,
    language: "en" | "tr",
    selectedCategories?: string[]
  ): Promise<LocalizedQuote[]> {
    const categories = await this.getAllCategories();

    // Determine which categories to load
    let categoriesToLoad: string[];

    if (selectedCategories && selectedCategories.length > 0) {
      // Filter selected categories by access
      const accessibleCategories = quoteFilterService.filterCategoriesByAccess(
        categories.filter((cat) => selectedCategories.includes(cat.id)),
        isPremium
      );
      categoriesToLoad = accessibleCategories.map((cat) => cat.id);
    } else {
      // Load all accessible categories
      const accessibleCategories = quoteFilterService.filterCategoriesByAccess(
        categories,
        isPremium
      );
      categoriesToLoad = accessibleCategories.map((cat) => cat.id);
    }

    console.log(
      `📚 Loading quotes from ${categoriesToLoad.length} categories for ${language}`
    );

    // Load and localize quotes
    const quotes = await dataService.loadQuotesForCategories(categoriesToLoad);
    const localizedQuotes = localizationService.localizeQuotes(
      quotes,
      language
    );

    return localizationService.filterValidLocalizedQuotes(localizedQuotes);
  }

  // Get random unseen quotes with fallback to seen quotes if needed
  async getRandomUnseenQuotes(
    count: number,
    seenQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr",
    selectedCategories?: string[]
  ): Promise<LocalizedQuote[]> {
    const availableQuotes = await this.getFilteredQuotes(
      isPremium,
      language,
      selectedCategories
    );

    // Use fallback logic if insufficient unseen quotes
    const { quotes: quotesToUse, fallbackUsed } =
      quoteFilterService.getQuotesWithFallback(availableQuotes, seenQuoteIds);

    if (fallbackUsed) {
      console.log("🔄 Fallback activated: Including previously seen quotes");
    }

    return getRandomItems(quotesToUse, count, [], (quote) => quote.id);
  }

  // Get personalized quotes
  async getPersonalizedQuotes(
    count: number,
    userPreferences: UserPreferences,
    seenQuoteIds: string[],
    isPremium: boolean
  ): Promise<LocalizedQuote[]> {
    const availableQuotes = await this.getFilteredQuotes(
      isPremium,
      userPreferences.language,
      userPreferences.selectedCategories
    );

    // Use fallback logic if insufficient unseen quotes
    const { quotes: quotesToUse, fallbackUsed } =
      quoteFilterService.getQuotesWithFallback(availableQuotes, seenQuoteIds);

    if (fallbackUsed) {
      console.log(
        "🔄 Personalized quotes fallback activated: Including previously seen quotes"
      );
    }

    // Weight function for personalization
    const weightFunction = (quote: LocalizedQuote): number => {
      let weight = 1;

      // Category preference weight
      if (userPreferences.selectedCategories.includes(quote.category)) {
        weight += 2;
      }

      // Topic preference weight
      const matchingTags = quote.tags.filter((tag) =>
        userPreferences.topics.some(
          (topic) =>
            topic.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(topic.toLowerCase())
        )
      );
      weight += matchingTags.length * 0.5;

      // Reading length preference weight
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

      return Math.max(weight, 0.1);
    };

    return getWeightedRandomItems(
      quotesToUse,
      count,
      weightFunction,
      [],
      (quote) => quote.id
    );
  }

  // Search quotes
  async searchQuotes(
    query: string,
    isPremium: boolean,
    language: "en" | "tr"
  ): Promise<LocalizedQuote[]> {
    const availableQuotes = await this.getFilteredQuotes(isPremium, language);
    return quoteFilterService.searchQuotes(availableQuotes, query);
  }

  // Get quote by ID
  async getQuoteById(
    id: string,
    language: "en" | "tr"
  ): Promise<LocalizedQuote | undefined> {
    // Try to find the quote in each category
    const categories = await this.getAllCategories();

    for (const category of categories) {
      const quotes = await dataService.loadQuotesForCategory(category.id);
      const quote = quotes.find((q) => q.id === id);

      if (quote) {
        return localizationService.localizeQuote(quote, language);
      }
    }

    return undefined;
  }

  // Get category by ID
  async getCategoryById(
    id: string,
    language: "en" | "tr"
  ): Promise<LocalizedCategory | undefined> {
    const categories = await this.getAllCategories();
    const category = categories.find((cat) => cat.id === id);

    if (category) {
      return localizationService.localizeCategory(category, language);
    }

    return undefined;
  }

  // Check if user can access a quote
  async canAccessQuote(
    quote: LocalizedQuote,
    isPremium: boolean
  ): Promise<boolean> {
    const categories = await this.getAllCategories();
    return quoteFilterService.canAccessQuote(quote, categories, isPremium);
  }

  // Get time-based quotes
  async getTimeBasedQuotes(
    timeOfDay: "morning" | "afternoon" | "evening",
    count: number,
    seenQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr"
  ): Promise<LocalizedQuote[]> {
    const timeBasedCategories = {
      morning: ["motivation", "success", "creativity", "leadership"],
      afternoon: ["success", "creativity", "wisdom", "growth"],
      evening: ["happiness", "peace", "gratitude", "mindfulness"],
    };

    const preferredCategories = timeBasedCategories[timeOfDay] || [];

    try {
      // First try with preferred categories (already includes fallback logic)
      const timeAppropriateQuotes = await this.getRandomUnseenQuotes(
        count,
        seenQuoteIds,
        isPremium,
        language,
        preferredCategories
      );

      if (timeAppropriateQuotes.length > 0) {
        return timeAppropriateQuotes;
      }
    } catch (error) {
      console.warn(
        "Failed to get time-based quotes, falling back to general quotes"
      );
    }

    // Fallback to general quotes (already includes fallback logic)
    return await this.getRandomUnseenQuotes(
      count,
      seenQuoteIds,
      isPremium,
      language
    );
  }

  // Get trending quotes
  async getTrendingQuotes(
    count: number,
    favoriteQuoteIds: string[],
    isPremium: boolean,
    language: "en" | "tr"
  ): Promise<LocalizedQuote[]> {
    const availableQuotes = await this.getFilteredQuotes(isPremium, language);

    // Sort by favorites and recency
    const sortedQuotes = availableQuotes.sort((a, b) => {
      const aIsFavorite = favoriteQuoteIds.includes(a.id);
      const bIsFavorite = favoriteQuoteIds.includes(b.id);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      return b.id.localeCompare(a.id);
    });

    return sortedQuotes.slice(0, count);
  }

  // Preload categories for better performance
  async preloadCategories(categoryIds: string[]): Promise<void> {
    await dataService.preloadCategories(categoryIds);
  }

  // Get cache statistics
  getCacheStats() {
    return dataService.getCacheStats();
  }

  // Clear cache
  clearCache(): void {
    dataService.clearCache();
  }
}

// Export singleton instance
export const modularQuoteService = new ModularQuoteService();
