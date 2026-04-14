import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const categoryIcon = getCategoryIcon(categoryId);

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
    // State'i hemen güncelle — gecikme olmadan filtre kalksın
    onClear();
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      // SafeAreaView zaten insets.top padding'i ekliyor.
      // QuoteReelCard header'ı (brain + menu butonları) kart tepesinden
      // top:27, yükseklik:44 → kart tepesinden top:71'de bitiyor.
      // Chip'i header'ın altına konumlandırıyoruz (top > 71).
      top: 80,
      left: 16,
      right: 16,
      zIndex: 1000,
      alignItems: "center",
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.whiteOverlay10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
      backdropFilter: "blur(10px)",
    },
    iconContainer: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.brandYellow + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
    },
    textContainer: {
      flex: 1,
      marginRight: 8,
    },
    categoryLabel: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.white,
      letterSpacing: 0.2,
    },
    clearButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.whiteOverlay20,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.chip,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Category Icon */}
        <View style={styles.iconContainer}>
          {categoryIcon ? (
            <IconSymbol
              name={categoryIcon as any}
              size={14}
              color={theme.colors.brandYellow}
              strokeWidth={2}
            />
          ) : (
            <Text style={{ fontSize: 12 }}>📂</Text>
          )}
        </View>

        {/* Category Name */}
        <View style={styles.textContainer}>
          <Text style={styles.categoryLabel}>{categoryName}</Text>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="xmark"
            size={12}
            color={theme.colors.text}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
