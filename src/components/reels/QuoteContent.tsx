import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
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
      <Text style={styles.quoteText}>{quote.text}</Text>

      {quote.author && <Text style={styles.authorText}>— {quote.author}</Text>}

      {/* Read More Hint */}
      <View style={styles.readMoreContainer}>
        <View style={styles.readMoreTextContainer}>
          <IconSymbol
            name="book"
            size={12}
            color={theme.colors.textSoftTertiary}
            strokeWidth={2}
          />
          <Text style={styles.readMoreText}>
            {quote.language === "tr"
              ? "Hikayeyi okumak için dokunun"
              : "Tap to read the story"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      width: "100%",
    },
    quoteText: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.textSoft,
      textAlign: "center",
      lineHeight: 36,
      marginBottom: 24,
      letterSpacing: -0.5,
    },
    authorText: {
      fontSize: 16,
      color: theme.colors.textSoftSecondary,
      textAlign: "center",
      fontStyle: "italic",
      fontWeight: "500",
      marginBottom: 32,
      letterSpacing: 0.2,
    },
    readMoreContainer: {
      backgroundColor: theme.colors.backgroundSoft,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    readMoreTextContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    readMoreText: {
      fontSize: 12,
      color: theme.colors.textSoftTertiary,
      textAlign: "center",
      fontWeight: "500",
    },
  });
