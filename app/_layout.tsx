import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { PaywallModal } from "../src/components/ui/PaywallModal";
import { useOnboardingSelectors } from "../src/store/useOnboardingStore";
import { usePaywallSelectors } from "../src/store/usePaywallStore";
import { usePurchaseSelectors } from "../src/store/usePurchaseStore";
import { useQuoteSelectors } from "../src/store/useQuoteStore";
import { ThemeProvider as ThemeContextProvider } from "../src/utils/ThemeContext";

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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize stores
  const quoteHydrated = useQuoteSelectors.hasHydrated();
  const purchaseHydrated = usePurchaseSelectors.hasHydrated();
  const onboardingHydrated = useOnboardingSelectors.hasHydrated();
  const paywallHydrated = usePaywallSelectors.hasHydrated();

  // Welcome paywall logic - show on first app launch
  const { showPaywall, markWelcomePaywallSeen } = usePaywallSelectors.actions();
  const hasSeenWelcome = usePaywallSelectors.hasSeenWelcome();
  const isCompleted = useOnboardingSelectors.isCompleted();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Show welcome paywall after all stores hydrated and onboarding completed
  useEffect(() => {
    if (
      quoteHydrated &&
      purchaseHydrated &&
      onboardingHydrated &&
      paywallHydrated &&
      isCompleted &&
      !hasSeenWelcome
    ) {
      setTimeout(() => {
        showPaywall("welcome");
        markWelcomePaywallSeen();
      }, 1000); // Delay to show after initial app load
    }
  }, [
    quoteHydrated,
    purchaseHydrated,
    onboardingHydrated,
    paywallHydrated,
    isCompleted,
    hasSeenWelcome,
    showPaywall,
    markWelcomePaywallSeen,
  ]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeContextProvider
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <ThemeProvider
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

        {/* Global Paywall Modal - Accessible from anywhere */}
        <PaywallModal
          onPurchase={() => {
            // Navigate to purchase screen when user wants to buy
            // router.push('/purchase'); // Can be implemented if needed
            console.log("Purchase flow triggered from paywall");
          }}
        />
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
