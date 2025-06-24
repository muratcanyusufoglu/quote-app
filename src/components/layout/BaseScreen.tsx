import React from "react";
import { SafeAreaView, StatusBar, View, ViewStyle } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface BaseScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  safeAreaStyle?: ViewStyle;
  statusBarStyle?: "light-content" | "dark-content" | "default";
}

const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  style,
  backgroundColor,
  safeAreaStyle,
  statusBarStyle,
}) => {
  const { theme, isDark } = useTheme();

  const bgColor = backgroundColor || theme.colors.background;
  const barStyle =
    statusBarStyle || (isDark ? "light-content" : "dark-content");

  return (
    <>
      <StatusBar barStyle={barStyle} backgroundColor={bgColor} />
      <View style={[$fullScreen, { backgroundColor: bgColor }]}>
        <SafeAreaView style={[$safeArea, safeAreaStyle]}>
          <View style={[$container, style]}>{children}</View>
        </SafeAreaView>
      </View>
    </>
  );
};

const $fullScreen: ViewStyle = {
  flex: 1,
};

const $safeArea: ViewStyle = {
  flex: 1,
};

const $container: ViewStyle = {
  flex: 1,
  paddingHorizontal: 16, // theme.spacing.md equivalent
};

export default BaseScreen;
