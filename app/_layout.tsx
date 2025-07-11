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
import StreakModal from "../src/components/ui/StreakModal";
import { useNotifications } from "../src/hooks/useNotifications";
import { useStreak } from "../src/hooks/useStreak";
import { initializePaywallService } from "../src/services/PaywallService";
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

  // Store selectors - properly call the selector functions
  const onboardingCompleted = useOnboardingSelectors.isCompleted();
  const onboardingHydrated = useOnboardingSelectors.hasHydrated();
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();
  const purchaseStoreHydrated = usePurchaseSelectors.hasHydrated();
  const paywallStoreHydrated = usePaywallSelectors.hasHydrated();

  // Initialize notifications and streak tracking
  useNotifications();
  const { modalState, closeModal } = useStreak();

  useEffect(() => {
    // Initialize PaywallService when app starts
    const initializeServices = async () => {
      try {
        console.log("🚀 Initializing PaywallService...");
        await initializePaywallService();
        console.log("✅ PaywallService initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize PaywallService:", error);
      }
    };

    initializeServices();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Deep linking configuration
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("Deep link received:", url);

      // Parse quote detail deep links
      const quoteDetailMatch = url.match(/quote-detail\/(.+)/);
      if (quoteDetailMatch) {
        const quoteId = quoteDetailMatch[1];
        router.push(`/quote-detail/${quoteId}`);
        return;
      }

      // Handle other deep links
      if (url.includes("onboarding")) {
        router.push("/onboarding");
      } else if (url.includes("explore")) {
        router.push("/(tabs)/explore");
      } else if (url.includes("favorites")) {
        router.push("/(tabs)/favorites");
      } else if (url.includes("history")) {
        router.push("/(tabs)/history");
      }
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Navigation logic after stores are hydrated
    if (
      loaded &&
      onboardingHydrated &&
      quoteStoreHydrated &&
      purchaseStoreHydrated &&
      paywallStoreHydrated
    ) {
      // Navigate to onboarding if not completed
      if (!onboardingCompleted) {
        console.log("🎯 Navigating to onboarding");
        router.replace("/onboarding");
      } else {
        console.log("🎯 Onboarding completed, staying on main flow");
      }
    }
  }, [
    loaded,
    onboardingCompleted,
    onboardingHydrated,
    quoteStoreHydrated,
    purchaseStoreHydrated,
    paywallStoreHydrated,
  ]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContextProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="quote-detail"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />

        {/* Global PaywallModal - Accessible from anywhere in the app */}
        <PaywallModal />

        {/* Global StreakModal - Shows streak achievements and breaks */}
        <StreakModal
          visible={modalState.visible}
          streakCount={modalState.streakCount}
          isStreakContinued={modalState.isStreakContinued}
          onClose={closeModal}
        />
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
