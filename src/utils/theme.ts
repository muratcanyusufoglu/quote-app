import { Theme } from "../types";

// Base color palette - carefully chosen for harmony and accessibility
const colorPalette = {
  // Primary blues - main brand colors
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue400: "#60a5fa",
  blue500: "#3b82f6", // Primary
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",

  // Secondary purples - complement blues nicely
  purple50: "#faf5ff",
  purple100: "#f3e8ff",
  purple200: "#e9d5ff",
  purple300: "#d8b4fe",
  purple400: "#c084fc",
  purple500: "#a855f7", // Secondary
  purple600: "#9333ea",
  purple700: "#7c3aed",
  purple800: "#6b21a8",
  purple900: "#581c87",

  // Accent colors - warm tones for highlights
  amber50: "#fffbeb",
  amber100: "#fef3c7",
  amber200: "#fde68a",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  amber500: "#f59e0b", // Accent
  amber600: "#d97706",
  amber700: "#b45309",
  amber800: "#92400e",
  amber900: "#78350f",

  // Success greens
  emerald50: "#ecfdf5",
  emerald100: "#d1fae5",
  emerald200: "#a7f3d0",
  emerald300: "#6ee7b7",
  emerald400: "#34d399",
  emerald500: "#10b981", // Success
  emerald600: "#059669",
  emerald700: "#047857",
  emerald800: "#065f46",
  emerald900: "#064e3b",

  // Error reds
  red50: "#fef2f2",
  red100: "#fee2e2",
  red200: "#fecaca",
  red300: "#fca5a5",
  red400: "#f87171",
  red500: "#ef4444", // Error
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  red900: "#7f1d1d",

  // Warning oranges
  orange50: "#fff7ed",
  orange100: "#ffedd5",
  orange200: "#fed7aa",
  orange300: "#fdba74",
  orange400: "#fb923c",
  orange500: "#f97316", // Warning
  orange600: "#ea580c",
  orange700: "#c2410c",
  orange800: "#9a3412",
  orange900: "#7c2d12",

  // Neutral grays
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Dark theme specific
  dark50: "#f8fafc",
  dark100: "#f1f5f9",
  dark200: "#e2e8f0",
  dark300: "#cbd5e1",
  dark400: "#94a3b8",
  dark500: "#64748b",
  dark600: "#475569",
  dark700: "#334155",
  dark800: "#1e293b",
  dark850: "#0f172a",
  dark900: "#020617",
} as const;

// Light theme definition
export const lightTheme: Theme = {
  colors: {
    // Core colors
    primary: colorPalette.blue500,
    primaryLight: colorPalette.blue400,
    primaryDark: colorPalette.blue600,
    secondary: colorPalette.purple500,
    secondaryLight: colorPalette.purple400,
    secondaryDark: colorPalette.purple600,

    // Backgrounds
    background: colorPalette.gray50,
    surface: "#ffffff",
    surfaceElevated: "#ffffff",

    // Text colors
    text: colorPalette.gray900,
    textSecondary: colorPalette.gray600,
    textTertiary: colorPalette.gray500,
    textInverse: "#ffffff",

    // Border colors
    border: colorPalette.gray200,
    borderLight: colorPalette.gray100,
    borderDark: colorPalette.gray300,

    // State colors
    error: colorPalette.red500,
    errorLight: colorPalette.red100,
    warning: colorPalette.orange500,
    warningLight: colorPalette.orange100,
    success: colorPalette.emerald500,
    successLight: colorPalette.emerald100,

    // Special colors
    premium: colorPalette.amber500,
    premiumLight: colorPalette.amber100,
    accent: colorPalette.amber500,

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.5)",
    backdrop: "rgba(0, 0, 0, 0.3)",
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
};

// Dark theme definition
export const darkTheme: Theme = {
  colors: {
    // Core colors - adjusted for dark theme
    primary: colorPalette.blue400,
    primaryLight: colorPalette.blue300,
    primaryDark: colorPalette.blue500,
    secondary: colorPalette.purple400,
    secondaryLight: colorPalette.purple300,
    secondaryDark: colorPalette.purple500,

    // Backgrounds
    background: colorPalette.dark900,
    surface: colorPalette.dark800,
    surfaceElevated: colorPalette.dark700,

    // Text colors
    text: colorPalette.dark50,
    textSecondary: colorPalette.dark300,
    textTertiary: colorPalette.dark400,
    textInverse: colorPalette.gray900,

    // Border colors
    border: colorPalette.dark600,
    borderLight: colorPalette.dark700,
    borderDark: colorPalette.dark500,

    // State colors
    error: colorPalette.red400,
    errorLight: colorPalette.red900,
    warning: colorPalette.orange400,
    warningLight: colorPalette.orange900,
    success: colorPalette.emerald400,
    successLight: colorPalette.emerald900,

    // Special colors
    premium: colorPalette.amber400,
    premiumLight: colorPalette.amber900,
    accent: colorPalette.amber400,

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.7)",
    backdrop: "rgba(0, 0, 0, 0.5)",
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
};

// Harmonious category colors - based on the main palette
export const categoryColors = {
  // Primary categories - blues and purples
  motivation: colorPalette.blue500,
  motivasyon: colorPalette.blue500,
  inspiration: colorPalette.blue600,
  ilham: colorPalette.blue600,
  wisdom: colorPalette.purple500,
  bilgelik: colorPalette.purple500,
  mindfulness: colorPalette.purple600,
  farkindalik: colorPalette.purple600,

  // Success and growth - greens
  success: colorPalette.emerald500,
  basari: colorPalette.emerald500,
  growth: colorPalette.emerald600,
  gelisim: colorPalette.emerald600,
  leadership: colorPalette.emerald700,
  liderlik: colorPalette.emerald700,

  // Positive emotions - warm colors
  happiness: colorPalette.amber500,
  mutluluk: colorPalette.amber500,
  love: colorPalette.red400,
  ask: colorPalette.red400,
  gratitude: colorPalette.orange500,
  sukur: colorPalette.orange500,

  // Strength and courage - stronger colors
  courage: colorPalette.red500,
  cesaret: colorPalette.red500,
  resilience: colorPalette.red600,
  dayaniklilik: colorPalette.red600,

  // Peace and balance - calming colors
  peace: colorPalette.blue300,
  huzur: colorPalette.blue300,
  balance: colorPalette.purple300,
  denge: colorPalette.purple300,

  // Creativity and dreams - imaginative colors
  creativity: colorPalette.purple400,
  yaraticilik: colorPalette.purple400,
  dreams: colorPalette.purple600,
  hayaller: colorPalette.purple600,

  // Default and general
  general: colorPalette.gray500,
  genel: colorPalette.gray500,
} as const;

// Category color mappings for dark and light themes
export const getCategoryColorForTheme = (
  category: string,
  isDark: boolean = true
): string => {
  const baseColor =
    categoryColors[category.toLowerCase() as keyof typeof categoryColors];
  if (!baseColor) {
    return isDark ? darkTheme.colors.primary : lightTheme.colors.primary;
  }
  return baseColor;
};

// Icon mappings for categories
export const categoryIcons = {
  motivation: "🚀",
  motivasyon: "🚀",
  success: "🏆",
  basari: "🏆",
  wisdom: "🧠",
  bilgelik: "🧠",
  happiness: "😊",
  mutluluk: "😊",
  love: "❤️",
  ask: "❤️",
  life: "🌱",
  hayat: "🌱",
  inspiration: "✨",
  ilham: "✨",
  growth: "📈",
  gelisim: "📈",
  courage: "🦁",
  cesaret: "🦁",
  peace: "☮️",
  huzur: "☮️",
  strength: "💪",
  guc: "💪",
  dreams: "🌟",
  hayaller: "🌟",
  friendship: "🤝",
  arkadaslik: "🤝",
  family: "👨‍👩‍👧‍👦",
  aile: "👨‍👩‍👧‍👦",
  work: "💼",
  is: "💼",
  health: "🏃‍♂️",
  saglik: "🏃‍♂️",
  education: "📚",
  egitim: "📚",
  creativity: "🎨",
  yaraticilik: "🎨",
  leadership: "👑",
  liderlik: "👑",
  spirituality: "🙏",
  maneviyat: "🙏",
  mindfulness: "🧘‍♀️",
  farkindalik: "🧘‍♀️",
  resilience: "🌊",
  dayaniklilik: "🌊",
  gratitude: "🙏",
  sukur: "🙏",
  change: "🔄",
  degisim: "🔄",
  adventure: "🗺️",
  macera: "🗺️",
  purpose: "🎯",
  amac: "🎯",
  balance: "⚖️",
  denge: "⚖️",
  confidence: "💫",
  guven: "💫",
  forgiveness: "🕊️",
  affetme: "🕊️",
  hope: "🌅",
  umut: "🌅",
  general: "💭",
  genel: "💭",
} as const;

// Export current theme (this can be dynamic based on user preference)
export const currentTheme = darkTheme;

// Theme switching utility
export const getTheme = (isDark: boolean = true): Theme => {
  return isDark ? darkTheme : lightTheme;
};
