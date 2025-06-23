import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCardColorByCategory } from "../../components/cards/QuoteCard";
import { useStoryReading } from "../../hooks/usePurchase";
import { useQuoteDetail } from "../../hooks/useQuoteService";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import {
  useActions,
  useFavoriteQuotes,
  useQuoteHydrated,
} from "../../store/useQuoteStore";
import { darkTheme } from "../../utils/theme";

const QUOTE_READ_DELAY = 10000; // 10 saniye

const QuoteDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quoteId = params.id as string;
  const readTimerRef = useRef<number | null>(null);

  // Store data
  const favoriteQuotes = useFavoriteQuotes();

  // Hydration checks
  const quoteStoreHydrated = useQuoteHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Actions
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  // Get quote details
  const quoteDetail = useQuoteDetail(quoteId);
  const storyReading = useStoryReading();

  useEffect(() => {
    if (quoteDetail?.quote) {
      // Quote'ı 10 saniye sonra okundu olarak işaretle
      console.log("⏱️ Starting read timer for quote:", quoteDetail.quote.id);

      readTimerRef.current = setTimeout(() => {
        console.log("✅ Marking quote as read:", quoteDetail.quote.id);
        markAsRead(quoteDetail.quote);
      }, QUOTE_READ_DELAY);
    }

    // Cleanup timer when component unmounts or quote changes
    return () => {
      if (readTimerRef.current) {
        console.log("🧹 Clearing read timer");
        clearTimeout(readTimerRef.current);
        readTimerRef.current = null;
      }
    };
  }, [quoteDetail?.quote?.id, markAsRead]);

  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quoteDetail || !quoteDetail.quote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Quote not found</Text>
          <Text style={styles.errorDescription}>
            The quote you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { quote, category, canAccess, isFavorite, toggleFavorite } =
    quoteDetail;
  const cardColor = getCardColorByCategory(quote.category);

  const handleReadStory = () => {
    if (!quote.story) return;

    if (storyReading.requestRead()) {
      // Story can be read
      console.log("Reading story:", quote.story.title);
    } else {
      // Show paywall
      console.log("Navigate to purchase - story limit reached");
    }
  };

  const handleFavoritePress = () => {
    if (!quoteDetail?.quote) return;

    if (favoriteQuotes.includes(quoteDetail.quote.id)) {
      removeFromFavorites(quoteDetail.quote.id);
    } else {
      addToFavorites(quoteDetail.quote.id);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{quote.text}</Text>

          {quote.author && (
            <Text style={styles.authorText}>- {quote.author}</Text>
          )}

          <View style={styles.quoteFooter}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>{category?.icon}</Text>
              <Text style={styles.categoryText}>{category?.name}</Text>
            </View>

            <View style={styles.readTimeContainer}>
              <Text style={styles.readTimeText}>{quote.readTime} min read</Text>
            </View>
          </View>
        </View>

        {/* Story Section */}
        {quote.story && (
          <View style={styles.storySection}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle}>{quote.story.title}</Text>
              <View style={styles.storyMeta}>
                <Text style={styles.storyReadTime}>
                  📖 {quote.story.readTime} min read
                </Text>
                {!storyReading.isPremium && (
                  <Text style={styles.remainingReads}>
                    {storyReading.remainingReads} stories left today
                  </Text>
                )}
              </View>
            </View>

            {canAccess ? (
              <View style={styles.storyContent}>
                <Text style={styles.storyText}>{quote.story.content}</Text>

                <TouchableOpacity
                  style={styles.readStoryButton}
                  onPress={handleReadStory}
                >
                  <Text style={styles.readStoryButtonText}>Mark as Read</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.premiumLockContainer}>
                <Text style={styles.premiumLockIcon}>🔒</Text>
                <Text style={styles.premiumLockText}>
                  This story is available with Premium
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => console.log("Navigate to purchase")}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade to Premium
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Story Limit Warning */}
        {!storyReading.isPremium && storyReading.isStoryLimitReached && (
          <View style={styles.limitWarningContainer}>
            <Text style={styles.limitWarningText}>
              {storyReading.upsellMessage}
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => console.log("Navigate to purchase")}
            >
              <Text style={styles.upgradeButtonText}>
                Unlock Unlimited Stories
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tags */}
        {quote.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>Related Topics</Text>
            <View style={styles.tagsContainer}>
              {quote.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: darkTheme.colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: darkTheme.spacing.lg,
    paddingTop: darkTheme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: darkTheme.colors.surface,
  },
  backButtonIcon: {
    fontSize: 18,
    color: darkTheme.colors.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: darkTheme.colors.surface,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  quoteContainer: {
    backgroundColor: darkTheme.colors.surface,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: darkTheme.typography.fontSize.xl,
    fontWeight: darkTheme.typography.fontWeight.medium as any,
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: darkTheme.spacing.lg,
  },
  authorText: {
    fontSize: darkTheme.typography.fontSize.md,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: darkTheme.spacing.xl,
    fontStyle: "italic" as const,
  },
  quoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    borderRadius: darkTheme.borderRadius.md,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: darkTheme.spacing.xs,
  },
  categoryText: {
    fontSize: darkTheme.typography.fontSize.sm,
    color: "#FFFFFF",
    fontWeight: darkTheme.typography.fontWeight.medium as any,
  },
  readTimeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    borderRadius: darkTheme.borderRadius.md,
  },
  readTimeText: {
    fontSize: darkTheme.typography.fontSize.sm,
    color: "#FFFFFF",
    fontWeight: darkTheme.typography.fontWeight.medium as any,
  },
  storySection: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: darkTheme.borderRadius.lg,
    padding: darkTheme.spacing.xl,
    marginBottom: darkTheme.spacing.lg,
  },
  storyHeader: {
    marginBottom: darkTheme.spacing.lg,
  },
  storyTitle: {
    fontSize: darkTheme.typography.fontSize.xl,
    fontWeight: darkTheme.typography.fontWeight.bold as any,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  storyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyReadTime: {
    fontSize: darkTheme.typography.fontSize.sm,
    color: darkTheme.colors.textSecondary,
  },
  remainingReads: {
    fontSize: darkTheme.typography.fontSize.sm,
    color: darkTheme.colors.warning,
    fontWeight: darkTheme.typography.fontWeight.medium as any,
  },
  storyContent: {
    // Content styling
  },
  storyText: {
    fontSize: darkTheme.typography.fontSize.md,
    color: darkTheme.colors.text,
    lineHeight: 24,
    marginBottom: darkTheme.spacing.xl,
  },
  readStoryButton: {
    backgroundColor: darkTheme.colors.primary,
    paddingVertical: darkTheme.spacing.md,
    paddingHorizontal: darkTheme.spacing.xl,
    borderRadius: darkTheme.borderRadius.md,
    alignItems: "center",
  },
  readStoryButtonText: {
    fontSize: darkTheme.typography.fontSize.md,
    fontWeight: darkTheme.typography.fontWeight.semibold as any,
    color: "#FFFFFF",
  },
  premiumLockContainer: {
    alignItems: "center",
    paddingVertical: darkTheme.spacing.xl,
  },
  premiumLockIcon: {
    fontSize: 40,
    marginBottom: darkTheme.spacing.md,
  },
  premiumLockText: {
    fontSize: darkTheme.typography.fontSize.md,
    color: darkTheme.colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: darkTheme.spacing.lg,
  },
  upgradeButton: {
    backgroundColor: darkTheme.colors.premium,
    paddingVertical: darkTheme.spacing.md,
    paddingHorizontal: darkTheme.spacing.xl,
    borderRadius: darkTheme.borderRadius.md,
    alignItems: "center",
  },
  upgradeButtonText: {
    fontSize: darkTheme.typography.fontSize.md,
    fontWeight: darkTheme.typography.fontWeight.semibold as any,
    color: "#FFFFFF",
  },
  limitWarningContainer: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: darkTheme.borderRadius.lg,
    padding: darkTheme.spacing.lg,
    marginBottom: darkTheme.spacing.lg,
    borderWidth: 1,
    borderColor: darkTheme.colors.warning,
  },
  limitWarningText: {
    fontSize: darkTheme.typography.fontSize.md,
    color: darkTheme.colors.text,
    textAlign: "center" as const,
    marginBottom: darkTheme.spacing.md,
  },
  tagsSection: {
    marginBottom: darkTheme.spacing.lg,
  },
  tagsTitle: {
    fontSize: darkTheme.typography.fontSize.lg,
    fontWeight: darkTheme.typography.fontWeight.semibold as any,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: darkTheme.spacing.sm,
  },
  tag: {
    backgroundColor: darkTheme.colors.surface,
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  tagText: {
    fontSize: darkTheme.typography.fontSize.sm,
    color: darkTheme.colors.primary,
    fontWeight: darkTheme.typography.fontWeight.medium as any,
  },
  bottomSpacing: {
    height: 100,
  },
});

export { QuoteDetailScreen };
