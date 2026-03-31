import React, {useEffect, useRef} from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {useTranslation} from "../../hooks/useTranslation";
import {useTheme} from "../../utils/ThemeContext";

const AUTO_CLOSE_MS = 4000;

interface StreakModalProps {
  visible: boolean;
  streakCount: number;
  isStreakContinued: boolean;
  onClose: () => void;
}

export default function StreakModal({
  visible,
  streakCount,
  isStreakContinued,
  onClose,
}: StreakModalProps) {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();

  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(1)).current; // 1 → 0
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayCount = Math.max(isStreakContinued ? 1 : 0, streakCount);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getTitle = () => {
    if (!isStreakContinued) return t("streak.broken_title");
    if (displayCount === 1) return t("streak.started_title");
    return t("streak.continued_title");
  };

  const getMessage = () => {
    if (!isStreakContinued) return t("streak.broken_message");
    if (displayCount === 1) return t("streak.started_message");
    return t("streak.continued_message").replace(
      "{count}",
      displayCount.toString()
    );
  };

  // ─── Accent colour ──────────────────────────────────────────────────────────
  const gold = theme.colors.brandYellow ?? "#f4d03f";
  const accentColor = isStreakContinued ? gold : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)");
  const iconColor = isStreakContinued ? gold : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)");

  // ─── Animation helpers ───────────────────────────────────────────────────────
  const animateIn = () => {
    progressWidth.setValue(1);
    cardScale.setValue(0.88);
    cardOpacity.setValue(0);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 120,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar depletes over AUTO_CLOSE_MS
    Animated.timing(progressWidth, {
      toValue: 0,
      duration: AUTO_CLOSE_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const animateOut = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.92,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(cb);
  };

  const handleClose = () => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    animateOut(onClose);
  };

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      animateIn();
      autoCloseTimer.current = setTimeout(handleClose, AUTO_CLOSE_MS);
    }
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  // ─── Card colours ────────────────────────────────────────────────────────────
  const cardBg = theme.colors.background;
  const borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";
  const countLabelColor = isStreakContinued
    ? gold
    : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)");

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[styles.backdrop, {opacity: backdropOpacity}]}
        />
      </TouchableWithoutFeedback>

      {/* Card */}
      <View
        style={[
          styles.centeredWrapper,
          {paddingBottom: insets.bottom + 32, paddingTop: insets.top + 16},
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor,
              opacity: cardOpacity,
              transform: [{scale: cardScale}],
              shadowColor: isDark ? "#000" : "#333",
            },
          ]}
        >
          {/* Progress bar */}
          <View style={[styles.progressTrack, {backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: accentColor,
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          >
            <IconSymbol
              name="xmark"
              size={14}
              color={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          {/* Body */}
          <View style={styles.body}>
            {/* Icon */}
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isStreakContinued
                    ? `${gold}1A`
                    : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                },
              ]}
            >
              <IconSymbol
                name={isStreakContinued ? "flame" : "heart"}
                size={28}
                color={iconColor}
                strokeWidth={1.5}
              />
            </View>

            {/* Count — only shown when continued */}
            {isStreakContinued && (
              <View style={styles.countRow}>
                <Text style={[styles.countNumber, {color: countLabelColor}]}>
                  {displayCount}
                </Text>
                <Text style={[styles.countUnit, {color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)"}]}>
                  {displayCount === 1 ? t("streak.day") : t("streak.days")}
                </Text>
              </View>
            )}

            {/* Gold accent line */}
            <View style={[styles.accentLine, {backgroundColor: accentColor}]} />

            {/* Title */}
            <Text style={[styles.title, {color: theme.colors.text}]}>
              {getTitle()}
            </Text>

            {/* Message */}
            <Text
              style={[
                styles.message,
                {color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)"},
              ]}
            >
              {getMessage()}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  centeredWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 300,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  progressTrack: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginBottom: 16,
  },
  countNumber: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 52,
  },
  countUnit: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    fontWeight: "400",
  },
});
