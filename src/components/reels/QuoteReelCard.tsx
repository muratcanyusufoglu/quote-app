import { LinearGradient } from "expo-linear-gradient";
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
import { useTheme } from "../../utils/ThemeContext";
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
  const { theme } = useTheme();
  // Tek renk kullan - kategori rengine göre değişmesin
  const cardColor = theme.colors.brandYellow;

  const navigateToExplore = () => {
    router.push("/(tabs)/explore");
  };

  const handlePress = () => {
    onQuoteAction?.("view_detail");
    onPress();
  };

  return (
    <View style={styles.container}>
      {/* Theme-based Gradient Background */}
      <LinearGradient
        colors={theme.colors.gradientColors as any}
        locations={theme.colors.gradientLocations as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Radial Yellow Accent Overlay */}
      <LinearGradient
        colors={theme.colors.radialOverlayColors as any}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 0.8 }}
        style={styles.radialOverlay}
      />

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={navigateToExplore}
        >
          <IconSymbol
            name="search"
            size={20}
            color={theme.colors.white}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Main Quote Card with Stack Effect */}
      <View style={styles.cardContainer}>
        {/* Background Cards - More Dramatic Stack Effect */}
        <View
          style={[
            styles.cardStack,
            styles.cardStackThird,
            { backgroundColor: cardColor, opacity: 0.8 },
          ]}
        />
        <View
          style={[
            styles.cardStack,
            styles.cardStackSecond,
            { backgroundColor: cardColor, opacity: 0.9 },
          ]}
        />

        {/* Main Active Card */}
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
          quote={quote}
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
            color={theme.colors.whiteOverlay80}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.helpTextSeparator,
              { color: theme.colors.whiteOverlay80 },
            ]}
          >
            Explore •{" "}
          </Text>
          <IconSymbol
            name="heart"
            size={10}
            color={theme.colors.whiteOverlay80}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.helpTextSeparator,
              { color: theme.colors.whiteOverlay80 },
            ]}
          >
            Favorite •{" "}
          </Text>
          <IconSymbol
            name="square.and.arrow.up"
            size={10}
            color={theme.colors.whiteOverlay80}
            strokeWidth={2}
          />
          <Text
            style={[styles.helpText, { color: theme.colors.whiteOverlay80 }]}
          >
            Share
          </Text>
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
    backgroundColor: "transparent",
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 100,
    // Allow overflow for stack effect
    overflow: "visible",
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
    elevation: 10,
    position: "relative",
    zIndex: 5,
  },
  actionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 32,
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  helpTextSeparator: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  helpText: {
    fontSize: 12,
  },
  cardStack: {
    position: "absolute",
    width: "100%",
    maxWidth: 340,
    minHeight: 400,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardStackThird: {
    transform: [{ scale: 0.95 }, { translateY: 25 }],
    zIndex: 1,
  },
  cardStackSecond: {
    transform: [{ scale: 0.97 }, { translateY: 12 }],
    zIndex: 2,
  },
  stackCardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  stackTextLine: {
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  radialOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
