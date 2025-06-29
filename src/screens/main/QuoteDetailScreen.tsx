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
import { useStoryReading } from "../../hooks/usePurchase";
import { useQuoteDetail } from "../../hooks/useQuoteService";
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

  const styles = createStyles(theme);

  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </BaseScreen>
    );
  }

  if (!quoteDetail || !quoteDetail.quote) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Quote bulunamadı</Text>
          <Text style={styles.errorDescription}>
            Aradığınız quote mevcut değil veya kaldırılmış.
          </Text>
        </View>
      </BaseScreen>
    );
  }

  const { quote, category, canAccess, isFavorite, toggleFavorite } =
    quoteDetail;

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
    <BaseScreen useGradientBackground={true}>
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
            <IconSymbol
              name="heart"
              size={18}
              color={isFavorite ? "#ff6b6b" : "rgba(255, 255, 255, 0.8)"}
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

            <View style={styles.readTimeContainer}>
              <Text style={styles.readTimeText}>{quote.readTime} dk okuma</Text>
            </View>
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
                    {quote.story.readTime} dk okuma
                  </Text>
                </View>
                {!storyReading.isPremium && (
                  <Text style={styles.remainingReads}>
                    Bugün {storyReading.remainingReads} hikaye kaldı
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
                  <Text style={styles.readStoryButtonText}>
                    Okundu İşaretle
                  </Text>
                </TouchableOpacity>
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
                  Bu hikaye Premium üyelikle kullanılabilir
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => console.log("Navigate to purchase")}
                >
                  <Text style={styles.upgradeButtonText}>
                    Premium'a Yükselt
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
              <Text style={styles.upgradeButtonText}>Sınırsız Hikaye Aç</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tags */}
        {quote.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>İlgili Konular</Text>
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
    readTimeContainer: {
      backgroundColor: "rgba(54, 69, 79, 0.2)",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    readTimeText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSoft,
      fontWeight: theme.typography.fontWeight.medium,
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
    readStoryButton: {
      backgroundColor: theme.colors.brandYellow,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
    },
    readStoryButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textSoft,
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
