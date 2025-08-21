import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  APP_CONFIG,
  PURCHASE_CONFIG,
  REVENUECAT_CONFIG,
} from "../../constants/config";
import revenueCatService from "../../services/revenueCat";

export default function RevenueCatTestComponent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    checkInitializationStatus();
  }, []);

  const checkInitializationStatus = async () => {
    try {
      const result = await revenueCatService.validateConfiguration();
      setValidationResult(result);
      setIsInitialized(result.isValid);
    } catch (error) {
      console.error("Failed to check initialization status:", error);
    }
  };

  const initializeRevenueCat = async () => {
    setIsLoading(true);
    try {
      const success = await revenueCatService.initialize();
      setIsInitialized(success);
      if (success) {
        Alert.alert("Success", "RevenueCat initialized successfully!");
        await checkInitializationStatus();
      } else {
        Alert.alert("Error", "Failed to initialize RevenueCat");
      }
    } catch (error) {
      Alert.alert("Error", `Initialization failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomerInfo = async () => {
    try {
      const info = await revenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      Alert.alert("Success", "Customer info retrieved successfully!");
    } catch (error) {
      Alert.alert("Error", `Failed to get customer info: ${error}`);
    }
  };

  const testOfferings = async () => {
    try {
      const offeringsData = await revenueCatService.getOfferings();
      setOfferings(offeringsData);
      Alert.alert("Success", "Offerings retrieved successfully!");
    } catch (error) {
      Alert.alert("Error", `Failed to get offerings: ${error}`);
    }
  };

  const testPremiumStatus = async () => {
    try {
      const isPremium = await revenueCatService.isPremiumUser();
      Alert.alert("Premium Status", `User is premium: ${isPremium}`);
    } catch (error) {
      Alert.alert("Error", `Failed to check premium status: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>RevenueCat Test Component</Text>

      {/* Configuration Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.configItem}>
          API Key: {REVENUECAT_CONFIG.API_KEY.substring(0, 20)}...
        </Text>
        <Text style={styles.configItem}>
          iOS Product ID: {REVENUECAT_CONFIG.PRODUCT_IDS.LIFETIME}
        </Text>
        <Text style={styles.configItem}>
          Android Product ID: {REVENUECAT_CONFIG.PRODUCT_IDS.LIFETIME}
        </Text>
        <Text style={styles.configItem}>App Version: {APP_CONFIG.VERSION}</Text>
        <Text style={styles.configItem}>
          Trial Period: {PURCHASE_CONFIG.TRIAL_PERIOD_DAYS} days
        </Text>
      </View>

      {/* Initialization Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Initialization Status</Text>
        <Text style={styles.statusItem}>
          Status: {isInitialized ? "✅ Initialized" : "❌ Not Initialized"}
        </Text>
        {validationResult && (
          <View style={styles.validationResult}>
            <Text style={styles.validationItem}>
              Valid: {validationResult.isValid ? "Yes" : "No"}
            </Text>
            <Text style={styles.validationItem}>
              Platform: {validationResult.platform}
            </Text>
            <Text style={styles.validationItem}>
              App Version: {validationResult.appVersion}
            </Text>
            <Text style={styles.validationItem}>
              Customer Info: {validationResult.customerInfo}
            </Text>
            {validationResult.error && (
              <Text style={styles.errorText}>
                Error: {validationResult.error}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={initializeRevenueCat}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Initializing..." : "Initialize RevenueCat"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isInitialized && styles.buttonDisabled]}
          onPress={checkInitializationStatus}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Validate Configuration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isInitialized && styles.buttonDisabled]}
          onPress={testCustomerInfo}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Test Customer Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isInitialized && styles.buttonDisabled]}
          onPress={testOfferings}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Test Offerings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isInitialized && styles.buttonDisabled]}
          onPress={testPremiumStatus}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Test Premium Status</Text>
        </TouchableOpacity>
      </View>

      {/* Results Display */}
      {customerInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Info</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(customerInfo, null, 2)}
          </Text>
        </View>
      )}

      {offerings && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offerings</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(offerings, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  configItem: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
    fontFamily: "monospace",
  },
  statusItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  validationResult: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  validationItem: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    color: "#dc3545",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#666",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
  },
});

