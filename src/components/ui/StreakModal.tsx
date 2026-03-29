import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTranslation } from "../../hooks/useTranslation";
import { useUserName } from "../../store/useOnboardingStore";
import { useTheme } from "../../utils/ThemeContext";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

interface StreakModalProps {
  visible: boolean;
  streakCount: number;
  isStreakContinued: boolean;
  onClose: () => void;
}

// Notification-style streak notification component

export default function StreakModal({
  visible,
  streakCount,
  isStreakContinued,
  onClose,
}: StreakModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const userName = useUserName();

  // Animation values for notification slide
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      translateY.setValue(-200);
      opacity.setValue(0);
      scaleAnim.setValue(0.9);

      // Slide in from top animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Ensure streak count is always at least 1 for display
  const displayStreakCount = Math.max(1, streakCount);

  const getTitle = () => {
    if (isStreakContinued) {
      if (displayStreakCount === 1) {
        return t("streak.started_title");
      }
      return t("streak.continued_title");
    }
    return t("streak.broken_title");
  };

  const getMessage = () => {
    if (isStreakContinued) {
      if (displayStreakCount === 1) {
        return t("streak.started_message");
      }
      return t("streak.continued_message").replace(
        "{count}",
        displayStreakCount.toString()
      );
    }
    return t("streak.broken_message");
  };

  const getStreakEmoji = () => {
    if (!isStreakContinued) return "💔";
    if (displayStreakCount === 1) return "🌟";
    if (displayStreakCount >= 7) return "🔥";
    if (displayStreakCount >= 3) return "⚡";
    return "✨";
  };

  // Get notification background gradient
  const getNotificationGradient = (): [string, string, ...string[]] => {
    if (isStreakContinued) {
      return [
        theme.colors.brandYellow + "F0",
        theme.colors.brandYellow + "E0",
        theme.colors.brandYellow + "D0",
      ];
    }
    return [
      theme.colors.whiteOverlay70,
      theme.colors.whiteOverlay80,
      theme.colors.whiteOverlay90,
    ];
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.notificationContainer}>
        <Animated.View
          style={[
            styles.notification,
            {
              opacity: opacity,
              transform: [{ translateY: translateY }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={getNotificationGradient()}
            style={styles.notificationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.notificationContent}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              {/* Icon & Content */}
              <View style={styles.leftContent}>
                {!isStreakContinued && (
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isStreakContinued
                          ? theme.colors.brandYellow + "40"
                          : "#00000020",
                      },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{getStreakEmoji()}</Text>
                  </View>
                )}
                <View style={styles.textContent}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      {
                        color: isStreakContinued ? "#000" : "#000000",
                      },
                    ]}
                  >
                    {getTitle()}
                  </Text>
                  <Text
                    style={[
                      styles.notificationMessage,
                      {
                        color: isStreakContinued ? "#000000CC" : "#000000BB",
                      },
                    ]}
                  >
                    {getMessage()}
                  </Text>
                </View>
              </View>

              {/* Streak Count */}
              <View style={styles.rightContent}>
                <Text
                  style={[
                    styles.streakCount,
                    {
                      color: isStreakContinued ? "#000" : "#000000",
                    },
                  ]}
                >
                  {displayStreakCount}
                </Text>
                <Text
                  style={[
                    styles.streakDays,
                    {
                      color: isStreakContinued ? "#000000AA" : "#000000AA",
                    },
                  ]}
                >
                  {displayStreakCount === 1 ? t("streak.day") : t("streak.days")}
                </Text>
              </View>

              {/* Close Icon */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol
                  name="xmark"
                  size={16}
                  color={isStreakContinued ? "#00000080" : "#00000080"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: isIOS ? 50 : 25,
    paddingHorizontal: 16,
  },
  notification: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  notificationGradient: {
    borderRadius: 16,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 80,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
    textAlign: "center",
  },
  textContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.8,
    lineHeight: 18,
  },
  rightContent: {
    alignItems: "center",
    marginRight: 8,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
    letterSpacing: -1,
  },
  streakDays: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "lowercase",
    opacity: 0.7,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
