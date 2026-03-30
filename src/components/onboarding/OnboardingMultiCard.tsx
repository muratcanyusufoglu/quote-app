import React from "react";
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {useTheme} from "../../utils/ThemeContext";

interface OnboardingMultiCardProps {
  icon?: string;
  title: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OnboardingMultiCard({
  icon,
  title,
  isSelected,
  onPress,
  style,
}: OnboardingMultiCardProps) {
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

  const iconColor = isSelected
    ? theme.colors.brandYellow
    : theme.colors.textSecondary;

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
      {/* Selection indicator */}
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

      {icon ? (
        <IconSymbol
          name={icon as any}
          size={22}
          color={iconColor}
          strokeWidth={1.5}
          style={styles.icon}
        />
      ) : null}

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontWeight: isSelected ? "600" : "400",
          },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 14,
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
  },
  checkBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
});
