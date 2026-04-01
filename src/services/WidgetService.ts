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
  type?: "quote" | "affirmation"; // kullanıcı onboarding seçimine göre
}

const APP_GROUP_ID = "group.com.quotespark.dailyinspiration";

export async function writeWidgetData(payload: QuotePayload): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    await setItem("widgetQuote", JSON.stringify(payload), APP_GROUP_ID);
    console.log("📝 Widget verisi App Group'a yazıldı");
  } catch (e) {
    console.warn("❌ Widget verisi yazılamadı:", e);
  }
}

export async function reloadWidget(): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    await reloadAllTimelines();
    console.log("🔄 Widget timeline'ları yenilendi");
  } catch (e) {
    console.warn("❌ Widget timeline'ları yenilenemedi:", e);
  }
}

export async function updateWithFavoriteOrRandom(): Promise<void> {
  if (Platform.OS !== "ios") return;

  console.log("🔄 Widget güncelleniyor...");

  // Pull from store synchronously
  const { quotes, favoriteQuotes } = useQuoteStore.getState();
  const selectedTheme = useThemeStore.getState().selectedTheme;
  const userPreferences = useOnboardingStore.getState().userPreferences;
  const preferredLang = userPreferences?.language || getSystemLanguage();

  // Kullanıcının onboarding seçimleri
  const contentType = userPreferences?.contentType || "both";
  const selectedCategories = userPreferences?.selectedCategories || [];

  console.log("📚 Widget için veri alınıyor:", {
    quotesCount: quotes.length,
    favoriteCount: favoriteQuotes.length,
    theme: selectedTheme,
    language: preferredLang,
    contentType,
    selectedCategories,
  });

  // Kullanıcı tercihlerine göre quote havuzunu filtrele
  const buildFilteredPool = (allQuotes: any[]): any[] => {
    if (!Array.isArray(allQuotes) || allQuotes.length === 0) return [];

    let pool = allQuotes;

    // 1. contentType'a göre filtrele
    if (contentType === "quotes") {
      // type alanı olmayan eski kayıtlar da quote sayılır
      pool = pool.filter((q: any) => q.type === "quote" || !q.type);
    } else if (contentType === "affirmations") {
      pool = pool.filter((q: any) => q.type === "affirmation");
    }
    // "both" → filtre yok

    // 2. Seçili kategorilere göre filtrele
    if (selectedCategories.length > 0) {
      const categoryPool = pool.filter((q: any) =>
        selectedCategories.includes(q.category)
      );
      // Kategori filtresi sonuç verdiyse uygula, vermezse tüm havuzu kullan
      if (categoryPool.length > 0) {
        pool = categoryPool;
      } else {
        console.log(
          "⚠️ Seçili kategorilerde içerik bulunamadı, tüm havuz kullanılıyor"
        );
      }
    }

    return pool;
  };

  const filteredPool = buildFilteredPool(quotes);
  const activePool = filteredPool.length > 0 ? filteredPool : quotes;

  console.log("🎯 Widget filtre sonucu:", {
    contentType,
    filteredCount: filteredPool.length,
    activePoolCount: activePool.length,
  });

  const pick = () => {
    let chosen = undefined as any;

    // Favoriler içinde filtreli havuzla kesişimi bul
    if (Array.isArray(favoriteQuotes) && favoriteQuotes.length > 0) {
      const filteredFavoriteIds = favoriteQuotes.filter((id: string) =>
        activePool.some((q: any) => q.id === id)
      );

      if (filteredFavoriteIds.length > 0) {
        const randomFavoriteIndex = Math.floor(
          Math.random() * filteredFavoriteIds.length
        );
        const favoriteId = filteredFavoriteIds[randomFavoriteIndex];
        console.log(
          "⭐ Favori (filtreli) quote rastgele seçiliyor:",
          favoriteId,
          `(${randomFavoriteIndex + 1}/${filteredFavoriteIds.length})`
        );
        chosen = activePool.find((q: any) => q.id === favoriteId);
      }
    }

    if (!chosen && activePool.length > 0) {
      // Favoride bulunamazsa filtreli havuzdan rastgele seç
      const randomIndex = Math.floor(Math.random() * activePool.length);
      chosen = activePool[randomIndex];
      console.log(
        "🎲 Filtreli havuzdan rastgele seçiliyor:",
        chosen?.id,
        `(${randomIndex + 1}/${activePool.length})`
      );
    }

    return chosen;
  };

  const q = pick();
  if (!q) {
    console.warn("⚠️ Widget için quote bulunamadı");
    return;
  }

  const theme = mapThemeToColors(selectedTheme || "uprising");
  const lang = SUPPORTED_LANGUAGES.includes(preferredLang as any)
    ? preferredLang
    : "en";

  // 13 dil için tam destek - öncelik sırası: tercih edilen > en > tr > diğerleri
  const getLocalizedText = (
    texts: any,
    authors: any,
    field: "texts" | "authors"
  ) => {
    if (!texts || !authors) return { text: "", author: "" };

    // 1. Tercih edilen dil
    if (texts[lang]) {
      return { text: texts[lang], author: authors[lang] || "" };
    }

    // 2. İngilizce
    if (texts.en) {
      return { text: texts.en, author: authors.en || "" };
    }

    // 3. Türkçe
    if (texts.tr) {
      return { text: texts.tr, author: authors.tr || "" };
    }

    // 4. Diğer diller (ilk bulunan)
    for (const supportedLang of SUPPORTED_LANGUAGES) {
      if (texts[supportedLang]) {
        return { text: texts[supportedLang], author: authors[supportedLang] || "" };
      }
    }

    // 5. Fallback - veri yapısı hiç eşleşmediyse
    return {
      text: (q as any).text || (q as any).content || "",
      author: (q as any).author || "",
    };
  };

  const localized = getLocalizedText(q.texts, q.authors, "texts");

  console.log("🌍 Widget dil ayarları:", {
    preferred: preferredLang,
    selected: lang,
    text: localized.text.substring(0, 50) + "...",
    author: localized.author,
  });

  const payload: QuotePayload = {
    id: q.id,
    text: localized.text,
    author: localized.author,
    bg: theme.bg,
    fg: theme.fg,
    type: (q.type as "quote" | "affirmation") || "quote",
  };

  console.log("📱 Widget payload hazırlandı:", {
    id: payload.id,
    textLength: payload.text.length,
    author: payload.author,
    theme: selectedTheme,
  });

  await writeWidgetData(payload);
  await reloadWidget();
  console.log("✅ Widget başarıyla güncellendi");
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
