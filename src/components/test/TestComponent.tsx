import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RevenueCatPackageTest from "./RevenueCatPackageTest";
import RevenueCatTestComponent from "./RevenueCatTestComponent";

const TestComponent: React.FC<{ title: string }> = ({ title }) => {
  const [showRevenueCatTest, setShowRevenueCatTest] = useState(false);
  const [showPackageTest, setShowPackageTest] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title} Screen Working!</Text>
      <Text style={styles.subtext}>Navigation and imports are successful</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowRevenueCatTest(!showRevenueCatTest)}
      >
        <Text style={styles.buttonText}>
          {showRevenueCatTest ? "Hide" : "Show"} RevenueCat Test
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPackageTest(!showPackageTest)}
      >
        <Text style={styles.buttonText}>
          {showPackageTest ? "Hide" : "Show"} Package Test
        </Text>
      </TouchableOpacity>

      {showRevenueCatTest && (
        <View style={styles.revenueCatContainer}>
          <RevenueCatTestComponent />
        </View>
      )}

      {showPackageTest && (
        <View style={styles.revenueCatContainer}>
          <RevenueCatPackageTest />
        </View>
      )}
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#60A5FA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  revenueCatContainer: {
    flex: 1,
    width: "100%",
  },
});
export default TestComponent;
