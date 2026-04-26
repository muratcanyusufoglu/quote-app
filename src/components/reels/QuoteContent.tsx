import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LocalizedQuote } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

interface QuoteContentProps {
  quote: LocalizedQuote;
}

export const QuoteContent: React.FC<QuoteContentProps> = ({ quote }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>
        {quote.type === "affirmation" ? quote.text : `"${quote.text}"`}
      </Text>

      {quote.author && <Text style={styles.authorText}>— {quote.author}</Text>}
    </View>
  );
};

const createStyles = (theme: any) =>
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
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 38,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    authorText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      fontStyle: "normal",
      fontWeight: "500",
      letterSpacing: 0.2,
    },
  });
