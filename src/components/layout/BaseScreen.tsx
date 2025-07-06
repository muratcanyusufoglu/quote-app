import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, StatusBar, View, ViewStyle } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface BaseScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  safeAreaStyle?: ViewStyle;
  statusBarStyle?: "light-content" | "dark-content" | "default";
  useGradientBackground?: boolean;
}

const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  style,
  backgroundColor,
  safeAreaStyle,
  statusBarStyle,
  useGradientBackground = true,
}) => {
  const { theme, isDark } = useTheme();

  const bgColor = backgroundColor || theme.colors.background;
  const barStyle = statusBarStyle || "light-content";

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor="transparent"
        translucent
      />
      <View style={[$fullScreen, { backgroundColor: theme.colors.background }]}>
        {useGradientBackground ? (
          <>
            <LinearGradient
              colors={theme.colors.gradientColors as any}
              locations={theme.colors.gradientLocations as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={$gradientBackground}
            />

            <LinearGradient
              colors={theme.colors.radialOverlayColors as any}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 0.8 }}
              style={$radialOverlay}
            />
          </>
        ) : (
          <View style={[$gradientBackground, { backgroundColor: bgColor }]} />
        )}

        <SafeAreaView
          style={[$safeArea, { backgroundColor: "transparent" }, safeAreaStyle]}
        >
          <View style={[$container, style]}>{children}</View>
        </SafeAreaView>
      </View>
    </>
  );
};

const $fullScreen: ViewStyle = {
  flex: 1,
};

const $gradientBackground: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const $radialOverlay: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const $safeArea: ViewStyle = {
  flex: 1,
};

const $container: ViewStyle = {
  flex: 1,
  paddingHorizontal: 16,
};

export default BaseScreen;
