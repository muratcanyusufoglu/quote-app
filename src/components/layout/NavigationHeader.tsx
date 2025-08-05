import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { usePremium } from "../../hooks/usePremium"; // UNIFIED: Use single premium hook
import { useCommonTranslations } from "../../hooks/useTranslation";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationHeaderProps {
  title?: string;
  currentRoute?: string;
  showBackButton?: boolean;
  showPremiumBadge?: boolean;
}

export function NavigationHeader({
  title,
  currentRoute,
  showBackButton = false,
  showPremiumBadge = true,
}: NavigationHeaderProps) {
  const { theme } = useTheme();
  const { isPremium } = usePremium(); // UNIFIED: Single source of truth
  const { showPaywall } = usePaywallSelectors.actions();
  const common = useCommonTranslations();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  const handlePremiumPress = () => {
    if (!isPremium) {
      showPaywall("premium_category");
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.whiteOverlay10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.white,
      flex: 1,
    },
    premiumBadge: {
      backgroundColor: isPremium
        ? theme.colors.brandYellow
        : theme.colors.whiteOverlay10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isPremium
        ? theme.colors.goldAccent
        : theme.colors.whiteOverlay20,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    premiumText: {
      color: isPremium ? theme.colors.textSoft : theme.colors.white,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <IconSymbol
              name="arrow.left"
              size={20}
              color={theme.colors.white}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      {showPremiumBadge && (
        <TouchableOpacity
          style={styles.premiumBadge}
          onPress={handlePremiumPress}
          activeOpacity={isPremium ? 1 : 0.7}
          disabled={isPremium}
        >
          {isPremium && (
            <IconSymbol name="crown" size={14} color={theme.colors.textSoft} />
          )}
          <Text style={styles.premiumText}>
            {isPremium ? common.premium_status : common.free_status}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
