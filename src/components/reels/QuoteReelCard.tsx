import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LocalizedQuote } from "../../types";
import { darkTheme } from "../../utils/theme";

interface QuoteReelCardProps {
  quote: LocalizedQuote;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onShare?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const getCardColorByCategory = (category: string): string => {
  const colorMap: Record<string, string> = {
    motivation: "#6366F1",
    motivasyon: "#6366F1",
    success: "#10B981",
    basari: "#10B981",
    happiness: "#F59E0B",
    mutluluk: "#F59E0B",
    wisdom: "#8B5CF6",
    bilgelik: "#8B5CF6",
    love: "#EF4444",
    ask: "#EF4444",
    peace: "#06B6D4",
    huzur: "#06B6D4",
    growth: "#84CC16",
    gelisim: "#84CC16",
    general: "#6B7280",
    genel: "#6B7280",
  };

  return colorMap[category.toLowerCase()] || darkTheme.colors.primary;
};

export function QuoteReelCard({
  quote,
  isFavorite,
  onPress,
  onFavoritePress,
  onShare,
}: QuoteReelCardProps) {
  const cardColor = getCardColorByCategory(quote.category);

  const navigateToExplore = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Background */}
      <View style={[styles.background, { backgroundColor: cardColor }]} />

      {/* Top Right - Simple Explore Button */}
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={navigateToExplore}
      >
        <Text style={styles.exploreIcon}>🔍</Text>
      </TouchableOpacity>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Quote Text */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{quote.text}</Text>
          {quote.author && (
            <Text style={styles.authorText}>— {quote.author}</Text>
          )}

          {/* Read More Hint */}
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>
              📖{" "}
              {quote.language === "tr"
                ? "Hikayeyi okumak için dokunun"
                : "Tap to read the story"}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Section - More Visible */}
      <View style={styles.bottomSection}>
        {/* Left: Category Tag */}
        <View style={styles.leftActions}>
          <Text style={styles.categoryTag}>#{quote.category}</Text>
          <Text style={styles.readTimeText}>📖 {quote.readTime} dk</Text>
        </View>

        {/* Right: Action Buttons */}
        <View style={styles.rightActions}>
          {onShare && (
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Text style={styles.actionIcon}>📤</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onFavoritePress}
          >
            <Text style={styles.actionIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>🔍 Explore • ❤️ Favorite • 📤 Share</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    position: "relative",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  // Top right explore button
  exploreButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  exploreIcon: {
    fontSize: 24,
  },
  // Content
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 100,
  },
  quoteContainer: {
    alignItems: "center",
  },
  quoteText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 32,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  authorText: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 24,
  },
  // Read more hint
  readMoreContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  readMoreText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
  },
  // Bottom section - improved visibility
  bottomSection: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  leftActions: {
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  readTimeText: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  actionButton: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 28,
  },
  // Help text at bottom
  helpContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  helpText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: "center",
  },
});
