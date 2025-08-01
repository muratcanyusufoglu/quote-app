import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCommonTranslations } from "../../hooks/useTranslation";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { useIsPremium } from "../../store/usePurchaseStore";
import { useThemeSelectors } from "../../store/useThemeStore";
import { useTheme } from "../../utils/ThemeContext";

export function MiniPremiumBadge() {
  // All hooks must be called in the same order every time
  const { theme } = useTheme();
  const selectedTheme = useThemeSelectors.selectedTheme();
  const isPremium = useIsPremium();
  const { showPaywall } = usePaywallSelectors.actions();
  const common = useCommonTranslations();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    showPaywall("premium_category");
  };

  // Dynamic colors based on selected theme
  const getBadgeColors = () => {
    switch (selectedTheme) {
      case "ocean":
        return {
          backgroundColor: theme.colors.primary, // Ocean blue
          borderColor: theme.colors.secondary, // Teal
          textColor: theme.colors.textInverse,
        };
      case "forest":
        return {
          backgroundColor: theme.colors.primary, // Forest green
          borderColor: theme.colors.secondary, // Pine green
          textColor: theme.colors.textInverse,
        };
      case "sunset":
        return {
          backgroundColor: theme.colors.primary, // Sunset orange
          borderColor: theme.colors.secondary, // Coral red
          textColor: theme.colors.textInverse,
        };
      case "purple":
        return {
          backgroundColor: theme.colors.primary, // Royal purple
          borderColor: theme.colors.secondary, // Lavender
          textColor: theme.colors.textInverse,
        };
      case "minimalist":
        return {
          backgroundColor: theme.colors.primary, // Slate gray
          borderColor: theme.colors.secondary, // Stone gray
          textColor: theme.colors.textInverse,
        };
      case "uprising":
      default:
        return {
          backgroundColor: theme.colors.premium, // Golden amber
          borderColor: theme.colors.brandYellow, // Light golden
          textColor: theme.colors.textInverse,
        };
    }
  };

  const badgeColors = getBadgeColors();

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: insets.top,
      left: 16,
      zIndex: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      backgroundColor: badgeColors.backgroundColor,
      borderWidth: 1.5,
      borderColor: badgeColors.borderColor,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      // Ensure it doesn't interfere with centered components
      alignSelf: "flex-start",
    } as ViewStyle,
    text: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: badgeColors.textColor,
      textAlign: "center",
    } as TextStyle,
  });

  // Only show badge for non-premium users (opposite way)
  // This conditional return must come AFTER all hooks are called
  if (isPremium) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{common.free}</Text>
    </TouchableOpacity>
  );
}
