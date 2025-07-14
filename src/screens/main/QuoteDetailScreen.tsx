import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import { ShareButton } from "../../components/ui/ShareButton";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useStoryReading } from "../../hooks/usePurchase";
import { useQuoteDetail } from "../../hooks/useQuoteService";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import {
  useActions,
  useFavoriteQuotes,
  useQuoteHydrated,
} from "../../store/useQuoteStore";
import { useTheme } from "../../utils/ThemeContext";

const QUOTE_READ_DELAY = 10000; // 10 saniye

const QuoteDetailScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const quoteId = params.id as string;
  const readTimerRef = useRef<number | null>(null);

  // Analytics
  const { trackScreen, trackQuoteView, trackQuoteFavorite } = useAnalytics();

  // Translations
  const common = useCommonTranslations();
  const quoteDetail = useScreenTranslations("quote_detail");
  const premium = useScreenTranslations("premium");

  // Store data
  const favoriteQuotes = useFavoriteQuotes();

  // Hydration checks
  const quoteStoreHydrated = useQuoteHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Actions
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  // Get quote details
  const quoteDetailData = useQuoteDetail(quoteId);
  const storyReading = useStoryReading();

  // Track screen view
  useEffect(() => {
    trackScreen("QuoteDetailScreen", "QuoteDetailScreen");
  }, [trackScreen]);

  // Track quote view and start read timer
  useEffect(() => {
    if (quoteDetailData?.quote) {
      // Track quote view analytics
      trackQuoteView({
        quote_id: quoteDetailData.quote.id,
        quote_category: quoteDetailData.quote.category,
        quote_author: quoteDetailData.quote.author,
        language: quoteDetailData.quote.language,
      });

      // Quote'ı 10 saniye sonra okundu olarak işaretle
      console.log(
        "⏱️ Starting read timer for quote:",
        quoteDetailData.quote.id
      );

      readTimerRef.current = setTimeout(() => {
        console.log("✅ Marking quote as read:", quoteDetailData.quote.id);
        markAsRead(quoteDetailData.quote);

        // Story varsa onu da otomatik olarak oku
        if (quoteDetailData.quote.story && storyReading.requestRead()) {
          console.log(
            "✅ Automatically reading story:",
            quoteDetailData.quote.story.title
          );
        }
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
  }, [quoteDetailData?.quote?.id, markAsRead, storyReading, trackQuoteView]);

  const styles = createStyles(theme);

  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{common.loading}</Text>
        </View>
      </BaseScreen>
    );
  }

  if (!quoteDetailData || !quoteDetailData.quote) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{quoteDetail.not_found_title}</Text>
          <Text style={styles.errorDescription}>
            {quoteDetail.not_found_description}
          </Text>
        </View>
      </BaseScreen>
    );
  }

  const { quote, category, canAccess, isFavorite, toggleFavorite } =
    quoteDetailData;

  const handleFavoritePress = () => {
    if (!quoteDetailData?.quote) return;

    const isCurrentlyFavorite = favoriteQuotes.includes(
      quoteDetailData.quote.id
    );
    const action = isCurrentlyFavorite ? "remove" : "add";

    // Track favorite analytics
    trackQuoteFavorite(
      {
        quote_id: quoteDetailData.quote.id,
        quote_category: quoteDetailData.quote.category,
        quote_author: quoteDetailData.quote.author,
        language: quoteDetailData.quote.language,
      },
      action
    );

    if (isCurrentlyFavorite) {
      removeFromFavorites(quoteDetailData.quote.id);
    } else {
      addToFavorites(quoteDetailData.quote.id);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <BaseScreen useGradientBackground={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
            <IconSymbol
              name="heart"
              size={18}
              color={
                isFavorite
                  ? theme.colors.favoriteRed
                  : theme.colors.whiteOverlay80
              }
              strokeWidth={isFavorite ? 3 : 2}
            />
          </TouchableOpacity>
        </View>

        {/* Quote Card */}
        <View
          style={[
            styles.quoteContainer,
            { backgroundColor: theme.colors.brandYellow },
          ]}
        >
          <Text style={styles.quoteText}>{quote.text}</Text>

          {quote.author && (
            <Text style={styles.authorText}>- {quote.author}</Text>
          )}

          <View style={styles.quoteFooter}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>{category?.icon}</Text>
              <Text style={styles.categoryText}>{category?.name}</Text>
            </View>

            <ShareButton
              quote={quote}
              size={18}
              iconColor={theme.colors.textSoft}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              style={styles.shareButton}
            />
          </View>
        </View>

        {/* Story Section */}
        {quote.story && (
          <View style={styles.storySection}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle}>{quote.story.title}</Text>
              <View style={styles.storyMeta}>
                <View style={styles.storyReadTimeContainer}>
                  <IconSymbol
                    name="book"
                    size={14}
                    color="rgba(255, 255, 255, 0.7)"
                    strokeWidth={2}
                  />
                  <Text style={styles.storyReadTime}>
                    {quote.story.readTime} {quoteDetail.minutes_short}
                  </Text>
                </View>
                {!storyReading.isPremium && (
                  <Text style={styles.remainingReads}>
                    {quoteDetail.stories_remaining.replace(
                      "{count}",
                      storyReading.remainingReads.toString()
                    )}
                  </Text>
                )}
              </View>
            </View>

            {canAccess ? (
              <View style={styles.storyContent}>
                <Text style={styles.storyText}>{quote.story.content}</Text>
              </View>
            ) : (
              <View style={styles.premiumLockContainer}>
                <IconSymbol
                  name="lock"
                  size={32}
                  color="rgba(255, 255, 255, 0.7)"
                  strokeWidth={2}
                />
                <Text style={styles.premiumLockText}>
                  {quoteDetail.story_premium_required}
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => console.log("Navigate to purchase")}
                >
                  <Text style={styles.upgradeButtonText}>
                    {premium.upgrade}
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
                {quoteDetail.unlimited_stories}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tags */}
        {quote.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>{quoteDetail.related_topics}</Text>
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
    </BaseScreen>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 18,
      color: "#FFFFFF",
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
      color: "#FFFFFF",
      marginBottom: 12,
      textAlign: "center",
    },
    errorDescription: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
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
      paddingVertical: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    backButtonIcon: {
      fontSize: 18,
      color: "#FFFFFF",
    },
    favoriteButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    quoteContainer: {
      padding: 24,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    quoteText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textSoft,
      lineHeight: 28,
      marginBottom: theme.spacing.lg,
    },
    authorText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textSoftSecondary,
      marginBottom: theme.spacing.xl,
      fontStyle: "italic",
    },
    quoteFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(54, 69, 79, 0.2)",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    categoryIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    categoryText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSoft,
      fontWeight: theme.typography.fontWeight.medium,
    },
    shareButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    storySection: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    storyHeader: {
      marginBottom: theme.spacing.lg,
    },
    storyTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: "#FFFFFF",
      marginBottom: theme.spacing.sm,
    },
    storyMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    storyReadTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    storyReadTime: {
      fontSize: theme.typography.fontSize.sm,
      color: "rgba(255, 255, 255, 0.7)",
      marginLeft: theme.spacing.xs,
    },
    remainingReads: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.brandYellow,
      fontWeight: theme.typography.fontWeight.medium,
    },
    storyContent: {
      // Content styling
    },
    storyText: {
      fontSize: theme.typography.fontSize.md,
      color: "#FFFFFF",
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },

    premiumLockContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    premiumLockIcon: {
      fontSize: 40,
      marginBottom: theme.spacing.md,
    },
    premiumLockText: {
      fontSize: theme.typography.fontSize.md,
      color: "rgba(255, 255, 255, 0.7)",
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    upgradeButton: {
      backgroundColor: theme.colors.premium,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
    },
    upgradeButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: "#FFFFFF",
    },
    limitWarningContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.brandYellow,
    },
    limitWarningText: {
      fontSize: theme.typography.fontSize.md,
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    tagsSection: {
      marginBottom: theme.spacing.lg,
    },
    tagsTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: "#FFFFFF",
      marginBottom: theme.spacing.md,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    tag: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    tagText: {
      fontSize: theme.typography.fontSize.sm,
      color: "#FFFFFF",
      fontWeight: theme.typography.fontWeight.medium,
    },
    bottomSpacing: {
      height: 100,
    },
  });

export { QuoteDetailScreen };
