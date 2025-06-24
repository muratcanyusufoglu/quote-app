import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { LocalizedCategory, LocalizedQuote } from "../../types";
import { getCategoryColor } from "../../utils/categoryColors";

interface QuoteCardProps {
  quote: LocalizedQuote;
  category?: LocalizedCategory;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  backgroundColor?: string;
  isDark?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  category,
  onPress,
  onFavoritePress,
  isFavorite = false,
  backgroundColor,
  isDark = true,
}) => {
  const cardColor =
    backgroundColor ||
    category?.color ||
    getCategoryColor(quote.category, isDark);

  return (
    <TouchableOpacity
      style={[$cardContainer, { backgroundColor: cardColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={$cardContent}>
        {/* Quote Text */}
        <Text style={$quoteText} numberOfLines={4}>
          "{quote.text}"
        </Text>

        {/* Author */}
        {quote.author && <Text style={$authorText}>— {quote.author}</Text>}

        {/* Card Footer */}
        <View style={$cardFooter}>
          <View style={$leftFooter}>
            <View style={$readTimeContainer}>
              <Text style={$readTimeText}>{quote.readTime} min</Text>
            </View>
          </View>

          <TouchableOpacity
            style={$favoriteButton}
            onPress={onFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol
              name="heart"
              size={20}
              color={isFavorite ? "#ff6b6b" : "rgba(255, 255, 255, 0.8)"}
              strokeWidth={isFavorite ? 3 : 2}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Note: Card colors are now managed centrally in src/utils/theme.ts
// This ensures consistency across the entire application

const $cardContainer: ViewStyle = {
  borderRadius: 20,
  marginHorizontal: 16,
  marginVertical: 8,
  minHeight: 160,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 8,
  },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 12,
  overflow: "hidden",
};

const $cardContent: ViewStyle = {
  flex: 1,
  padding: 20,
  justifyContent: "space-between",
};

const $quoteText = {
  fontSize: 18,
  fontWeight: "600" as any,
  color: "#FFFFFF",
  lineHeight: 26,
  marginBottom: 12,
  textAlign: "left" as const,
  letterSpacing: 0.3,
};

const $authorText = {
  fontSize: 14,
  fontWeight: "500" as any,
  color: "rgba(255, 255, 255, 0.9)",
  marginBottom: 16,
  textAlign: "left" as const,
  fontStyle: "italic" as const,
};

const $cardFooter: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

const $leftFooter: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $readTimeContainer: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
};

const $readTimeText = {
  fontSize: 12,
  color: "#FFFFFF",
  fontWeight: "600" as any,
  letterSpacing: 0.2,
};

const $favoriteButton: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
};

export default QuoteCard;
