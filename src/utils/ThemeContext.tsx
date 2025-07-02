import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { Theme } from "../types";
import { getThemeByOption } from "./theme";

// Define types locally to avoid circular dependencies
type ThemeOption =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "purple"
  | "minimalist";
type ColorScheme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  selectedTheme: ThemeOption;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setSelectedTheme: (theme: ThemeOption) => void;
  setColorScheme: (scheme: ColorScheme) => void;
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

  // Local state without store integration for now
  const [selectedTheme, setSelectedThemeState] =
    useState<ThemeOption>("default");
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === "dark");

  // Update isDark when system preference or color scheme changes
  useEffect(() => {
    if (colorScheme === "system") {
      setIsDark(systemColorScheme === "dark");
    } else {
      setIsDark(colorScheme === "dark");
    }
  }, [systemColorScheme, colorScheme]);

  // Load from store on mount (avoid render cycle issues)
  useEffect(() => {
    const loadFromStore = async () => {
      try {
        // Import dynamically to avoid circular dependency
        const { useThemeStore } = await import("../store/useThemeStore");
        const state = useThemeStore.getState();

        if (state._hasHydrated) {
          setSelectedThemeState(state.selectedTheme);
          setColorSchemeState(state.colorScheme);
        }
      } catch (error) {
        console.log("Could not load theme from store:", error);
      }
    };

    loadFromStore();
  }, []);

  // Get the theme based on selected theme option and dark mode
  const theme = getThemeByOption(selectedTheme, isDark);

  const toggleTheme = () => {
    const newScheme: ColorScheme = isDark ? "light" : "dark";
    setColorSchemeState(newScheme);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().setColorScheme(newScheme);
      })
      .catch(() => {});
  };

  const setTheme = (dark: boolean) => {
    const newScheme: ColorScheme = dark ? "dark" : "light";
    setColorSchemeState(newScheme);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().setColorScheme(newScheme);
      })
      .catch(() => {});
  };

  const setSelectedTheme = (themeOption: ThemeOption) => {
    setSelectedThemeState(themeOption);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().setTheme(themeOption);
      })
      .catch(() => {});
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().setColorScheme(scheme);
      })
      .catch(() => {});
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    selectedTheme,
    colorScheme,
    toggleTheme,
    setTheme,
    setSelectedTheme,
    setColorScheme,
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
