import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationHeaderProps {
  title: string;
  currentRoute: string;
}

export function NavigationHeader({
  title,
  currentRoute,
}: NavigationHeaderProps) {
  const { theme } = useTheme();

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
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.white,
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
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={handlePurchasePress}
      >
        <Text style={styles.purchaseText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}
