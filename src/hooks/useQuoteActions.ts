import { useMemo } from "react";
import { updateWithFavoriteOrRandom } from "../services/WidgetService";
import { useQuoteSelectors } from "../store/useQuoteStore";

// Single responsibility: Handle quote actions (favorites, reading)
export function useQuoteActions() {
  const favoriteQuotes = useQuoteSelectors.favoriteQuotes();
  const seenQuotes = useQuoteSelectors.seenQuotes();
  const actions = useQuoteSelectors.actions();

  // Stable action handlers
  const quoteActions = useMemo(
    () => ({
      // Check if quote is favorite
      isQuoteFavorite: (quoteId: string) => favoriteQuotes.includes(quoteId),

      // Check if quote has been seen
      isQuoteSeen: (quoteId: string) => seenQuotes.includes(quoteId),

      // Toggle favorite status
      toggleFavorite: async (quoteId: string) => {
        try {
          if (favoriteQuotes.includes(quoteId)) {
            actions.removeFromFavorites(quoteId);
            console.log("🗑️ Favorilerden çıkarıldı:", quoteId);
          } else {
            actions.addToFavorites(quoteId);
            console.log("⭐ Favorilere eklendi:", quoteId);
          }
          // Widget'ı güncelle ve bekle
          await updateWithFavoriteOrRandom();
        } catch (error) {
          console.error("❌ Widget güncellenirken hata:", error);
        }
      },

      // Mark quote as read
      markAsRead: actions.markAsRead,

      // Direct actions
      addToFavorites: async (quoteId: string) => {
        try {
          actions.addToFavorites(quoteId);
          console.log("⭐ Favorilere eklendi:", quoteId);
          await updateWithFavoriteOrRandom();
        } catch (error) {
          console.error("❌ Widget güncellenirken hata:", error);
        }
      },

      removeFromFavorites: async (quoteId: string) => {
        try {
          actions.removeFromFavorites(quoteId);
          console.log("🗑️ Favorilerden çıkarıldı:", quoteId);
          await updateWithFavoriteOrRandom();
        } catch (error) {
          console.error("❌ Widget güncellenirken hata:", error);
        }
      },
    }),
    [favoriteQuotes, seenQuotes, actions]
  );

  return {
    favoriteQuotes,
    seenQuotes,
    ...quoteActions,
  };
}
