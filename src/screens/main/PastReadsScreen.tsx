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
  useCurrentStreak,
  useDailyReads,
  useFavoriteQuotes,
  useHasHydrated,
  useLastReadQuotes,
  useSeenQuotes,
} from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { darkTheme } from "../../utils/theme";

export function PastReadsScreen() {
  // Store data
  const lastReadQuotes = useLastReadQuotes();
  const seenQuotes = useSeenQuotes();
  const favoriteQuotes = useFavoriteQuotes();
  const dailyReads = useDailyReads();
  const currentStreak = useCurrentStreak();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Actions
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  const handleQuotePress = (quote: LocalizedQuote) => {
    markAsRead(quote);
    router.push(`/quote-detail/${quote.id}`);
  };

  const handleFavoritePress = (quoteId: string) => {
    if (favoriteQuotes.includes(quoteId)) {
      removeFromFavorites(quoteId);
    } else {
      addToFavorites(quoteId);
    }
  };

  const renderQuoteCard = ({
    item,
    index,
  }: {
    item: LocalizedQuote;
    index: number;
  }) => (
    <View style={styles.quoteCardContainer}>
      <QuoteCard
        quote={item}
        isFavorite={favoriteQuotes.includes(item.id)}
        onPress={() => handleQuotePress(item)}
        onFavoritePress={() => handleFavoritePress(item.id)}
      />
    </View>
  );

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
      <NavigationHeader title="History" currentRoute="/(tabs)/history" />

      <View style={styles.content}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{seenQuotes.length}</Text>
            <Text style={styles.statLabel}>Total Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{dailyReads}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoriteQuotes.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Recent Reads Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Reads ({lastReadQuotes.length})
          </Text>

          {lastReadQuotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No reading history yet</Text>
              <Text style={styles.emptyDescription}>
                Start exploring quotes to build your reading history
              </Text>
            </View>
          ) : (
            <FlatList
              data={lastReadQuotes}
              renderItem={renderQuoteCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.quotesListContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: darkTheme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    textAlign: "center",
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: darkTheme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
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
