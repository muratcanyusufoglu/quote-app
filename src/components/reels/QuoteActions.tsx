import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";

interface QuoteActionsProps {
  isFavorite: boolean;
  onFavoritePress: () => void;
  onShare?: () => void;
  category: string;
  readTime: number;
  onQuoteAction?: (actionType: string) => void;
}

export const QuoteActions: React.FC<QuoteActionsProps> = ({
  isFavorite,
  onFavoritePress,
  onShare,
  category,
  readTime,
  onQuoteAction,
}) => {
  const handleFavoritePress = () => {
    onQuoteAction?.("favorite");
    onFavoritePress();
  };

  const handleSharePress = () => {
    onQuoteAction?.("share");
    onShare?.();
  };

  return (
    <View style={styles.container}>
      {/* Category and Read Time Info */}
      <View style={styles.infoSection}>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTag}>#{category}</Text>
        </View>
        <View style={styles.readTimeContainer}>
          <IconSymbol
            name="book"
            size={12}
            color="rgba(0, 0, 0, 0.6)"
            strokeWidth={2}
          />
          <Text style={styles.readTimeText}>{readTime} min</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {onShare && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSharePress}
          >
            <IconSymbol
              name="square.and.arrow.up"
              size={22}
              color="#333"
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            isFavorite && styles.favoriteActiveButton,
          ]}
          onPress={handleFavoritePress}
        >
          <IconSymbol
            name="heart"
            size={22}
            color={isFavorite ? "#ff4757" : "#333"}
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
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
    color: "#333",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: "rgba(0, 0, 0, 0.6)",
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
  favoriteActiveButton: {
    backgroundColor: "rgba(255, 71, 87, 0.1)",
  },
});
