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
  onShare?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Color mapping moved to utility - following SRP and OCP principles

export function QuoteReelCard({
  quote,
  isFavorite,
  onPress,
  onFavoritePress,
  onShare,
}: QuoteReelCardProps) {
  const cardColor = getCategoryColor(quote.category);

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
        <IconSymbol name="search" size={20} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <QuoteContent quote={quote} />
      </View>

      {/* Bottom Actions */}
      <QuoteActions
        isFavorite={isFavorite}
        onFavoritePress={onFavoritePress}
        onShare={onShare}
        category={quote.category}
        readTime={quote.readTime}
      />

      {/* Navigation Help Text */}
      <View style={styles.helpContainer}>
        <View style={styles.helpTextContainer}>
          <IconSymbol
            name="search"
            size={10}
            color="rgba(255, 255, 255, 0.7)"
            strokeWidth={2}
          />
          <Text style={styles.helpTextSeparator}>Explore • </Text>
          <IconSymbol
            name="heart"
            size={10}
            color="rgba(255, 255, 255, 0.7)"
            strokeWidth={2}
          />
          <Text style={styles.helpTextSeparator}>Favorite • </Text>
          <IconSymbol
            name="square.and.arrow.up"
            size={10}
            color="rgba(255, 255, 255, 0.7)"
            strokeWidth={2}
          />
          <Text style={styles.helpText}>Share</Text>
        </View>
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
  // Content
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 100,
  },
  // Removed styles: Moved to QuoteContent and QuoteActions components
  // This follows SRP - each component manages its own styles
  // Help text at bottom
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  helpTextSeparator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginHorizontal: 4,
  },
  helpText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
