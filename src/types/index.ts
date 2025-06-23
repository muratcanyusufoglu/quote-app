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
  id: string;
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

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  premium: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
