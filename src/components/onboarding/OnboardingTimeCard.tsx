import React from "react";
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {useTheme} from "../../utils/ThemeContext";

interface OnboardingTimeCardProps {
  icon: string;
  title: string;
  timeRange: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OnboardingTimeCard({
  icon,
  title,
  timeRange,
  isSelected,
  onPress,
  style,
}: OnboardingTimeCardProps) {
  const {theme, isDark} = useTheme();

  const cardBg = isSelected
    ? `${theme.colors.brandYellow}18`
    : isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.04)";

  const borderColor = isSelected
    ? theme.colors.brandYellow
    : isDark
    ? "rgba(255,255,255,0.13)"
    : "rgba(0,0,0,0.09)";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth: isSelected ? 1.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isSelected && (
        <View
          style={[
            styles.checkBadge,
            {backgroundColor: theme.colors.brandYellow},
          ]}
        >
          <IconSymbol
            name="checkmark"
            size={10}
            color={isDark ? "#141210" : "#1a1a1a"}
            strokeWidth={3}
          />
        </View>
      )}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isSelected
              ? `${theme.colors.brandYellow}22`
              : isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={20}
          color={
            isSelected
              ? theme.colors.brandYellow
              : theme.colors.textSecondary
          }
          strokeWidth={1.5}
        />
      </View>

      <View style={styles.textWrap}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontWeight: isSelected ? "600" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[styles.timeRange, {color: theme.colors.textSecondary}]}
          numberOfLines={1}
        >
          {timeRange}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginBottom: 10,
    width: "48%",
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  textWrap: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 3,
  },
  timeRange: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});
