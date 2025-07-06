import { getLocales } from "expo-localization";

export type SupportedLanguage = "en" | "tr";

// Supported languages in the app
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "tr"];

// Language mappings
export const LANGUAGE_NAMES = {
  en: "English",
  tr: "Türkçe",
} as const;

// Detect system language and return supported language
export function getSystemLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const locale = locales[0]?.languageTag || "en";

    console.log("📱 System locale detected:", locale);

    // Check if locale is valid
    if (!locale || typeof locale !== "string") {
      console.log("⚠️ Invalid locale, falling back to English");
      return "en";
    }

    // Extract language code from locale (e.g., 'en-US' -> 'en')
    const languageCode = locale.split("-")[0].toLowerCase();

    // Check if the language is supported
    if (SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
      console.log("✅ Supported language detected:", languageCode);
      return languageCode as SupportedLanguage;
    }

    // Fallback to English if language is not supported
    console.log("⚠️ Unsupported language, falling back to English");
    return "en";
  } catch (error) {
    console.log("⚠️ Error detecting system language:", error);
    return "en";
  }
}

// Get preferred language with priority:
// 1. User preference (if set)
// 2. System language
// 3. Default to English
export function getPreferredLanguage(
  userPreference?: SupportedLanguage
): SupportedLanguage {
  if (userPreference) {
    console.log("👤 Using user preference:", userPreference);
    return userPreference;
  }

  const systemLang = getSystemLanguage();
  console.log("📱 Using system language:", systemLang);
  return systemLang;
}

// Check if a language is supported
export function isLanguageSupported(
  language: string
): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

// Get language display name
export function getLanguageName(language: SupportedLanguage): string {
  return LANGUAGE_NAMES[language];
}
