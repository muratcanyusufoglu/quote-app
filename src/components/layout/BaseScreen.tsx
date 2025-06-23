import React from "react";
import { SafeAreaView, StatusBar, View, ViewStyle } from "react-native";
import { darkTheme } from "../../utils/theme";

interface BaseScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  safeAreaStyle?: ViewStyle;
}

const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  style,
  backgroundColor = darkTheme.colors.background,
  safeAreaStyle,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[$safeArea, { backgroundColor }, safeAreaStyle]}>
        <View style={[$container, { backgroundColor }, style]}>{children}</View>
      </SafeAreaView>
    </>
  );
};

const $safeArea: ViewStyle = {
  flex: 1,
};

const $container: ViewStyle = {
  flex: 1,
  paddingHorizontal: darkTheme.spacing.md,
};

export default BaseScreen;
