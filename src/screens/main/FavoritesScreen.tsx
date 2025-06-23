import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import QuoteCard from "../../components/cards/QuoteCard";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import {
  useActions,
  useFavoriteQuotes,
  useHasHydrated,
  useQuotes,
} from "../../store/useQuoteStore";
import { LocalizedQuote, Quote } from "../../types";
import { darkTheme } from "../../utils/theme";

export function FavoritesScreen() {
  // Store data
  const quotes = useQuotes();
  const favoriteQuotes = useFavoriteQuotes();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Actions
  const { markAsRead, removeFromFavorites } = useActions();

  // Get favorite quote objects
  const favoriteQuoteObjects = quotes.filter((quote) =>
    favoriteQuotes.includes(quote.id)
  );

  const handleQuotePress = (quote: Quote) => {
    // Convert Quote to LocalizedQuote for markAsRead
    const localizedQuote: LocalizedQuote = {
      id: quote.id,
      text: quote.texts.tr,
      author: quote.authors.tr,
      category: quote.category,
      tags: quote.tags.tr,
      language: "tr",
      readTime: quote.readTime,
      story: quote.stories?.tr,
    };
    markAsRead(localizedQuote);
    router.push(`/quote-detail/${quote.id}`);
  };

  const handleFavoritePress = (quoteId: string) => {
    removeFromFavorites(quoteId);
  };

  const renderQuoteCard = ({ item, index }: { item: Quote; index: number }) => {
    // Convert Quote to LocalizedQuote for QuoteCard
    const localizedQuote: LocalizedQuote = {
      id: item.id,
      text: item.texts.tr,
      author: item.authors.tr,
      category: item.category,
      tags: item.tags.tr,
      language: "tr",
      readTime: item.readTime,
      story: item.stories?.tr,
    };

    return (
      <View style={styles.quoteCardContainer}>
        <QuoteCard
          quote={localizedQuote}
          isFavorite={true}
          onPress={() => handleQuotePress(item)}
          onFavoritePress={() => handleFavoritePress(item.id)}
        />
      </View>
    );
  };

  // Show loading while stores are hydrating
  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen style={styles.container}>
      <NavigationHeader title="Favorites" currentRoute="/(tabs)/favorites" />

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.subtitle}>
            {favoriteQuoteObjects.length} quote
            {favoriteQuoteObjects.length !== 1 ? "s" : ""} saved
          </Text>
        </View>

        {favoriteQuoteObjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDescription}>
              Start exploring and tap the heart icon to save your favorite
              quotes
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoriteQuoteObjects}
            renderItem={renderQuoteCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.quotesListContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: darkTheme.colors.textSecondary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    textAlign: "center",
  },
  quotesListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  quoteCardContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: darkTheme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
