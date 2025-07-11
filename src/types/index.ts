// Base interfaces for the motivational quotes app
export interface Quote {
  id: string;
  texts: {
    en: string;
    tr: string;
  };
  authors: {
    en: string;
    tr: string;
  };
  category: string;
  tags: {
    en: string[];
    tr: string[];
  };
  readTime: number; // in minutes
  stories?: {
    en?: Story;
    tr?: Story;
  };
}

export interface Story {
  id?: string;
  title: string;
  content: string;
  readTime: number;
}

export interface Category {
  id: string;
  names: {
    en: string;
    tr: string;
  };
  descriptions: {
    en: string;
    tr: string;
  };
  icon: string;
  color: string;
  isPremium: boolean;
}

// Helper interface for working with localized content
export interface LocalizedQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  tags: string[];
  language: "en" | "tr";
  readTime: number;
  story?: Story;
}

export interface LocalizedCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
  language: "en" | "tr";
}

export interface UserPreferences {
  selectedCategories: string[];
  favoriteQuotes: string[];
  seenQuotes: string[];
  language: "en" | "tr";
  motivationStyle: "gentle" | "strong" | "balanced";
  stressResponse: "meditation" | "action" | "reflection";
  preferredTime: "morning" | "afternoon" | "evening";
  readingLength: "short" | "medium" | "long";
  topics: string[];
  frequency: "daily" | "weekly" | "occasional";
  preferredLanguages: ("en" | "tr")[];

  // New fields for enhanced personalization
  purpose: "motivation" | "learning" | "relaxation" | "growth" | "inspiration";
  notificationCount: number; // Daily notification count (1-10)
  notificationTimeRange: {
    start: string; // Format: "HH:mm" (e.g., "09:00")
    end: string; // Format: "HH:mm" (e.g., "18:00")
  };
}

export interface OnboardingQuestion {
  id: string;
  type: "single" | "multiple" | "slider" | "text";
  question: string;
  options?: OnboardingOption[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export interface OnboardingOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface OnboardingAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface DailyStats {
  date: string;
  quotesRead: number;
  storiesRead: number;
  timeSpent: number; // in minutes
  streak: number;
}

export interface PurchaseProduct {
  identifier: string;
  price: string;
  title: string;
  description: string;
}

// Store interfaces - updated for new multilingual structure
export interface QuoteStoreState {
  quotes: Quote[];
  categories: Category[];
  favoriteQuotes: string[];
  seenQuotes: string[];
  lastReadQuotes: LocalizedQuote[];
  dailyReads: number;
  currentStreak: number;
  lastReadDate: string;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
}

export interface QuoteStoreActions {
  setQuotes: (quotes: Quote[]) => void;
  setCategories: (categories: Category[]) => void;
  addToFavorites: (quoteId: string) => void;
  removeFromFavorites: (quoteId: string) => void;
  markAsRead: (quote: LocalizedQuote) => void;
  resetDailyReads: () => void;
  updateStreak: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export interface PurchaseStoreState {
  isPremium: boolean;
  products: PurchaseProduct[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
}

export interface PurchaseStoreActions {
  setPremium: (isPremium: boolean) => void;
  setProducts: (products: PurchaseProduct[]) => void;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export interface OnboardingStoreState {
  isCompleted: boolean;
  currentStep: number;
  answers: OnboardingAnswer[];
  userPreferences: UserPreferences | null;
  _hasHydrated: boolean;
}

export interface OnboardingStoreActions {
  setCompleted: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  addAnswer: (answer: OnboardingAnswer) => void;
  updateAnswer: (questionId: string, value: string | string[] | number) => void;
  generatePreferences: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

// Combined store types
export type QuoteStore = QuoteStoreState & QuoteStoreActions;
export type PurchaseStore = PurchaseStoreState & PurchaseStoreActions;
export type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  QuoteDetail: { quoteId: string };
  Purchase: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  PastReads: undefined;
};

// Theme types - Enhanced for comprehensive color system
export interface ThemeColors {
  // Core colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Soft text colors for quote content
  textSoft: string;
  textSoftSecondary: string;
  textSoftTertiary: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;

  // Soft border and background colors
  borderSoft: string;
  backgroundSoft: string;

  // App-wide gradient and brand colors
  brandYellow: string; // Ana sarı renk
  gradientColors: string[]; // Gradient background renkleri
  gradientLocations: number[]; // Gradient pozisyonları
  radialOverlayColors: string[]; // Radial overlay renkleri

  // State colors
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  success: string;
  successLight: string;

  // Special colors
  premium: string;
  premiumLight: string;
  accent: string;

  // Overlay colors
  overlay: string;
  backdrop: string;

  // Common semantic colors used throughout the app
  white: string;
  black: string;
  transparent: string;

  // Shadow and overlay colors
  shadowColor: string;
  shadowLight: string;
  shadowMedium: string;
  shadowHeavy: string;

  // Interactive colors
  favoriteRed: string;
  favoriteActive: string;
  goldAccent: string;

  // Overlay and background variations
  whiteOverlay10: string;
  whiteOverlay20: string;
  whiteOverlay25: string;
  whiteOverlay70: string;
  whiteOverlay80: string;
  whiteOverlay90: string;

  blackOverlay10: string;
  blackOverlay30: string;
  blackOverlay40: string;
  blackOverlay60: string;
  blackOverlay70: string;

  // Anthracite overlay colors (for soft text backgrounds)
  anthraciteOverlay10: string;
  anthraciteOverlay20: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    round: number;
  };
}

// Paywall types
export type PaywallTriggerSource =
  | "welcome"
  | "premium_category"
  | "premium_feature"
  | "action_limit"
  | "story_limit"
  | "real_purchase"
  | "manual";

export interface PaywallTestimonial {
  text: string;
  author: string;
}

export interface PaywallStoreState {
  isVisible: boolean;
  actionCount: number;
  lastShownDate: string;
  triggerSource: PaywallTriggerSource | null;
  hasSeenWelcomePaywall: boolean;
  _hasHydrated: boolean;
}

export interface PaywallStoreActions {
  showPaywall: (source: PaywallTriggerSource) => void;
  hidePaywall: () => void;
  trackAction: () => void;
  resetActionCount: () => void;
  markWelcomePaywallSeen: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export type PaywallStore = PaywallStoreState & PaywallStoreActions;

// Analytics Event Types
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface ScreenViewEvent {
  screen_name: string;
  screen_class?: string;
}

export interface QuoteEvent {
  quote_id: string;
  quote_category: string;
  quote_author: string;
  language: "en" | "tr";
}

export interface ShareEvent extends QuoteEvent {
  share_method: "native" | "image";
  content_type: "quote" | "story";
}

export interface CategoryEvent {
  category_id: string;
  category_name: string;
  is_premium: boolean;
}

export interface UserActionEvent {
  action_type:
    | "favorite_add"
    | "favorite_remove"
    | "theme_change"
    | "language_change"
    | "category_filter";
  item_id?: string;
  old_value?: string;
  new_value?: string;
}

export interface OnboardingEvent {
  step: number;
  total_steps: number;
  completion_rate: number;
  selected_preferences?: string[];
}

export interface PaywallEvent {
  trigger_source: PaywallTriggerSource;
  user_action: "viewed" | "dismissed" | "purchased";
  step?: string;
}

export interface PerformanceEvent {
  event_type: "app_start" | "screen_load" | "quote_load";
  duration_ms: number;
  success: boolean;
  error_message?: string;
}
