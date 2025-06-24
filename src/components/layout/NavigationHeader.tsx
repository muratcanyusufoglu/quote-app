import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationHeaderProps {
  title: string;
  currentRoute?: string;
}

const navigationItems = [
  { route: "/(tabs)/", icon: "🏠", label: "Ana Sayfa" },
  { route: "/(tabs)/explore", icon: "🔍", label: "Keşfet" },
  { route: "/(tabs)/favorites", icon: "❤️", label: "Favoriler" },
  { route: "/(tabs)/history", icon: "📚", label: "Geçmiş" },
];

export function NavigationHeader({
  title,
  currentRoute,
}: NavigationHeaderProps) {
  const { theme } = useTheme();

  const navigateToRoute = (route: string) => {
    router.push(route as any);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.navigationContainer}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navButton,
                currentRoute === item.route && styles.activeNavButton,
              ]}
              onPress={() => navigateToRoute(item.route)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
    },
    navigationContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    navButton: {
      width: 44,
      height: 44,
      backgroundColor: theme.colors.surface,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      opacity: 0.7,
    },
    activeNavButton: {
      backgroundColor: theme.colors.primary,
      opacity: 1,
    },
    navIcon: {
      fontSize: 18,
    },
  });
