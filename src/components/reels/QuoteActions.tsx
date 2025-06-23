import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuoteActionsProps {
  isFavorite: boolean;
  onFavoritePress: () => void;
  onShare?: () => void;
  category: string;
  readTime: number;
}

export const QuoteActions: React.FC<QuoteActionsProps> = ({
  isFavorite,
  onFavoritePress,
  onShare,
  category,
  readTime,
}) => {
  return (
    <View style={styles.bottomSection}>
      {/* Left: Category Tag */}
      <View style={styles.leftActions}>
        <Text style={styles.categoryTag}>#{category}</Text>
        <Text style={styles.readTimeText}>📖 {readTime} dk</Text>
      </View>

      {/* Right: Action Buttons */}
      <View style={styles.rightActions}>
        {onShare && (
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={onFavoritePress}>
          <Text style={styles.actionIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  leftActions: {
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  readTimeText: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  actionButton: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 28,
  },
});
