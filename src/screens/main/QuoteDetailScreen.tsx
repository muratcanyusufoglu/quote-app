import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import {MoodMotivationModal} from "../../components/ui/MoodMotivationModal";
import {ShareButton} from "../../components/ui/ShareButton";
import {useAnalytics} from "../../hooks/useAnalytics";
import {useMoodMotivation} from "../../hooks/useMoodMotivation";
import {useStoryReading} from "../../hooks/usePurchase";
import {useQuoteDetail} from "../../hooks/useQuoteService";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import {
  useOnboardingHydrated,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import {usePurchaseHydrated} from "../../store/usePurchaseStore";
import {
  useActions,
  useFavoriteQuotes,
  useQuoteHydrated,
} from "../../store/useQuoteStore";
import {useTheme} from "../../utils/ThemeContext";

const QUOTE_READ_DELAY = 10000; // 10 saniye

const QuoteDetailScreen: React.FC = () => {
  const {theme, isDark} = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const quoteId = params.id as string;
  const readTimerRef = useRef<number | null>(null);

  // Mood modal state
  const [isMoodModalVisible, setIsMoodModalVisible] = useState(false);
  const userPreferences = useUserPreferences();

  // Mood motivation hook
  const {
    isLoading: isGenerating,
    generatedMessage,
    error: moodError,
    generateMotivation,
    clearMessage,
  } = useMoodMotivation();

  // Analytics
  const {trackScreen, trackQuoteView, trackQuoteFavorite} = useAnalytics();

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
  const {markAsRead, addToFavorites, removeFromFavorites} = useActions();

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

  const {quote, category, canAccess, isFavorite, toggleFavorite} =
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

  const handleHomePress = () => {
    router.push("/");
  };

  // Mood modal handlers
  const handleMoodIconPress = () => {
    setIsMoodModalVisible(true);
  };

  const handleMoodModalClose = () => {
    setIsMoodModalVisible(false);
    clearMessage();
  };

  const handleMoodComplete = async (moodResponse: any) => {
    setIsMoodModalVisible(false);

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

  return (
    <BaseScreen useGradientBackground={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HTML-style Header */}
        <View style={styles.header}>
          <View style={styles.leftButtons}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                {backgroundColor: theme.colors.whiteOverlay20},
              ]}
              onPress={handleHomePress}
              activeOpacity={0.7}
            >
              <IconSymbol
                name="home"
                size={18}
                color={theme.colors.text}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerButton,
                {backgroundColor: theme.colors.whiteOverlay20},
              ]}
              onPress={handleMoodIconPress}
              activeOpacity={0.7}
            >
              <IconSymbol
                name="brain"
                size={18}
                color={theme.colors.text}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.categoryPill,
              {backgroundColor: theme.colors.whiteOverlay20},
            ]}
          >
            <Text style={[styles.categoryText, {color: theme.colors.text}]}>
              {category?.name || quote.category}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.headerButton,
              {backgroundColor: theme.colors.whiteOverlay20},
            ]}
            onPress={handleFavoritePress}
          >
            <IconSymbol
              name={isFavorite ? "heart.solid" : "heart"}
              size={18}
              color={isFavorite ? theme.colors.favoriteRed : theme.colors.text}
              strokeWidth={isFavorite ? 0 : 2}
            />
          </TouchableOpacity>
        </View>

        {/* Main Quote Content */}
        <View style={styles.mainQuoteSection}>
          <Text style={[styles.quoteText, {color: theme.colors.text}]}>
            "{quote.text}"
          </Text>

          {quote.author && (
            <Text
              style={[styles.authorText, {color: theme.colors.textSecondary}]}
            >
              — {quote.author}
            </Text>
          )}
        </View>

        {/* Share and Favorite Actions */}
        <View style={styles.footerSection}>
          <View
            style={[
              styles.actionsRow,
              {backgroundColor: theme.colors.whiteOverlay20},
            ]}
          >
            <ShareButton
              quote={quote}
              size={22}
              iconColor={theme.colors.textSecondary}
              backgroundColor="transparent"
              style={styles.actionButton}
            />

            <View
              style={[
                styles.actionDivider,
                {backgroundColor: theme.colors.whiteOverlay25},
              ]}
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavoritePress}
            >
              <IconSymbol
                name={isFavorite ? "heart.solid" : "heart"}
                size={22}
                color={
                  isFavorite
                    ? theme.colors.favoriteRed
                    : theme.colors.textSecondary
                }
                strokeWidth={isFavorite ? 0 : 2}
              />
            </TouchableOpacity>
          </View>

          {/* Home Indicator */}
          <View style={styles.homeIndicatorContainer}>
            <View
              style={[
                styles.homeIndicator,
                {backgroundColor: theme.colors.textSecondary + "40"},
              ]}
            />
          </View>
        </View>

        {/* Story Section */}
        {quote.story && (
          <View style={styles.storySection}>
            <View style={styles.storyHeader}>
              <Text style={[styles.storyTitle, {color: theme.colors.text}]}>
                {quote.story.title}
              </Text>
            </View>

            {canAccess ? (
              <View style={styles.storyContent}>
                <Text style={[styles.storyText, {color: theme.colors.text}]}>
                  {quote.story.content}
                </Text>
              </View>
            ) : (
              <View style={styles.premiumLockContainer}>
                <IconSymbol
                  name="lock"
                  size={32}
                  color={theme.colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.premiumLockText,
                    {color: theme.colors.textSecondary},
                  ]}
                >
                  {quoteDetail.story_premium_required}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => console.log("Navigate to purchase")}
                >
                  <Text
                    style={[
                      styles.upgradeButtonText,
                      {color: theme.colors.background},
                    ]}
                  >
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

        {/* Bottom Spacing - Reduced for better UX */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Mood Motivation Modal */}
      <MoodMotivationModal
        isVisible={isMoodModalVisible}
        onClose={handleMoodModalClose}
      />
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
      paddingHorizontal: 12,
      paddingTop: 20,
      paddingBottom: 40,
    },
    // HTML-style header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    leftButtons: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryText: {
      fontSize: 13,
      fontWeight: "500",
      textTransform: "capitalize",
    },
    // Main quote section
    mainQuoteSection: {
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    quoteText: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 38,
      marginBottom: theme.spacing.md,
      letterSpacing: -0.5,
    },
    authorText: {
      fontSize: 16,
      textAlign: "center",
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    // HTML-style footer section
    footerSection: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 6,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
    },
    actionDivider: {
      width: 1,
      height: 20,
    },
    homeIndicatorContainer: {
      alignItems: "center",
      marginTop: 8,
    },
    homeIndicator: {
      width: 120,
      height: 4,
      borderRadius: 2,
    },
    // Story section
    storySection: {
      backgroundColor: theme.colors.whiteOverlay10,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      marginHorizontal: theme.spacing.sm,
    },
    storyHeader: {
      marginBottom: theme.spacing.lg,
    },
    storyTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
    },
    storyContent: {
      // Content styling
    },
    storyText: {
      fontSize: theme.typography.fontSize.md,
      lineHeight: 24,
      marginBottom: theme.spacing.xl,
    },
    premiumLockContainer: {
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    premiumLockText: {
      fontSize: theme.typography.fontSize.md,
      textAlign: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    upgradeButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: 999,
      alignItems: "center",
    },
    upgradeButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    limitWarningContainer: {
      backgroundColor: theme.colors.whiteOverlay10,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    limitWarningText: {
      fontSize: theme.typography.fontSize.md,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    tagsSection: {
      marginBottom: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
    },
    tagsTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      marginBottom: theme.spacing.md,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    tag: {
      backgroundColor: theme.colors.whiteOverlay20,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay25,
    },
    tagText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    bottomSpacing: {
      height: 40,
    },
  });

export {QuoteDetailScreen};
