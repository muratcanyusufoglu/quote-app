import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
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

  // Deep link handling for quote sharing
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log("🔗 Deep link received:", url);

      // Parse the URL for quote ID
      const parsed = Linking.parse(url);
      console.log("🔍 Parsed URL:", parsed);

      // Handle quote:// scheme or https:// scheme
      if (
        parsed.hostname === "quote-detail" ||
        parsed.path?.includes("/quote/")
      ) {
        let quoteId: string | null = null;

        if (parsed.hostname === "quote-detail") {
          // Handle quote://quote-detail/[id] format
          quoteId = parsed.path?.replace("/", "") || null;
        } else if (parsed.path?.includes("/quote/")) {
          // Handle https://domain.com/quote/[id] format
          const pathParts = parsed.path.split("/");
          const quoteIndex = pathParts.indexOf("quote");
          if (quoteIndex !== -1 && pathParts[quoteIndex + 1]) {
            quoteId = pathParts[quoteIndex + 1];
          }
        }

        if (quoteId) {
          console.log("✅ Navigating to quote:", quoteId);
          // Small delay to ensure app is ready
          setTimeout(() => {
            router.push(`/quote-detail/${quoteId}`);
          }, 100);
        } else {
          console.warn("❌ Could not extract quote ID from URL:", url);
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🚀 App opened with initial URL:", url);
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("📱 URL received while app running:", url);
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

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
