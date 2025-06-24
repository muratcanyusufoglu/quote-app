import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { useExploreQuotes, useHomeQuotes } from "../../hooks/useQuoteService";
import {
  useOnboardingHydrated,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import { useQuoteHydrated } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

export function HomeScreen() {
  // Theme
  const { theme } = useTheme();

  // Router parameters for category selection from explore
  const { selectedCategory } = useLocalSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Store hydration checks
  const quoteStoreHydrated = useQuoteHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // User preferences for personalized quotes
  const userPreferences = useUserPreferences();

  // Get quotes based on category filter
  const homeQuotes = useHomeQuotes(20);
  const categoryQuotes = useExploreQuotes(
    categoryFilter ? [categoryFilter] : [],
    20
  );

  // Use category quotes if filter is active, otherwise use home quotes
  const displayQuotes = categoryFilter ? categoryQuotes : homeQuotes;

  // Handle category selection from router params
  useEffect(() => {
    if (selectedCategory && typeof selectedCategory === "string") {
      setCategoryFilter(selectedCategory);
    }
  }, [selectedCategory]);

  // Handle quote view tracking
  const handleQuoteView = (quote: LocalizedQuote) => {
    // Track quote view for analytics
    console.log("Quote viewed:", quote.id);
  };

  // Clear category filter function
  const clearCategoryFilter = () => {
    setCategoryFilter(null);
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
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Yükleniyor...
          </Text>
        </View>
      </BaseScreen>
    );
  }

  // Show empty state if no quotes
  if (displayQuotes.length === 0) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {categoryFilter
              ? `"${categoryFilter}" kategorisinde quote bulunamadı`
              : "Henüz quote bulunamadı"}
          </Text>
          <Text
            style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}
          >
            {categoryFilter
              ? "Başka bir kategori deneyin veya ana sayfaya dönün"
              : "Yeni kategoriler eklenene kadar bekleyin"}
          </Text>
          {categoryFilter && (
            <Text
              style={[styles.clearFilterText, { color: theme.colors.primary }]}
              onPress={clearCategoryFilter}
            >
              Ana sayfaya dön
            </Text>
          )}
        </View>
      </BaseScreen>
    );
  }

  console.log(
    `🏠 HomeScreen loaded with ${displayQuotes.length} quotes${
      categoryFilter ? ` from category: ${categoryFilter}` : ""
    }`
  );

  return (
    <BaseScreen style={styles.container}>
      {/* Category filter indicator */}
      {categoryFilter && (
        <View
          style={[
            styles.categoryFilterBanner,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.categoryFilterContent}>
            <Text
              style={[styles.categoryFilterText, { color: theme.colors.text }]}
            >
              📂 {categoryFilter} kategorisi
            </Text>
            <Text
              style={[
                styles.clearFilterButton,
                { color: theme.colors.primary },
              ]}
              onPress={clearCategoryFilter}
            >
              ✕ Temizle
            </Text>
          </View>
        </View>
      )}

      <QuoteReels
        initialQuotes={displayQuotes}
        onQuoteView={handleQuoteView}
        refreshControl={true}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0, // Override BaseScreen padding for full-width reels
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  clearFilterText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  categoryFilterBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryFilterContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryFilterText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  clearFilterButton: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
