import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {Animated, Image, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useScreenTranslations} from "../../hooks/useTranslation";
import {useUserName} from "../../store/useOnboardingStore";
import {usePaywallSelectors} from "../../store/usePaywallStore";
import {useTheme} from "../../utils/ThemeContext";

const TOTAL_DURATION = 4200;
const STEP_COUNT = 4;
const STEP_DURATION = TOTAL_DURATION / STEP_COUNT;

// Simulated quote count that ticks up during loading
const QUOTE_COUNT_TARGET = 847;

export function PersonalizationScreen() {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const userName = useUserName();
  const personalization = useScreenTranslations("personalization");
  const onboarding = useScreenTranslations("onboarding");
  const {markOnboardingCompleted, showFirstTimePaywall} =
    usePaywallSelectors.actions();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(0.85)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [showFoundMessage, setShowFoundMessage] = useState(false);

  const steps = [
    personalization.step1,
    personalization.step2,
    personalization.step3,
    personalization.step4,
  ];

  const title = userName
    ? (personalization.title_with_name as string)
        ?.replace("{{name}}", userName) ?? personalization.title
    : personalization.title;

  useEffect(() => {
    // Fade in + icon scale entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

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
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(messageAnim, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start();
          setTimeout(() => setCurrentMessageIndex(i), 180);
        }, i * STEP_DURATION)
      );
    }

    // Animate quote count ticking up (starts at ~60% of total duration)
    const countStart = TOTAL_DURATION * 0.55;
    const countDuration = TOTAL_DURATION * 0.32;
    const countInterval = 30; // ms per tick
    const totalTicks = countDuration / countInterval;
    const increment = QUOTE_COUNT_TARGET / totalTicks;

    let currentCount = 0;
    const countTimer = setTimeout(() => {
      const ticker = setInterval(() => {
        currentCount = Math.min(currentCount + increment, QUOTE_COUNT_TARGET);
        setQuoteCount(Math.round(currentCount));
        if (currentCount >= QUOTE_COUNT_TARGET) {
          clearInterval(ticker);
          setShowFoundMessage(true);
        }
      }, countInterval);
      intervals.push(ticker as any);
    }, countStart);
    intervals.push(countTimer);

    // Navigate after animation completes
    const navTimer = setTimeout(() => {
      markOnboardingCompleted();
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

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const goldColor = theme.colors.brandYellow;
  const trackColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  // Found message: replace {{count}} with actual count
  const rawFoundMessage =
    (onboarding as any).personalization_found ||
    "Found {{count}} perfect quotes for you ✓";
  const foundMessage = rawFoundMessage.replace(
    "{{count}}",
    quoteCount.toString()
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 40,
              paddingBottom: insets.bottom + 40,
            },
          ]}
        >
          {/* App icon with glow ring */}
          <View style={styles.iconWrap}>
            {/* Pulsing glow */}
            <Animated.View
              style={[
                styles.iconGlow,
                {
                  backgroundColor: `${goldColor}22`,
                  opacity: glowOpacity,
                },
              ]}
            />
            <Animated.View
              style={{transform: [{scale: iconScaleAnim}]}}
            >
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {title}
          </Text>

          {/* Subtitle */}
          <Text
            style={[
              styles.subtitle,
              {color: theme.colors.textSecondary ?? theme.colors.text},
            ]}
          >
            {personalization.subtitle}
          </Text>

          {/* Progress bar */}
          <View style={[styles.track, {backgroundColor: trackColor}]}>
            <Animated.View style={[styles.fillWrap, {width: progressWidth}]}>
              <LinearGradient
                colors={[goldColor, `${goldColor}BB`]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.fill}
              />
            </Animated.View>
          </View>

          {/* Cycling step message */}
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

          {/* Quote count — fades in once ticking starts */}
          {quoteCount > 0 && (
            <View style={styles.countWrap}>
              <Text
                style={[styles.countNumber, {color: goldColor}]}
              >
                {quoteCount.toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.countLabel,
                  {color: theme.colors.textSecondary},
                ]}
              >
                {showFoundMessage
                  ? foundMessage
                  : "quotes matched so far..."}
              </Text>
            </View>
          )}
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
    gap: 18,
  },

  // Icon with glow
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.7,
    marginTop: -6,
    lineHeight: 22,
  },

  // Progress bar
  track: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  fillWrap: {
    height: "100%",
    overflow: "hidden",
    borderRadius: 2,
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    // Width is 100% of fillWrap which is animated
    width: "100%",
  },

  message: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },

  // Quote count
  countWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  countNumber: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  countLabel: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
});
