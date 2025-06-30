import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import { useHasHydrated, useLastReadQuotes } from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

export function PastReadsScreen() {
  const { theme } = useTheme();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Get past read quotes
  const lastReadQuotes = useLastReadQuotes();

  // Translations
  const history = useScreenTranslations("history");
  const common = useCommonTranslations();

  const handleQuotePress = (quote: LocalizedQuote) => {
    router.push(`/quote-detail/${quote.id}`);
  };

  const handleStartReading = () => {
    router.push("/(tabs)");
  };

  const renderQuoteItem = ({ item: quote }: { item: LocalizedQuote }) => (
    <TouchableOpacity
      style={[styles.readCard, { backgroundColor: theme.colors.brandYellow }]}
      onPress={() => handleQuotePress(quote)}
    >
      <Text style={[styles.quoteText, { color: theme.colors.textSoft }]}>
        {quote.text}
      </Text>
      <Text
        style={[styles.quoteAuthor, { color: theme.colors.textSoftSecondary }]}
      >
        {quote.author}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.white }]}>
        {history.empty_title}
      </Text>
      <Text
        style={[styles.emptyMessage, { color: theme.colors.whiteOverlay80 }]}
      >
        {history.empty_message}
      </Text>
      <TouchableOpacity
        style={[
          styles.startReadingButton,
          { backgroundColor: theme.colors.brandYellow },
        ]}
        onPress={handleStartReading}
      >
        <Text
          style={[styles.startReadingButtonText, { color: theme.colors.white }]}
        >
          {history.start_reading}
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
      <NavigationHeader title={history.title} currentRoute="/(tabs)/history" />

      <View style={styles.content}>
        {lastReadQuotes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={lastReadQuotes}
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
  readCard: {
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
  startReadingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startReadingButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
