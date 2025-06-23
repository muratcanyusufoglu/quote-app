import quotesData from "../data/quotes.json";
import {
  Category,
  LocalizedCategory,
  LocalizedQuote,
  Quote,
  UserPreferences,
} from "../types";
import { getRandomItems, getWeightedRandomItems } from "../utils/shuffle";

// Single Responsibility: QuoteService handles only quote-related business logic
class QuoteService {
  private quotes: Quote[] = [];
  private categories: Category[] = [];

  constructor() {
    this.loadData();
  }

  // Load data from JSON file
  private loadData(): void {
    this.quotes = quotesData.quotes as Quote[];
    this.categories = quotesData.categories as Category[];
  }

  // Helper function to localize a quote
  public localizeQuote(quote: any, language: "en" | "tr"): LocalizedQuote {
    if (!quote) {
      throw new Error(`Quote is null or undefined`);
    }

    // Backwards compatibility: Check if it's old format (text, author) or new format (texts, authors)
    let text: string;
    let author: string;
    let tags: string[];
    let story: any;

    if (quote.texts && quote.authors) {
      // New format with multilingual support
      text = quote.texts[language] || quote.texts.en || "";
      author = quote.authors[language] || quote.authors.en || "";
      tags = quote.tags?.[language] || quote.tags?.en || [];
      story = quote.stories?.[language];
    } else if (quote.text && typeof quote.text === "string") {
      // Old format - single language
      text = quote.text;
      author = quote.author || "";
      tags = quote.tags || [];
      story = quote.story;
    } else {
      console.warn(`Invalid quote format:`, quote);
      text = "Invalid quote";
      author = "";
      tags = [];
      story = undefined;
    }

    return {
      id: quote.id,
      text,
      author,
      category: quote.category,
      tags,
      language,
      readTime: quote.readTime || 1,
      story,
    };
  }

  // Helper function to localize a category
  private localizeCategory(
    category: any,
    language: "en" | "tr"
  ): LocalizedCategory {
    if (!category) {
      throw new Error(`Category is null or undefined`);
    }

    // Backwards compatibility: Check if it's old format (name, description) or new format (names, descriptions)
    let name: string;
    let description: string;

    if (category.names && category.descriptions) {
      // New format with multilingual support
      name = category.names[language] || category.names.en || "";
      description =
        category.descriptions[language] || category.descriptions.en || "";
    } else if (category.name && category.description) {
      // Old format - single language
      name = category.name;
      description = category.description;
    } else {
      console.warn(`Invalid category format:`, category);
      name = category.id || "Unknown";
      description = "";
    }

    return {
      id: category.id,
      name,
      description,
      icon: category.icon || "📝",
      color: category.color || "#6366F1",
      isPremium: category.isPremium || false,
      language,
    };
  }

  // Get all quotes (returns raw multilingual quotes)
  getAllQuotes(): Quote[] {
    return [...this.quotes];
  }

  // Get all categories (returns raw multilingual categories)
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

    // Filter by premium access
    if (!isPremium) {
      const freeCategories = this.getFreeCategories(language);
      const freeCategoryIds = freeCategories.map((cat) => cat.id);
      availableQuotes = availableQuotes.filter((quote) =>
        freeCategoryIds.includes(quote.category)
      );
      console.log(
        `💰 After premium filtering: ${availableQuotes.length} quotes`
      );
    }

    // Filter by selected categories if provided
    if (selectedCategories && selectedCategories.length > 0) {
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
      .filter((localizedQuote) => {
        // Additional check: ensure the quote has content in the requested language
        const hasContent =
          localizedQuote.text && localizedQuote.text.trim().length > 0;
        if (!hasContent) {
          console.warn(
            `⚠️ Quote ${localizedQuote.id} has no content in ${language}`
          );
        }
        return hasContent;
      });

    console.log(
      `✅ Final localized quotes for ${language}: ${localizedQuotes.length}`
    );
    return localizedQuotes;
  }

  // Get random unseen quotes
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
    const seenQuotes = availableQuotes.filter((quote) =>
      seenQuoteIds.includes(quote.id)
    );

    return getRandomItems(
      availableQuotes,
      count,
      seenQuotes,
      (quote) => quote.id
    );
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

    // Create weight function based on user preferences
    const weightFunction = (quote: LocalizedQuote): number => {
      let weight = 1; // Base weight

      // Increase weight for selected categories
      if (userPreferences.selectedCategories.includes(quote.category)) {
        weight += 2;
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

    const seenQuotes = availableQuotes.filter((quote) =>
      seenQuoteIds.includes(quote.id)
    );

    return getWeightedRandomItems(
      availableQuotes,
      count,
      weightFunction,
      seenQuotes,
      (quote) => quote.id
    );
  }

  // Get quote by ID (returns raw quote, use localizeQuote to get specific language)
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

  // Get category by ID (returns raw category, use localizeCategory to get specific language)
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

    return availableQuotes.filter((quote) => {
      const textMatch = quote.text.toLowerCase().includes(searchTerm);
      const authorMatch =
        quote.author?.toLowerCase().includes(searchTerm) || false;
      const tagMatch = quote.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      return textMatch || authorMatch || tagMatch;
    });
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

    const seenQuotes = availableQuotes.filter((quote) =>
      seenQuoteIds.includes(quote.id)
    );

    if (timeAppropriateQuotes.length > 0) {
      return getRandomItems(
        timeAppropriateQuotes,
        count,
        seenQuotes,
        (quote) => quote.id
      );
    }

    // Fallback to regular random quotes
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
export const quoteService = new QuoteService();
export default QuoteService;
