import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { darkTheme } from "../../utils/theme";

interface NavigationHeaderProps {
  title: string;
  currentRoute?: string;
}

const navigationItems = [
  { route: "/(tabs)/", icon: "🏠", label: "Home" },
  { route: "/(tabs)/explore", icon: "🔍", label: "Explore" },
  { route: "/(tabs)/favorites", icon: "❤️", label: "Favorites" },
  { route: "/(tabs)/history", icon: "📚", label: "History" },
];

export function NavigationHeader({
  title,
  currentRoute,
}: NavigationHeaderProps) {
  const navigateToRoute = (route: string) => {
    router.push(route as any);
  };

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.colors.background,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.colors.border,
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
    color: darkTheme.colors.text,
    flex: 1,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  activeNavButton: {
    backgroundColor: darkTheme.colors.primary,
  },
  navIcon: {
    fontSize: 18,
  },
});
