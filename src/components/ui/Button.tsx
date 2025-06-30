import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useTheme } from "../../utils/ThemeContext";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      paddingHorizontal: size === "large" ? 24 : size === "small" ? 12 : 16,
      paddingVertical: size === "large" ? 16 : size === "small" ? 8 : 12,
      ...(fullWidth && { width: "100%" }),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.secondary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.transparent,
          borderWidth: 1,
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.transparent,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === "large" ? 18 : size === "small" ? 14 : 16,
      fontWeight: "600",
      ...(icon && { marginLeft: 8 }),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          color: disabled ? theme.colors.textSecondary : theme.colors.white,
        };
      case "secondary":
        return {
          ...baseStyle,
          color: disabled ? theme.colors.textSecondary : theme.colors.white,
        };
      case "outline":
        return {
          ...baseStyle,
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      case "ghost":
        return {
          ...baseStyle,
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.white} />
      ) : (
        <>
          {icon && (
            <IconSymbol
              name={icon as any}
              size={size === "large" ? 24 : size === "small" ? 16 : 20}
              color={getTextStyle().color as string}
              strokeWidth={2}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 52,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  baseText: {
    fontWeight: "600",
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
