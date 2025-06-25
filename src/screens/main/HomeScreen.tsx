import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { useExploreQuotes, useHomeQuotes } from "../../hooks/useQuoteService";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import {
  useOnboardingActions,
  useOnboardingHydrated,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import {
  useIsPremium,
  usePurchaseActions,
  usePurchaseHydrated,
} from "../../store/usePurchaseStore";
import { useHasHydrated } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

export function HomeScreen() {
  // Theme
  const { theme } = useTheme();

  // Router parameters for category selection from explore
  const { selectedCategory } = useLocalSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Store hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // User preferences for personalized quotes
  const userPreferences = useUserPreferences();

  // Premium status and actions
  const isPremium = useIsPremium();
  const { setPremium } = usePurchaseActions();

  // Onboarding actions for debug
  const { resetOnboarding } = useOnboardingActions();

  // Paywall tracking
  const { trackAction } = usePaywallSelectors.actions();

  // Translations
  const home = useScreenTranslations("home");
  const common = useCommonTranslations();

  // Determine quote source based on user status and navigation source
  const getQuoteSource = () => {
    // 1. If coming from explore (category filter active), show only that category
    if (categoryFilter) {
      console.log(`📂 Showing quotes from category: ${categoryFilter}`);
      return useExploreQuotes([categoryFilter], 20);
    }

    // 2. If premium user with preferences, show personalized quotes from selected categories
    if (
      isPremium &&
      userPreferences?.selectedCategories &&
      userPreferences.selectedCategories.length > 0
    ) {
      console.log(
        `👑 Premium user - showing personalized quotes from categories:`,
        userPreferences.selectedCategories
      );
      return useExploreQuotes(userPreferences.selectedCategories, 20);
    }

    // 3. Default: show general home feed
    console.log(`🏠 Showing default home feed`);
    return useHomeQuotes(20);
  };

  const displayQuotes = getQuoteSource();

  // Debug logging
  console.log(`🏠 HomeScreen DEBUG:`);
  console.log(`📊 isPremium: ${isPremium}`);
  console.log(`🌍 userPreferences:`, userPreferences);
  console.log(`🎯 categoryFilter: ${categoryFilter || "none"}`);
  console.log(`📱 displayQuotes length: ${displayQuotes.length}`);
  console.log(
    `✅ All stores hydrated:`,
    quoteStoreHydrated && purchaseStoreHydrated && onboardingStoreHydrated
  );

  // Handle category selection from router params
  useEffect(() => {
    if (selectedCategory && typeof selectedCategory === "string") {
      setCategoryFilter(selectedCategory);
      console.log(
        `🔗 Navigation from explore with category: ${selectedCategory}`
      );
    }
  }, [selectedCategory]);

  // Handle quote view tracking
  const handleQuoteView = (quote: LocalizedQuote) => {
    // Track quote view for analytics
    console.log("Quote viewed:", quote.id);
  };

  // Track actions when user interacts with quotes
  const handleQuoteAction = (actionType: string) => {
    console.log(`📱 User action: ${actionType}`);
    trackAction(); // This will trigger paywall after 15 actions
  };

  // Clear category filter function
  const clearCategoryFilter = () => {
    setCategoryFilter(null);
    console.log(`🧹 Category filter cleared`);
  };

  // Toggle premium status for debugging
  const togglePremiumStatus = () => {
    setPremium(!isPremium);
    console.log(`🔧 Debug: Premium status toggled to ${!isPremium}`);
  };

  // Reset onboarding for testing
  const handleResetOnboarding = () => {
    resetOnboarding();
    console.log(
      `🔄 Debug: Onboarding reset - user will see onboarding flow again`
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
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {common.loading}
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
              : home.no_quotes}
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

  console.log(`🏠 HomeScreen loaded with ${displayQuotes.length} quotes`);

  return (
    <BaseScreen style={styles.container}>
      {/* Debug Premium Toggle - Only show in development */}
      {__DEV__ && (
        <View
          style={[
            styles.debugContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.debugContent}>
            <View style={styles.debugInfo}>
              <Text style={[styles.debugTitle, { color: theme.colors.text }]}>
                🔧 Debug Mode
              </Text>
              <Text
                style={[
                  styles.debugSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Premium: {isPremium ? "✅" : "❌"} | Categories:{" "}
                {userPreferences?.selectedCategories?.length || 0}
              </Text>
            </View>
            <View style={styles.debugButtons}>
              <TouchableOpacity
                style={[
                  styles.debugButton,
                  {
                    backgroundColor: isPremium
                      ? theme.colors.premium
                      : theme.colors.surface,
                  },
                ]}
                onPress={togglePremiumStatus}
              >
                <Text
                  style={[
                    styles.debugButtonText,
                    { color: isPremium ? "#FFFFFF" : theme.colors.text },
                  ]}
                >
                  {isPremium ? "Premium" : "Free"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.debugButton,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={handleResetOnboarding}
              >
                <Text style={[styles.debugButtonText, { color: "#FFFFFF" }]}>
                  Reset Onboarding
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Category filter indicator - Show when coming from explore */}
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

      {/* Personalization indicator - Show for premium users when not filtering */}
      {!categoryFilter &&
        isPremium &&
        userPreferences?.selectedCategories &&
        userPreferences.selectedCategories.length > 0 && (
          <View
            style={[
              styles.personalizationBanner,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.personalizationContent}>
              <Text
                style={[
                  styles.personalizationText,
                  { color: theme.colors.text },
                ]}
              >
                👑 Size özel seçilmiş quote'lar
              </Text>
              <Text
                style={[
                  styles.personalizationSubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {userPreferences.selectedCategories.slice(0, 3).join(", ")}
                {userPreferences.selectedCategories.length > 3
                  ? ` +${userPreferences.selectedCategories.length - 3}`
                  : ""}
              </Text>
            </View>
          </View>
        )}

      <QuoteReels
        initialQuotes={displayQuotes}
        onQuoteView={handleQuoteView}
        onQuoteAction={handleQuoteAction}
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
  debugContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  debugInfo: {
    flex: 1,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  debugSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  debugButtons: {
    flexDirection: "row",
    gap: 8,
  },
  debugButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
  personalizationBanner: {
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
  personalizationContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personalizationText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  personalizationSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
});
