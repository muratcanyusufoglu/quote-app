import {router} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {Animated, Image, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useScreenTranslations} from "../../hooks/useTranslation";
import {useUserName} from "../../store/useOnboardingStore";
import {usePaywallSelectors} from "../../store/usePaywallStore";
import {useTheme} from "../../utils/ThemeContext";

const TOTAL_DURATION = 4000;
const STEP_COUNT = 4;
const STEP_DURATION = TOTAL_DURATION / STEP_COUNT;

export function PersonalizationScreen() {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const userName = useUserName();
  const personalization = useScreenTranslations("personalization");
  const {markOnboardingCompleted, showFirstTimePaywall} =
    usePaywallSelectors.actions();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(1)).current;

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const steps = [
    personalization.step1,
    personalization.step2,
    personalization.step3,
    personalization.step4,
  ];

  const title = userName
    ? (personalization.title_with_name as string)?.replace(
        "{{name}}",
        userName
      ) ?? personalization.title
    : personalization.title;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TOTAL_DURATION,
      useNativeDriver: false,
    }).start();

    // Cycle through messages
    const intervals: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < STEP_COUNT; i++) {
      intervals.push(
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(messageAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(messageAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          setTimeout(() => setCurrentMessageIndex(i), 200);
        }, i * STEP_DURATION)
      );
    }

    // After animation completes, navigate
    const navTimer = setTimeout(() => {
      markOnboardingCompleted();
      // Set paywall visible BEFORE navigating — PaywallModal is already
      // mounted globally in _layout.tsx and will render as soon as it
      // sees isVisible: true, regardless of which screen is active.
      showFirstTimePaywall();
      router.replace("/(tabs)");
    }, TOTAL_DURATION + 300);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const goldColor = "#f4d03f";
  const trackColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Animated.View
        style={[styles.container, {opacity: fadeAnim}]}
      >
      <View
        style={[
          styles.content,
          {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40},
        ]}
      >
        {/* App icon */}
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.appIcon}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={[styles.title, {color: theme.colors.text}]}>{title}</Text>

        {/* Subtitle */}
        <Text
          style={[styles.subtitle, {color: theme.colors.textSecondary ?? theme.colors.text}]}
        >
          {personalization.subtitle}
        </Text>

        {/* Progress bar */}
        <View style={[styles.track, {backgroundColor: trackColor}]}>
          <Animated.View
            style={[
              styles.fill,
              {width: progressWidth, backgroundColor: goldColor},
            ]}
          />
        </View>

        {/* Cycling message */}
        <Animated.Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary ?? theme.colors.text,
              opacity: messageAnim,
            },
          ]}
        >
          {steps[currentMessageIndex]}
        </Animated.Text>
      </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 20,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.7,
    marginTop: -8,
  },
  track: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
