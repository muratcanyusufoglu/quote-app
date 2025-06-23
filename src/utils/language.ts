import * as Localization from "expo-localization";

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
  const locale = Localization.locale;

  console.log("📱 System locale detected:", locale);

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
