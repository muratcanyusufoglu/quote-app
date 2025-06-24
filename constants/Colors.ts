/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Harmonious color system for the quote app.
 * Colors are carefully chosen to work well together and provide smooth transitions.
 * Based on a cohesive palette with blue primary, purple secondary, and warm accents.
 */

// Import our comprehensive themes
import { darkTheme, lightTheme } from "../src/utils/theme";

export const Colors = {
  light: {
    text: lightTheme.colors.text,
    background: lightTheme.colors.background,
    tint: lightTheme.colors.primary,
    icon: lightTheme.colors.textSecondary,
    tabIconDefault: lightTheme.colors.textSecondary,
    tabIconSelected: lightTheme.colors.primary,
    surface: lightTheme.colors.surface,
    border: lightTheme.colors.border,
    error: lightTheme.colors.error,
    success: lightTheme.colors.success,
    warning: lightTheme.colors.warning,
    premium: lightTheme.colors.premium,
  },
  dark: {
    text: darkTheme.colors.text,
    background: darkTheme.colors.background,
    tint: darkTheme.colors.primary,
    icon: darkTheme.colors.textSecondary,
    tabIconDefault: darkTheme.colors.textSecondary,
    tabIconSelected: darkTheme.colors.primary,
    surface: darkTheme.colors.surface,
    border: darkTheme.colors.border,
    error: darkTheme.colors.error,
    success: darkTheme.colors.success,
    warning: darkTheme.colors.warning,
    premium: darkTheme.colors.premium,
  },
};

// Export theme colors for direct access if needed
export const themeColors = {
  light: lightTheme.colors,
  dark: darkTheme.colors,
};

// Utility function to get colors based on theme
export const getColors = (isDark: boolean = true) => {
  return isDark ? Colors.dark : Colors.light;
};
