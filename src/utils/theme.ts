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

  // Additional colors for complete theme support
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Text colors
  textSoft: "#2c3e50",
  textSoftSecondary: "rgba(44, 62, 80, 0.95)",
  textSoftTertiary: "rgba(44, 62, 80, 0.75)",

  // Border and background soft colors
  borderSoft: "rgba(54, 69, 79, 0.1)",
  backgroundSoft: "rgba(54, 69, 79, 0.05)",
  borderSoftDark: "rgba(189, 195, 199, 0.1)",
  backgroundSoftDark: "rgba(189, 195, 199, 0.05)",

  // Overlay colors
  overlayLight: "rgba(0, 0, 0, 0.5)",
  overlayDark: "rgba(0, 0, 0, 0.7)",
  backdropLight: "rgba(0, 0, 0, 0.3)",
  backdropDark: "rgba(0, 0, 0, 0.5)",

  // Interactive colors
  favoriteRed: "#ff6b6b",
  favoriteActive: "#ff4757",
  goldAccent: "#FFD700",

  // White overlay variations
  whiteOverlay10: "rgba(255, 255, 255, 0.1)",
  whiteOverlay20: "rgba(255, 255, 255, 0.2)",
  whiteOverlay25: "rgba(255, 255, 255, 0.25)",
  whiteOverlay70: "rgba(255, 255, 255, 0.7)",
  whiteOverlay80: "rgba(255, 255, 255, 0.8)",
  whiteOverlay90: "rgba(255, 255, 255, 0.9)",

  // Black overlay variations
  blackOverlay10: "rgba(0, 0, 0, 0.1)",
  blackOverlay30: "rgba(0, 0, 0, 0.3)",
  blackOverlay40: "rgba(0, 0, 0, 0.4)",
  blackOverlay60: "rgba(0, 0, 0, 0.6)",
  blackOverlay70: "rgba(0, 0, 0, 0.7)",

  // Anthracite overlay colors
  anthraciteOverlay10: "rgba(54, 69, 79, 0.1)",
  anthraciteOverlay20: "rgba(54, 69, 79, 0.2)",

  // Shadow colors
  shadowColor: "#000000",
  shadowLight: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.3)",
  shadowHeavy: "rgba(0, 0, 0, 0.7)",

  // Gradient colors
  gradientDark1: "#1a1a1a",
  gradientDark2: "#2d2d2d",
  gradientDark3: "#454545",
  radialOverlayTransparent: "transparent",
  radialOverlayGolden: "rgba(244, 208, 63, 0.2)",
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
    surface: colorPalette.white,
    surfaceElevated: colorPalette.white,

    // Text colors
    text: colorPalette.gray900,
    textSecondary: colorPalette.gray600,
    textTertiary: colorPalette.gray500,
    textInverse: colorPalette.white,

    // Soft text colors for quote content - Darker for better contrast on golden cards
    textSoft: colorPalette.textSoft,
    textSoftSecondary: colorPalette.textSoftSecondary,
    textSoftTertiary: colorPalette.textSoftTertiary,

    // Border colors
    border: colorPalette.gray200,
    borderLight: colorPalette.gray100,
    borderDark: colorPalette.gray300,

    // Soft border and background colors - matching anthracite theme
    borderSoft: colorPalette.borderSoft,
    backgroundSoft: colorPalette.backgroundSoft,

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
    overlay: colorPalette.overlayLight,
    backdrop: colorPalette.backdropLight,

    // App-wide gradient and brand colors
    brandYellow: colorPalette.golden200,
    gradientColors: [
      colorPalette.gradientDark1,
      colorPalette.gradientDark2,
      colorPalette.gradientDark3,
      colorPalette.golden500,
    ],
    gradientLocations: [0, 0.3, 0.7, 1],
    radialOverlayColors: [
      colorPalette.radialOverlayTransparent,
      colorPalette.radialOverlayGolden,
      colorPalette.radialOverlayTransparent,
    ],

    // Common semantic colors used throughout the app
    white: colorPalette.white,
    black: colorPalette.black,
    transparent: colorPalette.transparent,

    // Shadow and overlay colors
    shadowColor: colorPalette.shadowColor,
    shadowLight: colorPalette.shadowLight,
    shadowMedium: colorPalette.shadowMedium,
    shadowHeavy: colorPalette.shadowHeavy,

    // Interactive colors
    favoriteRed: colorPalette.favoriteRed,
    favoriteActive: colorPalette.favoriteActive,
    goldAccent: colorPalette.goldAccent,

    // Overlay and background variations
    whiteOverlay10: colorPalette.whiteOverlay10,
    whiteOverlay20: colorPalette.whiteOverlay20,
    whiteOverlay25: colorPalette.whiteOverlay25,
    whiteOverlay70: colorPalette.whiteOverlay70,
    whiteOverlay80: colorPalette.whiteOverlay80,
    whiteOverlay90: colorPalette.whiteOverlay90,

    blackOverlay10: colorPalette.blackOverlay10,
    blackOverlay30: colorPalette.blackOverlay30,
    blackOverlay40: colorPalette.blackOverlay40,
    blackOverlay60: colorPalette.blackOverlay60,
    blackOverlay70: colorPalette.blackOverlay70,

    // Anthracite overlay colors (for soft text backgrounds)
    anthraciteOverlay10: colorPalette.anthraciteOverlay10,
    anthraciteOverlay20: colorPalette.anthraciteOverlay20,
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
    textSoft: colorPalette.textSoft,
    textSoftSecondary: colorPalette.textSoftSecondary,
    textSoftTertiary: colorPalette.textSoftTertiary,

    // Border colors
    border: colorPalette.dark600,
    borderLight: colorPalette.dark700,
    borderDark: colorPalette.dark500,

    // Soft border and background colors (adjusted for dark theme)
    borderSoft: colorPalette.borderSoftDark,
    backgroundSoft: colorPalette.backgroundSoftDark,

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
    overlay: colorPalette.overlayDark,
    backdrop: colorPalette.backdropDark,

    // App-wide gradient and brand colors
    brandYellow: colorPalette.golden300, // Orta açık sarı - dark tema için uygun
    gradientColors: [
      colorPalette.gradientDark1,
      colorPalette.gradientDark2,
      colorPalette.gradientDark3,
      colorPalette.golden500,
    ],
    gradientLocations: [0, 0.3, 0.7, 1],
    radialOverlayColors: [
      colorPalette.radialOverlayTransparent,
      colorPalette.radialOverlayGolden,
      colorPalette.radialOverlayTransparent,
    ],

    // Common semantic colors used throughout the app
    white: colorPalette.white,
    black: colorPalette.black,
    transparent: colorPalette.transparent,

    // Shadow and overlay colors
    shadowColor: colorPalette.shadowColor,
    shadowLight: colorPalette.shadowLight,
    shadowMedium: colorPalette.shadowMedium,
    shadowHeavy: colorPalette.shadowHeavy,

    // Interactive colors
    favoriteRed: colorPalette.favoriteRed,
    favoriteActive: colorPalette.favoriteActive,
    goldAccent: colorPalette.goldAccent,

    // Overlay and background variations
    whiteOverlay10: colorPalette.whiteOverlay10,
    whiteOverlay20: colorPalette.whiteOverlay20,
    whiteOverlay25: colorPalette.whiteOverlay25,
    whiteOverlay70: colorPalette.whiteOverlay70,
    whiteOverlay80: colorPalette.whiteOverlay80,
    whiteOverlay90: colorPalette.whiteOverlay90,

    blackOverlay10: colorPalette.blackOverlay10,
    blackOverlay30: colorPalette.blackOverlay30,
    blackOverlay40: colorPalette.blackOverlay40,
    blackOverlay60: colorPalette.blackOverlay60,
    blackOverlay70: colorPalette.blackOverlay70,

    // Anthracite overlay colors (for soft text backgrounds)
    anthraciteOverlay10: colorPalette.anthraciteOverlay10,
    anthraciteOverlay20: colorPalette.anthraciteOverlay20,
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

// ==============================
// NEW THEME PALETTES
// ==============================

// Ocean Theme - Calming blues and teals - Updated for better contrast
const oceanPalette = {
  // Ocean blues
  ocean50: "#f0f9ff",
  ocean100: "#e0f2fe",
  ocean200: "#bae6fd",
  ocean300: "#7dd3fc",
  ocean400: "#38bdf8",
  ocean500: "#0ea5e9", // Primary ocean blue
  ocean600: "#0284c7",
  ocean700: "#0369a1",
  ocean800: "#075985",
  ocean900: "#0c4a6e",

  // Light ocean for brand color
  oceanLight100: "#f0f9ff", // Çok açık mavi - siyah yazı için mükemmel
  oceanLight200: "#e0f2fe", // Açık mavi
  oceanLight300: "#bae6fd", // Orta açık mavi

  // Deep ocean/teal
  teal50: "#f0fdfa",
  teal100: "#ccfbf1",
  teal200: "#99f6e4",
  teal300: "#5eead4",
  teal400: "#2dd4bf",
  teal500: "#14b8a6", // Secondary teal
  teal600: "#0d9488",
  teal700: "#0f766e",
  teal800: "#115e59",
  teal900: "#134e4a",

  // Light teal for brand color
  tealLight100: "#f0fdfa", // Çok açık teal
  tealLight200: "#ccfbf1", // Açık teal
};

// Forest Theme - Natural greens - Updated for better contrast
const forestPalette = {
  // Fresh greens
  forest50: "#f0fdf4",
  forest100: "#dcfce7",
  forest200: "#bbf7d0",
  forest300: "#86efac",
  forest400: "#4ade80",
  forest500: "#22c55e", // Primary forest green
  forest600: "#16a34a",
  forest700: "#15803d",
  forest800: "#166534",
  forest900: "#14532d",

  // Light forest for brand color
  forestLight100: "#f0fdf4", // Çok açık yeşil - siyah yazı için mükemmel
  forestLight200: "#dcfce7", // Açık yeşil
  forestLight300: "#bbf7d0", // Orta açık yeşil

  // Deep forest
  pine50: "#f7fee7",
  pine100: "#ecfccb",
  pine200: "#d9f99d",
  pine300: "#bef264",
  pine400: "#a3e635",
  pine500: "#84cc16", // Secondary pine
  pine600: "#65a30d",
  pine700: "#4d7c0f",
  pine800: "#3f6212",
  pine900: "#365314",

  // Light pine for brand color
  pineLight100: "#f7fee7", // Çok açık lime
  pineLight200: "#ecfccb", // Açık lime
};

// Sunset Theme - Warm oranges and reds - Updated for better contrast
const sunsetPalette = {
  // Sunset oranges
  sunset50: "#fff7ed",
  sunset100: "#ffedd5",
  sunset200: "#fed7aa",
  sunset300: "#fdba74",
  sunset400: "#fb923c",
  sunset500: "#f97316", // Primary sunset orange
  sunset600: "#ea580c",
  sunset700: "#c2410c",
  sunset800: "#9a3412",
  sunset900: "#7c2d12",

  // Light sunset for brand color
  sunsetLight100: "#fff7ed", // Çok açık turuncu - siyah yazı için mükemmel
  sunsetLight200: "#ffedd5", // Açık turuncu
  sunsetLight300: "#fed7aa", // Orta açık turuncu

  // Deep sunset reds
  coral50: "#fef2f2",
  coral100: "#fee2e2",
  coral200: "#fecaca",
  coral300: "#fca5a5",
  coral400: "#f87171",
  coral500: "#ef4444", // Secondary coral red
  coral600: "#dc2626",
  coral700: "#b91c1c",
  coral800: "#991b1b",
  coral900: "#7f1d1d",

  // Light coral for brand color
  coralLight100: "#fef2f2", // Çok açık koral
  coralLight200: "#fee2e2", // Açık koral
};

// Purple Theme - Royal purples and lavender - Updated for better contrast
const purplePalette = {
  // Royal purples
  royal50: "#faf5ff",
  royal100: "#f3e8ff",
  royal200: "#e9d5ff",
  royal300: "#d8b4fe",
  royal400: "#c084fc",
  royal500: "#a855f7", // Primary royal purple
  royal600: "#9333ea",
  royal700: "#7c3aed",
  royal800: "#6b21a8",
  royal900: "#581c87",

  // Light royal for brand color
  royalLight100: "#faf5ff", // Çok açık mor - siyah yazı için mükemmel
  royalLight200: "#f3e8ff", // Açık mor
  royalLight300: "#e9d5ff", // Orta açık mor

  // Soft lavender
  lavender50: "#f5f3ff",
  lavender100: "#ede9fe",
  lavender200: "#ddd6fe",
  lavender300: "#c4b5fd",
  lavender400: "#a78bfa",
  lavender500: "#8b5cf6", // Secondary lavender
  lavender600: "#7c3aed",
  lavender700: "#6d28d9",
  lavender800: "#5b21b6",
  lavender900: "#4c1d95",

  // Light lavender for brand color
  lavenderLight100: "#f5f3ff", // Çok açık lavanta
  lavenderLight200: "#ede9fe", // Açık lavanta
};

// Minimalist Theme - Sophisticated grays - Updated for better contrast
const minimalistPalette = {
  // Warm grays
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b", // Primary slate
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",

  // Light slate for brand color
  slateLight100: "#f8fafc", // Çok açık gri - siyah yazı için mükemmel
  slateLight200: "#f1f5f9", // Açık gri
  slateLight300: "#e2e8f0", // Orta açık gri

  // Pure grays
  stone50: "#fafaf9",
  stone100: "#f5f5f4",
  stone200: "#e7e5e4",
  stone300: "#d6d3d1",
  stone400: "#a8a29e",
  stone500: "#78716c", // Secondary stone
  stone600: "#57534e",
  stone700: "#44403c",
  stone800: "#292524",
  stone900: "#1c1917",

  // Light stone for brand color
  stoneLight100: "#fafaf9", // Çok açık stone
  stoneLight200: "#f5f5f4", // Açık stone
};

// Create themed variations
const createThemedColors = (
  primaryColor: string,
  secondaryColor: string,
  brandColor: string,
  gradientColors: string[]
) => ({
  // Core colors
  primary: primaryColor,
  primaryLight: lightenColor(primaryColor, 0.2),
  primaryDark: darkenColor(primaryColor, 0.2),
  secondary: secondaryColor,
  secondaryLight: lightenColor(secondaryColor, 0.2),
  secondaryDark: darkenColor(secondaryColor, 0.2),

  // App-wide gradient and brand colors
  brandYellow: brandColor,
  gradientColors: gradientColors,
  gradientLocations: [0, 0.3, 0.7, 1],
  radialOverlayColors: [
    "transparent",
    `${hexToRgba(brandColor, 0.2)}`,
    "transparent",
  ],
});

// Helper functions
function lightenColor(color: string, amount: number): string {
  // Simple implementation - you might want to use a color library for production
  return color;
}

function darkenColor(color: string, amount: number): string {
  // Simple implementation - you might want to use a color library for production
  return color;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Ocean Themes
export const oceanLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      oceanPalette.ocean500,
      oceanPalette.teal500,
      oceanPalette.oceanLight100,
      ["#1a1a1a", "#2d2d2d", "#0ea5e9", oceanPalette.teal400]
    ),
    brandYellow: oceanPalette.oceanLight100,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#0ea5e9", oceanPalette.teal400],
  },
};

export const oceanDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      oceanPalette.ocean400,
      oceanPalette.teal400,
      oceanPalette.oceanLight200,
      ["#1a1a1a", "#2d2d2d", "#0ea5e9", oceanPalette.teal500]
    ),
    brandYellow: oceanPalette.oceanLight200,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#0ea5e9", oceanPalette.teal500],
  },
};

// Forest Themes
export const forestLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      forestPalette.forest500,
      forestPalette.pine500,
      forestPalette.forestLight100,
      ["#1a1a1a", "#2d2d2d", "#22c55e", forestPalette.pine400]
    ),
    brandYellow: forestPalette.forestLight100,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#22c55e", forestPalette.pine400],
  },
};

export const forestDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      forestPalette.forest400,
      forestPalette.pine400,
      forestPalette.forestLight200,
      ["#1a1a1a", "#2d2d2d", "#22c55e", forestPalette.pine500]
    ),
    brandYellow: forestPalette.forestLight200,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#22c55e", forestPalette.pine500],
  },
};

// Sunset Themes
export const sunsetLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      sunsetPalette.sunset500,
      sunsetPalette.coral500,
      sunsetPalette.sunsetLight100,
      ["#1a1a1a", "#2d2d2d", "#f97316", sunsetPalette.coral400]
    ),
    brandYellow: sunsetPalette.sunsetLight100,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#f97316", sunsetPalette.coral400],
  },
};

export const sunsetDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      sunsetPalette.sunset400,
      sunsetPalette.coral400,
      sunsetPalette.sunsetLight200,
      ["#1a1a1a", "#2d2d2d", "#f97316", sunsetPalette.coral500]
    ),
    brandYellow: sunsetPalette.sunsetLight200,
    gradientColors: ["#1a1a1a", "#2d2d2d", "#f97316", sunsetPalette.coral500],
  },
};

// Purple Themes
export const purpleLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      purplePalette.royal500,
      purplePalette.lavender500,
      purplePalette.royalLight100,
      ["#1a1a1a", "#2d2d2d", "#a855f7", purplePalette.lavender400]
    ),
    brandYellow: purplePalette.royalLight100,
    gradientColors: [
      "#1a1a1a",
      "#2d2d2d",
      "#a855f7",
      purplePalette.lavender400,
    ],
  },
};

export const purpleDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      purplePalette.royal400,
      purplePalette.lavender400,
      purplePalette.royalLight200,
      ["#1a1a1a", "#2d2d2d", "#a855f7", purplePalette.lavender500]
    ),
    brandYellow: purplePalette.royalLight200,
    gradientColors: [
      "#1a1a1a",
      "#2d2d2d",
      "#a855f7",
      purplePalette.lavender500,
    ],
  },
};

// Minimalist Themes
export const minimalistLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      minimalistPalette.slate500,
      minimalistPalette.stone500,
      minimalistPalette.slateLight100,
      ["#1a1a1a", "#2d2d2d", "#64748b", minimalistPalette.stone400]
    ),
    brandYellow: minimalistPalette.slateLight100,
    gradientColors: [
      "#1a1a1a",
      "#2d2d2d",
      "#64748b",
      minimalistPalette.stone400,
    ],
  },
};

export const minimalistDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      minimalistPalette.slate400,
      minimalistPalette.stone400,
      minimalistPalette.slateLight200,
      ["#1a1a1a", "#2d2d2d", "#64748b", minimalistPalette.stone500]
    ),
    brandYellow: minimalistPalette.slateLight200,
    gradientColors: [
      "#1a1a1a",
      "#2d2d2d",
      "#64748b",
      minimalistPalette.stone500,
    ],
  },
};

// Theme switching utility - Updated to support all themes
export const getTheme = (isDark: boolean = true): Theme => {
  return isDark ? darkTheme : lightTheme;
};

// New theme getter with theme option support
import { ThemeOption } from "../store/useThemeStore";

export const getThemeByOption = (
  themeOption: ThemeOption,
  isDark: boolean = true
): Theme => {
  switch (themeOption) {
    case "ocean":
      return isDark ? oceanDarkTheme : oceanLightTheme;
    case "forest":
      return isDark ? forestDarkTheme : forestLightTheme;
    case "sunset":
      return isDark ? sunsetDarkTheme : sunsetLightTheme;
    case "purple":
      return isDark ? purpleDarkTheme : purpleLightTheme;
    case "minimalist":
      return isDark ? minimalistDarkTheme : minimalistLightTheme;
    case "default":
    default:
      return isDark ? darkTheme : lightTheme;
  }
};

// Theme metadata for UI
export const themeMetadata = {
  default: {
    name: { en: "Golden", tr: "Altın" },
    description: {
      en: "Warm and inspiring golden theme",
      tr: "Sıcak ve ilham verici altın tema",
    },
    icon: "sun",
    preview: colorPalette.golden500,
  },
  ocean: {
    name: { en: "Ocean", tr: "Okyanus" },
    description: {
      en: "Calming blues and teals",
      tr: "Sakinleştirici mavi ve turkuaz",
    },
    icon: "waves",
    preview: oceanPalette.ocean500,
  },
  forest: {
    name: { en: "Forest", tr: "Orman" },
    description: {
      en: "Natural greens and earth tones",
      tr: "Doğal yeşil ve toprak tonları",
    },
    icon: "tree-pine",
    preview: forestPalette.forest500,
  },
  sunset: {
    name: { en: "Sunset", tr: "Gün Batımı" },
    description: {
      en: "Warm oranges and reds",
      tr: "Sıcak turuncu ve kırmızı",
    },
    icon: "sunset",
    preview: sunsetPalette.sunset500,
  },
  purple: {
    name: { en: "Purple", tr: "Mor" },
    description: {
      en: "Royal purples and lavender",
      tr: "Kraliyet moru ve lavanta",
    },
    icon: "crown",
    preview: purplePalette.royal500,
  },
  minimalist: {
    name: { en: "Minimalist", tr: "Minimalist" },
    description: {
      en: "Clean grays and sophisticated tones",
      tr: "Temiz gri ve sofistike tonlar",
    },
    icon: "square",
    preview: minimalistPalette.slate500,
  },
} as const;
