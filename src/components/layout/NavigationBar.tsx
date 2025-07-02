import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationBarProps {
  style?: ViewStyle;
}

export function NavigationBar({ style }: NavigationBarProps) {
  const { theme } = useTheme();

  const navigateToHome = () => {
    router.push("/(tabs)");
  };

  const navigateToFavorites = () => {
    router.push("/(tabs)/favorites");
  };

  const navigateToHistory = () => {
    router.push("/(tabs)/history");
  };

  const navigateToThemes = () => {
    router.push("/(tabs)/themes");
  };

  return (
    <View style={[styles.navigationContainer, style]}>
      <TouchableOpacity
        style={[
          styles.navButton,
          { backgroundColor: theme.colors.whiteOverlay10 },
        ]}
        onPress={navigateToHome}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="house.fill"
          size={24}
          color={theme.colors.brandYellow}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          { backgroundColor: theme.colors.whiteOverlay10 },
        ]}
        onPress={navigateToFavorites}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="heart.fill"
          size={24}
          color={theme.colors.brandYellow}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          { backgroundColor: theme.colors.whiteOverlay10 },
        ]}
        onPress={navigateToHistory}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="clock.fill"
          size={24}
          color={theme.colors.brandYellow}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          { backgroundColor: theme.colors.whiteOverlay10 },
        ]}
        onPress={navigateToThemes}
        activeOpacity={0.7}
      >
        <IconSymbol name="palette" size={20} color={theme.colors.brandYellow} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
