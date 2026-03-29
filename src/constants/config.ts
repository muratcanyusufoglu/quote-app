import { Platform } from "react-native";

// Environment configuration
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// RevenueCat Configuration
export const REVENUECAT_CONFIG = {
  API_KEY: isDevelopment
    ? "appl_ImiacPUxaVXtBlqndcLFpCQwZNY" // Development key
    : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
      "appl_ImiacPUxaVXtBlqndcLFpCQwZNY", // Production key
  APP_STORE_ID: "6739167925", // TODO: App Store'da yayınlandıktan sonra güncelle
  PRODUCT_IDS: {
    LIFETIME:
      Platform.OS === "ios"
        ? "com.quotespark.dailyinspiration.lifetime"
        : "com.quotespark.dailyinspiration.lifetime",
    YEARLY:
      Platform.OS === "ios"
        ? "com.quotespark.dailyinspiration.yearly"
        : "com.quotespark.dailyinspiration.yearly",
  },
};

// Purchase Configuration
// Note: These are fallback values only - actual prices come from RevenueCat
export const PURCHASE_CONFIG = {
  // Fallback values - should not be used in production
  // All actual pricing comes from RevenueCat packages
  ORIGINAL_PRICE: "$0.00", // Will be replaced by RevenueCat data
  DEFAULT_PRICE: "$0.00", // Will be replaced by RevenueCat data
  SPECIAL_OFFER_PRICE: "$0.00", // Will be replaced by RevenueCat data
  DEFAULT_DISCOUNT: "", // Will be replaced by RevenueCat data
  SPECIAL_DISCOUNT: "", // Will be replaced by RevenueCat data
  TRIAL_PERIOD_DAYS: 0, // Will be replaced by RevenueCat data
  ANNUAL_TRIAL_DAYS: 0, // Will be replaced by RevenueCat data
  LIFETIME_TRIAL_DAYS: 0, // Will be replaced by RevenueCat data
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  FIREBASE_ENABLED: true,
  DEBUG_MODE: isDevelopment,
  TRACK_CRASHES: isProduction,
};

// App Configuration
export const APP_CONFIG = {
  VERSION: "1.0.0",
  BUILD_NUMBER: "6",
  BUNDLE_ID: "com.quotespark.dailyinspiration",
  SCHEME: "quote",
  DEEP_LINK_URL: "https://quote-app.com",
  SUPPORT_EMAIL: "support@quotespark.com", // TODO: Gerçek email adresi
  PRIVACY_POLICY_URL: "https://quotespark.com/privacy", // TODO: Gerçek URL
  TERMS_URL: "https://quotespark.com/terms", // TODO: Gerçek URL
};

export default {
  REVENUECAT_CONFIG,
  PURCHASE_CONFIG,
  ANALYTICS_CONFIG,
  APP_CONFIG,
};
