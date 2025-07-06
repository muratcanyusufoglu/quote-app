import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TestComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title} Screen Working!</Text>
      <Text style={styles.subtext}>Navigation and imports are successful</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F23",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F8FAFC",
    marginBottom: 10,
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
  },
});
export default TestComponent;
