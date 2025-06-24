import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  useOnboardingCompleted,
  useOnboardingHydrated,
} from "../../src/store/useOnboardingStore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Onboarding state
  const isOnboardingCompleted = useOnboardingCompleted();
  const isOnboardingHydrated = useOnboardingHydrated();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isOnboardingHydrated && !isOnboardingCompleted) {
      console.log("🚀 Redirecting to onboarding - user hasn't completed setup");
      router.replace("/onboarding");
    }
  }, [isOnboardingHydrated, isOnboardingCompleted, router]);

  // Don't render tabs until we know onboarding status
  if (!isOnboardingHydrated) {
    return null; // Could show a loading screen here
  }

  // If onboarding not completed, don't render tabs (user will be redirected)
  if (!isOnboardingCompleted) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoriler",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Geçmiş",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
