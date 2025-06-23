import { darkTheme } from "./theme";

// Category color mapping - Open for extension, closed for modification
const CATEGORY_COLOR_MAP: Record<string, string> = {
  motivation: "#6366F1",
  motivasyon: "#6366F1",
  success: "#10B981",
  basari: "#10B981",
  happiness: "#F59E0B",
  mutluluk: "#F59E0B",
  wisdom: "#8B5CF6",
  bilgelik: "#8B5CF6",
  love: "#EF4444",
  ask: "#EF4444",
  peace: "#06B6D4",
  huzur: "#06B6D4",
  growth: "#84CC16",
  gelisim: "#84CC16",
  general: "#6B7280",
  genel: "#6B7280",
  leadership: "#7C3AED",
  liderlik: "#7C3AED",
  resilience: "#DC2626",
  dayaniklilik: "#DC2626",
  mindfulness: "#059669",
  farkindalik: "#059669",
  courage: "#EA580C",
  cesaret: "#EA580C",
  gratitude: "#0891B2",
  sukur: "#0891B2",
  dreams: "#7C2D92",
  hayaller: "#7C2D92",
  creativity: "#3B82F6",
  yaraticilik: "#3B82F6",
};

// Single responsibility: Get color for a category
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLOR_MAP[category.toLowerCase()] || darkTheme.colors.primary;
};

// Open for extension: Add new color mapping
export const addCategoryColor = (category: string, color: string): void => {
  CATEGORY_COLOR_MAP[category.toLowerCase()] = color;
};

// Get all available category colors
export const getAllCategoryColors = (): Record<string, string> => {
  return { ...CATEGORY_COLOR_MAP };
};

// Check if category has custom color
export const hasCategoryColor = (category: string): boolean => {
  return category.toLowerCase() in CATEGORY_COLOR_MAP;
};
