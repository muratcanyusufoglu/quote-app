import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

interface AIMoodIconProps {
  size?: number;
  onPress?: () => void;
}

export function AIMoodIcon({ size = 44, onPress }: AIMoodIconProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    innerCircle: {
      width: size * 0.6,
      height: size * 0.6,
      borderRadius: (size * 0.6) / 2,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    brainIcon: {
      width: size * 0.3,
      height: size * 0.3,
      justifyContent: "center",
      alignItems: "center",
    },
    brainLine: {
      position: "absolute",
      width: size * 0.15,
      height: 2,
      backgroundColor: "#6366f1",
      borderRadius: 1,
    },
    brainCurve: {
      position: "absolute",
      width: size * 0.12,
      height: size * 0.08,
      borderWidth: 2,
      borderColor: "#6366f1",
      borderRadius: size * 0.06,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
    },
    pulseDot: {
      position: "absolute",
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#ec4899",
    },
  });

  return (
    <LinearGradient
      colors={["#6366f1", "#8b5cf6", "#ec4899"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.innerCircle}>
        <View style={styles.brainIcon}>
          {/* Brain-like structure */}
          <View
            style={[
              styles.brainCurve,
              { top: 2, left: 2, transform: [{ rotate: "-45deg" }] },
            ]}
          />
          <View
            style={[
              styles.brainCurve,
              { top: 2, right: 2, transform: [{ rotate: "45deg" }] },
            ]}
          />
          <View
            style={[
              styles.brainCurve,
              { bottom: 2, left: 2, transform: [{ rotate: "-135deg" }] },
            ]}
          />
          <View
            style={[
              styles.brainCurve,
              { bottom: 2, right: 2, transform: [{ rotate: "135deg" }] },
            ]}
          />

          {/* Central connection */}
          <View
            style={[
              styles.brainLine,
              {
                top: "50%",
                left: "50%",
                transform: [{ translateX: -size * 0.075 }],
              },
            ]}
          />

          {/* Pulse dots */}
          <View
            style={[
              styles.pulseDot,
              { top: 2, left: "50%", transform: [{ translateX: -2 }] },
            ]}
          />
          <View
            style={[
              styles.pulseDot,
              { bottom: 2, left: "50%", transform: [{ translateX: -2 }] },
            ]}
          />
        </View>
      </View>
    </LinearGradient>
  );
}
