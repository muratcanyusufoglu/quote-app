import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

// Navigation items with icon names for IconSymbol
const navigationItems = [
  { route: "/(tabs)/", icon: "home", label: "Ana Sayfa" },
  { route: "/(tabs)/explore", icon: "search", label: "Keşfet" },
  { route: "/(tabs)/favorites", icon: "heart", label: "Favoriler" },
  { route: "/(tabs)/history", icon: "clock", label: "Geçmiş" },
];

interface NavigationHeaderProps {
  title: string;
  currentRoute?: string;
}

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
              <IconSymbol
                name={item.icon as any}
                size={18}
                color={
                  currentRoute === item.route
                    ? "#FFFFFF"
                    : theme.colors.textSecondary
                }
                strokeWidth={2}
              />
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
  });
