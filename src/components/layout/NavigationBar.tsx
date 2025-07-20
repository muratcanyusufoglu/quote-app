import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

interface NavigationBarProps {
  style?: ViewStyle;
}

export function NavigationBar({ style }: NavigationBarProps) {
  const { theme } = useTheme();

  // Animation values for each button
  const homeAnim = useRef(new Animated.Value(100)).current;
  const favoritesAnim = useRef(new Animated.Value(100)).current;
  const historyAnim = useRef(new Animated.Value(100)).current;
  const themesAnim = useRef(new Animated.Value(100)).current;

  // Opacity animations for smooth entrance
  const homeOpacity = useRef(new Animated.Value(0)).current;
  const favoritesOpacity = useRef(new Animated.Value(0)).current;
  const historyOpacity = useRef(new Animated.Value(0)).current;
  const themesOpacity = useRef(new Animated.Value(0)).current;

  // Function to reset and start animation
  const startAnimation = () => {
    // Reset all animations to initial state
    homeAnim.setValue(100);
    favoritesAnim.setValue(100);
    historyAnim.setValue(100);
    themesAnim.setValue(100);

    homeOpacity.setValue(0);
    favoritesOpacity.setValue(0);
    historyOpacity.setValue(0);
    themesOpacity.setValue(0);

    const animations = [
      Animated.parallel([
        Animated.spring(homeAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(homeOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(favoritesAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(favoritesOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(historyAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(historyOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(themesAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(themesOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ];

    // Stagger the animations
    Animated.stagger(100, animations).start();
  };

  // Animate buttons from right to left on every mount (screen navigation)
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startAnimation();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Animate buttons when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        startAnimation();
      }, 0);

      return () => clearTimeout(timer);
    }, [])
  );

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
      <Animated.View
        style={{
          transform: [{ translateX: homeAnim }],
          opacity: homeOpacity,
        }}
      >
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
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: favoritesAnim }],
          opacity: favoritesOpacity,
        }}
      >
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
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: historyAnim }],
          opacity: historyOpacity,
        }}
      >
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
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: themesAnim }],
          opacity: themesOpacity,
        }}
      >
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: theme.colors.whiteOverlay10 },
          ]}
          onPress={navigateToThemes}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="palette"
            size={20}
            color={theme.colors.brandYellow}
          />
        </TouchableOpacity>
      </Animated.View>
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
