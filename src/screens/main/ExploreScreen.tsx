import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QuoteCard from "../../components/cards/QuoteCard";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import { useQuoteCategories } from "../../hooks/useQuoteService";
import {
  useOnboardingHydrated,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import {
  useIsPremium,
  usePurchaseHydrated,
} from "../../store/usePurchaseStore";
import {
  useActions,
  useFavoriteQuotes,
  useHasHydrated,
  useQuotes,
  useSeenQuotes,
} from "../../store/useQuoteStore";
import { LocalizedQuote, Quote } from "../../types";
import { darkTheme } from "../../utils/theme";

export function ExploreScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Store data
  const quotes = useQuotes();
  const seenQuotes = useSeenQuotes();
  const favoriteQuotes = useFavoriteQuotes();
  const isPremium = useIsPremium();
  const userPreferences = useUserPreferences();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Actions
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  // Categories
  const { availableCategories, freeCategories, premiumCategories } =
    useQuoteCategories();

  // Filtered quotes based on selected categories
  const filteredQuotes = useMemo(() => {
    if (selectedCategories.length === 0) {
      return quotes.filter((quote) => !seenQuotes.includes(quote.id));
    }

    return quotes.filter(
      (quote) =>
        selectedCategories.includes(quote.category) &&
        !seenQuotes.includes(quote.id)
    );
  }, [quotes, selectedCategories, seenQuotes]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleQuotePress = (quote: Quote) => {
    // Convert Quote to LocalizedQuote for markAsRead
    const localizedQuote: LocalizedQuote = {
      id: quote.id,
      text: quote.texts.tr, // Assuming Turkish for now
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
    if (favoriteQuotes.includes(quoteId)) {
      removeFromFavorites(quoteId);
    } else {
      addToFavorites(quoteId);
    }
  };

  const renderCategoryButton = (category: any) => {
    const isSelected = selectedCategories.includes(category.id);
    const isPremiumCategory = premiumCategories.some(
      (cat) => cat.id === category.id
    );
    const canAccess = isPremium || !isPremiumCategory;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategoryButton,
          !canAccess && styles.lockedCategoryButton,
        ]}
        onPress={() => canAccess && handleCategoryPress(category.id)}
      >
        <Text
          style={[
            styles.categoryButtonText,
            isSelected && styles.selectedCategoryButtonText,
            !canAccess && styles.lockedCategoryButtonText,
          ]}
        >
          {category.name} {!canAccess && "🔒"}
        </Text>
      </TouchableOpacity>
    );
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
          isFavorite={favoriteQuotes.includes(item.id)}
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
      <NavigationHeader title="Explore" currentRoute="/(tabs)/explore" />

      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
          >
            {availableCategories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Quotes */}
        <View style={styles.quotesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategories.length === 0
              ? "All Quotes"
              : `${selectedCategories.length} Category${
                  selectedCategories.length > 1 ? "ies" : "y"
                } Selected`}
            {` (${filteredQuotes.length} quotes)`}
          </Text>

          {filteredQuotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No quotes found</Text>
              <Text style={styles.emptyDescription}>
                Try selecting different categories or clearing your filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredQuotes}
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
  categoriesContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: darkTheme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesScrollContainer: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: darkTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedCategoryButton: {
    backgroundColor: darkTheme.colors.primary,
  },
  lockedCategoryButton: {
    backgroundColor: darkTheme.colors.surface,
    opacity: 0.5,
  },
  categoryButtonText: {
    fontSize: 14,
    color: darkTheme.colors.text,
    fontWeight: "500",
  },
  selectedCategoryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  lockedCategoryButtonText: {
    color: darkTheme.colors.textSecondary,
  },
  quotesContainer: {
    flex: 1,
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
