import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LocalizedQuote } from "../../types";
import { getContrastTextColor } from "../../utils/theme";
import { useTheme } from "../../utils/ThemeContext";

interface QuoteContentProps {
  quote: LocalizedQuote;
}

export const QuoteContent: React.FC<QuoteContentProps> = ({ quote }) => {
  const { theme } = useTheme();

  const bgHex = Array.isArray(theme.colors.gradientColors)
    ? (theme.colors.gradientColors[0] as string)
    : theme.colors.background;
  const contrastText = getContrastTextColor(bgHex);

  const styles = createStyles(theme, contrastText);

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>
        {quote.type === "affirmation" ? quote.text : `"${quote.text}"`}
      </Text>

      {quote.author && <Text style={styles.authorText}>— {quote.author}</Text>}
    </View>
  );
};

const createStyles = (theme: any, contrastText: {primary: string; secondary: string}) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    quoteText: {
      fontSize: 28,
      fontWeight: "700",
      color: contrastText.primary,
      textAlign: "center",
      lineHeight: 38,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    authorText: {
      fontSize: 16,
      color: contrastText.secondary,
      textAlign: "center",
      fontStyle: "normal",
      fontWeight: "500",
      letterSpacing: 0.2,
    },
  });
