import {Category, LocalizedQuote, Quote} from "../types";

// Single Responsibility: Handle quote filtering logic
export class QuoteFilterService {
  // Filter quotes by premium access
  filterByPremiumAccess(
    quotes: Quote[],
    categories: Category[],
    isPremium: boolean
  ): Quote[] {
    if (isPremium) return quotes;

    const freeCategoryIds = categories
      .filter((cat) => !cat.isPremium)
      .map((cat) => cat.id);

    return quotes.filter((quote) => freeCategoryIds.includes(quote.category));
  }

  // Filter quotes by selected categories
  filterByCategories(quotes: Quote[], selectedCategories: string[]): Quote[] {
    if (selectedCategories.length === 0) return quotes;

    return quotes.filter((quote) =>
      selectedCategories.includes(quote.category)
    );
  }

  // Filter out seen quotes
  filterOutSeen(
    quotes: LocalizedQuote[],
    seenQuoteIds: string[]
  ): LocalizedQuote[] {
    return quotes.filter((quote) => !seenQuoteIds.includes(quote.id));
  }

  // Get quotes with fallback to seen quotes if insufficient unseen quotes
  // Ensures each quote is shown once until all quotes are seen
  getQuotesWithFallback(
    quotes: LocalizedQuote[],
    seenQuoteIds: string[],
    minUnseenThreshold: number = 0
  ): {quotes: LocalizedQuote[]; fallbackUsed: boolean; allExhausted: boolean} {
    const unseenQuotes = this.filterOutSeen(quotes, seenQuoteIds);

    // Return only unseen quotes as long as any exist
    if (unseenQuotes.length > 0) {
      return {quotes: unseenQuotes, fallbackUsed: false, allExhausted: false};
    }

    // All quotes in this pool have been seen — fallback to full pool
    // Caller should reset seenQuotes to begin a fresh cycle
    console.log(
      `🔄 All ${quotes.length} quotes seen — falling back to full pool`
    );
    return {quotes: quotes, fallbackUsed: true, allExhausted: true};
  }

  // Search quotes by text, author, or tags
  searchQuotes(quotes: LocalizedQuote[], query: string): LocalizedQuote[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return quotes.filter((quote) => {
      const textMatch = quote.text.toLowerCase().includes(searchTerm);
      const authorMatch =
        quote.author?.toLowerCase().includes(searchTerm) || false;
      const tagMatch = quote.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      return textMatch || authorMatch || tagMatch;
    });
  }

  // Filter categories by premium access
  filterCategoriesByAccess(
    categories: Category[],
    isPremium: boolean
  ): Category[] {
    return categories.filter((category) => isPremium || !category.isPremium);
  }

  // Get free categories only
  getFreeCategories(categories: Category[]): Category[] {
    return categories.filter((category) => !category.isPremium);
  }

  // Get premium categories only
  getPremiumCategories(categories: Category[]): Category[] {
    return categories.filter((category) => category.isPremium);
  }

  // Validate quote access
  canAccessQuote(
    quote: LocalizedQuote,
    categories: Category[],
    isPremium: boolean
  ): boolean {
    const category = categories.find((cat) => cat.id === quote.category);
    if (!category) return false;

    return isPremium || !category.isPremium;
  }
}

// Export singleton instance
export const quoteFilterService = new QuoteFilterService();
