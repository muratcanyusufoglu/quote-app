import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import categoriesData from "../../data/categories.json";
import {useTranslation} from "../../hooks/useTranslation";
import {Language, LocalizedQuote} from "../../types";
import {useTheme} from "../../utils/ThemeContext";
import {QuoteActions} from "./QuoteActions";
import {QuoteContent} from "./QuoteContent";

interface QuoteReelCardProps {
  quote: LocalizedQuote;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onShare?: (quote: LocalizedQuote) => void;
  onQuoteAction?: (actionType: string) => void;
  onMoodIconPress?: () => void;
}

const {width: screenWidth, height: screenHeight} = Dimensions.get("window");

// Utility function to get localized category name
const getCategoryLocalizedName = (
  categoryId: string,
  language: Language
): string => {
  const category = categoriesData.categories.find(
    (cat) => cat.id === categoryId
  );
  if (!category) {
    return categoryId;
  }

  const names = category.names as any;
  return names[language] || names.en || categoryId;
};

export function QuoteReelCard({
  quote,
  isFavorite,
  onPress,
  onFavoritePress,
  onShare,
  onQuoteAction,
  onMoodIconPress,
}: QuoteReelCardProps) {
  const {theme} = useTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const cardColor = theme.colors.brandYellow;
  const localizedCategoryName = getCategoryLocalizedName(
    quote.category,
    quote.language
  );

  // Responsive calculation for header position below "ÜCRETSİZ" badge
  // Badge is positioned at: top: insets.top, left: 16
  // Badge actual rendered height: paddingVertical 4*2=8px + fontSize 11 with lineHeight ~14px + borderWidth 1.5*2=3px = ~25px
  // Position header directly at badge bottom with zero gap - header top edge touches badge bottom edge
  const badgeActualHeight = 25; // Actual rendered badge height
  const headerTop = badgeActualHeight + 2; // Header top edge = badge bottom edge (no gap)

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
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />

      {/* Radial Yellow Accent Overlay */}
      <LinearGradient
        colors={theme.colors.radialOverlayColors as any}
        locations={[0, 0.5, 1]}
        start={{x: 0.5, y: 0.3}}
        end={{x: 0.5, y: 0.8}}
        style={styles.radialOverlay}
      />

      {/* Top Header - HTML Style */}
      <View
        style={[
          styles.header,
          {
            // Position header directly at badge bottom with zero gap
            // Badge bottom = insets.top + badge height, header starts exactly there
            top: headerTop,
            backgroundColor: "transparent",
            marginTop: 0, // Ensure no margin
            paddingTop: 0, // Ensure no padding
          },
        ]}
      >
        {onMoodIconPress ? (
          <TouchableOpacity
            style={[
              styles.headerButton,
              {backgroundColor: theme.colors.whiteOverlay25},
            ]}
            onPress={onMoodIconPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="brain"
              size={18}
              color={theme.colors.text}
              strokeWidth={2}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        <View
          style={[
            styles.categoryPill,
            {backgroundColor: theme.colors.whiteOverlay25},
          ]}
        >
          <Text style={[styles.categoryText, {color: theme.colors.text}]}>
            {localizedCategoryName}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.headerButton,
            {backgroundColor: theme.colors.whiteOverlay25},
          ]}
          onPress={navigateToExplore}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="menu"
            size={18}
            color={theme.colors.text}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Main Quote Content - Centered */}
      <View style={styles.mainContent}>
        <QuoteContent quote={quote} />
      </View>

      {/* Footer Section - HTML Style */}
      <View style={styles.footer}>
        {/* Read Story Button */}
        <TouchableOpacity
          style={[
            styles.readStoryButton,
            {backgroundColor: theme.colors.primary},
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <IconSymbol
            name="book"
            size={14}
            color={theme.colors.text}
            strokeWidth={2}
          />
          <Text style={[styles.readStoryText, {color: theme.colors.text}]}>
            {t("quote_detail.read_story")}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons Container */}
        <View
          style={[
            styles.actionsContainer,
            {backgroundColor: theme.colors.whiteOverlay20},
          ]}
        >
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
  // HTML-style header
  header: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 10,
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
  // Main content area
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 200,
  },
  // HTML-style footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 35,
    zIndex: 1000,
  },
  readStoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 999,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 6,
  },
  readStoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionsContainer: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 60,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeIndicatorContainer: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
  },
});
