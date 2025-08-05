import DebugPanel from "@/src/components/ui/DebugPanel";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { AIMessageCard } from "../../components/ui/AIMessageCard";
import { CategoryFilterChip } from "../../components/ui/CategoryFilterChip";
import { MoodSelectionModal } from "../../components/ui/MoodSelectionModal";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useMoodMotivation } from "../../hooks/useMoodMotivation";
import { usePremium } from "../../hooks/usePremium"; // UNIFIED: Single premium source
import {
  useExploreQuotes,
  useHomeQuotes,
  useQuoteCategories,
} from "../../hooks/useQuoteService";
import { useStoreReview } from "../../hooks/useStoreReview";
import { getGlobalStreakFunctions } from "../../hooks/useStreak";
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
  usePurchaseActions,
  usePurchaseHydrated,
} from "../../store/usePurchaseStore";
import { useQuoteSelectors } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

export function HomeScreen() {
  // Theme
  const { theme } = useTheme();

  // Analytics
  const { trackScreen, trackQuoteView, trackCategoryFilter } = useAnalytics();

  // Store review tracking
  const { incrementQuotesRead } = useStoreReview();

  // Progressive paywall tracking
  const { trackUserInteraction } = usePaywallSelectors.actions();

  // Mood-based motivation
  const {
    isLoading: isGenerating,
    generatedMessage,
    error: moodError,
    generateMotivation,
    clearMessage,
  } = useMoodMotivation();

  // Mood modal state (now managed locally)
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Mood modal handlers
  const showModal = () => setIsModalVisible(true);
  const hideModal = () => {
    setIsModalVisible(false);
    clearMessage();
  };

  const handleMoodComplete = async (moodResponse: any) => {
    // Close modal first
    setIsModalVisible(false);

    // Generate motivation using new hook
    await generateMotivation({
      mood: moodResponse.feeling,
      energy: moodResponse.energy,
      affecting: moodResponse.affecting,
      language: (userPreferences?.language || "tr") as
        | "en"
        | "tr"
        | "fr"
        | "es"
        | "de"
        | "it"
        | "pt"
        | "ru"
        | "nl"
        | "id"
        | "ja"
        | "th"
        | "ms",
    });
  };

  // AI Message Card handlers
  const handleShare = () => {
    console.log("📤 Sharing mood-based motivation message");
    // Implement share functionality here
  };

  const handleTryDifferent = async () => {
    if (!userPreferences) return;

    // Re-generate with same mood data but different result
    const lastMoodData = {
      mood: "motivated", // Default or store last used values
      energy: "medium",
      affecting: "goals",
      language: (userPreferences.language || "tr") as
        | "en"
        | "tr"
        | "fr"
        | "es"
        | "de"
        | "it"
        | "pt"
        | "ru"
        | "nl"
        | "id"
        | "ja"
        | "th"
        | "ms",
    };

    await generateMotivation(lastMoodData);
  };

  const handleClose = () => {
    clearMessage();
  };

  // Router parameters for category selection from explore
  const { selectedCategory } = useLocalSearchParams();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Store hydration checks
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // User preferences for personalized quotes
  const userPreferences = useUserPreferences();

  // UNIFIED: Premium status from unified system
  const { isPremium } = usePremium(); // Extract isPremium boolean
  const { setPremium } = usePurchaseActions();

  // Onboarding actions for debug
  const { resetOnboarding } = useOnboardingActions();

  // Paywall tracking
  const { trackAction } = usePaywallSelectors.actions();
  const { showPaywall } = usePaywallSelectors.actions();

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

  // Track screen view
  useEffect(() => {
    trackScreen("HomeScreen", "HomeScreen");
  }, [trackScreen]);

  // Handle category selection from router params
  useEffect(() => {
    if (selectedCategory && typeof selectedCategory === "string") {
      setCategoryFilter(selectedCategory);
      console.log(
        `🔗 Navigation from explore with category: ${selectedCategory}`
      );

      // Track category filter analytics
      const selectedCategoryData = allCategories.find(
        (cat) => cat.id === selectedCategory
      );
      if (selectedCategoryData) {
        trackCategoryFilter({
          category_id: selectedCategoryData.id,
          category_name: selectedCategoryData.name,
          is_premium: selectedCategoryData.isPremium,
        });
      }

      // Track user interaction for progressive paywall (only for non-premium users)
      if (!isPremium) {
        trackUserInteraction();
        console.log("🎯 User interaction tracked (category filter)");
      } else {
        console.log(
          "👑 Premium user - skipping interaction tracking (category filter)"
        );
      }
    }
  }, [selectedCategory, allCategories, trackCategoryFilter, isPremium]);

  // Handle quote view tracking
  const handleQuoteView = async (quote: LocalizedQuote) => {
    // Track quote view for analytics
    console.log("Quote viewed:", quote.id);

    // Track quote view
    trackQuoteView({
      quote_id: quote.id,
      quote_category: quote.category,
      quote_author: quote.author,
      language: quote.language as "en" | "tr",
    });

    // Track quote read for store review eligibility
    await incrementQuotesRead();

    // Track user interaction for progressive paywall (only for non-premium users)
    if (!isPremium) {
      trackUserInteraction();
      console.log("🎯 User interaction tracked (quote view)");
    } else {
      console.log(
        "👑 Premium user - skipping interaction tracking (quote view)"
      );
    }
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

    // Track user interaction for progressive paywall (only for non-premium users)
    if (!isPremium) {
      trackUserInteraction();
      console.log("🎯 User interaction tracked (category clear)");
    } else {
      console.log(
        "👑 Premium user - skipping interaction tracking (category clear)"
      );
    }
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

  // Debug streak modal functions - access global streak functions
  const showStreakContinue = () => {
    console.log("🔥 Debug: Triggering global streak continue modal");
    const globalFunctions = getGlobalStreakFunctions();
    if (globalFunctions) {
      globalFunctions.showStreakContinue(3);
    } else {
      console.warn("❌ Global streak functions not available yet");
    }
  };

  const showStreakBreak = () => {
    console.log("💔 Debug: Triggering global streak break modal");
    const globalFunctions = getGlobalStreakFunctions();
    if (globalFunctions) {
      globalFunctions.showStreakBreak(0);
    } else {
      console.warn("❌ Global streak functions not available yet");
    }
  };

  // Debug paywall modal function
  const handleShowPaywall = () => {
    showPaywall("real_purchase");
    console.log(`💰 Debug: PaywallModal opened from debug panel`);
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
      useGradientBackground={true} // QuoteReelCard has its own gradient
      backgroundColor="transparent" // Transparent to show QuoteReelCard gradient
      safeAreaStyle={{}} // Override BaseScreen padding
    >
      {/* Debug Panel */}
      {__DEV__ && (
        <DebugPanel
          isPremium={isPremium}
          displayQuotes={displayQuotes}
          userPreferences={userPreferences}
          common={common}
          theme={theme}
          togglePremiumStatus={togglePremiumStatus}
          handleResetOnboarding={handleResetOnboarding}
          showStreakContinue={showStreakContinue}
          showStreakBreak={showStreakBreak}
          handleShowPaywall={handleShowPaywall}
        />
      )}

      {/* Mood Selection Modal */}
      <MoodSelectionModal
        visible={isModalVisible}
        onClose={hideModal}
        onComplete={handleMoodComplete}
      />

      {/* AI Generated Message Card */}
      {generatedMessage && (
        <AIMessageCard
          message={generatedMessage}
          isLoading={isGenerating}
          onShare={handleShare}
          onTryDifferent={handleTryDifferent}
          onClose={handleClose}
        />
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
        onMoodIconPress={showModal}
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
