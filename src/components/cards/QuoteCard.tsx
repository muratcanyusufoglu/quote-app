import React from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { LocalizedCategory, LocalizedQuote } from "../../types";

interface QuoteCardProps {
  quote: LocalizedQuote;
  category?: LocalizedCategory;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  backgroundColor?: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  category,
  onPress,
  onFavoritePress,
  isFavorite = false,
  backgroundColor,
}) => {
  const cardColor = backgroundColor || category?.color || cardColors.blue;

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
            <Text style={$favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Enhanced card colors with more vibrant options
export const cardColors = {
  blue: "#5865F2", // Discord Blue
  red: "#FF6B6B", // Coral Red
  purple: "#9B59B6", // Amethyst
  brown: "#D4A574", // Sandy Brown
  green: "#2ECC71", // Emerald
  orange: "#FF9500", // Orange
  pink: "#FF6B9D", // Pink
  teal: "#1ABC9C", // Turquoise
  indigo: "#667EEA", // Indigo
  yellow: "#F39C12", // Orange (Golden)
  lime: "#32D74B", // Lime Green
  cyan: "#5AC8FA", // Cyan
};

export const getCardColorByIndex = (index: number): string => {
  const colors = Object.values(cardColors);
  return colors[index % colors.length];
};

export const getCardColorByCategory = (categoryId: string): string => {
  const categoryColorMap: Record<string, string> = {
    motivation: cardColors.blue,
    motivasyon: cardColors.blue,
    success: cardColors.green,
    basari: cardColors.green,
    wisdom: cardColors.purple,
    bilgelik: cardColors.purple,
    happiness: cardColors.yellow,
    mutluluk: cardColors.yellow,
    love: cardColors.pink,
    ask: cardColors.pink,
    life: cardColors.teal,
    hayat: cardColors.teal,
    inspiration: cardColors.red,
    ilham: cardColors.red,
    growth: cardColors.lime,
    gelisim: cardColors.lime,
    peace: cardColors.cyan,
    huzur: cardColors.cyan,
    strength: cardColors.orange,
    guc: cardColors.orange,
    confidence: cardColors.indigo,
    guven: cardColors.indigo,
  };

  return categoryColorMap[categoryId] || cardColors.blue;
};

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

const $favoriteIcon = {
  fontSize: 22,
};

export default QuoteCard;
