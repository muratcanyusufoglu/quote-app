import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePremium } from "../../hooks/usePremium";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { useTheme } from "../../utils/ThemeContext";

// Button container
const BTN = 64;
const BTN_RADIUS = 20;

// Gift box dimensions (inside the button)
const BOX_W = 36;
const LID_H = 13;
const BODY_H = 20;
const RIBBON_W = 4;
const LID_LIFT = 10;

// Bow loop dimensions
const BOW_W = 8;
const BOW_H = 5;

export function GiftBoxButton() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const showGiftButton = usePaywallSelectors.showGiftButton();
  const { showPaywall } = usePaywallSelectors.actions();

  const lidY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showGiftButton || isPremium) return;

    // Lid open → pause → close → pause → repeat
    const lidLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.spring(lidY, {
          toValue: -LID_LIFT,
          useNativeDriver: true,
          speed: 18,
          bounciness: 8,
        }),
        Animated.delay(550),
        Animated.spring(lidY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 4,
        }),
      ])
    );

    // Subtle pulse on the whole button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.07,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    lidLoop.start();
    pulseLoop.start();

    return () => {
      lidLoop.stop();
      pulseLoop.stop();
      lidY.setValue(0);
      scaleAnim.setValue(1);
    };
  }, [showGiftButton, isPremium]);

  if (!showGiftButton || isPremium) return null;

  const ribbon = "rgba(255,255,255,0.88)";
  const lidGradient: [string, string] = isDark
    ? ["#A86018", "#C87820"]
    : ["#B86A1A", "#D48020"];
  const bodyGradient: [string, string] = isDark
    ? ["#D08828", "#F0A830"]
    : ["#E09030", "#F5B840"];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          right: 20,
          bottom: insets.bottom + 84,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Static background pill */}
      <View
        pointerEvents="none"
        style={[styles.glow, { backgroundColor: theme.colors.surface }]}
      />

      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => showPaywall("discounted")}
      >
        {/* Container — transparent, no background */}
        <View style={styles.container}>
          {/* Lid — animates upward */}
          <Animated.View
            style={[
              styles.lidWrap,
              { transform: [{ translateY: lidY }] },
            ]}
          >
            <LinearGradient
              colors={lidGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.lid}
            >
              {/* Ribbon on lid */}
              <View
                style={[
                  styles.ribbonV,
                  { backgroundColor: ribbon, left: BOX_W / 2 - RIBBON_W / 2, height: LID_H },
                ]}
              />
              {/* Bow — left loop */}
              <View
                style={[
                  styles.bow,
                  { backgroundColor: ribbon, left: BOX_W / 2 - RIBBON_W / 2 - BOW_W },
                ]}
              />
              {/* Bow — right loop */}
              <View
                style={[
                  styles.bow,
                  { backgroundColor: ribbon, left: BOX_W / 2 + RIBBON_W / 2 },
                ]}
              />
            </LinearGradient>
          </Animated.View>

          {/* Box body */}
          <LinearGradient
            colors={bodyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.body}
          >
            {/* Vertical ribbon */}
            <View
              style={[
                styles.ribbonV,
                { backgroundColor: ribbon, left: BOX_W / 2 - RIBBON_W / 2, height: BODY_H },
              ]}
            />
            {/* Horizontal ribbon */}
            <View
              style={[
                styles.ribbonH,
                { backgroundColor: ribbon, top: BODY_H / 2 - RIBBON_W / 2 },
              ]}
            />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    zIndex: 9998,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: BOX_W + 16,
    height: LID_H + BODY_H + 16,
    borderRadius: 12,
    top: -8,
    left: -(16 / 2),
  },
  container: {
    width: BTN,
    height: BTN,
    alignItems: "center",
    justifyContent: "center",
  },
  lidWrap: {
    zIndex: 2,
  },
  lid: {
    width: BOX_W,
    height: LID_H,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: "hidden",
  },
  body: {
    width: BOX_W,
    height: BODY_H,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: "hidden",
  },
  ribbonV: {
    position: "absolute",
    width: RIBBON_W,
    top: 0,
  },
  ribbonH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: RIBBON_W,
  },
  bow: {
    position: "absolute",
    top: -3,
    width: BOW_W,
    height: BOW_H,
    borderRadius: 3,
  },
});
