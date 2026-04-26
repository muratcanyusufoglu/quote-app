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

// Simple category color getter
export const getCategoryColor = (categoryId: string): string | null => {
  const color =
    categoryColors[categoryId.toLowerCase() as keyof typeof categoryColors];
  return color || null;
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
    return exactIcon;
  }

  // Try lowercase match
  const lowerIcon =
    categoryIcons[categoryId.toLowerCase() as keyof typeof categoryIcons];
  if (lowerIcon) {
    return lowerIcon;
  }

  // Return null so ExploreScreen can use emoji fallback
  return null;
};

// Export current theme (this can be dynamic based on user preference)
export const currentTheme = darkTheme;

// ==============================
// NEW THEME PALETTES
// ==============================

// Ocean Theme - Deep Blue & Navy (from inspirational_quote_display_3)
const oceanPalette = {
  // Background colors
  background: "#1C2331",
  surface: "#273449",
  
  // Primary colors
  primary: "#F4C47A", // Golden accent
  primaryLight: "#F9CA63",
  primaryDark: "#F1C40F",
  
  // Text colors
  textPrimary: "#EAEFFC",
  textSecondary: "#A9B8D0",
  textTertiary: "#8B949A",
  
  // Additional shades for compatibility
  ocean50: "#EAEFFC",
  ocean100: "#d4deeb",
  ocean200: "#A9B8D0",
  ocean300: "#8B9AAA",
  ocean400: "#556880",
  ocean500: "#273449", // Primary surface
  ocean600: "#1C2331", // Background
  ocean700: "#161C28",
  ocean800: "#11151F",
  ocean900: "#0A0D13",
};

// Forest Theme - Light Minimalist (from code.html)
const forestPalette = {
  // Background colors
  backgroundLight: "#FBF9F6",
  cardLight: "#FFFFFF",
  
  // Primary colors
  primary: "#4A5C6A", // Cool blue-gray
  primaryLight: "#5E7080",
  primaryDark: "#3A4C5A",
  
  // Accent colors
  accent: "#E0CDBA", // Warm beige
  accentLight: "#EFE2D5",
  accentDark: "#D1BDA5",
  
  // Text colors
  textPrimary: "#3D4A53",
  textSecondary: "#8B949A",
  textTertiary: "#B4BBC1",
  
  // Background dark variant
  backgroundDark: "#2A333A",
  cardDark: "#39444D",
  
  // Additional shades
  forest50: "#FBF9F6",
  forest100: "#F3EFE9",
  forest200: "#E0CDBA",
  forest300: "#C9B5A3",
  forest400: "#8B949A",
  forest500: "#4A5C6A",
  forest600: "#3A4C5A",
  forest700: "#2A3C4A",
  forest800: "#1A2C3A",
  forest900: "#0A1C2A",
};

// Classic Theme - Gradient Yellow to Pink (from HTML Variant 2)
const classicPalette = {
  // Gradient colors
  gradientStart: "#FCE38A", // Warm yellow
  gradientEnd: "#F38181", // Soft coral pink
  
  // Card & Button colors
  cardBg: "rgba(255, 255, 255, 0.2)", // Glassmorphism
  buttonBg: "#FFFFFF",
  
  // Text colors
  textMain: "#2A2A2A",
  textSecondary: "#4A4A4A",
  iconColor: "#616161",
  
  // Primary colors derived from gradient
  primary: "#FCE38A",
  primaryLight: "#FEF3C7",
  primaryDark: "#FBBF24",
  
  // Secondary colors
  secondary: "#F38181",
  secondaryLight: "#FCA5A5",
  secondaryDark: "#DC2626",
  
  // Additional shades
  classic50: "#FFFBEB",
  classic100: "#FEF3C7",
  classic200: "#FCE38A",
  classic300: "#FBD55A",
  classic400: "#FAC73C",
  classic500: "#F9B91E",
  classic600: "#F38181",
  classic700: "#EF5757",
  classic800: "#DC2626",
  classic900: "#991B1B",
};

// Sunset Theme - Warm Earth Tones (from HTML example)
const sunsetPalette = {
  // Background colors
  backgroundLight: "#E6E0D4",
  backgroundDark: "#1C1C1E",

  // Card colors
  cardLight: "#F7F5F2",
  cardDark: "#2C2C2E",

  // Primary colors - warm earth tones
  primary: "#6A5B4C", // Deep brown
  primaryLight: "#8A7F71",
  primaryDark: "#383127",

  // Secondary colors - warm beige
  secondary: "#D1C4B3",
  secondaryLight: "#E0DACE",
  secondaryDark: "#B8AB9F",

  // Accent colors
  accent: "#DCD5C9", // Light border color
  accentLight: "#98989F", // Light text
  accentDark: "#444446", // Dark border

  // Text colors
  textPrimaryLight: "#383127", // Dark brown for light backgrounds
  textPrimaryDark: "#E0DACE", // Light beige for dark backgrounds
  textSecondaryLight: "#8A7F71", // Medium brown
  textSecondaryDark: "#98989F", // Light gray

  // Border colors
  borderLight: "#DCD5C9", // Light border
  borderDark: "#444446", // Dark border

  // Additional shades for compatibility
  sunset50: "#E6E0D4", // Light background
  sunset100: "#F7F5F2", // Light card
  sunset200: "#DCD5C9", // Light border
  sunset300: "#8A7F71", // Medium brown
  sunset400: "#6A5B4C", // Primary brown
  sunset500: "#383127", // Dark brown
  sunset600: "#D1C4B3", // Warm beige
  sunset700: "#444446", // Dark border
  sunset800: "#2C2C2E", // Dark card
  sunset900: "#1C1C1E", // Dark background
};

// Purple Theme - Glassmorphism Dark (from inspirational_quote_display_4)
const purplePalette = {
  // Background colors
  background: "#111827",
  card: "#1F2937",
  cardGlass: "rgba(31, 41, 55, 0.5)", // Glassmorphism effect
  
  // Primary colors
  primary: "#F59E0B", // Amber gold
  primaryLight: "#FBBF24",
  primaryDark: "#D97706",
  
  // Secondary colors
  secondary: "#EC4899", // Pink
  secondaryLight: "#F472B6",
  secondaryDark: "#DB2777",
  
  // Accent colors
  accent: "#8B5CF6", // Purple
  accentLight: "#A78BFA",
  accentDark: "#7C3AED",
  
  // Text colors
  textMain: "#F9FAFB",
  textSubtle: "#9CA3AF",
  
  // Additional shades
  royal50: "#F9FAFB",
  royal100: "#E5E7EB",
  royal200: "#9CA3AF",
  royal300: "#6B7280",
  royal400: "#374151",
  royal500: "#1F2937",
  royal600: "#111827",
  royal700: "#0F172A",
  royal800: "#020617",
  royal900: "#000000",
};

// Minimalist Theme - Elegant Dark (from inspirational_quote_display_2)
const minimalistPalette = {
  // Light theme colors
  backgroundLight: "#E6E0D4",
  cardLight: "#F7F5F2",
  textPrimaryLight: "#383127",
  textSecondaryLight: "#8A7F71",
  accentLight: "#6A5B4C",
  borderLight: "#DCD5C9",
  
  // Dark theme colors
  backgroundDark: "#1C1C1E",
  cardDark: "#2C2C2E",
  textPrimaryDark: "#E0DACE",
  textSecondaryDark: "#98989F",
  accentDark: "#D1C4B3",
  borderDark: "#444446",
  
  // Primary colors
  primary: "#D1C4B3", // Warm beige
  primaryLight: "#E0D6C7",
  primaryDark: "#B8AB9F",
  
  // Additional shades
  slate50: "#F7F5F2",
  slate100: "#E6E0D4",
  slate200: "#D1C4B3",
  slate300: "#B8AB9F",
  slate400: "#98989F",
  slate500: "#6A5B4C",
  slate600: "#444446",
  slate700: "#2C2C2E",
  slate800: "#1C1C1E",
  slate900: "#0F0F10",
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

// Ocean Themes - Deep Blue & Navy
export const oceanLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      oceanPalette.primary,
      oceanPalette.ocean500,
      oceanPalette.ocean50,
      [oceanPalette.ocean600, oceanPalette.ocean600, oceanPalette.ocean600, oceanPalette.ocean600]
    ),
    background: oceanPalette.ocean50,
    surface: "#FFFFFF",
    // textPrimary (#EAEFFC) açık tema arka planıyla aynı renk — koyu metin kullan
    text: oceanPalette.ocean800,          // "#11151F" — koyu lacivert, okunabilir
    textSecondary: oceanPalette.ocean500, // "#273449" — orta lacivert
    textTertiary: oceanPalette.ocean400,  // "#556880" — daha açık
    brandYellow: oceanPalette.primary,
    gradientColors: [oceanPalette.ocean600, oceanPalette.ocean600, oceanPalette.ocean600, oceanPalette.ocean600],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

export const oceanDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      oceanPalette.primary,
      oceanPalette.ocean500,
      oceanPalette.primary,
      [oceanPalette.background, oceanPalette.background, oceanPalette.background, oceanPalette.background]
    ),
    background: oceanPalette.background,
    surface: oceanPalette.surface,
    text: oceanPalette.textPrimary,
    textSecondary: oceanPalette.textSecondary,
    brandYellow: oceanPalette.primary,
    gradientColors: [oceanPalette.background, oceanPalette.background, oceanPalette.background, oceanPalette.background],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

// Forest Themes - Light Minimalist
export const forestLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      forestPalette.primary,
      forestPalette.accent,
      forestPalette.accent,
      [forestPalette.backgroundLight, forestPalette.backgroundLight, forestPalette.backgroundLight, forestPalette.backgroundLight]
    ),
    background: forestPalette.backgroundLight,
    surface: forestPalette.cardLight,
    text: forestPalette.textPrimary,
    textSecondary: forestPalette.textSecondary,
    brandYellow: forestPalette.accent,
    gradientColors: [forestPalette.backgroundLight, forestPalette.backgroundLight, forestPalette.backgroundLight, forestPalette.backgroundLight],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

export const forestDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      forestPalette.primary,
      forestPalette.accent,
      forestPalette.accent,
      [forestPalette.backgroundDark, forestPalette.backgroundDark, forestPalette.backgroundDark, forestPalette.backgroundDark]
    ),
    background: forestPalette.backgroundDark,
    surface: forestPalette.cardDark,
    text: forestPalette.forest50,
    textSecondary: forestPalette.textSecondary,
    brandYellow: forestPalette.accent,
    gradientColors: [forestPalette.backgroundDark, forestPalette.backgroundDark, forestPalette.backgroundDark, forestPalette.backgroundDark],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

// Classic Themes - Gradient Yellow to Pink (from HTML Variant 2)
export const classicLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      classicPalette.primary,
      classicPalette.secondary,
      classicPalette.primary,
      [classicPalette.gradientStart, classicPalette.classic200, classicPalette.classic400, classicPalette.gradientEnd]
    ),
    background: classicPalette.gradientStart,
    surface: classicPalette.buttonBg,
    text: classicPalette.textMain, // #2A2A2A - koyu gri/siyah (iconlar ve text için)
    textSecondary: classicPalette.textSecondary, // #4A4A4A - orta gri
    textTertiary: classicPalette.textMain, // #2A2A2A - iconlar için siyah (Classic tema için)
    brandYellow: classicPalette.primary,
    gradientColors: [classicPalette.gradientStart, classicPalette.classic200, classicPalette.classic400, classicPalette.gradientEnd],
    gradientLocations: [0, 0.4, 0.7, 1],
    whiteOverlay20: classicPalette.cardBg,
  },
};

export const classicDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      classicPalette.primary,
      classicPalette.secondary,
      classicPalette.primary,
      [classicPalette.classic900, classicPalette.classic800, classicPalette.classic700, classicPalette.classic600]
    ),
    background: classicPalette.classic900,
    surface: classicPalette.classic800,
    text: classicPalette.classic50, // Açık renk dark tema için
    textSecondary: classicPalette.classic200,
    textTertiary: classicPalette.classic300,
    brandYellow: classicPalette.primary,
    gradientColors: [classicPalette.classic900, classicPalette.classic800, classicPalette.classic700, classicPalette.classic600],
    gradientLocations: [0, 0.3, 0.7, 1],
    whiteOverlay20: "rgba(255, 255, 255, 0.2)",
  },
};

// Sunset Themes - Warm Earth Tones (brown/beige palette)
export const sunsetLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      sunsetPalette.primary,
      sunsetPalette.secondary,
      sunsetPalette.secondary,
      [sunsetPalette.backgroundLight, sunsetPalette.backgroundLight, sunsetPalette.backgroundLight, sunsetPalette.backgroundLight]
    ),
    background: sunsetPalette.backgroundLight,
    surface: sunsetPalette.cardLight,
    text: sunsetPalette.textPrimaryLight,
    textSecondary: sunsetPalette.textSecondaryLight,
    brandYellow: sunsetPalette.secondary,
    gradientColors: [sunsetPalette.backgroundLight, sunsetPalette.backgroundLight, sunsetPalette.backgroundLight, sunsetPalette.backgroundLight],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

export const sunsetDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      sunsetPalette.secondary,
      sunsetPalette.primary,
      sunsetPalette.secondary,
      [sunsetPalette.backgroundDark, sunsetPalette.backgroundDark, sunsetPalette.backgroundDark, sunsetPalette.backgroundDark]
    ),
    background: sunsetPalette.backgroundDark,
    surface: sunsetPalette.cardDark,
    text: sunsetPalette.textPrimaryDark,
    textSecondary: sunsetPalette.textSecondaryDark,
    brandYellow: sunsetPalette.secondary,
    gradientColors: [sunsetPalette.backgroundDark, sunsetPalette.backgroundDark, sunsetPalette.backgroundDark, sunsetPalette.backgroundDark],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

// Purple Themes - Glassmorphism Dark
export const purpleLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      purplePalette.primary,
      purplePalette.secondary,
      purplePalette.primary,
      [purplePalette.royal50, purplePalette.royal50, purplePalette.royal50, purplePalette.royal50]
    ),
    background: purplePalette.royal50,
    surface: "#FFFFFF",
    text: purplePalette.background,
    textSecondary: purplePalette.royal300,
    brandYellow: purplePalette.primary,
    gradientColors: [purplePalette.royal50, purplePalette.royal50, purplePalette.royal50, purplePalette.royal50],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

export const purpleDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      purplePalette.primary,
      purplePalette.secondary,
      purplePalette.primary,
      [purplePalette.background, purplePalette.background, purplePalette.background, purplePalette.background]
    ),
    background: purplePalette.background,
    surface: purplePalette.card,
    text: purplePalette.textMain, // #F9FAFB - beyaz (koyu arka plan için)
    textSecondary: purplePalette.royal200, // #9CA3AF - açık gri (daha görünür)
    brandYellow: purplePalette.primary,
    gradientColors: [purplePalette.background, purplePalette.background, purplePalette.background, purplePalette.background],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

// Minimalist Themes - Elegant Dark
export const minimalistLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      minimalistPalette.accentLight,
      minimalistPalette.primary,
      minimalistPalette.primary,
      [minimalistPalette.backgroundLight, minimalistPalette.backgroundLight, minimalistPalette.backgroundLight, minimalistPalette.backgroundLight]
    ),
    background: minimalistPalette.backgroundLight,
    surface: minimalistPalette.cardLight,
    text: minimalistPalette.textPrimaryLight,
    textSecondary: minimalistPalette.textSecondaryLight,
    brandYellow: minimalistPalette.primary,
    gradientColors: [minimalistPalette.backgroundLight, minimalistPalette.backgroundLight, minimalistPalette.backgroundLight, minimalistPalette.backgroundLight],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

export const minimalistDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      minimalistPalette.accentDark,
      minimalistPalette.primary,
      minimalistPalette.primary,
      [minimalistPalette.backgroundDark, minimalistPalette.backgroundDark, minimalistPalette.backgroundDark, minimalistPalette.backgroundDark]
    ),
    background: minimalistPalette.backgroundDark,
    surface: minimalistPalette.cardDark,
    text: minimalistPalette.textPrimaryDark, // #E0DACE - açık bej (koyu arka plan için)
    textSecondary: minimalistPalette.textSecondaryDark, // #98989F - açık gri (daha görünür)
    brandYellow: minimalistPalette.primary,
    gradientColors: [minimalistPalette.backgroundDark, minimalistPalette.backgroundDark, minimalistPalette.backgroundDark, minimalistPalette.backgroundDark],
    gradientLocations: [0, 0.3, 0.7, 1],
  },
};

// Aura Theme - Warm Cinematic (premium dark/cream palette)
const auraPalette = {
  // Dark version – deep warm charcoal
  darkBg:       "#141210", // near-black, warm
  darkBg2:      "#1C1916", // slightly lighter charcoal
  darkBg3:      "#241E1A", // mid charcoal
  darkSurface:  "#1C1916",
  darkCard:     "#2A221D",

  // Light version – warm cream paper
  lightBg:      "#FBF8F3", // warm off-white
  lightBg2:     "#F5EDE0", // soft cream
  lightBg3:     "#EDE3D4", // deeper cream
  lightSurface: "#FFFFFF",
  lightCard:    "#F7F3ED",

  // Text – dark version
  textLight:    "#F0EBE2", // warm cream white
  textLightSec: "#B8AD9E", // muted warm grey

  // Text – light version
  textDark:     "#1A1410", // very dark warm brown
  textDarkSec:  "#7A6E63", // medium warm brown

  // Accent – warm gold
  gold:         "#C8965A", // rich gold
  goldLight:    "#E8C97A", // lighter gold

  // Brand color for radial overlay
  brand:        "#C8965A",
};

export const auraLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...createThemedColors(
      auraPalette.gold,
      auraPalette.goldLight,
      auraPalette.gold,
      [auraPalette.lightBg, auraPalette.lightBg2, auraPalette.lightBg3, auraPalette.lightBg2]
    ),
    background:    auraPalette.lightBg,
    surface:       auraPalette.lightSurface,
    text:          auraPalette.textDark,
    textSecondary: auraPalette.textDarkSec,
    brandYellow:   auraPalette.gold,
    gradientColors: [auraPalette.lightBg, auraPalette.lightBg2, auraPalette.lightBg3, auraPalette.lightBg2],
    gradientLocations: [0, 0.35, 0.7, 1],
    radialOverlayColors: ["transparent", `rgba(200, 150, 90, 0.12)`, "transparent"],
  },
};

export const auraDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    ...createThemedColors(
      auraPalette.gold,
      auraPalette.goldLight,
      auraPalette.gold,
      [auraPalette.darkBg, auraPalette.darkBg2, auraPalette.darkBg3, auraPalette.darkBg2]
    ),
    background:    auraPalette.darkBg,
    surface:       auraPalette.darkSurface,
    text:          auraPalette.textLight,
    textSecondary: auraPalette.textLightSec,
    brandYellow:   auraPalette.gold,
    gradientColors: [auraPalette.darkBg, auraPalette.darkBg2, auraPalette.darkBg3, auraPalette.darkBg2],
    gradientLocations: [0, 0.35, 0.7, 1],
    radialOverlayColors: ["transparent", `rgba(200, 150, 90, 0.10)`, "transparent"],
    whiteOverlay20: "rgba(255, 255, 255, 0.08)",
    whiteOverlay25: "rgba(255, 255, 255, 0.10)",
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
    case "aura":
      return isDark ? auraDarkTheme : auraLightTheme;
    case "uprising":
      return isDark ? classicDarkTheme : classicLightTheme;
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
    default:
      return isDark ? classicDarkTheme : classicLightTheme;
  }
};

// Theme metadata for UI (icons and preview colors only)
export const themeMetadata = {
  aura: {
    icon: "moon.stars",
    preview: auraPalette.gold,
    name: "Aura", // Warm cinematic dark/cream — default premium theme
  },
  uprising: {
    icon: "sun",
    preview: classicPalette.gradientEnd,
    name: "Classic", // Gradient yellow to pink theme (from HTML Variant 2)
  },
  ocean: {
    icon: "waves",
    preview: oceanPalette.primary,
    name: "Ocean", // Deep blue & navy theme
  },
  forest: {
    icon: "tree-pine",
    preview: forestPalette.accent,
    name: "Forest", // Light minimalist theme
  },
  sunset: {
    icon: "sunset",
    preview: sunsetPalette.secondary,
    name: "Earth", // Warm earth tones - brown and beige palette
  },
  purple: {
    icon: "sparkles",
    preview: purplePalette.accent,
    name: "Purple", // Glassmorphism dark theme
  },
  minimalist: {
    icon: "square",
    preview: minimalistPalette.primary,
    name: "Minimalist", // Elegant dark theme
  },
} as const;
