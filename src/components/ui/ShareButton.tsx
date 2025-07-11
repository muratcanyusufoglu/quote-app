import React from "react";
import { Share, TouchableOpacity, ViewStyle } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { useAnalytics } from "../../hooks/useAnalytics";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

interface ShareButtonProps {
  quote: LocalizedQuote;
  size?: number;
  iconColor?: string;
  style?: ViewStyle;
  backgroundColor?: string;
  onShareComplete?: () => void;
  onShareError?: (error: any) => void;
}

export function ShareButton({
  quote,
  size = 18,
  iconColor,
  style,
  backgroundColor,
  onShareComplete,
  onShareError,
}: ShareButtonProps) {
  const { theme } = useTheme();
  const { trackQuoteShare } = useAnalytics();
  const APP_NAME = "QuoteSpark";

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `"${quote.text}"\n\n- ${quote.author || "Unknown"}`,
        title: APP_NAME,
      };

      await Share.share(shareContent);

      // Track share analytics
      trackQuoteShare({
        quote_id: quote.id,
        quote_category: quote.category,
        quote_author: quote.author,
        language: quote.language,
        share_method: "native",
        content_type: "quote",
      });

      console.log("📤 Quote shared successfully");
      onShareComplete?.();
    } catch (error) {
      console.error("❌ Error sharing quote:", error);
      onShareError?.(error);
    }
  };

  const defaultStyle: ViewStyle = {
    width: size * 2.2,
    height: size * 2.2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: size * 1.1,
    backgroundColor: backgroundColor || theme.colors.whiteOverlay10,
  };

  return (
    <TouchableOpacity
      style={[defaultStyle, style]}
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <IconSymbol
        name="square.and.arrow.up"
        size={size}
        color={iconColor || theme.colors.white}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}
