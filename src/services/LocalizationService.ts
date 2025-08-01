import {
  Category,
  Language,
  LocalizedCategory,
  LocalizedQuote,
  Quote,
} from "../types";

// Single Responsibility: Handle localization of quotes and categories
export class LocalizationService {
  // Localize a single quote
  localizeQuote(quote: any, language: Language): LocalizedQuote {
    if (!quote) {
      throw new Error(`Quote is null or undefined`);
    }

    // Backwards compatibility: Check if it's old format or new format
    let text: string;
    let author: string;
    let tags: string[];
    let story: any;

    if (quote.texts && quote.authors) {
      // New format with multilingual support
      // Try requested language first, then fallback to English, then Turkish
      text = quote.texts[language] || quote.texts.en || quote.texts.tr || "";
      author =
        quote.authors[language] || quote.authors.en || quote.authors.tr || "";
      tags = quote.tags?.[language] || quote.tags?.en || quote.tags?.tr || [];
      story =
        quote.stories?.[language] || quote.stories?.en || quote.stories?.tr;
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

  // Localize a single category
  localizeCategory(category: any, language: Language): LocalizedCategory {
    if (!category) {
      throw new Error(`Category is null or undefined`);
    }

    // Backwards compatibility: Check if it's old format or new format
    let name: string;
    let description: string;

    if (category.names && category.descriptions) {
      // New format with multilingual support
      // Try requested language first, then fallback to English, then Turkish
      name =
        category.names[language] ||
        category.names.en ||
        category.names.tr ||
        "";
      description =
        category.descriptions[language] ||
        category.descriptions.en ||
        category.descriptions.tr ||
        "";
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
      isPremium: !!(
        category.isPremium === true || category.isPremium === "true"
      ),
      language,
    };
  }

  // Localize multiple quotes
  localizeQuotes(quotes: Quote[], language: Language): LocalizedQuote[] {
    return quotes.map((quote) => this.localizeQuote(quote, language));
  }

  // Localize multiple categories
  localizeCategories(
    categories: Category[],
    language: Language
  ): LocalizedCategory[] {
    return categories.map((category) =>
      this.localizeCategory(category, language)
    );
  }

  // Validate that localized content has actual content
  validateLocalizedQuote(quote: LocalizedQuote): boolean {
    return quote.text && quote.text.trim().length > 0;
  }

  // Filter out quotes with no content in requested language
  filterValidLocalizedQuotes(quotes: LocalizedQuote[]): LocalizedQuote[] {
    return quotes.filter((quote) => {
      const isValid = this.validateLocalizedQuote(quote);
      if (!isValid) {
        console.warn(
          `⚠️ Quote ${quote.id} has no content in ${quote.language}`
        );
      }
      return isValid;
    });
  }

  // Get available languages for a quote
  getAvailableLanguages(quote: Quote): Language[] {
    if (!quote.texts) return ["en"];

    const languages: Language[] = [];
    const supportedLangs: Language[] = [
      "en",
      "tr",
      "fr",
      "pt",
      "nl",
      "es",
      "de",
      "it",
      "ru",
      "id",
      "ja",
      "th",
      "ms",
    ];

    for (const lang of supportedLangs) {
      if (quote.texts[lang] && quote.texts[lang].trim().length > 0) {
        languages.push(lang);
      }
    }

    return languages.length > 0 ? languages : ["en"];
  }

  // Check if a specific language is available for a quote
  isLanguageAvailable(quote: Quote, language: Language): boolean {
    const availableLanguages = this.getAvailableLanguages(quote);
    return availableLanguages.includes(language);
  }
}

// Export singleton instance
export const localizationService = new LocalizationService();
