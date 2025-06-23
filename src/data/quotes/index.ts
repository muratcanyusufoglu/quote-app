// Static imports for all quote categories
import courageQuotes from "./courage.json";
import dreamsQuotes from "./dreams.json";
import generalQuotes from "./general.json";
import gratitudeQuotes from "./gratitude.json";
import leadershipQuotes from "./leadership.json";
import mindfulnessQuotes from "./mindfulness.json";
import motivationQuotes from "./motivation.json";
import resilienceQuotes from "./resilience.json";

// Quote data mapping
export const quoteDataMap = {
  general: generalQuotes,
  motivation: motivationQuotes,
  leadership: leadershipQuotes,
  resilience: resilienceQuotes,
  mindfulness: mindfulnessQuotes,
  courage: courageQuotes,
  gratitude: gratitudeQuotes,
  dreams: dreamsQuotes,
} as const;

// Available category IDs
export const availableCategoryIds = Object.keys(quoteDataMap);

// Helper function to get quotes for a category
export function getQuotesForCategory(categoryId: string) {
  const quoteData = quoteDataMap[categoryId as keyof typeof quoteDataMap];
  return quoteData?.quotes || [];
}

// Helper function to check if category exists
export function categoryExists(categoryId: string): boolean {
  return categoryId in quoteDataMap;
}

// Get all quotes from all categories
export function getAllQuotes() {
  return Object.values(quoteDataMap).flatMap((data) => data.quotes);
}
