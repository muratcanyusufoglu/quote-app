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
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    background?: string;
  };
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setSelectedTheme: (theme: ThemeOption) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setCustomColors: (colors: ThemeContextType["customColors"]) => void;
  resetCustomColors: () => void;
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

  // Get custom colors from store
  const [customColors, setCustomColorsState] =
    useState<ThemeContextType["customColors"]>();

  useEffect(() => {
    const loadCustomColors = async () => {
      try {
        const { useThemeStore } = await import("../store/useThemeStore");
        const state = useThemeStore.getState();
        setCustomColorsState(state.customColors);
      } catch (error) {
        console.log("Could not load custom colors from store:", error);
      }
    };

    loadCustomColors();
  }, []);

  // Get the theme based on selected theme option and dark mode
  let theme;
  try {
    theme = getThemeByOption(selectedTheme, isDark);
  } catch (error) {
    console.error("Error getting theme by option:", error);
    // Fallback to default theme
    theme = getThemeByOption("default", isDark);
  }

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

  const setCustomColors = (colors: ThemeContextType["customColors"]) => {
    setCustomColorsState(colors);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().setCustomColors(colors);
      })
      .catch(() => {});
  };

  const resetCustomColors = () => {
    setCustomColorsState(undefined);

    // Save to store
    import("../store/useThemeStore")
      .then(({ useThemeStore }) => {
        useThemeStore.getState().resetCustomColors();
      })
      .catch(() => {});
  };

  // Ensure theme is always defined
  const safeTheme = theme || getThemeByOption("default", isDark);

  const value: ThemeContextType = {
    theme: safeTheme,
    isDark,
    selectedTheme,
    colorScheme,
    customColors,
    toggleTheme,
    setTheme,
    setSelectedTheme,
    setColorScheme,
    setCustomColors,
    resetCustomColors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error("useTheme must be used within a ThemeProvider");
    // Return a default theme to prevent crashes
    try {
      return {
        theme: getThemeByOption("default", true),
        isDark: true,
        selectedTheme: "default",
        colorScheme: "system",
        toggleTheme: () => {},
        setTheme: () => {},
        setSelectedTheme: () => {},
        setColorScheme: () => {},
        setCustomColors: () => {},
        resetCustomColors: () => {},
      };
    } catch (error) {
      console.error("Error creating default theme:", error);
      // Return a minimal theme object
      return {
        theme: {
          colors: {
            primary: "#3b82f6",
            primaryLight: "#60a5fa",
            primaryDark: "#2563eb",
            secondary: "#a855f7",
            secondaryLight: "#c084fc",
            secondaryDark: "#9333ea",
            background: "#ffffff",
            surface: "#ffffff",
            surfaceElevated: "#ffffff",
            text: "#000000",
            textSecondary: "#6b7280",
            textTertiary: "#9ca3af",
            textInverse: "#ffffff",
            textSoft: "#2c3e50",
            textSoftSecondary: "rgba(44, 62, 80, 0.95)",
            textSoftTertiary: "rgba(44, 62, 80, 0.75)",
            border: "#e5e7eb",
            borderLight: "#f3f4f6",
            borderDark: "#d1d5db",
            borderSoft: "rgba(54, 69, 79, 0.1)",
            backgroundSoft: "rgba(54, 69, 79, 0.05)",
            error: "#ef4444",
            errorLight: "#fee2e2",
            warning: "#f97316",
            warningLight: "#ffedd5",
            success: "#10b981",
            successLight: "#d1fae5",
            premium: "#f59e0b",
            premiumLight: "#fef3c7",
            accent: "#f59e0b",
            overlay: "rgba(0, 0, 0, 0.5)",
            backdrop: "rgba(0, 0, 0, 0.3)",
            brandYellow: "#fef08a",
            gradientColors: ["#1a1a1a", "#2d2d2d", "#454545", "#f4d03f"],
            gradientLocations: [0, 0.3, 0.7, 1],
            radialOverlayColors: [
              "transparent",
              "rgba(244, 208, 63, 0.2)",
              "transparent",
            ],
            white: "#FFFFFF",
            black: "#000000",
            transparent: "transparent",
            shadowColor: "#000000",
            shadowLight: "rgba(0, 0, 0, 0.1)",
            shadowMedium: "rgba(0, 0, 0, 0.3)",
            shadowHeavy: "rgba(0, 0, 0, 0.7)",
            favoriteRed: "#ff6b6b",
            favoriteActive: "#ff4757",
            goldAccent: "#FFD700",
            whiteOverlay10: "rgba(255, 255, 255, 0.1)",
            whiteOverlay20: "rgba(255, 255, 255, 0.2)",
            whiteOverlay25: "rgba(255, 255, 255, 0.25)",
            whiteOverlay70: "rgba(255, 255, 255, 0.7)",
            whiteOverlay80: "rgba(255, 255, 255, 0.8)",
            whiteOverlay90: "rgba(255, 255, 255, 0.9)",
            blackOverlay10: "rgba(0, 0, 0, 0.1)",
            blackOverlay30: "rgba(0, 0, 0, 0.3)",
            blackOverlay40: "rgba(0, 0, 0, 0.4)",
            blackOverlay60: "rgba(0, 0, 0, 0.6)",
            blackOverlay70: "rgba(0, 0, 0, 0.7)",
            anthraciteOverlay10: "rgba(54, 69, 79, 0.1)",
            anthraciteOverlay20: "rgba(54, 69, 79, 0.2)",
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            xxl: 40,
          },
          typography: {
            fontSize: {
              xs: 12,
              sm: 14,
              md: 16,
              lg: 18,
              xl: 20,
              xxl: 24,
              xxxl: 28,
            },
            fontWeight: {
              regular: "400",
              medium: "500",
              semibold: "600",
              bold: "700",
            },
          },
          borderRadius: {
            xs: 2,
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
            xxl: 20,
            round: 9999,
          },
        },
        isDark: false,
        selectedTheme: "default",
        colorScheme: "system",
        toggleTheme: () => {},
        setTheme: () => {},
        setSelectedTheme: () => {},
        setColorScheme: () => {},
        setCustomColors: () => {},
        resetCustomColors: () => {},
      };
    }
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
