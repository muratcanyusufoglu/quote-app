import useOnboardingStore from "@/src/store/useOnboardingStore";
import useQuoteStore from "@/src/store/useQuoteStore";
import { useThemeStore } from "@/src/store/useThemeStore";
import { getSystemLanguage, SUPPORTED_LANGUAGES } from "@/src/utils/language";
import { Platform } from "react-native";
import { reloadAllTimelines, setItem } from "react-native-widgetkit";

export interface QuotePayload {
  id: string;
  text: string;
  author?: string;
  bg: string; // hex
  fg: string; // hex
}

const APP_GROUP_ID = "group.com.quotespark.dailyinspiration";
export async function writeWidgetData(payload: QuotePayload): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    await setItem("widgetQuote", JSON.stringify(payload), APP_GROUP_ID);
  } catch (e) {
    console.warn("Failed writing widget data:", e);
  }
}

export async function reloadWidget(): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    await reloadAllTimelines();
  } catch (e) {
    console.warn("Failed to reload widget timelines:", e);
  }
}

export async function updateWithFavoriteOrRandom(): Promise<void> {
  if (Platform.OS !== "ios") return;
  // Pull from store synchronously
  const { quotes, favoriteQuotes } = useQuoteStore.getState();
  const selectedTheme = useThemeStore.getState().selectedTheme;
  const preferredLang =
    useOnboardingStore.getState().userPreferences?.language ||
    getSystemLanguage();

  const pick = () => {
    let chosen = undefined as any;
    if (Array.isArray(favoriteQuotes) && favoriteQuotes.length > 0) {
      const id = favoriteQuotes[0];
      chosen = Array.isArray(quotes)
        ? quotes.find((q: any) => q.id === id)
        : undefined;
    }
    if (!chosen && Array.isArray(quotes) && quotes.length > 0) {
      const idx = Math.floor(Math.random() * quotes.length);
      chosen = quotes[idx];
    }
    return chosen;
  };

  const q = pick();
  if (!q) return;

  const theme = mapThemeToColors(selectedTheme || "uprising");
  const lang = SUPPORTED_LANGUAGES.includes(preferredLang as any)
    ? (preferredLang as any)
    : "en";
  const text =
    (q.texts && (q.texts[lang] || q.texts.en || q.texts.tr)) ||
    (q.text as string) ||
    (q.content as string) ||
    "";
  const author =
    (q.authors && (q.authors[lang] || q.authors.en || q.authors.tr)) ||
    (q.author as string) ||
    undefined;
  const payload: QuotePayload = {
    id: q.id,
    text,
    author,
    bg: theme.bg,
    fg: theme.fg,
  };
  await writeWidgetData(payload);
  await reloadWidget();
}

function mapThemeToColors(theme: string): { bg: string; fg: string } {
  switch (theme) {
    case "ocean":
      return { bg: "#0ea5e9", fg: "#ffffff" };
    case "forest":
      return { bg: "#065f46", fg: "#ecfdf5" };
    case "sunset":
      return { bg: "#f59e0b", fg: "#111827" };
    case "purple":
      return { bg: "#7c3aed", fg: "#f5f3ff" };
    case "minimalist":
      return { bg: "#111827", fg: "#f9fafb" };
    case "uprising":
    default:
      return { bg: "#1f2937", fg: "#f9fafb" };
  }
}
