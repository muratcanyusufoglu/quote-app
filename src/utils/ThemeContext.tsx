import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { Theme } from "../types";
import { getTheme } from "./theme";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "light" | "dark" | "system";
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const systemColorScheme = useColorScheme();

  // Determine initial theme
  const getInitialTheme = (): boolean => {
    switch (defaultTheme) {
      case "light":
        return false;
      case "dark":
        return true;
      case "system":
      default:
        return systemColorScheme === "dark";
    }
  };

  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Update theme when system preference changes (if using system theme)
  useEffect(() => {
    if (defaultTheme === "system") {
      setIsDark(systemColorScheme === "dark");
    }
  }, [systemColorScheme, defaultTheme]);

  const theme = getTheme(isDark);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Convenience hooks for specific theme properties
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

export const useThemeBorderRadius = () => {
  const { theme } = useTheme();
  return theme.borderRadius;
};
