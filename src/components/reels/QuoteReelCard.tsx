import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { LocalizedQuote } from "../../types";
import { getCategoryColor } from "../../utils/categoryColors";
import { QuoteActions } from "./QuoteActions";
import { QuoteContent } from "./QuoteContent";

interface QuoteReelCardProps {
  quote: LocalizedQuote;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onShare?: (quote: LocalizedQuote) => void;
  onQuoteAction?: (actionType: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Color mapping moved to utility - following SRP and OCP principles

export function QuoteReelCard({
  quote,
  isFavorite,
  onPress,
  onFavoritePress,
  onShare,
  onQuoteAction,
}: QuoteReelCardProps) {
  const cardColor = getCategoryColor(quote.category);

  const navigateToExplore = () => {
    router.push("/(tabs)/explore");
  };

  const handlePress = () => {
    onQuoteAction?.("view_detail");
    onPress();
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient */}
      <View style={styles.backgroundGradient} />

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={navigateToExplore}
        >
          <IconSymbol name="search" size={20} color="#333" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Main Quote Card */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardColor }]}
          onPress={handlePress}
          activeOpacity={0.95}
        >
          <QuoteContent quote={quote} />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <QuoteActions
          isFavorite={isFavorite}
          onFavoritePress={onFavoritePress}
          onShare={() => onShare?.(quote)}
          category={quote.category}
          readTime={quote.readTime}
          onQuoteAction={onQuoteAction}
        />
      </View>

      {/* Navigation Help Text */}
      <View style={styles.helpContainer}>
        <View style={styles.helpTextContainer}>
          <IconSymbol
            name="search"
            size={10}
            color="rgba(0, 0, 0, 0.6)"
            strokeWidth={2}
          />
          <Text style={styles.helpTextSeparator}>Explore • </Text>
          <IconSymbol
            name="heart"
            size={10}
            color="rgba(0, 0, 0, 0.6)"
            strokeWidth={2}
          />
          <Text style={styles.helpTextSeparator}>Favorite • </Text>
          <IconSymbol
            name="square.and.arrow.up"
            size={10}
            color="rgba(0, 0, 0, 0.6)"
            strokeWidth={2}
          />
          <Text style={styles.helpText}>Share</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    position: "relative",
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8f9fa", // Light neutral background
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  exploreButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 120,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    minHeight: 400,
    borderRadius: 24,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    // Subtle gradient overlay
    position: "relative",
  },
  actionsContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    zIndex: 5,
  },
  helpContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  helpTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTextSeparator: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.6)",
    marginHorizontal: 4,
  },
  helpText: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.6)",
  },
});
