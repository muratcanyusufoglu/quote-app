import { useMemo } from "react";
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
      toggleFavorite: (quoteId: string) => {
        if (favoriteQuotes.includes(quoteId)) {
          actions.removeFromFavorites(quoteId);
        } else {
          actions.addToFavorites(quoteId);
        }
      },

      // Mark quote as read
      markAsRead: actions.markAsRead,

      // Direct actions
      addToFavorites: actions.addToFavorites,
      removeFromFavorites: actions.removeFromFavorites,
    }),
    [favoriteQuotes, seenQuotes, actions]
  );

  return {
    favoriteQuotes,
    seenQuotes,
    ...quoteActions,
  };
}
