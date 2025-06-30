import categoriesData from "../data/categories.json";
import {
  availableCategoryIds,
  categoryExists,
  getAllQuotes as getAllQuotesFromMap,
  getQuotesForCategory,
} from "../data/quotes";
import { Category, LocalizedCategory, LocalizedQuote, Quote } from "../types";
import { SupportedLanguage } from "../utils/language";

// Cache interface for performance optimization
interface DataCache {
  categories: Category[] | null;
  quotes: Map<string, Quote[]>;
  lastUpdated: Map<string, number>;
}

// Single Responsibility: Handle modular data loading and caching
export class DataService {
  private cache: DataCache = {
    categories: null,
    quotes: new Map(),
    lastUpdated: new Map(),
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Load categories from separate JSON file
  async loadCategories(): Promise<Category[]> {
    try {
      // Check cache first
      if (this.cache.categories) {
        console.log("📚 Categories loaded from cache");
        return this.cache.categories;
      }

      console.log("📚 Loading categories from file...");
      const categories: Category[] = categoriesData.categories;

      // Cache the result
      this.cache.categories = categories;
      console.log(`📚 ${categories.length} categories loaded and cached`);

      return categories;
    } catch (error) {
      console.error("❌ Failed to load categories:", error);
      throw new Error("Failed to load categories");
    }
  }

  // Get categories filtered by language for notification service
  async getCategories(
    language: SupportedLanguage
  ): Promise<LocalizedCategory[]> {
    try {
      const categories = await this.loadCategories();
      return categories.map((category) => ({
        id: category.id,
        name: category.names[language] || category.names.en,
        description:
          category.descriptions[language] || category.descriptions.en,
        icon: category.icon,
        color: category.color,
        isPremium: category.isPremium,
        language: language,
      }));
    } catch (error) {
      console.error("❌ Failed to get localized categories:", error);
      return [];
    }
  }

  // Get quotes by category filtered by language for notification service
  async getQuotesByCategory(
    categoryId: string,
    language: SupportedLanguage
  ): Promise<LocalizedQuote[]> {
    try {
      const quotes = await this.loadQuotesForCategory(categoryId);
      return quotes.map((quote) => ({
        id: quote.id,
        text: quote.texts[language] || quote.texts.en,
        author: quote.authors[language] || quote.authors.en,
        category: quote.category,
        tags: quote.tags[language] || quote.tags.en || [],
        language: language,
        readTime: quote.readTime || 1,
        story: quote.stories?.[language]
          ? {
              title: quote.stories[language]!.title,
              content: quote.stories[language]!.content,
              readTime: quote.stories[language]!.readTime || 3,
            }
          : undefined,
      }));
    } catch (error) {
      console.error(
        `❌ Failed to get quotes for category ${categoryId}:`,
        error
      );
      return [];
    }
  }

  // Load quotes for a specific category with lazy loading
  async loadQuotesForCategory(categoryId: string): Promise<Quote[]> {
    try {
      // Check cache first
      const cachedQuotes = this.cache.quotes.get(categoryId);
      const lastUpdated = this.cache.lastUpdated.get(categoryId) || 0;
      const now = Date.now();

      if (cachedQuotes && now - lastUpdated < this.CACHE_DURATION) {
        console.log(`📖 Quotes for "${categoryId}" loaded from cache`);
        return cachedQuotes;
      }

      console.log(`📖 Loading quotes for category "${categoryId}"...`);

      // Check if category exists
      if (!categoryExists(categoryId)) {
        console.warn(`⚠️ Category "${categoryId}" does not exist`);
        return [];
      }

      // Get quotes from static imports
      const quotes = getQuotesForCategory(categoryId);

      // Cache the result
      this.cache.quotes.set(categoryId, quotes);
      this.cache.lastUpdated.set(categoryId, now);

      console.log(
        `📖 ${quotes.length} quotes loaded for "${categoryId}" and cached`
      );
      return quotes;
    } catch (error) {
      console.error(
        `❌ Failed to load quotes for category "${categoryId}":`,
        error
      );

      // Return empty array instead of throwing error for better UX
      return [];
    }
  }

  // Load quotes for multiple categories efficiently
  async loadQuotesForCategories(categoryIds: string[]): Promise<Quote[]> {
    try {
      console.log(`📖 Loading quotes for ${categoryIds.length} categories...`);

      // Load all categories in parallel
      const quotePromises = categoryIds.map((categoryId) =>
        this.loadQuotesForCategory(categoryId)
      );

      const quotesArrays = await Promise.all(quotePromises);

      // Flatten the arrays
      const allQuotes = quotesArrays.flat();

      console.log(
        `📖 Total ${allQuotes.length} quotes loaded from ${categoryIds.length} categories`
      );
      return allQuotes;
    } catch (error) {
      console.error("❌ Failed to load quotes for multiple categories:", error);
      return [];
    }
  }

  // Get all available category IDs
  async getAvailableCategoryIds(): Promise<string[]> {
    try {
      return availableCategoryIds;
    } catch (error) {
      console.error("❌ Failed to get available category IDs:", error);
      return [];
    }
  }

  // Load all quotes (use with caution for performance)
  async loadAllQuotes(): Promise<Quote[]> {
    try {
      console.log("🚨 Loading ALL quotes - this might impact performance");

      // Use the static import function
      const allQuotes = getAllQuotesFromMap();
      console.log(`📖 Loaded ${allQuotes.length} quotes from static imports`);

      return allQuotes;
    } catch (error) {
      console.error("❌ Failed to load all quotes:", error);
      return [];
    }
  }

  // Preload specific categories for better UX
  async preloadCategories(categoryIds: string[]): Promise<void> {
    try {
      console.log(`🚀 Preloading ${categoryIds.length} categories...`);

      // Load categories in parallel without blocking
      const preloadPromises = categoryIds.map((categoryId) =>
        this.loadQuotesForCategory(categoryId).catch((error) => {
          console.warn(`⚠️ Failed to preload category "${categoryId}":`, error);
        })
      );

      await Promise.all(preloadPromises);
      console.log("🚀 Preloading completed");
    } catch (error) {
      console.error("❌ Failed to preload categories:", error);
    }
  }

  // Clear cache (useful for testing or force refresh)
  clearCache(): void {
    this.cache = {
      categories: null,
      quotes: new Map(),
      lastUpdated: new Map(),
    };
    console.log("🧹 Cache cleared");
  }

  // Get cache statistics
  getCacheStats(): {
    categoriesCached: boolean;
    quoteCategoriesCached: number;
    totalQuotesCached: number;
  } {
    const totalQuotesCached = Array.from(this.cache.quotes.values()).reduce(
      (total, quotes) => total + quotes.length,
      0
    );

    return {
      categoriesCached: this.cache.categories !== null,
      quoteCategoriesCached: this.cache.quotes.size,
      totalQuotesCached,
    };
  }

  // Check if category has quotes available
  async categoryHasQuotes(categoryId: string): Promise<boolean> {
    try {
      const quotes = await this.loadQuotesForCategory(categoryId);
      return quotes.length > 0;
    } catch {
      return false;
    }
  }

  // Get quote count for a category without loading all quotes
  async getQuoteCount(categoryId: string): Promise<number> {
    try {
      const quotes = await this.loadQuotesForCategory(categoryId);
      return quotes.length;
    } catch {
      return 0;
    }
  }

  // Validate data integrity
  async validateData(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate categories
      const categories = await this.loadCategories();
      if (categories.length === 0) {
        errors.push("No categories found");
      }

      // Validate that each category has corresponding quote file
      for (const categoryId of availableCategoryIds) {
        const hasQuotes = await this.categoryHasQuotes(categoryId);
        if (!hasQuotes) {
          errors.push(`Category "${categoryId}" has no quotes`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Data validation failed: ${error}`);
      return {
        isValid: false,
        errors,
      };
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
