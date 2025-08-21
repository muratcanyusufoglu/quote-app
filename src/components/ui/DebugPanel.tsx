import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { updateWithFavoriteOrRandom } from "../../services/WidgetService";
import {
  countryUses12HourFormat,
  getUserCountry,
  uses12HourFormat,
} from "../../utils/language";
import RevenueCatPackageTest from "../test/RevenueCatPackageTest";
import RevenueCatTestComponent from "../test/RevenueCatTestComponent";

interface DebugPanelProps {
  isPremium: boolean;
  displayQuotes: any[];
  userPreferences: any;
  common: any;
  theme: any;
  togglePremiumStatus: () => void;
  handleResetOnboarding: () => void;
  showStreakContinue: () => void;
  showStreakBreak: () => void;
  handleShowPaywall: () => void;
}

export function DebugPanel({
  isPremium,
  displayQuotes,
  userPreferences,
  common,
  theme,
  togglePremiumStatus,
  handleResetOnboarding,
  showStreakContinue,
  showStreakBreak,
  handleShowPaywall,
}: DebugPanelProps) {
  const [showRevenueCatTest, setShowRevenueCatTest] = useState(false);
  const [showPackageTest, setShowPackageTest] = useState(false);
  const [isUpdatingWidget, setIsUpdatingWidget] = useState(false);
  const styles = createStyles(theme);

  // Get time format info for debugging
  const is12HourFormat = uses12HourFormat();
  const userCountry = getUserCountry();
  const countryPrefers12h = countryUses12HourFormat(userCountry);

  // Widget güncelleme fonksiyonu
  const handleWidgetUpdate = async () => {
    if (isUpdatingWidget) return;

    setIsUpdatingWidget(true);
    try {
      console.log("🔧 Debug: Widget manuel güncelleniyor...");
      await updateWithFavoriteOrRandom();
    } catch (error) {
      console.error("❌ Debug: Widget güncellenirken hata:", error);
    } finally {
      setIsUpdatingWidget(false);
    }
  };

  return (
    <View
      style={[
        styles.debugPanel,
        {
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.debugContent}>
        <View style={styles.debugInfo}>
          <Text style={[styles.debugTitle, { color: theme.colors.white }]}>
            Debug Panel
          </Text>
          <Text
            style={[styles.debugText, { color: theme.colors.whiteOverlay80 }]}
          >
            Premium: {isPremium ? common.yes : common.no}
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.white }]}>
            Quotes: {displayQuotes.length} | Categories:{" "}
            {userPreferences?.selectedCategories?.length || 0}
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.white }]}>
            Language: {(common.language || "EN").toUpperCase()}
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.brandYellow }]}>
            🕐 {userCountry}: {is12HourFormat ? "12h (AM/PM)" : "24h"} |
            Expected: {countryPrefers12h ? "12h" : "24h"}
          </Text>
        </View>
        <View style={styles.debugButtons}>
          <TouchableOpacity
            style={[
              styles.debugButton,
              {
                backgroundColor: isPremium
                  ? theme.colors.premium
                  : theme.colors.surface,
              },
            ]}
            onPress={togglePremiumStatus}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              {isPremium ? common.premium_status : common.free_status}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={handleResetOnboarding}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              {common.reset_onboarding}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.brandYellow },
            ]}
            onPress={showStreakContinue}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              🔥 Streak
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={showStreakBreak}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              💔 Break
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleShowPaywall}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              💰 Paywall
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: "#8b5cf6" }, // Purple for widget
            ]}
            onPress={handleWidgetUpdate}
            disabled={isUpdatingWidget}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              {isUpdatingWidget ? "⏳ Güncelleniyor..." : "📱 Widget Güncelle"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.success || "#22c55e" },
            ]}
            onPress={() => setShowPackageTest(!showPackageTest)}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              📦 Test Packages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.debugButton,
              { backgroundColor: theme.colors.warning || "#f59e0b" },
            ]}
            onPress={() => setShowRevenueCatTest(!showRevenueCatTest)}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              🔧 RevenueCat Test
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RevenueCat Test Components - Full Screen Modals */}
      {showPackageTest && (
        <View style={styles.testModal}>
          <RevenueCatPackageTest />
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={() => setShowPackageTest(false)}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              ✕ Close
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showRevenueCatTest && (
        <View style={styles.testModal}>
          <RevenueCatTestComponent />
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={() => setShowRevenueCatTest(false)}
          >
            <Text
              style={[styles.debugButtonText, { color: theme.colors.white }]}
            >
              ✕ Close
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    debugPanel: {
      position: "absolute",
      top: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.blackOverlay70,
      borderRadius: 12,
      padding: 16,
      zIndex: 1000,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    debugContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    debugInfo: {
      flex: 1,
    },
    debugTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    debugText: {
      fontSize: 12,
      fontWeight: "500",
    },
    debugButtons: {
      flexDirection: "column",
      gap: 8,
    },
    debugButton: {
      backgroundColor: theme.colors.brandYellow,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 8,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    debugButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    testModal: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background || "#fff",
      zIndex: 2000,
      padding: 16,
    },
    closeButton: {
      position: "absolute",
      top: 50,
      right: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      zIndex: 2001,
    },
  });

export default DebugPanel;
