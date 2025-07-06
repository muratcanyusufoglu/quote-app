import { useMemo } from "react";
import { useOnboardingSelectors } from "../store/useOnboardingStore";
import { getPreferredLanguage, SupportedLanguage } from "../utils/language";

// Import translation files
import enTranslations from "../data/translations/en.json";
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

type TranslationKey = DeepKeys<typeof trTranslations>;

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
    tr: trTranslations,
    en: enTranslations,
  };

  translate(key: TranslationKey, language: SupportedLanguage): string {
    const translations = this.translations[language];
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

    const translations = this.translations[language];
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
      features: tNamespace("paywall.features"),
      pricing: tNamespace("paywall.pricing"),
      footer: translationService.translate("paywall.footer", language),
      processing: translationService.translate("paywall.processing", language),
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

export default useTranslation;
