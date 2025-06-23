// Static imports for all quote categories
// This approach avoids dynamic imports which don't work in React Native
import courageQuotes from "./courage.json";
import dreamsQuotes from "./dreams.json";
import generalQuotes from "./general.json";
import gratitudeQuotes from "./gratitude.json";
import leadershipQuotes from "./leadership.json";
import mindfulnessQuotes from "./mindfulness.json";
import motivationQuotes from "./motivation.json";
import resilienceQuotes from "./resilience.json";

// Import new categories - existing ones that were missing JSON files
import creativityQuotes from "./creativity.json";
import growthQuotes from "./growth.json";
import happinessQuotes from "./happiness.json";
import loveQuotes from "./love.json";
import peaceQuotes from "./peace.json";
import successQuotes from "./success.json";
import wisdomQuotes from "./wisdom.json";

// Import brand new categories
import balanceQuotes from "./balance.json";
import changeQuotes from "./change.json";
import educationQuotes from "./education.json";
import familyQuotes from "./family.json";
import friendshipQuotes from "./friendship.json";
import healthQuotes from "./health.json";
import natureQuotes from "./nature.json";
import patienceQuotes from "./patience.json";
import spiritualityQuotes from "./spirituality.json";
import technologyQuotes from "./technology.json";
import timeQuotes from "./time.json";
import travelQuotes from "./travel.json";

import { Quote } from "../../types";

// Map of category IDs to their quote data
export const quoteDataMap = {
  // Original categories
  general: generalQuotes,
  motivation: motivationQuotes,
  leadership: leadershipQuotes,
  resilience: resilienceQuotes,
  mindfulness: mindfulnessQuotes,
  courage: courageQuotes,
  gratitude: gratitudeQuotes,
  dreams: dreamsQuotes,

  // Previously missing categories now with JSON files
  success: successQuotes,
  wisdom: wisdomQuotes,
  happiness: happinessQuotes,
  love: loveQuotes,
  creativity: creativityQuotes,
  growth: growthQuotes,
  peace: peaceQuotes,

  // Brand new categories
  friendship: friendshipQuotes,
  family: familyQuotes,
  health: healthQuotes,
  travel: travelQuotes,
  education: educationQuotes,
  change: changeQuotes,
  time: timeQuotes,
  nature: natureQuotes,
  technology: technologyQuotes,
  spirituality: spiritualityQuotes,
  balance: balanceQuotes,
  patience: patienceQuotes,
} as const;

// Available category IDs for validation
export const availableCategoryIds = Object.keys(quoteDataMap);

// Helper function to get quotes for a specific category
export function getQuotesForCategory(categoryId: string): Quote[] {
  const categoryData = quoteDataMap[categoryId as keyof typeof quoteDataMap];
  if (!categoryData) {
    console.warn(`Category "${categoryId}" not found in quoteDataMap`);
    return [];
  }
  return categoryData.quotes || [];
}

// Helper function to check if a category exists
export function categoryExists(categoryId: string): boolean {
  return categoryId in quoteDataMap;
}

// Helper function to get all quotes from all categories
export function getAllQuotes(): Quote[] {
  const allQuotes: Quote[] = [];

  for (const categoryId of availableCategoryIds) {
    const quotes = getQuotesForCategory(categoryId);
    allQuotes.push(...quotes);
  }

  return allQuotes;
}
