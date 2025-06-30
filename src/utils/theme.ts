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

  // Golden/Yellow warm tones for quote cards (softer and more muted)
  yellow50: "#fefce8",
  yellow100: "#fef9c3",
  yellow200: "#fef08a",
  yellow300: "#fde047",
  yellow400: "#facc15",
  yellow500: "#f4d03f", // Softer, more muted golden primary
  yellow600: "#f7dc6f",
  yellow700: "#f8c471",
  yellow800: "#f9ca63",
  yellow900: "#f1c40f",

  // Warm golden variants for quote backgrounds (softer and more elegant)
  golden50: "#fffbeb",
  golden100: "#fef3c7",
  golden200: "#fde68a",
  golden300: "#fcd34d",
  golden400: "#fbbf24",
  golden500: "#f4d03f", // Softer main golden
  golden600: "#f7dc6f",
  golden700: "#f8c471",
  golden800: "#f9ca63",
  golden900: "#f1c40f",

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

    // Soft text colors for quote content - Darker for better contrast on golden cards
    textSoft: "#2c3e50", // Very dark blue-gray for excellent contrast on golden background
    textSoftSecondary: "rgba(44, 62, 80, 0.95)", // Almost opaque dark secondary
    textSoftTertiary: "rgba(44, 62, 80, 0.75)", // Darker tertiary for good readability

    // Border colors
    border: colorPalette.gray200,
    borderLight: colorPalette.gray100,
    borderDark: colorPalette.gray300,

    // Soft border and background colors - matching anthracite theme
    borderSoft: "rgba(54, 69, 79, 0.1)",
    backgroundSoft: "rgba(54, 69, 79, 0.05)",

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

    // App-wide gradient and brand colors
    brandYellow: colorPalette.golden500,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#454545", colorPalette.golden500],
    gradientLocations: [0, 0.3, 0.7, 1],
    radialOverlayColors: [
      "transparent",
      `rgba(244, 208, 63, 0.2)`,
      "transparent",
    ],

    // Common semantic colors used throughout the app
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",

    // Shadow and overlay colors
    shadowColor: "#000000",
    shadowLight: "rgba(0, 0, 0, 0.1)",
    shadowMedium: "rgba(0, 0, 0, 0.3)",
    shadowHeavy: "rgba(0, 0, 0, 0.7)",

    // Interactive colors
    favoriteRed: "#ff6b6b",
    favoriteActive: "#ff4757",
    goldAccent: "#FFD700",

    // Overlay and background variations
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

    // Anthracite overlay colors (for soft text backgrounds)
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

    // Soft text colors for quote content (adjusted for dark theme) - Darkened for better contrast on golden cards
    textSoft: "#2c3e50", // Dark blue-gray (much better contrast on golden background)
    textSoftSecondary: "rgba(44, 62, 80, 0.9)", // Darker secondary with high opacity
    textSoftTertiary: "rgba(44, 62, 80, 0.7)", // Darker tertiary for better readability

    // Border colors
    border: colorPalette.dark600,
    borderLight: colorPalette.dark700,
    borderDark: colorPalette.dark500,

    // Soft border and background colors (adjusted for dark theme)
    borderSoft: "rgba(189, 195, 199, 0.1)",
    backgroundSoft: "rgba(189, 195, 199, 0.05)",

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

    // App-wide gradient and brand colors
    brandYellow: colorPalette.golden500,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#454545", colorPalette.golden500],
    gradientLocations: [0, 0.3, 0.7, 1],
    radialOverlayColors: [
      "transparent",
      `rgba(244, 208, 63, 0.2)`,
      "transparent",
    ],

    // Common semantic colors used throughout the app
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",

    // Shadow and overlay colors
    shadowColor: "#000000",
    shadowLight: "rgba(0, 0, 0, 0.1)",
    shadowMedium: "rgba(0, 0, 0, 0.3)",
    shadowHeavy: "rgba(0, 0, 0, 0.7)",

    // Interactive colors
    favoriteRed: "#ff6b6b",
    favoriteActive: "#ff4757",
    goldAccent: "#FFD700",

    // Overlay and background variations
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

    // Anthracite overlay colors (for soft text backgrounds)
    anthraciteOverlay10: "rgba(54, 69, 79, 0.1)",
    anthraciteOverlay20: "rgba(54, 69, 79, 0.2)",
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
};

// Harmonious category colors - based on warm golden palette (inspired by screenshot)
export const categoryColors = {
  // Primary categories - warm golden tones
  motivation: colorPalette.golden500,
  motivasyon: colorPalette.golden500,
  inspiration: colorPalette.yellow500,
  ilham: colorPalette.yellow500,
  wisdom: colorPalette.golden600,
  bilgelik: colorPalette.golden600,
  mindfulness: colorPalette.yellow600,
  farkindalik: colorPalette.yellow600,

  // Success and growth - warm greens with golden tints
  success: colorPalette.emerald500,
  basari: colorPalette.emerald500,
  growth: colorPalette.emerald600,
  gelisim: colorPalette.emerald600,
  leadership: colorPalette.golden700,
  liderlik: colorPalette.golden700,

  // Positive emotions - warm golden colors
  happiness: colorPalette.golden400,
  mutluluk: colorPalette.golden400,
  love: colorPalette.red400,
  ask: colorPalette.red400,
  gratitude: colorPalette.golden500,
  sukur: colorPalette.golden500,

  // Strength and courage - deeper golden/amber tones
  courage: colorPalette.amber600,
  cesaret: colorPalette.amber600,
  resilience: colorPalette.golden700,
  dayaniklilik: colorPalette.golden700,

  // Peace and balance - soft golden tones
  peace: colorPalette.yellow300,
  huzur: colorPalette.yellow300,
  balance: colorPalette.golden300,
  denge: colorPalette.golden300,

  // Creativity and dreams - vibrant golden colors
  creativity: colorPalette.yellow400,
  yaraticilik: colorPalette.yellow400,
  dreams: colorPalette.golden400,
  hayaller: colorPalette.golden400,

  // Additional categories with warm tones
  patience: colorPalette.golden300,
  sabir: colorPalette.golden300,
  time: colorPalette.amber500,
  zaman: colorPalette.amber500,
  change: colorPalette.yellow400,
  degisim: colorPalette.yellow400,
  health: colorPalette.emerald400,
  saglik: colorPalette.emerald400,
  family: colorPalette.golden600,
  aile: colorPalette.golden600,
  friendship: colorPalette.yellow500,
  arkadaslik: colorPalette.yellow500,
  travel: colorPalette.amber400,
  seyahat: colorPalette.amber400,
  nature: colorPalette.emerald500,
  doga: colorPalette.emerald500,
  technology: colorPalette.blue500,
  teknoloji: colorPalette.blue500,
  education: colorPalette.golden600,
  egitim: colorPalette.golden600,
  spirituality: colorPalette.purple400,
  maneviyat: colorPalette.purple400,

  // Default and general - warm neutral
  general: colorPalette.golden500,
  genel: colorPalette.golden500,
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

// Lucide icon mappings for categories - exact matches with IconSymbol ICON_MAPPING
export const categoryIcons = {
  // Basic categories
  general: "message-circle", // ✅ exists in ICON_MAPPING
  genel: "message-circle",

  // Motivation & Success
  motivation: "star", // ✅ exists
  motivasyon: "star",
  success: "crown", // ✅ exists
  basari: "crown",
  inspiration: "lightbulb", // ✅ exists
  ilham: "lightbulb",

  // Knowledge & Learning
  wisdom: "book", // ✅ exists
  bilgelik: "book",
  education: "graduation-cap", // ✅ exists (note the dash!)
  egitim: "graduation-cap",

  // Emotions & Feelings
  happiness: "heart", // ✅ exists
  mutluluk: "heart",
  love: "heart", // ✅ exists
  ask: "heart",
  gratitude: "gift", // ✅ exists
  sukur: "gift",

  // Personal Development
  growth: "trending-up", // ✅ exists (note the dash!)
  gelisim: "trending-up",
  creativity: "palette", // ✅ exists
  yaraticilik: "palette",
  leadership: "crown", // ✅ exists
  liderlik: "crown",
  mindfulness: "brain", // ✅ exists
  farkindalik: "brain",

  // Strength & Resilience
  courage: "shield", // ✅ exists
  cesaret: "shield",
  resilience: "mountain", // ✅ exists
  dayaniklilik: "mountain",

  // Peace & Balance
  peace: "heart", // ✅ exists
  huzur: "heart",
  balance: "scale", // ✅ exists
  denge: "scale",
  spirituality: "church", // ✅ exists
  maneviyat: "church",

  // Dreams & Goals
  dreams: "moon", // ✅ exists
  hayaller: "moon",

  // Relationships
  friendship: "users", // ✅ exists
  arkadaslik: "users",
  family: "home", // ✅ exists
  aile: "home",

  // Health & Wellness
  health: "heart-pulse", // ✅ exists (note the dash!)
  saglik: "heart-pulse",

  // Life & Change
  change: "refresh-cw", // ✅ exists (note the dash!)
  degisim: "refresh-cw",
  time: "hourglass", // ✅ exists
  zaman: "hourglass",
  patience: "clock", // ✅ exists
  sabir: "clock",

  // Adventure & World
  travel: "compass", // ✅ exists
  seyahat: "compass",
  nature: "tree-pine", // ✅ exists (note the dash!)
  doga: "tree-pine",

  // Technology
  technology: "cpu", // ✅ exists
  teknoloji: "cpu",

  // Additional categories
  life: "tree-pine",
  hayat: "tree-pine",
  strength: "zap", // ✅ exists
  guc: "zap",
  work: "briefcase", // ✅ exists
  is: "briefcase",
  adventure: "map", // ✅ exists
  macera: "map",
  purpose: "target", // ✅ exists
  amac: "target",
  confidence: "zap",
  guven: "zap",
  forgiveness: "heart",
  affetme: "heart",
  hope: "sunrise", // ✅ exists
  umut: "sunrise",
} as const;

// Helper function to get category icon with smart fallback
export const getCategoryIcon = (categoryId: string): string | null => {
  // Try exact match first
  const exactIcon = categoryIcons[categoryId as keyof typeof categoryIcons];
  if (exactIcon) {
    console.log(`✅ Found exact icon for ${categoryId}: ${exactIcon}`);
    return exactIcon;
  }

  // Try lowercase match
  const lowerIcon =
    categoryIcons[categoryId.toLowerCase() as keyof typeof categoryIcons];
  if (lowerIcon) {
    console.log(`✅ Found lowercase icon for ${categoryId}: ${lowerIcon}`);
    return lowerIcon;
  }

  // Log missing icon for debugging
  console.warn(`❌ Missing icon mapping for category: "${categoryId}"`);
  console.log(`🔍 Available icons:`, Object.keys(categoryIcons));

  // Return null so ExploreScreen can use emoji fallback
  return null;
};

// Export current theme (this can be dynamic based on user preference)
export const currentTheme = darkTheme;

// Theme switching utility
export const getTheme = (isDark: boolean = true): Theme => {
  return isDark ? darkTheme : lightTheme;
};
