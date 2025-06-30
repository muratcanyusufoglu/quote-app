import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useQuoteService } from "../../hooks/useQuoteService";
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
}

const { height: screenHeight } = Dimensions.get("window");
const QUOTES_PER_PAGE = 10;

export function QuoteReels({
  initialQuotes = [],
  onQuoteView,
  onQuoteAction,
  refreshControl = true,
}: QuoteReelsProps) {
  const { theme } = useTheme();
  const [quotes, setQuotes] = useState<LocalizedQuote[]>(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreQuotes, setHasMoreQuotes] = useState(true);
  const [viewedQuotes, setViewedQuotes] = useState<Set<string>>(new Set());

  // Store data
  const favoriteQuotes = useFavoriteQuotes();
  const seenQuotes = useSeenQuotes();
  const { markAsRead, addToFavorites, removeFromFavorites } = useActions();

  // Quote service
  const { getHomeFeedQuotes, getExploreQuotes } = useQuoteService();

  // Memoized available quotes - aynı gün içinde tüm quote'lar görülebilir
  const availableQuotes = useMemo(() => {
    // Aynı gün içinde quote'lar tekrar görülebilir olmalı
    // Sadece yeni quote'lar yüklendikçe liste genişler
    console.log("🔍 Total quotes:", quotes.length);
    console.log("👀 Seen quotes:", seenQuotes.length);
    console.log("✅ Available quotes (all):", quotes.length);
    return quotes; // Tüm quote'ları göster, seen/unseen filtrelemesi yapma
  }, [quotes, seenQuotes]);

  // Load initial quotes if not provided
  useEffect(() => {
    if (quotes.length === 0) {
      if (initialQuotes.length === 0) {
        console.log("🚀 No initial quotes provided, loading...");
        loadInitialQuotes();
      } else {
        console.log("📦 Using provided initial quotes:", initialQuotes.length);
        // Unique initial quotes'ları al
        const uniqueInitialQuotes = initialQuotes.filter(
          (quote, index, self) =>
            index === self.findIndex((q) => q.id === quote.id)
        );
        setQuotes(uniqueInitialQuotes);
      }
    }
  }, []); // Sadece ilk mount'ta çalış

  const loadInitialQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔄 QuoteReels: Loading initial quotes...");
      const newQuotes = getHomeFeedQuotes(QUOTES_PER_PAGE);

      // Unique quote'ları al
      const uniqueQuotes = newQuotes.filter(
        (quote, index, self) =>
          index === self.findIndex((q) => q.id === quote.id)
      );

      console.log("📚 QuoteReels: Loaded quotes:", uniqueQuotes.length);
      console.log("📖 QuoteReels: First quote:", uniqueQuotes[0]);
      setQuotes(uniqueQuotes);
      setCurrentPage(1);
      setHasMoreQuotes(uniqueQuotes.length === QUOTES_PER_PAGE);
    } catch (error) {
      console.error("❌ QuoteReels: Error loading initial quotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getHomeFeedQuotes]);

  const loadMoreQuotes = useCallback(async () => {
    if (isLoading || !hasMoreQuotes) return;

    try {
      setIsLoading(true);

      // Get more quotes based on current page
      const moreQuotes = getExploreQuotes(
        [], // No specific categories - get from all available
        QUOTES_PER_PAGE
      );

      if (moreQuotes.length > 0) {
        setQuotes((prevQuotes) => {
          // Duplicate quote'ları filtrele
          const existingIds = new Set(prevQuotes.map((q) => q.id));
          const newUniqueQuotes = moreQuotes.filter(
            (quote) => !existingIds.has(quote.id)
          );

          console.log("📥 New quotes to add:", newUniqueQuotes.length);
          return [...prevQuotes, ...newUniqueQuotes];
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
  }, [isLoading, hasMoreQuotes, seenQuotes, quotes, getExploreQuotes]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      console.log("🔄 Refreshing quotes...");
      const freshQuotes = getHomeFeedQuotes(QUOTES_PER_PAGE);

      // Unique quote'ları al
      const uniqueQuotes = freshQuotes.filter(
        (quote, index, self) =>
          index === self.findIndex((q) => q.id === quote.id)
      );

      console.log("🔄 Fresh quotes loaded:", uniqueQuotes.length);
      setQuotes(uniqueQuotes);
      setCurrentPage(1);
      setHasMoreQuotes(true);
      setViewedQuotes(new Set());
    } catch (error) {
      console.error("Error refreshing quotes:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getHomeFeedQuotes]);

  const handleQuotePress = useCallback(
    (quote: LocalizedQuote) => {
      // Quote detay sayfasına git, ancak hemen "okundu" olarak işaretleme
      // Quote sadece detay sayfasında uzun süre kalındığında okundu işaretlenecek
      onQuoteView?.(quote);
      router.push(`/quote-detail/${quote.id}`);
    },
    [onQuoteView]
  );

  const handleFavoritePress = useCallback(
    (quoteId: string) => {
      if (favoriteQuotes.includes(quoteId)) {
        removeFromFavorites(quoteId);
      } else {
        addToFavorites(quoteId);
      }
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
      }\n\n📱 Open in Quote App: ${deepLinkUrl}\n🌐 View online: ${webUrl}`;

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
      />
    ),
    [
      favoriteQuotes,
      handleQuotePress,
      handleFavoritePress,
      handleShare,
      handleQuoteAction,
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
            text: "Yeni quote'lar yükleniyor...",
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
      <FlatList
        data={availableQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={keyExtractor}
        pagingEnabled
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
});
