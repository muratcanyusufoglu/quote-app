import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
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
  onMoodIconPress?: () => void;
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
  onMoodIconPress,
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
        {onMoodIconPress && (
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.colors.whiteOverlay10 },
            ]}
            onPress={onMoodIconPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="brain"
              size={24}
              color={theme.colors.brandYellow}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: theme.colors.whiteOverlay10 },
          ]}
          onPress={navigateToExplore}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="compass"
            size={20}
            color={theme.colors.brandYellow}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Main Quote Card - Centered */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardColor }]}
          onPress={handlePress}
          activeOpacity={0.95}
        >
          <QuoteContent quote={quote} />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions - Fixed positioning with safe area */}
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
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1001,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80, // Space for top navigation
    paddingBottom: 180, // Increased space for bottom actions
    overflow: "visible",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    minHeight: 420, // Restored tall card height
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
    bottom: 100, // Higher positioning for better visibility
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 20, // Add bottom padding for safe area
    zIndex: 10,
    minHeight: 60, // Ensure minimum height for buttons
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
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
});
