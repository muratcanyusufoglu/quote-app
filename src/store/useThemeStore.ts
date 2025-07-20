import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeOption =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "purple"
  | "minimalist";

export type ColorScheme = "light" | "dark" | "system";

interface ThemeStoreState {
  selectedTheme: ThemeOption;
  colorScheme: ColorScheme;
  _hasHydrated: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    background?: string;
  };
}

interface ThemeStoreActions {
  setTheme: (theme: ThemeOption) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setCustomColors: (colors: ThemeStoreState["customColors"]) => void;
  resetCustomColors: () => void;
}

type ThemeStore = ThemeStoreState & ThemeStoreActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      selectedTheme: "default",
      colorScheme: "system",
      _hasHydrated: false,

      // Actions
      setTheme: (theme: ThemeOption) => {
        console.log(`🎨 Theme changed to: ${theme}`);
        set({ selectedTheme: theme });
      },

      setColorScheme: (scheme: ColorScheme) => {
        console.log(`🌓 Color scheme changed to: ${scheme}`);
        set({ colorScheme: scheme });
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated });
      },

      setCustomColors: (colors: ThemeStoreState["customColors"]) => {
        console.log(`🎨 Custom colors updated:`, colors);
        set({ customColors: colors });
      },

      resetCustomColors: () => {
        console.log(`🎨 Custom colors reset`);
        set({ customColors: undefined });
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        console.log("🎨 Theme store hydrated");
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selectors
export const useThemeSelectors = {
  selectedTheme: () => useThemeStore((state) => state.selectedTheme),
  colorScheme: () => useThemeStore((state) => state.colorScheme),
  hasHydrated: () => useThemeStore((state) => state._hasHydrated),
  customColors: () => useThemeStore((state) => state.customColors),
  actions: () =>
    useThemeStore((state) => ({
      setTheme: state.setTheme,
      setColorScheme: state.setColorScheme,
      setCustomColors: state.setCustomColors,
      resetCustomColors: state.resetCustomColors,
    })),
};
