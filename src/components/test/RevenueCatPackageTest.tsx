import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getPaywallService } from "../../services/PaywallService";
import revenueCatService from "../../services/revenueCat";

export default function RevenueCatPackageTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [revenueCatPackages, setRevenueCatPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testRevenueCatPackages();
  }, []);

  const testRevenueCatPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🧪 Testing RevenueCat packages...");

      // Test 1: Direct RevenueCat call
      console.log("🔍 Test 1: Direct RevenueCat getOfferings()");
      const offerings = await revenueCatService.getOfferings();
      console.log("📦 Direct RevenueCat offerings:", offerings);

      if (offerings && offerings.packages) {
        setRevenueCatPackages(offerings.packages);
        console.log(
          "✅ RevenueCat packages received:",
          offerings.packages.length
        );
      } else {
        console.warn("⚠️ No RevenueCat packages received");
        setError("No RevenueCat packages received");
      }

      // Test 2: PaywallService call
      console.log("🔍 Test 2: PaywallService getAllSubscriptionPackages()");
      const paywallService = getPaywallService();
      const paywallPackages = await paywallService.getAllSubscriptionPackages();
      console.log("📦 PaywallService packages:", paywallPackages);

      if (paywallPackages && paywallPackages.length > 0) {
        setPackages(paywallPackages);
        console.log(
          "✅ PaywallService packages received:",
          paywallPackages.length
        );
      } else {
        console.warn("⚠️ No PaywallService packages received");
        setError("No PaywallService packages received");
      }
    } catch (error) {
      console.error("❌ Test failed:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const testRevenueCatInitialization = async () => {
    try {
      console.log("🔍 Testing RevenueCat initialization...");
      const success = await revenueCatService.initialize();
      console.log("✅ RevenueCat initialization result:", success);

      if (success) {
        Alert.alert("Success", "RevenueCat initialized successfully!");
        // Retest packages after initialization
        setTimeout(testRevenueCatPackages, 1000);
      } else {
        Alert.alert("Error", "RevenueCat initialization failed");
      }
    } catch (error) {
      Alert.alert("Error", `Initialization failed: ${error}`);
    }
  };

  const clearCache = async () => {
    try {
      console.log("🧹 Clearing package cache...");

      // Clear RevenueCat cache
      await revenueCatService.refreshOfferings();

      const paywallService = getPaywallService();
      // Reset the service to clear cache
      await paywallService.initialize();
      Alert.alert(
        "Success",
        "RevenueCat and local cache cleared, retesting packages..."
      );
      setTimeout(testRevenueCatPackages, 1000);
    } catch (error) {
      Alert.alert("Error", `Failed to clear cache: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>RevenueCat Package Test</Text>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Status</Text>
        <Text style={styles.statusItem}>
          Loading: {isLoading ? "🔄 Yes" : "✅ No"}
        </Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testRevenueCatPackages}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Testing..." : "Test Packages"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testRevenueCatInitialization}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test RevenueCat Init</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={clearCache}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Clear Cache & Retest</Text>
        </TouchableOpacity>
      </View>

      {/* RevenueCat Packages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          RevenueCat Packages ({revenueCatPackages.length})
        </Text>
        {revenueCatPackages.length > 0 ? (
          revenueCatPackages.map((pkg, index) => (
            <View key={index} style={styles.packageItem}>
              <Text style={styles.packageTitle}>
                📦 {pkg.title || pkg.identifier}
              </Text>
              <Text style={styles.packageDetail}>ID: {pkg.identifier}</Text>
              <Text style={styles.packageDetail}>Type: {pkg.packageType}</Text>
              <Text style={styles.packageDetail}>
                Price: {pkg.product?.priceString || "N/A"}
              </Text>
              <Text style={styles.packageDetail}>
                Currency: {pkg.product?.currencyCode || "N/A"}
              </Text>
              <Text style={styles.packageDetail}>
                Price Number: {pkg.product?.price || "N/A"}
              </Text>
              <Text style={styles.packageDetail}>
                Description: {pkg.product?.description || "N/A"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No RevenueCat packages found</Text>
        )}
      </View>

      {/* PaywallService Packages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          PaywallService Packages ({packages.length})
        </Text>
        {packages.length > 0 ? (
          packages.map((pkg, index) => (
            <View key={index} style={styles.packageItem}>
              <Text style={styles.packageTitle}>📦 {pkg.title}</Text>
              <Text style={styles.packageDetail}>ID: {pkg.id}</Text>
              <Text style={styles.packageDetail}>
                Current Price: {pkg.currentPrice}
              </Text>
              <Text style={styles.packageDetail}>
                Original Price: {pkg.originalPrice}
              </Text>
              <Text style={styles.packageDetail}>
                Currency Code: {pkg.currencyCode || "N/A"}
              </Text>
              <Text style={styles.packageDetail}>
                Price Number: {pkg.priceNumber || "N/A"}
              </Text>
              <Text style={styles.packageDetail}>Period: {pkg.period}</Text>
              <Text style={styles.packageDetail}>
                Features: {pkg.features?.length || 0}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>
            No PaywallService packages found
          </Text>
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Information</Text>
        <Text style={styles.debugText}>
          Check console logs for detailed debugging information.
        </Text>
        <Text style={styles.debugText}>
          Look for logs starting with: 🔍, 📦, ✅, ⚠️, ❌
        </Text>
      </View>
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
  statusItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
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
  packageItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  packageDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  debugText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});
