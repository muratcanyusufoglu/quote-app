import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

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
  const { theme, selectedTheme, isDark } = useTheme();

  // Helper function to get theme-appropriate text colors
  const getTextColor = (overlay?: number) => {
    // Light themes need dark text colors
    const isLightTheme = ['forest', 'sunset', 'minimalist'].includes(selectedTheme) && !isDark;
    const isClassicLight = selectedTheme === 'uprising' && !isDark;

    if (isLightTheme || isClassicLight) {
      // Use dark text colors for light themes
      if (overlay === 90) return '#2c3e50'; // textSoft equivalent
      if (overlay === 70) return 'rgba(44, 62, 80, 0.7)'; // textSoftTertiary equivalent
      if (overlay === 80) return 'rgba(44, 62, 80, 0.8)'; // textSoftSecondary equivalent
      return '#383127'; // textPrimary for light themes
    } else {
      // Use original white overlay colors for dark themes
      if (overlay === 90) return theme.colors.whiteOverlay90;
      if (overlay === 70) return theme.colors.whiteOverlay70;
      if (overlay === 80) return theme.colors.whiteOverlay80;
      return theme.colors.white;
    }
  };

  const getCardStyles = () => {
    const baseStyle = {
      backgroundColor: isSelected
        ? `${theme.colors.brandYellow}20`
        : `${theme.colors.surface}15`,
      borderColor: isSelected
        ? theme.colors.brandYellow
        : `${theme.colors.border}40`,
      borderWidth: isSelected ? 2 : 1,
    };

    switch (variant) {
      case "compact":
        return {
          ...baseStyle,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
        };
      case "featured":
        return {
          ...baseStyle,
          paddingHorizontal: 20,
          paddingVertical: 18,
          borderRadius: 16,
        };
      default:
        return {
          ...baseStyle,
          paddingHorizontal: 18,
          paddingVertical: 16,
          borderRadius: 14,
        };
    }
  };

  const getTextStyles = (): { title: TextStyle; subtitle?: TextStyle } => {
    return {
      title: {
        color: isSelected ? getTextColor() : getTextColor(90),
        fontSize: variant === "compact" ? 14 : 16,
        fontWeight: isSelected ? "700" : "600",
      },
      subtitle: subtitle
        ? {
            color: isSelected
              ? getTextColor(80)
              : getTextColor(70),
            fontSize: variant === "compact" ? 12 : 14,
            fontWeight: "500",
            marginTop: 4,
            opacity: 0.95,
          }
        : undefined,
    };
  };

  const cardStyles = getCardStyles();
  const textStyles = getTextStyles();

  return (
    <TouchableOpacity
      style={[styles.container, cardStyles, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <LinearGradient
          colors={[
            `${theme.colors.brandYellow}15`,
            `${theme.colors.premium}10`,
            `${theme.colors.brandYellow}15`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={[
          "transparent",
          isSelected ? `${theme.colors.brandYellow}05` : "transparent",
        ]}
        style={[styles.content, { borderRadius: cardStyles.borderRadius }]}
      >
        {icon && (
          <IconSymbol
            name={icon as any}
            size={variant === "compact" ? 20 : 24}
            color={
              isSelected
                ? theme.colors.brandYellow
                : getTextColor(80)
            }
            strokeWidth={2}
            style={styles.icon}
          />
        )}

        <Text style={[styles.title, textStyles.title]}>{title}</Text>

        {subtitle && textStyles.subtitle && (
          <Text style={[styles.subtitle, textStyles.subtitle]}>{subtitle}</Text>
        )}

        {isSelected && (
          <IconSymbol
            name="checkmark"
            size={20}
            color={theme.colors.brandYellow}
            strokeWidth={2.5}
            style={styles.checkIcon}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    lineHeight: 20,
  },
  subtitle: {
    flex: 1,
    lineHeight: 18,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
