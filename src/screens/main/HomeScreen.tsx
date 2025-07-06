import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { CategoryFilterChip } from "../../components/ui/CategoryFilterChip";
import {
  useExploreQuotes,
  useHomeQuotes,
  useQuoteCategories,
} from "../../hooks/useQuoteService";
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

  // Categories for getting category name
  const { allCategories } = useQuoteCategories();

  // Create styles with theme
  const styles = createStyles(theme);

  // Get category name for display
  const selectedCategoryData = categoryFilter
    ? allCategories.find((cat) => cat.id === categoryFilter)
    : null;

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
              ? home.category_no_quotes.replace("{category}", categoryFilter)
              : home.no_quotes}
          </Text>
          <Text
            style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}
          >
            {categoryFilter
              ? home.try_other_category
              : home.wait_for_categories}
          </Text>
          {categoryFilter && (
            <Text
              style={[styles.clearFilterText, { color: theme.colors.primary }]}
              onPress={clearCategoryFilter}
            >
              {home.back_to_home}
            </Text>
          )}
        </View>
      </BaseScreen>
    );
  }

  console.log(`🏠 HomeScreen loaded with ${displayQuotes.length} quotes`);

  return (
    <BaseScreen
      style={styles.container}
      useGradientBackground={false} // QuoteReelCard has its own gradient
      backgroundColor="transparent" // Transparent to show QuoteReelCard gradient
      safeAreaStyle={{ paddingHorizontal: 0 }} // Override BaseScreen padding
    >
      {/* Debug Premium Toggle - Hidden by default, can be enabled for debugging */}
      {__DEV__ && (
        <View
          style={[
            styles.debugPanel,
            {
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.debugContent}>
            <View style={styles.debugInfo}>
              <Text style={[styles.debugTitle, { color: theme.colors.white }]}>
                Debug Panel
              </Text>
              <Text
                style={[
                  styles.debugText,
                  { color: theme.colors.whiteOverlay80 },
                ]}
              >
                Premium: {isPremium ? common.yes : common.no}
              </Text>
              <Text
                style={[
                  styles.debugText,
                  {
                    color: isPremium ? theme.colors.white : theme.colors.white,
                  },
                ]}
              >
                Quotes: {displayQuotes.length} | Categories:{" "}
                {userPreferences?.selectedCategories?.length || 0}
              </Text>
              <Text style={[styles.debugText, { color: theme.colors.white }]}>
                Language: {(common.language || "EN").toUpperCase()}
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
                    {
                      color: isPremium
                        ? theme.colors.white
                        : theme.colors.white,
                    },
                  ]}
                >
                  {isPremium ? common.premium_status : common.free_status}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.debugButton,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={handleResetOnboarding}
              >
                <Text
                  style={[
                    styles.debugButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  {common.reset_onboarding}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Category filter indicator - Show when category is selected */}
      {categoryFilter && selectedCategoryData && (
        <CategoryFilterChip
          categoryName={selectedCategoryData.name}
          categoryId={categoryFilter}
          onClear={clearCategoryFilter}
        />
      )}

      {/* Personalization indicator - Hidden by default */}
      {false &&
        !categoryFilter &&
        isPremium &&
        userPreferences?.selectedCategories &&
        (userPreferences?.selectedCategories?.length || 0) > 0 && (
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
                {home.personalized_quotes}
              </Text>
              <Text
                style={[
                  styles.personalizationSubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {userPreferences?.selectedCategories?.slice(0, 3).join(", ")}
                {(userPreferences?.selectedCategories?.length || 0) > 3
                  ? ` +${
                      (userPreferences?.selectedCategories?.length || 0) - 3
                    }`
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
        categoryFilter={categoryFilter}
      />
    </BaseScreen>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 0, // No padding to allow full gradient visibility
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
    debugPanel: {
      position: "absolute",
      top: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.blackOverlay70,
      borderRadius: 12,
      padding: 16,
      zIndex: 1000,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
    debugText: {
      fontSize: 12,
      fontWeight: "500",
    },
    debugButtons: {
      flexDirection: "row",
      gap: 8,
    },
    debugButton: {
      backgroundColor: theme.colors.brandYellow,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 8,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    debugButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    personalizationBanner: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      shadowColor: theme.colors.shadowColor,
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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      backgroundColor: theme.colors.whiteOverlay10,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay10,
    },
  });
