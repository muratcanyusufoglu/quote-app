import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { QuoteReels } from "../../components/reels";
import { useHomeQuotes } from "../../hooks/useQuoteService";
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

  // Get home quotes using sync hook
  const homeQuotes = useHomeQuotes(20);

  // Handle quote view tracking
  const handleQuoteView = (quote: LocalizedQuote) => {
    // Track quote view for analytics
    console.log("Quote viewed:", quote.id);
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

  // Show empty state if no quotes
  if (homeQuotes.length === 0) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Henüz quote bulunamadı</Text>
          <Text style={styles.errorSubtext}>
            Yeni kategoriler eklenene kadar bekleyin
          </Text>
        </View>
      </BaseScreen>
    );
  }

  console.log(`🏠 HomeScreen loaded with ${homeQuotes.length} quotes`);

  return (
    <BaseScreen style={styles.container}>
      <QuoteReels
        initialQuotes={homeQuotes}
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
    color: darkTheme.colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: darkTheme.colors.error || "#EF4444",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    textAlign: "center",
  },
});
