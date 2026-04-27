import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationBar } from "../../components/layout/NavigationBar";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useFavoriteQuotes } from "../../hooks/useQuoteService";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import { useHasHydrated } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { getContrastTextColor } from "../../utils/theme";
import { useTheme } from "../../utils/ThemeContext";

export function FavoritesScreen() {
  const { theme } = useTheme();
  const cardText = getContrastTextColor(theme.colors.brandYellow);

  // Analytics
  const { trackScreen, trackQuoteView } = useAnalytics();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Get favorite quotes
  const favoriteQuotes = useFavoriteQuotes();

  // Translations
  const favorites = useScreenTranslations("favorites");
  const common = useCommonTranslations();

  // Track screen view
  useEffect(() => {
    trackScreen("FavoritesScreen", "FavoritesScreen");
  }, [trackScreen]);

  const handleQuotePress = (quote: LocalizedQuote) => {
    // Track quote view analytics
    trackQuoteView({
      quote_id: quote.id,
      quote_category: quote.category,
      quote_author: quote.author,
      language: quote.language,
    });

    router.push(`/quote-detail/${quote.id}`);
  };

  const handleBrowseQuotes = () => {
    router.push("/(tabs)");
  };

  const renderQuoteItem = ({ item: quote }: { item: LocalizedQuote }) => (
    <TouchableOpacity
      style={[styles.quoteCard, { backgroundColor: theme.colors.brandYellow }]}
      onPress={() => handleQuotePress(quote)}
    >
      <Text style={[styles.quoteText, { color: cardText.primary }]}>
        {quote.text}
      </Text>
      <Text style={[styles.quoteAuthor, { color: cardText.secondary }]}>
        {quote.author}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.white }]}>
        {favorites.empty_title}
      </Text>
      <Text
        style={[styles.emptyMessage, { color: theme.colors.whiteOverlay80 }]}
      >
        {favorites.empty_message}
      </Text>
      <TouchableOpacity
        style={[
          styles.browseButton,
          { backgroundColor: theme.colors.brandYellow },
        ]}
        onPress={handleBrowseQuotes}
      >
        <Text style={[styles.browseButtonText, { color: theme.colors.white }]}>
          {favorites.browse_quotes}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading while stores are hydrating
  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.white }]}>
            {common.loading}
          </Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen style={styles.container} useGradientBackground={true}>
      <NavigationBar />

      <NavigationHeader
        title={favorites.title}
        currentRoute="/(tabs)/favorites"
      />

      <View style={styles.content}>
        {/* Navigation Bar */}

        {favoriteQuotes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={favoriteQuotes}
            renderItem={renderQuoteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
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
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
