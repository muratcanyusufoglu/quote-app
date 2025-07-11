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
  theme: any;
}

const StreakCircle: React.FC<StreakCircleProps> = ({
  index,
  isActive,
  progress,
  theme,
}) => {
  const circleSize = 14;
  const circleSpacing = 10;

  // Theme-specific colors
  const getCircleColors = () => {
    const themeOption = theme.name || "default";
    switch (themeOption) {
      case "ocean":
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
        };
      case "forest":
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
        };
      case "sunset":
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
        };
      case "purple":
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
        };
      case "minimalist":
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
        };
      default:
        return {
          active: theme.colors.primary,
          inactive: theme.colors.background,
          border: theme.colors.border,
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
  };

  const fillStyle = {
    position: "absolute" as const,
    width: "100%" as const,
    height: "100%" as const,
    backgroundColor: colors.active,
    transform: [
      {
        scale: progress,
      },
    ],
  };

  return (
    <View style={circleStyle}>
      <Animated.View style={fillStyle} />
    </View>
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const streakProgress = useRef(
    Array.from({ length: MAX_STREAK_CIRCLES }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      streakProgress.forEach((anim) => anim.setValue(0));

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

      // Animate streak circles with a smoother, sequential animation
      if (isStreakContinued) {
        const activeCircles = Math.min(streakCount, MAX_STREAK_CIRCLES);

        // Create sequential animations for each circle
        const animations = streakProgress
          .slice(0, activeCircles)
          .map((anim, index) =>
            Animated.sequence([
              // Initial delay for modal to appear
              Animated.delay(300 + index * 150),
              // Spring animation for smooth filling
              Animated.spring(anim, {
                toValue: 1,
                tension: 30,
                friction: 8,
                useNativeDriver: true,
              }),
            ])
          );

        // Start all animations in parallel
        Animated.parallel(animations).start();
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
            theme={theme}
          />
        ))}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              shadowColor: theme.colors.shadowColor,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.emoji, { color: theme.colors.text }]}>
              {isStreakContinued ? "🔥" : "💔"}
            </Text>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {getTitle()}
            </Text>

            {isStreakContinued && renderStreakIndicator()}

            <View style={styles.streakContainer}>
              <Text
                style={[styles.streakNumber, { color: theme.colors.primary }]}
              >
                {streakCount}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.colors.text }]}>
                {streakCount === 1 ? t("streak.day") : t("streak.days")}
              </Text>
            </View>

            <Text
              style={[styles.message, { color: theme.colors.textSecondary }]}
            >
              {getMessage()}
            </Text>

            <TouchableOpacity
              style={[styles.skipButton, { borderColor: theme.colors.primary }]}
              onPress={handleClose}
            >
              <Text
                style={[styles.skipButtonText, { color: theme.colors.primary }]}
              >
                {t("common.skip")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
