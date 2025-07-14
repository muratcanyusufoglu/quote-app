import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const styles = createStyles(theme);
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
        </View>
      </View>
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
  });

export default DebugPanel;
