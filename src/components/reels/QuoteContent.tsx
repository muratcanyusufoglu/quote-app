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
      flex: 1, // Allow container to grow
      justifyContent: "center",
    },
    quoteText: {
      fontSize: 28, // Reduced from 28 for better fit
      fontWeight: "700",
      color: theme.colors.textSoft,
      textAlign: "center",
      lineHeight: 32, // Reduced from 36 for tighter spacing
      marginBottom: 20, // Reduced from 24
      letterSpacing: -0.5,
      flexShrink: 1, // Allow text to shrink if needed
    },
    authorText: {
      fontSize: 15, // Reduced from 16
      color: theme.colors.textSoftSecondary,
      textAlign: "center",
      fontStyle: "italic",
      fontWeight: "500",
      marginBottom: 24, // Reduced from 32
      letterSpacing: 0.2,
    },
    readMoreContainer: {
      backgroundColor: theme.colors.backgroundSoft,
      paddingHorizontal: 14, // Slightly reduced padding
      paddingVertical: 7, // Slightly reduced padding
      borderRadius: 18, // Slightly smaller radius
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      marginTop: 8, // Add some top margin for better spacing
    },
    readMoreTextContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5, // Slightly reduced gap
    },
    readMoreText: {
      fontSize: 11, // Reduced from 12
      color: theme.colors.textSoftTertiary,
      textAlign: "center",
      fontWeight: "500",
    },
  });
