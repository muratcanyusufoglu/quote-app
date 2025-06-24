import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useOnboardingSelectors } from "../src/store/useOnboardingStore";
import { usePurchaseSelectors } from "../src/store/usePurchaseStore";
import { useQuoteSelectors } from "../src/store/useQuoteStore";
import { ThemeProvider } from "../src/utils/ThemeContext";

// Custom dark theme based on our new harmonious color system
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#60a5fa", // blue400 from our palette
    background: "#020617", // dark900 from our palette
    card: "#1e293b", // dark800 from our palette
    text: "#f8fafc", // dark50 from our palette
    border: "#475569", // dark600 from our palette
    notification: "#60a5fa", // blue400 from our palette
  },
};

// Custom light theme for navigation
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3b82f6", // blue500 from our palette
    background: "#f9fafb", // gray50 from our palette
    card: "#ffffff", // white surface
    text: "#111827", // gray900 from our palette
    border: "#e5e7eb", // gray200 from our palette
    notification: "#3b82f6", // blue500 from our palette
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize stores
  const quoteHydrated = useQuoteSelectors.hasHydrated();
  const purchaseHydrated = usePurchaseSelectors.hasHydrated();
  const onboardingHydrated = useOnboardingSelectors.hasHydrated();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider defaultTheme={colorScheme === "dark" ? "dark" : "light"}>
      <RNThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="quote-detail/[id]"
            options={{
              headerShown: false,
              presentation: "modal",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="purchase"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </RNThemeProvider>
    </ThemeProvider>
  );
}
