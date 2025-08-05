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
      {/* Category and Read Time Info */}
      <View style={styles.infoSection}>
        <View
          style={[
            styles.categoryContainer,
            {
              backgroundColor: theme.colors.whiteOverlay10,
              shadowColor: theme.colors.shadowColor,
            },
          ]}
        >
          <Text
            style={[styles.categoryTag, { color: theme.colors.brandYellow }]}
          >
            #{localizedCategoryName}
          </Text>
        </View>
        {/* read time */}
        {/* <View
          style={[
            styles.readTimeContainer,
            {
              backgroundColor: theme.colors.whiteOverlay70,
            },
          ]}
        >
          <IconSymbol
            name="book"
            size={12}
            color={theme.colors.textSoftSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.readTimeText,
              { color: theme.colors.textSoftSecondary },
            ]}
          >
            {readTime} min
          </Text>
        </View> */}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {/* Share Button - Use ShareButton component if quote is provided, otherwise use callback */}
        {quote ? (
          <ShareButton
            quote={quote}
            size={24}
            iconColor={theme.colors.brandYellow}
            backgroundColor={theme.colors.whiteOverlay10}
            style={styles.actionButton}
            onShareComplete={handleShareComplete}
          />
        ) : onShare ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.whiteOverlay10,
                shadowColor: theme.colors.shadowColor,
              },
            ]}
            onPress={handleSharePress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="square.and.arrow.up"
              size={24}
              color={theme.colors.brandYellow}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isFavorite
                ? theme.colors.favoriteActive + "20" // 20% opacity
                : theme.colors.whiteOverlay10,
              shadowColor: theme.colors.shadowColor,
            },
          ]}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="heart"
            size={24}
            color={
              isFavorite ? theme.colors.favoriteRed : theme.colors.brandYellow
            }
            strokeWidth={isFavorite ? 3 : 2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  infoSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteActiveButton: {
    backgroundColor: "rgba(255, 71, 87, 0.1)",
  },
});
