import React from "react";
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {useTheme} from "../../utils/ThemeContext";

interface OnboardingCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onPress: () => void;
  variant?: "default" | "compact" | "featured";
  style?: ViewStyle;
}

export function OnboardingCard({
  icon,
  title,
  subtitle,
  isSelected,
  onPress,
  variant = "default",
  style,
}: OnboardingCardProps) {
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

  const iconBg = isSelected
    ? `${theme.colors.brandYellow}28`
    : isDark
    ? "rgba(255,255,255,0.09)"
    : "rgba(0,0,0,0.06)";

  const iconColor = isSelected
    ? theme.colors.brandYellow
    : theme.colors.textSecondary;

  const isCompact = variant === "compact";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth: isSelected ? 1.5 : 1,
          paddingVertical: isCompact ? 12 : 15,
          paddingHorizontal: isCompact ? 14 : 16,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={[styles.iconWrap, {backgroundColor: iconBg}]}>
          <IconSymbol
            name={icon as any}
            size={isCompact ? 18 : 20}
            color={iconColor}
            strokeWidth={1.5}
          />
        </View>
      )}

      <View style={styles.textWrap}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontSize: isCompact ? 14 : 16,
              fontWeight: isSelected ? "600" : "500",
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.radio,
          {
            borderColor: isSelected
              ? theme.colors.brandYellow
              : isDark
              ? "rgba(255,255,255,0.25)"
              : "rgba(0,0,0,0.18)",
            backgroundColor: isSelected
              ? theme.colors.brandYellow
              : "transparent",
          },
        ]}
      >
        {isSelected && (
          <IconSymbol
            name="checkmark"
            size={11}
            color={isDark ? "#141210" : "#1a1a1a"}
            strokeWidth={3}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});
