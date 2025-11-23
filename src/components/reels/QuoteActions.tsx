import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import categoriesData from "../../data/categories.json";
import { Language, LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";
import { ShareButton } from "../ui/ShareButton";

interface QuoteActionsProps {
  isFavorite: boolean;
  onFavoritePress: () => void;
  onShare?: () => void;
  quote: LocalizedQuote;
  category: string; // Category ID
  readTime: number;
  onQuoteAction?: (actionType: string) => void;
}

// Utility function to get localized category name
const getCategoryLocalizedName = (
  categoryId: string,
  language: Language
): string => {
  const category = categoriesData.categories.find(
    (cat) => cat.id === categoryId
  );
  if (!category) {
    return categoryId; // Fallback to ID if category not found
  }

  // Get localized name based on language, fallback to English
  const names = category.names as any;
  return names[language] || names.en || categoryId;
};

export const QuoteActions: React.FC<QuoteActionsProps> = ({
  isFavorite,
  onFavoritePress,
  onShare,
  quote,
  category,
  readTime,
  onQuoteAction,
}) => {
  const { theme } = useTheme();

  const handleFavoritePress = () => {
    onQuoteAction?.("favorite");
    onFavoritePress();
  };

  const handleSharePress = () => {
    onQuoteAction?.("share");
    onShare?.();
  };

  const handleShareComplete = () => {
    onQuoteAction?.("share");
  };

  // Get localized category name
  const localizedCategoryName = getCategoryLocalizedName(
    category,
    quote.language
  );

  return (
    <View style={styles.container}>
      {/* Share Button */}
      {quote ? (
        <ShareButton
          quote={quote}
          size={18}
          iconColor={theme.colors.textSecondary}
          backgroundColor="transparent"
          style={styles.actionButton}
          onShareComplete={handleShareComplete}
        />
      ) : onShare ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSharePress}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="square.and.arrow.up"
            size={18}
            color={theme.colors.textSecondary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      ) : null}

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.whiteOverlay25 }]} />

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleFavoritePress}
        activeOpacity={0.7}
      >
        <IconSymbol
          name={isFavorite ? "heart.solid" : "heart"}
          size={18}
          color={isFavorite ? theme.colors.favoriteRed : theme.colors.textSecondary}
          strokeWidth={isFavorite ? 0 : 2}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },
  divider: {
    width: 1,
    height: 16,
  },
});
