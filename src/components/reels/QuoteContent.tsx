import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import { LocalizedQuote } from "../../types";

interface QuoteContentProps {
  quote: LocalizedQuote;
}

export const QuoteContent: React.FC<QuoteContentProps> = ({ quote }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>{quote.text}</Text>

      {quote.author && <Text style={styles.authorText}>— {quote.author}</Text>}

      {/* Read More Hint */}
      <View style={styles.readMoreContainer}>
        <View style={styles.readMoreTextContainer}>
          <IconSymbol
            name="book"
            size={14}
            color="rgba(255, 255, 255, 0.9)"
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  quoteText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 32,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  authorText: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 24,
  },
  readMoreContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  readMoreTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
    marginLeft: 8,
  },
});
