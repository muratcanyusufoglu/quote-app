import { getLocales } from "expo-localization";
import { Language } from "../types";

export type SupportedLanguage = Language;

export const SUPPORTED_LANGUAGES = [
  "en",
  "tr",
  "fr",
  "es",
  "de",
  "it",
  "pt",
  "ru",
  "nl",
  "id",
  "ja",
  "th",
  "ms",
] as const;

export const LANGUAGE_NAMES = {
  en: "English",
  tr: "Türkçe",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  nl: "Nederlands",
  id: "Bahasa Indonesia",
  ja: "日本語",
  th: "ไทย",
  ms: "Bahasa Melayu",
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
    console.log(
      `⚠️ Unsupported language '${languageCode}', falling back to English`
    );
    return "en";
  } catch (error) {
    console.log("⚠️ Error detecting system language:", error);
    return "en";
  }
}

// Detect if user prefers 12-hour time format (AM/PM)
export function uses12HourFormat(): boolean {
  try {
    const locales = getLocales();
    const locale = locales[0]?.languageTag || "en-US";

    // Use Intl.DateTimeFormat to detect 12/24 hour preference
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric",
    });

    // Test with a known time (14:30) to see if it shows as 2:30 PM
    const testDate = new Date();
    testDate.setHours(14, 30, 0, 0);
    const formattedTime = formatter.format(testDate);

    // If formatted time contains 'PM' or 'AM', it's 12-hour format
    const is12Hour = /AM|PM|am|pm/.test(formattedTime);

    console.log(
      `🕐 Time format detected: ${
        is12Hour ? "12-hour (AM/PM)" : "24-hour"
      } for locale: ${locale}`
    );
    return is12Hour;
  } catch (error) {
    console.log(
      "⚠️ Error detecting time format, defaulting to 24-hour:",
      error
    );
    return false;
  }
}

// Get user's country from locale
export function getUserCountry(): string {
  try {
    const locales = getLocales();
    const locale = locales[0]?.languageTag || "en-US";

    // Extract country code (e.g., 'en-US' -> 'US')
    const parts = locale.split("-");
    const countryCode = parts.length > 1 ? parts[1].toUpperCase() : "US";

    console.log(`🌍 Country detected: ${countryCode} from locale: ${locale}`);
    return countryCode;
  } catch (error) {
    console.log("⚠️ Error detecting country, defaulting to US:", error);
    return "US";
  }
}

// Check if country typically uses 12-hour format
export function countryUses12HourFormat(countryCode?: string): boolean {
  const country = countryCode || getUserCountry();

  // Countries that typically use 12-hour format
  const twelveHourCountries = [
    "US",
    "CA",
    "AU",
    "NZ",
    "PH",
    "IN",
    "PK",
    "BD",
    "MY",
    "EG",
    "SA",
    "JO",
    "LB",
  ];

  return twelveHourCountries.includes(country);
}

// Format time according to user preference
export function formatTimeForUser(hour: number, minute: number): string {
  const uses12h = uses12HourFormat();

  if (uses12h) {
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
  } else {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }
}

// Parse time string back to 24-hour format for storage
export function parseTimeToMilitary(timeString: string): {
  hour: number;
  minute: number;
} {
  // Handle both formats: "14:30" and "2:30 PM"
  const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (ampmMatch) {
    // 12-hour format with AM/PM
    let hour = parseInt(ampmMatch[1]);
    const minute = parseInt(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();

    if (period === "AM" && hour === 12) {
      hour = 0;
    } else if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return { hour, minute };
  } else {
    // 24-hour format
    const parts = timeString.split(":");
    return {
      hour: parseInt(parts[0]),
      minute: parseInt(parts[1]),
    };
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

// Get fallback language for quote localization
export function getFallbackLanguage(
  language: SupportedLanguage
): SupportedLanguage {
  if (language === "en") return "tr";
  return "en";
}

// Get language with fallback chain for quote localization
export function getLanguageWithFallback(
  preferredLanguage: SupportedLanguage,
  availableLanguages: SupportedLanguage[]
): SupportedLanguage {
  // First try preferred language
  if (availableLanguages.includes(preferredLanguage)) {
    return preferredLanguage;
  }

  // Then try English
  if (availableLanguages.includes("en")) {
    return "en";
  }

  // Then try Turkish
  if (availableLanguages.includes("tr")) {
    return "tr";
  }

  // Finally, return first available language
  return availableLanguages[0] || "en";
}
