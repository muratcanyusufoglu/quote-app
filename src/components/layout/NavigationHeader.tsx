import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationHeaderProps {
  title: string;
  currentRoute: string;
  showBackButton?: boolean;
}

export function NavigationHeader({
  title,
  currentRoute,
  showBackButton = false,
}: NavigationHeaderProps) {
  const { theme } = useTheme();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  const handlePurchasePress = () => {
    console.log("Navigate to purchase");
    // TODO: Implement purchase navigation
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
    purchaseButton: {
      backgroundColor: theme.colors.whiteOverlay10,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
    },
    purchaseText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: "600",
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

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={handlePurchasePress}
      >
        <Text style={styles.purchaseText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}
