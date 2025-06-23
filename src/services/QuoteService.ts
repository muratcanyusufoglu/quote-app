// QuoteService.ts - Legacy compatibility wrapper
// This file maintains backward compatibility for existing code
// For new features, use the modular services in the services directory

import { legacyQuoteService } from "./LegacyQuoteService";

// Export the legacy service as the main service for backward compatibility
export const quoteService = legacyQuoteService;

// Also export the class for potential future use
export { default as LegacyQuoteService } from "./LegacyQuoteService";

// Note: For new development, consider using:
// - DataService for data loading
// - LocalizationService for translations
// - QuoteFilterService for filtering logic
// - ModularQuoteService for comprehensive quote operations
