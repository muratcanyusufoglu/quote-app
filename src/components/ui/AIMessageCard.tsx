import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Dimensions,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTranslation } from "../../hooks/useTranslation";
import { useTheme } from "../../utils/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

interface AIMessageCardProps {
  message: string;
  isLoading?: boolean;
  onShare?: () => void;
  onTryDifferent?: () => void;
  onClose?: () => void;
}

export function AIMessageCard({
  message,
  isLoading = false,
  onShare,
  onTryDifferent,
  onClose,
}: AIMessageCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleShare = async () => {
    try {
      await Share.share({
        message: message,
        title: t("mood_motivation.title"),
      });
      onShare?.();
    } catch (error) {
      console.error("Error sharing message:", error);
    }
  };

  const handleTryDifferent = () => {
    Alert.alert(
      t("mood_motivation.title"),
      "Are you sure you want to generate a different message?",
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("mood_motivation.try_different"),
          onPress: onTryDifferent,
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: "50%",
      left: 25, // Quote card'larla aynı margin
      right: 25, // Quote card'larla aynı margin
      transform: [{ translateY: -180 }],
      zIndex: 1000,
    },
    card: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
    },
    gradient: {
      padding: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    aiIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.whiteOverlay25,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
      overflow: "hidden",
    },
    aiIconGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 18,
      opacity: 0.9,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.white,
      flex: 1,
      letterSpacing: 0.2,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.whiteOverlay20,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
    },
    messageContainer: {
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    message: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.white,
      textAlign: "left",
      fontWeight: "500",
    },
    loadingContainer: {
      alignItems: "center",
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.white,
      marginTop: 12,
      textAlign: "center",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.whiteOverlay20,
      borderWidth: 1,
      borderColor: theme.colors.whiteOverlay20,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
      marginLeft: 8,
    },
    primaryActionButton: {
      backgroundColor: theme.colors.brandYellow,
      borderColor: theme.colors.brandYellow,
    },
    primaryActionText: {
      color: theme.colors.textSoft, // better contrast on yellow
    },
    tryDifferentButton: {
      backgroundColor: theme.colors.whiteOverlay10,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={[
            theme.colors.gradientColors[0],
            theme.colors.gradientColors[1],
            theme.colors.gradientColors[2],
            theme.colors.gradientColors[3],
          ]}
          locations={
            theme.colors.gradientLocations as [number, number, number, number]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.aiIcon}>
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.brandYellow]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiIconGradient}
              />
              <IconSymbol
                name="brain"
                size={18}
                color={theme.colors.white}
                strokeWidth={2}
              />
            </View>
            <Text style={styles.title}>{t("mood_motivation.title")}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol
                name="xmark"
                size={16}
                color={theme.colors.white}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.messageContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  {t("mood_motivation.generating")}
                </Text>
              </View>
            ) : (
              <Text style={styles.message}>{message}</Text>
            )}
          </View>

          {!isLoading && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.tryDifferentButton]}
                onPress={handleTryDifferent}
              >
                <IconSymbol
                  name="refresh-cw"
                  size={16}
                  color={theme.colors.white}
                  strokeWidth={2}
                />
                <Text style={styles.actionButtonText}>
                  {t("mood_motivation.try_different")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={handleShare}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={16}
                  color={theme.colors.textSoft}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.actionButtonText, styles.primaryActionText]}
                >
                  {t("mood_motivation.share")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
