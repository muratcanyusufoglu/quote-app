import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
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
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const categoryIcon = getCategoryIcon(categoryId);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.chip, { opacity: opacityAnim }]}>
        {/* Icon */}
        {categoryIcon && (
          <IconSymbol
            name={categoryIcon as any}
            size={11}
            color="rgba(255,255,255,0.5)"
            strokeWidth={1.8}
          />
        )}

        {/* Category Name */}
        <Text style={styles.label} numberOfLines={1}>
          {categoryName}
        </Text>

        {/* Separator */}
        <Text style={styles.separator}>·</Text>

        {/* Clear */}
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.6}
        >
          <IconSymbol
            name="xmark"
            size={9}
            color="rgba(255,255,255,0.45)"
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 82,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.1,
    maxWidth: 140,
  },
  separator: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    lineHeight: 14,
  },
});
