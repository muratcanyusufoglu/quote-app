import { useMemo } from "react";
import { useOnboardingSelectors } from "../store/useOnboardingStore";
import {
  getPreferredLanguage,
  getSystemLanguage,
  SupportedLanguage,
} from "../utils/language";

// Import translation files (all supported languages)
import deTranslations from "../data/translations/de.json";
import enTranslations from "../data/translations/en.json";
import esTranslations from "../data/translations/es.json";
import frTranslations from "../data/translations/fr.json";
import idTranslations from "../data/translations/id.json";
import itTranslations from "../data/translations/it.json";
import jaTranslations from "../data/translations/ja.json";
import msTranslations from "../data/translations/ms.json";
import nlTranslations from "../data/translations/nl.json";
import ptTranslations from "../data/translations/pt.json";
import ruTranslations from "../data/translations/ru.json";
import thTranslations from "../data/translations/th.json";
import trTranslations from "../data/translations/tr.json";

// Type for translation keys (deep object keys)
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

// Use English as canonical key space
type TranslationKey = DeepKeys<typeof enTranslations>;

// Helper function to get nested object value by dot notation
const getNestedValue = (obj: any, path: string): string => {
  if (!path || typeof path !== "string") {
    return path || "";
  }
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
};

// Translation service
class TranslationService {
  private translations = {
    en: enTranslations,
    tr: trTranslations,
    de: deTranslations,
    es: esTranslations,
    fr: frTranslations,
    id: idTranslations,
    it: itTranslations,
    ja: jaTranslations,
    ms: msTranslations,
    nl: nlTranslations,
    pt: ptTranslations,
    ru: ruTranslations,
    th: thTranslations,
  } as const;

  translate(key: TranslationKey, language: SupportedLanguage): string {
    // Default to English for unsupported languages
    const translationLanguage = this.translations[
      language as keyof typeof this.translations
    ]
      ? (language as keyof typeof this.translations)
      : "en";
    const translations = this.translations[translationLanguage];
    const value = getNestedValue(translations, key);

    if (!value || value === key) {
      // Fallback to English if translation not found
      const fallback = getNestedValue(this.translations.en, key);
      if (fallback && fallback !== key) {
        console.warn(
          `🌍 Translation missing for "${key}" in ${language}, using English fallback`
        );
        return fallback;
      }
      // If no fallback, return the key itself
      console.warn(`🌍 Translation missing for "${key}" in both languages`);
      return key;
    }

    return value;
  }

  // Get all translations for a namespace (e.g., "paywall.features")
  getNamespace(
    namespace: string,
    language: SupportedLanguage
  ): Record<string, string> {
    if (!namespace || typeof namespace !== "string") {
      return {};
    }

    // Default to English for unsupported languages
    const translationLanguage = this.translations[
      language as keyof typeof this.translations
    ]
      ? (language as keyof typeof this.translations)
      : "en";
    const translations = this.translations[translationLanguage];
    if (!translations) {
      return {};
    }

    const namespaceValue = getNestedValue(translations, namespace);

    if (typeof namespaceValue === "object" && namespaceValue !== null) {
      return namespaceValue;
    }

    return {};
  }
}

const translationService = new TranslationService();

// Main hook for translations
export function useTranslation() {
  const userPreferences = useOnboardingSelectors.userPreferences();

  // Get user's preferred language with smart detection
  const language = useMemo(() => {
    const preferredLang = getPreferredLanguage(
      userPreferences?.language as SupportedLanguage
    );
    return preferredLang;
  }, [userPreferences?.language]);

  // Memoized translation function
  const t = useMemo(() => {
    return (key: TranslationKey) => translationService.translate(key, language);
  }, [language]);

  // Function to get translations for a namespace
  const tNamespace = useMemo(() => {
    return (namespace: string) =>
      translationService.getNamespace(namespace, language);
  }, [language]);

  return {
    t,
    tNamespace,
    language,
    isReady: true, // Can be enhanced with loading states if needed
  };
}

// Specialized hooks for specific namespaces
export function useNavigationTranslations() {
  const { tNamespace } = useTranslation();
  const navigationTranslations = tNamespace("navigation");

  // Ensure we have default values for navigation items
  return {
    home: navigationTranslations?.home || "Home",
    explore: navigationTranslations?.explore || "Explore",
    favorites: navigationTranslations?.favorites || "Favorites",
    history: navigationTranslations?.history || "History",
    ...navigationTranslations,
  };
}

export function useCommonTranslations() {
  const { tNamespace } = useTranslation();
  return tNamespace("common");
}

export function usePaywallTranslations() {
  const { tNamespace, language } = useTranslation();

  return useMemo(
    () => ({
      welcome: tNamespace("paywall.welcome"),
      premiumCategory: tNamespace("paywall.premium_category"),
      storyLimit: tNamespace("paywall.story_limit"),
      actionLimit: tNamespace("paywall.action_limit"),
      default: tNamespace("paywall.default"),
      realPurchase: tNamespace("paywall.real_purchase"),
      modern: tNamespace("paywall.modern"),
      features: tNamespace("paywall.features"),
      pricing: tNamespace("paywall.pricing"),
      alerts: tNamespace("paywall.alerts"),
      debug: tNamespace("paywall.debug"),
      testimonials: tNamespace("paywall.testimonials"),

      footer: translationService.translate("paywall.footer", language),
      processing: translationService.translate("paywall.processing", language),
      startFreeTrial: translationService.translate(
        "paywall.start_free_trial",
        language
      ),
      getPremiumAccess: translationService.translate(
        "paywall.get_premium_access",
        language
      ),
      unlockStories: translationService.translate(
        "paywall.unlock_stories",
        language
      ),
      removeLimits: translationService.translate(
        "paywall.remove_limits",
        language
      ),
      getPremium: translationService.translate("paywall.get_premium", language),
      privacyPolicy: translationService.translate(
        "paywall.privacy_policy",
        language
      ),
      termsOfUse: translationService.translate(
        "paywall.terms_of_use",
        language
      ),
      failedToLoadSubscription: translationService.translate(
        "paywall.failed_to_load_subscription",
        language
      ),
      purchaseVerification: translationService.translate(
        "paywall.purchase_verification",
        language
      ),
      purchaseVerificationMessage: translationService.translate(
        "paywall.purchase_verification_message",
        language
      ),
      verificationError: translationService.translate(
        "paywall.verification_error",
        language
      ),
      verificationErrorMessage: translationService.translate(
        "paywall.verification_error_message",
        language
      ),
      restoreVerificationError: translationService.translate(
        "paywall.restore_verification_error",
        language
      ),
      dailyLimitFallbackTitle: translationService.translate(
        "paywall.daily_limit_fallback_title",
        language
      ),
      dailyLimitFallbackSubtitle: translationService.translate(
        "paywall.daily_limit_fallback_subtitle",
        language
      ),
      dailyLimitFallbackButton: translationService.translate(
        "paywall.daily_limit_fallback_button",
        language
      ),
      dailyLimitFallbackHighlight: translationService.translate(
        "paywall.daily_limit_fallback_highlight",
        language
      ),
    }),
    [tNamespace, language]
  );
}

export function useCategoryTranslations() {
  const { tNamespace } = useTranslation();
  return tNamespace("categories");
}

// Helper function for components that need specific translations
export function useScreenTranslations(screenName: string) {
  const { tNamespace } = useTranslation();
  return tNamespace(screenName);
}

// Hook to provide language update functionality
export function useLanguageUpdate() {
  const { updateAnswer, generatePreferences } =
    useOnboardingSelectors.actions();

  function updateFromSystem(): boolean {
    const systemLanguage = getSystemLanguage();
    updateAnswer("languages", [systemLanguage]);
    generatePreferences();
    console.log("🌍 Language updated from system:", systemLanguage);
    return true;
  }

  return {
    updateFromSystem,
    forceSystemLanguageUpdate: () => updateFromSystem(),
  };
}

export default useTranslation;
