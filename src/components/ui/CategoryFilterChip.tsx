import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const categoryIcon = getCategoryIcon(categoryId);

  // Use current theme colors directly - simpler and more reliable
  const themeColors = {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: `${theme.colors.primary}15`,
  };

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClear = () => {
    // Exit animation before clearing
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClear();
    });
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: insets.top + 60, // Safe area + navigation height
      left: 20,
      right: 20,
      zIndex: 1000,
      alignItems: "center",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 28,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 1.5,
      borderColor: themeColors.primary,
      // Subtle background tint
      ...(theme.colors.background.includes("rgba")
        ? {}
        : {
            backgroundColor: `${theme.colors.background}F5`, // Slightly more opaque
          }),
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: themeColors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: `${themeColors.primary}30`,
    },
    textContainer: {
      flex: 1,
      marginRight: 12,
    },
    categoryLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "left",
      letterSpacing: 0.3,
    },
    categorySubtext: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      opacity: 0.8,
    },
    clearButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${theme.colors.error}15`, // Light error background
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: `${theme.colors.error}30`,
    },
    themeIndicator: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: themeColors.primary,
      borderTopLeftRadius: 28,
      borderBottomLeftRadius: 28,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.chip,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Theme Color Indicator */}
        <View style={styles.themeIndicator} />

        {/* Category Icon */}
        <View style={styles.iconContainer}>
          {categoryIcon ? (
            <IconSymbol
              name={categoryIcon as any}
              size={18}
              color={themeColors.primary}
              strokeWidth={2.5}
            />
          ) : (
            <Text style={{ fontSize: 16 }}>📂</Text>
          )}
        </View>

        {/* Category Name */}
        <View style={styles.textContainer}>
          <Text style={styles.categoryLabel}>{categoryName}</Text>
          <Text style={styles.categorySubtext}>Filtered by category</Text>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="xmark"
            size={14}
            color={theme.colors.error}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
