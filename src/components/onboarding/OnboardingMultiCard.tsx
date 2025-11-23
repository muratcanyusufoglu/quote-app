import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? `${theme.colors.brandYellow}20`
            : `${theme.colors.surface}12`,
          borderColor: isSelected
            ? theme.colors.brandYellow
            : `${theme.colors.border}30`,
          borderWidth: isSelected ? 2 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <LinearGradient
          colors={[
            `${theme.colors.brandYellow}10`,
            `${theme.colors.premium}08`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.content}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected
                  ? `${theme.colors.brandYellow}25`
                  : `${theme.colors.whiteOverlay20}`,
              },
            ]}
          >
            <IconSymbol
              name={icon as any}
              size={16}
              color={
                isSelected
                  ? theme.colors.brandYellow
                  : getTextColor(80)
              }
              strokeWidth={2}
            />
          </View>
        )}

        <Text
          style={[
            styles.title,
            {
              color: isSelected
                ? getTextColor()
                : getTextColor(90),
              fontWeight: isSelected ? "700" : "600",
            },
          ]}
        >
          {title}
        </Text>

        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected
                ? theme.colors.brandYellow
                : theme.colors.border,
              backgroundColor: isSelected
                ? theme.colors.brandYellow
                : "transparent",
            },
          ]}
        >
          {isSelected && (
            <IconSymbol
              name="checkmark"
              size={12}
              color={theme.colors.white}
              strokeWidth={3}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
