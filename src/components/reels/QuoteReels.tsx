import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDailyLimit } from "../../hooks/useDailyLimit";
import { usePaywall } from "../../hooks/usePaywall";
import { useQuoteService } from "../../hooks/useQuoteService";
import { useTranslation } from "../../hooks/useTranslation";
import {
  useActions,
  useFavoriteQuotes,
  useSeenQuotes,
} from "../../store/useQuoteStore";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";
import { QuoteReelCard } from "./QuoteReelCard";

interface QuoteReelsProps {
  initialQuotes?: LocalizedQuote[];
  onQuoteView?: (quote: LocalizedQuote) => void;
  onQuoteAction?: (actionType: string) => void;
  refreshControl?: boolean;
  categoryFilter?: string | null;
  onMoodIconPress?: () => void;
}

const { height: screenHeight } = Dimensions.get("window");
const QUOTES_PER_PAGE = 10;

export function QuoteReels({
  initialQuotes = [],
  onQuoteView,
  onQuoteAction,
  refreshControl = true,
  categoryFilter = null,
  onMoodIconPress,
}: QuoteReelsProps) {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [quotes, setQuotes] = useState<LocalizedQuote[]>(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreQuotes, setHasMoreQuotes] = useState(true);
  const [viewedQuotes, setViewedQuotes] = useState<Set<string>>(new Set());
  const [isFavoriteActionInProgress, setIsFavoriteActionInProgress] =
    useState(false);

  // Store data
  const favoriteQuotes = useFavoriteQuotes();
  const seenQuotes = useSeenQuotes();
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  // Quote service
  const { getHomeFeedQuotes, getExploreQuotes } = useQuoteService();

  // Daily limit control
  const { hasReachedDailyLimit, isPremium } = useDailyLimit();

  // Paywall control
  const { showPaywall } = usePaywall();

  // Translations
  const { t } = useTranslation();

  // Memoized available quotes - aynı gün içinde tüm quote'lar görülebilir
  const availableQuotes = useMemo(() => {
    if (__DEV__) {
      console.log("🔍 Total quotes:", quotes.length);
      console.log("👀 Seen quotes:", seenQuotes.length);
      console.log("✅ Available quotes (all):", quotes.length);
    }
    return quotes;
  }, [quotes, seenQuotes]);

  // Load initial quotes if not provided
  useEffect(() => {
    if (quotes.length === 0) {
      if (initialQuotes.length === 0) {
        if (__DEV__) console.log("🚀 No initial quotes provided, loading...");
        loadInitialQuotes();
      } else {
        if (__DEV__)
          console.log(
            "📦 Using provided initial quotes:",
            initialQuotes.length
          );
        const uniqueInitialQuotes = initialQuotes.filter(
          (quote, index, self) =>
            index === self.findIndex((q) => q.id === quote.id)
        );
        setQuotes(uniqueInitialQuotes);
      }
    }
  }, []); // Sadece ilk mount'ta çalış

  // Reload quotes when category filter or initial quotes change
  useEffect(() => {
    if (initialQuotes.length > 0) {
      if (__DEV__)
        console.log(
          "📦 Initial quotes changed, updating:",
          initialQuotes.length
        );
      const uniqueInitialQuotes = initialQuotes.filter(
        (quote, index, self) =>
          index === self.findIndex((q) => q.id === quote.id)
      );
      setQuotes(uniqueInitialQuotes);
      setCurrentPage(1);
      setHasMoreQuotes(true);
      setViewedQuotes(new Set());
    }
  }, [initialQuotes, categoryFilter]);

  const loadInitialQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      if (__DEV__) console.log("🔄 QuoteReels: Loading initial quotes...");

      let newQuotes: LocalizedQuote[];

      if (categoryFilter) {
        if (__DEV__)
          console.log(`📂 Loading quotes from category: ${categoryFilter}`);
        newQuotes = getExploreQuotes([categoryFilter], QUOTES_PER_PAGE);
      } else {
        newQuotes = getHomeFeedQuotes(QUOTES_PER_PAGE);
      }

      const uniqueQuotes = newQuotes.filter(
        (quote, index, self) =>
          index === self.findIndex((q) => q.id === quote.id)
      );

      if (__DEV__) {
        console.log("📚 QuoteReels: Loaded quotes:", uniqueQuotes.length);
        console.log("📖 QuoteReels: First quote:", uniqueQuotes[0]);
      }
      setQuotes(uniqueQuotes);
      setCurrentPage(1);
      setHasMoreQuotes(uniqueQuotes.length === QUOTES_PER_PAGE);
    } catch (error) {
      console.error("❌ QuoteReels: Error loading initial quotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getHomeFeedQuotes, getExploreQuotes, categoryFilter]);

  const loadMoreQuotes = useCallback(async () => {
    if (isLoading || !hasMoreQuotes) return;

    try {
      setIsLoading(true);

      let moreQuotes: LocalizedQuote[];

      if (categoryFilter) {
        if (__DEV__)
          console.log(
            `📂 Loading more quotes from category: ${categoryFilter}`
          );
        moreQuotes = getExploreQuotes([categoryFilter], QUOTES_PER_PAGE);

        if (moreQuotes.length === 0) {
          if (__DEV__)
            console.log(
              `🔄 No more quotes in ${categoryFilter}, cycling back to beginning`
            );
          moreQuotes = getExploreQuotes([categoryFilter], QUOTES_PER_PAGE);
        }
      } else {
        moreQuotes = getExploreQuotes([], QUOTES_PER_PAGE);
      }

      if (moreQuotes.length > 0) {
        setQuotes((prevQuotes) => {
          if (categoryFilter) {
            if (__DEV__)
              console.log(
                "📥 Adding quotes for category (allowing duplicates):",
                moreQuotes.length
              );
            return [...prevQuotes, ...moreQuotes];
          } else {
            const existingIds = new Set(prevQuotes.map((q) => q.id));
            const newUniqueQuotes = moreQuotes.filter(
              (quote) => !existingIds.has(quote.id)
            );
            if (__DEV__)
              console.log(
                "📥 New unique quotes to add:",
                newUniqueQuotes.length
              );
            return [...prevQuotes, ...newUniqueQuotes];
          }
        });
        setCurrentPage((prev) => prev + 1);
        setHasMoreQuotes(moreQuotes.length === QUOTES_PER_PAGE);
      } else {
        setHasMoreQuotes(false);
      }
    } catch (error) {
      console.error("Error loading more quotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    hasMoreQuotes,
    seenQuotes,
    quotes,
    getExploreQuotes,
    categoryFilter,
  ]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      if (__DEV__) console.log("🔄 Refreshing quotes...");

      let freshQuotes: LocalizedQuote[];

      if (categoryFilter) {
        if (__DEV__)
          console.log(`🔄 Refreshing quotes from category: ${categoryFilter}`);
        freshQuotes = getExploreQuotes([categoryFilter], QUOTES_PER_PAGE);
      } else {
        freshQuotes = getHomeFeedQuotes(QUOTES_PER_PAGE);
      }

      const uniqueQuotes = freshQuotes.filter(
        (quote, index, self) =>
          index === self.findIndex((q) => q.id === quote.id)
      );

      if (__DEV__) console.log("🔄 Fresh quotes loaded:", uniqueQuotes.length);
      setQuotes(uniqueQuotes);
      setCurrentPage(1);
      setHasMoreQuotes(true);
      setViewedQuotes(new Set());
    } catch (error) {
      console.error("Error refreshing quotes:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getHomeFeedQuotes, getExploreQuotes, categoryFilter]);

  const handleQuotePress = useCallback(
    (quote: LocalizedQuote) => {
      onQuoteView?.(quote);
      router.push(`/quote-detail/${quote.id}`);
    },
    [onQuoteView]
  );

  const handleFavoritePress = useCallback(
    (quoteId: string) => {
      // Prevent scrolling during favorite action
      setIsFavoriteActionInProgress(true);

      // Store current scroll position to maintain it
      if (flatListRef.current) {
        flatListRef.current.setNativeProps({
          scrollEnabled: false,
        });
      }

      if (favoriteQuotes.includes(quoteId)) {
        removeFromFavorites(quoteId);
      } else {
        addToFavorites(quoteId);
      }

      // Re-enable scrolling after action is complete
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.setNativeProps({
            scrollEnabled: true,
          });
        }
        setIsFavoriteActionInProgress(false);
      }, 300);
    },
    [favoriteQuotes, addToFavorites, removeFromFavorites]
  );

  const handleShare = useCallback(async (quote: LocalizedQuote) => {
    try {
      // Create deep link URL for the quote
      const deepLinkUrl = `quote://quote-detail/${quote.id}`;
      const webUrl = `https://quote-app.com/quote/${quote.id}`; // Replace with your actual web domain

      // Create formatted share message
      const shareMessage = `"${quote.text}"${
        quote.author ? `\n\n— ${quote.author}` : ""
      }\n\n📱 Open in Quote App: ${deepLinkUrl}`;

      // Use React Native Share API
      const result = await Share.share({
        title: "Inspiring Quote",
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        console.log("✅ Quote shared successfully");
      }
    } catch (error) {
      console.error("❌ Error sharing quote:", error);

      // Show user-friendly error
      Alert.alert("Share Failed", "Unable to share quote. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, []);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      // Don't trigger viewable items change during favorite actions
      if (isFavoriteActionInProgress) {
        return;
      }

      // Mark quotes as viewed when they become visible
      viewableItems.forEach((item: any) => {
        const quote = item.item as LocalizedQuote;
        if (!viewedQuotes.has(quote.id)) {
          setViewedQuotes((prev) => new Set([...prev, quote.id]));
          onQuoteView?.(quote);
        }
      });
    },
    [viewedQuotes, onQuoteView]
  );

  const handleEndReached = useCallback(() => {
    if (hasMoreQuotes && !isLoading) {
      loadMoreQuotes();
    }
  }, [hasMoreQuotes, isLoading, loadMoreQuotes]);

  const handleQuoteAction = (actionType: string) => {
    onQuoteAction?.(actionType);
  };

  const renderQuoteItem = useCallback(
    ({ item }: { item: LocalizedQuote }) => (
      <QuoteReelCard
        quote={item}
        isFavorite={favoriteQuotes.includes(item.id)}
        onPress={() => handleQuotePress(item)}
        onFavoritePress={() => {
          handleFavoritePress(item.id);
          handleQuoteAction("favorite");
        }}
        onShare={() => {
          handleShare(item);
          handleQuoteAction("share");
        }}
        onQuoteAction={handleQuoteAction}
        onMoodIconPress={onMoodIconPress}
      />
    ),
    [
      favoriteQuotes,
      handleQuotePress,
      handleFavoritePress,
      handleShare,
      handleQuoteAction,
      onMoodIconPress,
    ]
  );

  const keyExtractor = useCallback(
    (item: LocalizedQuote, index: number) => `${item.id}_${index}`,
    []
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: screenHeight,
      offset: screenHeight * index,
      index,
    }),
    []
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 100,
    }),
    []
  );

  if (availableQuotes.length === 0 && !isLoading) {
    return (
      <View style={styles.noDataContainer}>
        <QuoteReelCard
          quote={{
            id: "empty",
            text: t("common.loading"),
            author: "",
            category: "motivation",
            tags: [],
            language: "tr",
            readTime: 1,
          }}
          isFavorite={false}
          onPress={() => {}}
          onFavoritePress={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Daily Limit Warning Banner */}

      <FlatList
        ref={flatListRef}
        data={availableQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={keyExtractor}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={handleViewableItemsChanged}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        scrollEnabled={
          !isFavoriteActionInProgress && (!hasReachedDailyLimit() || isPremium)
        }
        scrollEventThrottle={16}
        refreshControl={
          refreshControl ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.white}
            />
          ) : undefined
        }
      />
      {hasReachedDailyLimit() && !isPremium && (
        <View
          style={[
            styles.limitWarningBanner,
            {
              backgroundColor: theme.colors.whiteOverlay20,
              borderColor: theme.colors.whiteOverlay25,
            },
          ]}
        >
          <View style={styles.limitWarningContent}>
            <View
              style={[
                styles.limitWarningIcon,
                { backgroundColor: theme.colors.brandYellow },
              ]}
            >
              <Text style={styles.limitWarningIconText}>
                ⚠️
              </Text>
            </View>
            <Text
              style={[
                styles.limitWarningText,
                { color: theme.colors.text },
              ]}
              numberOfLines={2}
            >
              {t("paywall.daily_limit.limit_reached")}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => showPaywall("daily_limit")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.upgradeButtonText,
                { color: theme.colors.text },
              ]}
              numberOfLines={1}
            >
              {t("paywall.daily_limit.upgrade_to_premium")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  limitWarningBanner: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  limitWarningContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    flexShrink: 1,
  },
  limitWarningIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  limitWarningIconText: {
    fontSize: 16,
  },
  limitWarningText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    flexShrink: 1,
    lineHeight: 18,
  },
  upgradeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexShrink: 0,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
