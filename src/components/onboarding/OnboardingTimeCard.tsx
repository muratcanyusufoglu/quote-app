import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";

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
            ? `${theme.colors.brandYellow}18`
            : `${theme.colors.surface}12`,
          borderColor: isSelected
            ? theme.colors.brandYellow
            : `${theme.colors.border}35`,
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
            `${theme.colors.brandYellow}12`,
            `${theme.colors.premium}08`,
            `${theme.colors.brandYellow}12`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? `${theme.colors.brandYellow}30`
                : `${theme.colors.whiteOverlay20}`,
            },
          ]}
        >
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        <View style={styles.textContainer}>
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
          <Text
            style={[
              styles.timeRange,
              {
                color: isSelected
                  ? getTextColor(80)
                  : getTextColor(70),
              },
            ]}
          >
            {timeRange}
          </Text>
        </View>

        {isSelected && (
          <View
            style={[
              styles.selectedIndicator,
              { backgroundColor: theme.colors.brandYellow },
            ]}
          >
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    width: "48%",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
