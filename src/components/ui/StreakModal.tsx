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
  selectedTheme: string;
}

const StreakCircle: React.FC<StreakCircleProps> = ({
  index,
  isActive,
  progress,
  flickerAnim,
  theme,
  selectedTheme,
}) => {
  const circleSize = 14;
  const circleSpacing = 10;

  // Enhanced theme-specific colors with fire-like gradients
  const getCircleColors = () => {
    switch (selectedTheme) {
      case "ocean":
        return {
          active: ["#FF6B47", "#FF8E53", "#FFA726"], // Ocean fire: coral to orange
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#FF6B47",
        };
      case "forest":
        return {
          active: ["#FF5722", "#FF7043", "#FF8A65"], // Forest fire: deep orange to lighter
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#FF5722",
        };
      case "sunset":
        return {
          active: ["#FF3D00", "#FF6D00", "#FF9100"], // Sunset fire: red to yellow
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#FF3D00",
        };
      case "purple":
        return {
          active: ["#E91E63", "#F44336", "#FF5722"], // Purple fire: pink to red
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#E91E63",
        };
      case "minimalist":
        return {
          active: ["#FF4444", "#FF6666", "#FF8888"], // Minimalist fire: clean reds
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#FF4444",
        };
      default:
        return {
          active: ["#FF4500", "#FF6347", "#FFA500"], // Default fire: orange red to orange
          inactive: theme.colors.background,
          border: theme.colors.border,
          glow: "#FF4500",
        };
    }
  };

  const colors = getCircleColors();

  const circleStyle: ViewStyle = {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    marginHorizontal: circleSpacing / 2,
    backgroundColor: colors.inactive,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden" as const,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: isActive ? colors.glow : "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: isActive ? 8 : 0,
  };

  // Animated fire effect with flickering
  const fireOpacity = flickerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.8],
  });

  const innerFireScale = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0.6, 1],
  });

  const outerFireScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1.2],
  });

  const coreFireScale = progress.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [0, 0.4, 0.7],
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
              backgroundColor: colors.active[0],
              borderRadius: circleSize / 2,
              transform: [{ scale: outerFireScale }],
              opacity: fireOpacity,
            }}
          />
          {/* Inner fire layer */}
          <Animated.View
            style={{
              position: "absolute" as const,
              width: "100%" as const,
              height: "100%" as const,
              backgroundColor: colors.active[1],
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
              backgroundColor: colors.active[2],
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
  const { theme, selectedTheme } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
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
      scaleAnim.setValue(0.3);
      streakProgress.forEach((anim) => anim.setValue(0));
      flickerAnims.forEach((anim) => anim.setValue(0));

      // Modal entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate streak circles with fire-like effect
      if (isStreakContinued) {
        const activeCircles = Math.min(streakCount, MAX_STREAK_CIRCLES);

        // Create sequential animations for each circle
        const animations = streakProgress
          .slice(0, activeCircles)
          .map((anim, index) =>
            Animated.sequence([
              // Initial delay for modal to appear
              Animated.delay(300 + index * 150),
              // Fire ignition effect
              Animated.spring(anim, {
                toValue: 1,
                tension: 40,
                friction: 6,
                useNativeDriver: true,
              }),
            ])
          );

        // Flickering fire animation for active circles
        const flickerAnimations = flickerAnims
          .slice(0, activeCircles)
          .map((anim, index) =>
            Animated.sequence([
              Animated.delay(300 + index * 150 + 200), // Start after ignition
              Animated.loop(
                Animated.sequence([
                  Animated.timing(anim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                  }),
                  Animated.timing(anim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                  }),
                ])
              ),
            ])
          );

        // Start all animations in parallel
        Animated.parallel([...animations, ...flickerAnimations]).start();
      }

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, isStreakContinued, streakCount]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getTitle = () => {
    if (isStreakContinued) {
      if (streakCount === 1) {
        return t("streak.started_title");
      }
      return t("streak.continued_title");
    }
    return t("streak.broken_title");
  };

  const getMessage = () => {
    if (isStreakContinued) {
      if (streakCount === 1) {
        return t("streak.started_message");
      }
      return t("streak.continued_message").replace(
        "{count}",
        streakCount.toString()
      );
    }
    return t("streak.broken_message");
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
            selectedTheme={selectedTheme}
          />
        ))}
      </View>
    );
  };

  // Enhanced theme-specific styling
  const getThemeSpecificStyles = () => {
    switch (selectedTheme) {
      case "ocean":
        return {
          containerGlow: theme.colors.primary + "20",
          titleGlow: theme.colors.primary,
        };
      case "forest":
        return {
          containerGlow: theme.colors.primary + "20",
          titleGlow: theme.colors.primary,
        };
      case "sunset":
        return {
          containerGlow: "#FF3D00" + "20",
          titleGlow: "#FF3D00",
        };
      case "purple":
        return {
          containerGlow: theme.colors.primary + "20",
          titleGlow: theme.colors.primary,
        };
      case "minimalist":
        return {
          containerGlow: theme.colors.primary + "15",
          titleGlow: theme.colors.primary,
        };
      default:
        return {
          containerGlow: "#FF4500" + "20",
          titleGlow: "#FF4500",
        };
    }
  };

  const themeStyles = getThemeSpecificStyles();

  // Themed gradient for modal overlay
  const getOverlayGradient = () => {
    switch (selectedTheme) {
      case "ocean":
        return ["rgba(178,235,242,0.7)", "rgba(33,150,243,0.4)"];
      case "forest":
        return ["rgba(200,230,201,0.7)", "rgba(56,142,60,0.4)"];
      case "sunset":
        return ["rgba(255,224,178,0.7)", "rgba(255,112,67,0.4)"];
      case "purple":
        return ["rgba(225,190,231,0.7)", "rgba(103,58,183,0.4)"];
      case "minimalist":
        return ["rgba(245,245,245,0.7)", "rgba(158,158,158,0.3)"];
      default:
        return ["rgba(255,224,178,0.7)", "rgba(33,150,243,0.3)"];
    }
  };
  const overlayGradient = getOverlayGradient();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.absoluteFill}>
        <LinearGradient
          colors={overlayGradient as [string, string]}
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
                  shadowColor: themeStyles.titleGlow,
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                }),
              },
            ]}
          >
            <View style={styles.content}>
              <Text style={[styles.emoji, { color: theme.colors.text }]}>
                {isStreakContinued ? "🔥" : "💔"}
              </Text>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    ...(isStreakContinued && {
                      textShadowColor: themeStyles.titleGlow,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 10,
                    }),
                  },
                ]}
              >
                {getTitle()}
              </Text>

              {isStreakContinued && renderStreakIndicator()}

              <View style={styles.streakContainer}>
                <Text
                  style={[
                    styles.streakNumber,
                    {
                      color: theme.colors.primary,
                      textShadowColor: themeStyles.titleGlow,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 8,
                    },
                  ]}
                >
                  {streakCount}
                </Text>
                <Text
                  style={[styles.streakLabel, { color: theme.colors.text }]}
                >
                  {streakCount === 1 ? t("streak.day") : t("streak.days")}
                </Text>
              </View>

              <Text
                style={[styles.message, { color: theme.colors.textSecondary }]}
              >
                {getMessage()}
              </Text>

              <TouchableOpacity
                style={[
                  styles.skipButton,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={handleClose}
              >
                <Text
                  style={[
                    styles.skipButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {t("common.skip")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
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
  },
  container: {
    width: width * 0.85,
    maxWidth: 350,
    borderRadius: 24,
    padding: 32,
    elevation: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    zIndex: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  streakIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    height: 24,
    paddingHorizontal: 8,
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: "900",
    textAlign: "center",
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -8,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  skipButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
