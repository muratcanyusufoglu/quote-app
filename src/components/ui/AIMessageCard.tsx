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
      left: 20,
      right: 20,
      transform: [{ translateY: -150 }],
      zIndex: 1000,
    },
    card: {
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    gradient: {
      padding: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    aiIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    messageContainer: {
      marginBottom: 20,
    },
    message: {
      fontSize: 16,
      lineHeight: 24,
      color: "#fff",
      textAlign: "center",
      fontWeight: "500",
    },
    loadingContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    loadingText: {
      fontSize: 16,
      color: "#fff",
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
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#fff",
      marginLeft: 8,
    },
    tryDifferentButton: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={["#6366f1", "#8b5cf6", "#ec4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.aiIcon}>
              <Text style={{ fontSize: 16 }}>🧠</Text>
            </View>
            <Text style={styles.title}>{t("mood_motivation.title")}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark" size={16} color="#fff" strokeWidth={2} />
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
                style={styles.actionButton}
                onPress={handleShare}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={16}
                  color="#fff"
                  strokeWidth={2}
                />
                <Text style={styles.actionButtonText}>
                  {t("mood_motivation.share")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.tryDifferentButton]}
                onPress={handleTryDifferent}
              >
                <IconSymbol
                  name="refresh-cw"
                  size={16}
                  color="#fff"
                  strokeWidth={2}
                />
                <Text style={styles.actionButtonText}>
                  {t("mood_motivation.try_different")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
