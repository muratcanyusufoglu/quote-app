import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";
import { getCategoryIcon } from "../../utils/theme";

interface CategoryFilterChipProps {
  categoryName: string;
  categoryId: string;
  onClear: () => void;
}

export function CategoryFilterChip({
  categoryName,
  categoryId,
  onClear,
}: CategoryFilterChipProps) {
  const { theme } = useTheme();

  const categoryIcon = getCategoryIcon(categoryId);

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 60, // Below status bar and navigation
      left: 20,
      right: 20,
      zIndex: 1000,
      alignItems: "center",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 25,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    iconContainer: {
      marginRight: 8,
    },
    categoryIcon: {
      fontSize: 16,
    },
    textContainer: {
      flex: 1,
      marginRight: 8,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2c3e50",
      textAlign: "center",
    },
    clearButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: "rgba(52, 73, 94, 0.1)",
    },
    clearIcon: {
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        {/* Category Icon */}
        <View style={styles.iconContainer}>
          {categoryIcon ? (
            <IconSymbol
              name={categoryIcon as any}
              size={16}
              color="#34495e"
              strokeWidth={2}
            />
          ) : (
            <Text style={styles.categoryIcon}>📂</Text>
          )}
        </View>

        {/* Category Name */}
        <View style={styles.textContainer}>
          <Text style={styles.categoryLabel}>{categoryName}</Text>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol
            name="xmark"
            size={14}
            color="#34495e"
            strokeWidth={2}
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
