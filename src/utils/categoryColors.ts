import { categoryColors, getCategoryColorForTheme, getTheme } from "./theme";

// Single responsibility: Get color for a category using theme
export const getCategoryColor = (
  category: string,
  isDark: boolean = true
): string => {
  const theme = getTheme(isDark);

  // Önce theme'daki brand yellow'u kullan, eğer spesifik renk yoksa
  const specificColor = getCategoryColorForTheme(category, isDark);

  // Brand yellow ile uyumlu kategoriler için brand yellow kullan
  const brandCategories = [
    "motivation",
    "motivasyon",
    "inspiration",
    "ilham",
    "happiness",
    "mutluluk",
    "general",
    "genel",
    "gratitude",
    "sukur",
    "dreams",
    "hayaller",
  ];

  if (brandCategories.includes(category.toLowerCase())) {
    return theme.colors.brandYellow;
  }

  return specificColor;
};

// Get all available category colors
export const getAllCategoryColors = (): Record<string, string> => {
  return { ...categoryColors };
};

// Check if category has custom color
export const hasCategoryColor = (category: string): boolean => {
  return category.toLowerCase() in categoryColors;
};

// Backward compatibility - export for components that might still use it
export const addCategoryColor = (category: string, color: string): void => {
  console.warn(
    "addCategoryColor is deprecated. Please update category colors in theme.ts"
  );
};
