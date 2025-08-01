import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserName } from "../../store/useOnboardingStore";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");
const MAX_STREAK_CIRCLES = 7;

interface StreakModalProps {
  visible: boolean;
  streakCount: number;
  isStreakContinued: boolean;
  onClose: () => void;
}

interface StreakCircleProps {
  index: number;
  isActive: boolean;
  progress: Animated.Value;
  flickerAnim: Animated.Value;
  theme: any;
}

const StreakCircle: React.FC<StreakCircleProps> = ({
  index,
  isActive,
  progress,
  flickerAnim,
  theme,
}) => {
  const circleSize = 16;
  const circleSpacing = 12;

  // Theme-based fire colors using primary and secondary colors
  const getFireColors = () => {
    return {
      outer: theme.colors.primary,
      middle: theme.colors.primaryLight,
      inner: theme.colors.secondary,
      glow: theme.colors.primary,
      inactive: theme.colors.surface,
      border: theme.colors.border,
    };
  };

  const colors = getFireColors();

  const circleStyle: ViewStyle = {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    marginHorizontal: circleSpacing / 2,
    backgroundColor: colors.inactive,
    borderWidth: 2,
    borderColor: isActive ? colors.glow : colors.border,
    overflow: "hidden" as const,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: isActive ? colors.glow : "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isActive ? 0.8 : 0,
    shadowRadius: 6,
    elevation: isActive ? 12 : 0,
  };

  // Enhanced fire effect with theme colors
  const fireOpacity = flickerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.9],
  });

  const innerFireScale = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0.7, 1],
  });

  const outerFireScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.9, 1.3],
  });

  const coreFireScale = progress.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [0, 0.5, 0.8],
  });

  return (
    <Animated.View style={circleStyle}>
      {isActive && (
        <>
          {/* Outer fire layer */}
          <Animated.View
            style={{
              position: "absolute" as const,
              width: "100%" as const,
              height: "100%" as const,
              backgroundColor: colors.outer,
              borderRadius: circleSize / 2,
              transform: [{ scale: outerFireScale }],
              opacity: fireOpacity,
            }}
          />
          {/* Middle fire layer */}
          <Animated.View
            style={{
              position: "absolute" as const,
              width: "100%" as const,
              height: "100%" as const,
              backgroundColor: colors.middle,
              borderRadius: circleSize / 2,
              transform: [{ scale: innerFireScale }],
              opacity: fireOpacity,
            }}
          />
          {/* Core fire layer */}
          <Animated.View
            style={{
              position: "absolute" as const,
              width: "100%" as const,
              height: "100%" as const,
              backgroundColor: colors.inner,
              borderRadius: circleSize / 2,
              transform: [{ scale: coreFireScale }],
              opacity: fireOpacity,
            }}
          />
        </>
      )}
    </Animated.View>
  );
};

export default function StreakModal({
  visible,
  streakCount,
  isStreakContinued,
  onClose,
}: StreakModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const userName = useUserName();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const streakProgress = useRef(
    Array.from({ length: MAX_STREAK_CIRCLES }, () => new Animated.Value(0))
  ).current;
  const flickerAnims = useRef(
    Array.from({ length: MAX_STREAK_CIRCLES }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      streakProgress.forEach((anim) => anim.setValue(0));
      flickerAnims.forEach((anim) => anim.setValue(0));

      // Modal entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate streak circles with enhanced fire effect
      if (isStreakContinued) {
        const activeCircles = Math.min(streakCount, MAX_STREAK_CIRCLES);

        // Sequential animations for each circle
        const animations = streakProgress
          .slice(0, activeCircles)
          .map((anim, index) =>
            Animated.sequence([
              Animated.delay(400 + index * 120),
              Animated.spring(anim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }),
            ])
          );

        // Enhanced flickering animation
        const flickerAnimations = flickerAnims
          .slice(0, activeCircles)
          .map((anim, index) =>
            Animated.sequence([
              Animated.delay(400 + index * 120 + 300),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(anim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                  Animated.timing(anim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                ])
              ),
            ])
          );

        Animated.parallel([...animations, ...flickerAnimations]).start();
      }

      // Auto close after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [visible, isStreakContinued, streakCount]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getTitle = () => {
    if (isStreakContinued) {
      if (streakCount === 1) {
        return userName
          ? t("streak.started_title_personalized").replace(
              "{userName}",
              userName
            )
          : t("streak.started_title");
      }
      return userName
        ? t("streak.continued_title_personalized").replace(
            "{userName}",
            userName
          )
        : t("streak.continued_title");
    }
    return userName
      ? t("streak.broken_title_personalized").replace("{userName}", userName)
      : t("streak.broken_title");
  };

  const getMessage = () => {
    if (isStreakContinued) {
      if (streakCount === 1) {
        return userName
          ? t("streak.started_message_personalized").replace(
              "{userName}",
              userName
            )
          : t("streak.started_message");
      }
      let message = userName
        ? t("streak.continued_message_personalized")
        : t("streak.continued_message");

      return message
        .replace("{count}", streakCount.toString())
        .replace("{userName}", userName || "");
    }
    return userName
      ? t("streak.broken_message_personalized").replace("{userName}", userName)
      : t("streak.broken_message");
  };

  const renderStreakIndicator = () => {
    return (
      <View style={styles.streakIndicator}>
        {Array.from({ length: MAX_STREAK_CIRCLES }).map((_, index) => (
          <StreakCircle
            key={`streak-${index}`}
            index={index}
            isActive={
              isStreakContinued &&
              index < Math.min(streakCount, MAX_STREAK_CIRCLES)
            }
            progress={streakProgress[index]}
            flickerAnim={flickerAnims[index]}
            theme={theme}
          />
        ))}
      </View>
    );
  };

  // Theme-based overlay gradient
  const getOverlayGradient = () => {
    return [theme.colors.backdrop, theme.colors.overlay];
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={getOverlayGradient() as [string, string]}
          style={styles.overlay}
        />
        <View style={styles.centeredContent}>
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.surface,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                shadowColor: theme.colors.shadowColor,
                borderColor: theme.colors.border,
                ...(isStreakContinued && {
                  shadowColor: theme.colors.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 20,
                  borderColor: theme.colors.primaryLight,
                }),
              },
            ]}
          >
            {/* Header section */}
            <View style={styles.header}>
              <Text style={[styles.emoji, { color: theme.colors.text }]}>
                {isStreakContinued ? "🔥" : "💔"}
              </Text>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    ...(isStreakContinued && {
                      color: theme.colors.primary,
                    }),
                  },
                ]}
              >
                {getTitle()}
              </Text>
            </View>

            {/* Streak visual indicator */}
            {isStreakContinued && (
              <View style={styles.indicatorSection}>
                {renderStreakIndicator()}
              </View>
            )}

            {/* Streak count section */}
            <View style={styles.countSection}>
              <Text
                style={[
                  styles.streakNumber,
                  {
                    color: isStreakContinued
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {streakCount}
              </Text>
              <Text
                style={[
                  styles.streakLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {streakCount === 1 ? t("streak.day") : t("streak.days")}
              </Text>
            </View>

            {/* Message section */}
            <Text
              style={[styles.message, { color: theme.colors.textSecondary }]}
            >
              {getMessage()}
            </Text>

            {/* Action button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                },
              ]}
              onPress={handleClose}
            >
              <Text
                style={[styles.actionButtonText, { color: theme.colors.white }]}
              >
                {t("common.skip")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingHorizontal: 20,
  },
  container: {
    width: width * 0.9,
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1,
    elevation: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  indicatorSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  streakIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 32,
    paddingHorizontal: 16,
  },
  countSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -4,
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 24,
    marginBottom: 24,
    opacity: 0.85,
  },
  actionButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
