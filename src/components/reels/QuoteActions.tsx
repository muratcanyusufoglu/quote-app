import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";
import { ShareButton } from "../ui/ShareButton";

interface QuoteActionsProps {
  isFavorite: boolean;
  onFavoritePress: () => void;
  onShare?: () => void;
  quote?: LocalizedQuote; // Optional quote for ShareButton
  category: string;
  readTime: number;
  onQuoteAction?: (actionType: string) => void;
}

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

  return (
    <View style={styles.container}>
      {/* Category and Read Time Info */}
      <View style={styles.infoSection}>
        <View
          style={[
            styles.categoryContainer,
            {
              backgroundColor: theme.colors.whiteOverlay90,
              shadowColor: theme.colors.shadowColor,
            },
          ]}
        >
          <Text style={[styles.categoryTag, { color: theme.colors.textSoft }]}>
            #{category}
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
            size={22}
            iconColor={theme.colors.textSoft}
            backgroundColor={theme.colors.whiteOverlay90}
            style={styles.actionButton}
            onShareComplete={handleShareComplete}
          />
        ) : onShare ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.whiteOverlay90,
                shadowColor: theme.colors.shadowColor,
              },
            ]}
            onPress={handleSharePress}
          >
            <IconSymbol
              name="square.and.arrow.up"
              size={22}
              color={theme.colors.textSoft}
              strokeWidth={2}
            />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isFavorite
                ? theme.colors.favoriteActive + "20" // 20% opacity
                : theme.colors.whiteOverlay90,
              shadowColor: theme.colors.shadowColor,
            },
          ]}
          onPress={handleFavoritePress}
        >
          <IconSymbol
            name="heart"
            size={22}
            color={
              isFavorite ? theme.colors.favoriteRed : theme.colors.textSoft
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
