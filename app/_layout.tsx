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
import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { MiniPremiumBadge } from "@/src/components/ui/MiniPremiumBadge";
import { PaywallModal } from "../src/components/ui/PaywallModal";
import StreakModal from "../src/components/ui/StreakModal";
import { useNotifications } from "../src/hooks/useNotifications";
import { usePremium } from "../src/hooks/usePremium"; // UNIFIED: Single premium source
import { useStreak } from "../src/hooks/useStreak";
import { getPaywallService } from "../src/services/PaywallService";
import revenueCatService from "../src/services/revenueCat";
import { useOnboardingSelectors } from "../src/store/useOnboardingStore";
import { usePurchaseSelectors } from "../src/store/usePurchaseStore";
import { useQuoteSelectors } from "../src/store/useQuoteStore";
import {
  ThemeProvider as ThemeContextProvider,
  useTheme,
} from "../src/utils/ThemeContext";
// Widget: update initial content once stores are ready (iOS only)
import { updateWithFavoriteOrRandom } from "../src/services/WidgetService";

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

// StatusBar component that uses our theme
function ThemedStatusBar() {
  const { theme, isDark } = useTheme();

  return (
    <StatusBar
      style={isDark ? "light" : "dark"}
      backgroundColor={theme.colors.background}
      translucent={false}
    />
  );
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Theme
  const colorScheme = useColorScheme();

  // Store hydration
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();
  const onboardingStoreHydrated = useOnboardingSelectors.hasHydrated();
  const purchaseStoreHydrated = usePurchaseSelectors.hasHydrated();

  // UNIFIED: Premium system
  const { ensureFreshPremiumStatus } = usePremium();

  const isHydrated =
    quoteStoreHydrated && onboardingStoreHydrated && purchaseStoreHydrated;

  // Store selectors - properly call the selector functions
  const onboardingCompleted = useOnboardingSelectors.isCompleted();
  const { modalState, closeModal, showStreakContinue, showStreakBreak } =
    useStreak();
  const { setPremium } = usePurchaseSelectors.actions();
  const isPurchaseHydrated = usePurchaseSelectors.hasHydrated();

  // Initialize notifications and streak tracking
  useNotifications();

  useEffect(() => {
    // Initialize PaywallService when app starts
    const initializeServices = async () => {
      try {
        console.log("🚀 Initializing PaywallService...");
        await getPaywallService().initialize();
        console.log("✅ PaywallService initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize PaywallService:", error);
      }
    };

    initializeServices();
  }, []);

  // Initialize RevenueCat and sync premium status when purchase store is hydrated
  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (!isPurchaseHydrated) return;

      try {
        console.log("🚀 Initializing RevenueCat...");
        const initialized = await revenueCatService.initialize();

        if (initialized) {
          console.log("✅ RevenueCat initialized successfully");

          // Check premium status and sync with store
          const isPremium = await revenueCatService.isPremiumUser();
          console.log(`🔄 Initial RevenueCat premium check: ${isPremium}`);

          setPremium(isPremium);
          console.log(`✅ Premium status synced to store: ${isPremium}`);
        }
      } catch (error) {
        console.error("❌ Failed to initialize RevenueCat:", error);
      }
    };

    initializeRevenueCat();
  }, [isPurchaseHydrated, setPremium]);

  // Enhanced app state change handler with premium sync
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      console.log(`🔄 App state changed to: ${nextAppState}`);

      if (nextAppState === "active") {
        console.log("🔄 App became active, verifying premium status...");

        try {
          // UNIFIED: Use unified premium verification
          const actualIsPremium = await ensureFreshPremiumStatus();
          console.log(`✅ Premium status verified: ${actualIsPremium}`);
        } catch (error) {
          console.error(
            "❌ Failed to verify premium status on app focus:",
            error
          );
        }
      }
    },
    [ensureFreshPremiumStatus]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [handleAppStateChange]);

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (loaded && isHydrated) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn("Error hiding splash screen:", error);
        }
      }
    };

    hideSplashScreen();
  }, [loaded, isHydrated]);

  // Once stores are hydrated, push a favorite/random quote to the widget
  useEffect(() => {
    if (!loaded || !isHydrated) return;
    updateWithFavoriteOrRandom();
  }, [loaded, isHydrated]);

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
      onboardingStoreHydrated &&
      quoteStoreHydrated &&
      purchaseStoreHydrated &&
      isHydrated
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
    onboardingStoreHydrated,
    quoteStoreHydrated,
    purchaseStoreHydrated,
    isHydrated,
  ]);

  if (!loaded || !isHydrated) {
    return null;
  }

  return (
    <ThemeContextProvider defaultTheme={colorScheme || "system"}>
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <ThemedStatusBar />
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

        {/* Global PaywallModal - Accessible from anywhere in the app */}
        <PaywallModal />

        {/* Global MiniPremiumBadge - Shows on all screens */}

        <MiniPremiumBadge />

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
