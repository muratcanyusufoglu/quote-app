import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

interface OnboardingMultiCardProps {
  icon?: string;
  title: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OnboardingMultiCard({
  icon,
  title,
  isSelected,
  onPress,
  style,
}: OnboardingMultiCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? `${theme.colors.brandYellow}20`
            : `${theme.colors.surface}12`,
          borderColor: isSelected
            ? theme.colors.brandYellow
            : `${theme.colors.border}30`,
          borderWidth: isSelected ? 2 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <LinearGradient
          colors={[
            `${theme.colors.brandYellow}10`,
            `${theme.colors.premium}08`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.content}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected
                  ? `${theme.colors.brandYellow}25`
                  : `${theme.colors.whiteOverlay20}`,
              },
            ]}
          >
            <IconSymbol
              name={icon as any}
              size={16}
              color={
                isSelected
                  ? theme.colors.brandYellow
                  : theme.colors.whiteOverlay80
              }
              strokeWidth={2}
            />
          </View>
        )}

        <Text
          style={[
            styles.title,
            {
              color: isSelected
                ? theme.colors.white
                : theme.colors.whiteOverlay90,
              fontWeight: isSelected ? "700" : "600",
            },
          ]}
        >
          {title}
        </Text>

        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected
                ? theme.colors.brandYellow
                : theme.colors.border,
              backgroundColor: isSelected
                ? theme.colors.brandYellow
                : "transparent",
            },
          ]}
        >
          {isSelected && (
            <IconSymbol
              name="checkmark"
              size={12}
              color={theme.colors.white}
              strokeWidth={3}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
