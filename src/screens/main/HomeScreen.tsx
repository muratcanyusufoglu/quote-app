import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { useQuoteService } from "../../hooks/useQuoteService";
import {
  useOnboardingHydrated,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import { useQuoteHydrated } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { darkTheme } from "../../utils/theme";

export function HomeScreen() {
  // Store hydration checks
  const quoteStoreHydrated = useQuoteHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // User preferences for personalized quotes
  const userPreferences = useUserPreferences();

  // Quote service
  const { getHomeFeedQuotes } = useQuoteService();

  // Handle quote view tracking
  const handleQuoteView = (quote: LocalizedQuote) => {
    // Track quote view for analytics
    console.log("Quote viewed:", quote.id);
  };

  // Get initial quotes based on user preferences
  const getInitialQuotes = (): LocalizedQuote[] => {
    console.log("🏠 Getting initial quotes, userPreferences:", userPreferences);

    if (!userPreferences) {
      const quotes = getHomeFeedQuotes(20);
      console.log("🔤 No preferences, loaded quotes:", quotes.length);
      return quotes;
    }

    // Get personalized quotes based on user preferences
    const quotes = getHomeFeedQuotes(20);
    console.log("👤 With preferences, loaded quotes:", quotes.length);
    return quotes;
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
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </BaseScreen>
    );
  }

  const initialQuotes = getInitialQuotes();

  return (
    <BaseScreen style={styles.container}>
      <QuoteReels
        initialQuotes={initialQuotes}
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
  },
  loadingText: {
    fontSize: 18,
    color: darkTheme.colors.text,
    fontWeight: "500",
  },
});
