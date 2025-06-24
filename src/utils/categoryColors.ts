import { categoryColors, getCategoryColorForTheme } from "./theme";

// Single responsibility: Get color for a category
export const getCategoryColor = (
  category: string,
  isDark: boolean = true
): string => {
  return getCategoryColorForTheme(category, isDark);
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
