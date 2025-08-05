import { Alert, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { REVENUECAT_CONFIG } from "../constants/config";

export interface PurchasePackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  userCancelled?: boolean;
}

export interface OfferingData {
  packages: PurchasePackage[];
  lifetime?: PurchasePackage;
  yearly?: PurchasePackage;
}

class RevenueCatService {
  private isInitialized = false;
  private offerings: PurchasesOffering[] = [];

  /**
   * Initialize RevenueCat SDK
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log("🔄 RevenueCat already initialized");
        return true;
      }

      console.log("🚀 Initializing RevenueCat SDK...");

      // Configure RevenueCat with proper API key
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.API_KEY,
        appUserID: undefined, // Use anonymous ID
      });

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        console.log("📝 RevenueCat debug logging enabled");
      }

      this.isInitialized = true;
      console.log("✅ RevenueCat initialized successfully");

      // In development, you can test with sandbox accounts
      if (__DEV__) {
        console.log("🧪 Development mode - using sandbox environment");
        console.log(
          "📝 Use test Apple ID or Google test account for purchases"
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize RevenueCat:", error);
      return false;
    }
  }

  /**
   * Set user attributes for analytics
   */
  private async setUserAttributes(): Promise<void> {
    try {
      await Purchases.setAttributes({
        platform: Platform.OS,
        app_version: "1.0.0", // You can get this from app.json
      });
    } catch (error) {
      console.error("Failed to set user attributes:", error);
    }
  }

  /**
   * Get available offerings and packages
   */
  async getOfferings(): Promise<OfferingData | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        console.warn("No current offering found");
        return null;
      }

      const packages: PurchasePackage[] =
        offerings.current.availablePackages.map((pkg: PurchasesPackage) => ({
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          product: {
            identifier: pkg.product.identifier,
            description: pkg.product.description,
            title: pkg.product.title,
            price: pkg.product.price,
            priceString: pkg.product.priceString,
            currencyCode: pkg.product.currencyCode,
          },
        }));

      // Find specific packages
      const lifetime = packages.find(
        (pkg: PurchasePackage) =>
          pkg.identifier.includes("lifetime") || pkg.packageType === "LIFETIME"
      );

      const yearly = packages.find(
        (pkg: PurchasePackage) =>
          pkg.identifier.includes("yearly") || pkg.packageType === "ANNUAL"
      );

      this.offerings = [offerings.current];

      return {
        packages,
        lifetime,
        yearly,
      };
    } catch (error) {
      console.error("Failed to get offerings:", error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(
    packageToPurchase: PurchasePackage
  ): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Find the original package object
      const originalPackage = this.offerings[0]?.availablePackages.find(
        (pkg: PurchasesPackage) =>
          pkg.identifier === packageToPurchase.identifier
      );

      if (!originalPackage) {
        return {
          success: false,
          error: "Package not found",
        };
      }

      const { customerInfo } = await Purchases.purchasePackage(originalPackage);

      return {
        success: true,
        customerInfo,
      };
    } catch (error) {
      console.error("Purchase failed:", error);

      const purchasesError = error as PurchasesError;

      // Handle user cancellation
      if (
        purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        return {
          success: false,
          userCancelled: true,
          error: "Purchase cancelled by user",
        };
      }

      // Handle other errors
      return {
        success: false,
        error: purchasesError.message || "Purchase failed",
      };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const customerInfo = await Purchases.restorePurchases();

      return {
        success: true,
        customerInfo,
      };
    } catch (error) {
      console.error("Restore purchases failed:", error);
      const purchasesError = error as PurchasesError;

      return {
        success: false,
        error: purchasesError.message || "Restore failed",
      };
    }
  }

  /**
   * Get customer info (check premium status)
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error("Failed to get customer info:", error);
      return null;
    }
  }

  /**
   * Development utilities for testing subscription status
   * ⚠️ ONLY FOR DEVELOPMENT/TESTING
   */
  async forceSetPremiumStatus(isPremium: boolean): Promise<void> {
    if (!__DEV__) {
      console.warn("🚫 forceSetPremiumStatus only available in development");
      return;
    }

    console.log(`🧪 [TEST] Forcing premium status to: ${isPremium}`);

    try {
      // This is a development hack - set a test attribute
      await Purchases.setAttributes({
        test_premium_override: isPremium.toString(),
      });

      console.log(`✅ [TEST] Premium status forced to: ${isPremium}`);
    } catch (error) {
      console.error("❌ [TEST] Failed to force premium status:", error);
    }
  }

  /**
   * Get test subscription status for development
   */
  async getTestPremiumStatus(): Promise<boolean | null> {
    if (!__DEV__) {
      return null;
    }

    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return null;

      // Check for test override using RevenueCat's custom attributes
      // Note: This uses Purchases.setAttributes() set values
      try {
        const appUserID = await Purchases.getAppUserID();
        console.log(`🧪 [TEST] Checking test override for user: ${appUserID}`);

        // For development testing, we'll check a simple boolean flag
        // This is safer than relying on attribution data
        const testOverrideKey = "test_premium_override";
        // Note: RevenueCat doesn't provide direct access to custom attributes
        // So we'll remove this test override mechanism for security

        console.log(`🧪 [TEST] Test override mechanism disabled for security`);
        return null;
      } catch (error) {
        console.log(`🧪 [TEST] Could not check test override:`, error);
        return null;
      }
    } catch (error) {
      console.error("❌ [TEST] Failed to get test premium status:", error);
      return null;
    }
  }

  /**
   * Enhanced isPremiumUser with direct subscription checking (no entitlements required)
   */
  async isPremiumUser(): Promise<boolean> {
    try {
      // SECURITY FIX: Remove test override in production builds
      // Only allow test override in development AND debug builds
      if (__DEV__ && console.warn) {
        // Additional check to ensure dev environment
        const testStatus = await this.getTestPremiumStatus();
        if (testStatus !== null) {
          console.warn("🧪 [DEV] Using premium test override:", testStatus);
          return testStatus;
        }
      }

      const customerInfo = await this.getCustomerInfo();

      if (!customerInfo) {
        console.log("📊 No customer info - user is not premium");
        return false;
      }

      // METHOD 1: Check active subscriptions (no entitlements required)
      const activeSubscriptions = customerInfo.activeSubscriptions;
      const hasActiveSubscription = activeSubscriptions.length > 0;

      // METHOD 2: Check latest expiration date
      const latestExpirationDate = customerInfo.latestExpirationDate;
      const hasValidExpiration = latestExpirationDate
        ? new Date(latestExpirationDate) > new Date()
        : false;

      // METHOD 3: Check all purchased products (lifetime purchases)
      const allPurchasedProducts = customerInfo.allPurchasedProductIdentifiers;
      const hasAnyPurchase = allPurchasedProducts.length > 0;

      // User is premium if:
      // 1. Has active subscription OR
      // 2. Has valid expiration date OR
      // 3. Has any purchased products (for lifetime/non-consumable)
      const isPremium =
        hasActiveSubscription || hasValidExpiration || hasAnyPurchase;

      console.log("📊 RevenueCat Premium Check (Direct Subscription):", {
        hasCustomerInfo: !!customerInfo,
        activeSubscriptions: activeSubscriptions,
        latestExpirationDate: latestExpirationDate,
        allPurchasedProducts: allPurchasedProducts,
        hasActiveSubscription,
        hasValidExpiration,
        hasAnyPurchase,
        isPremium,
      });

      return isPremium;
    } catch (error) {
      console.error("❌ Failed to check premium status:", error);

      // SECURITY: On error, always return false (deny access)
      // This prevents potential bypasses through error manipulation
      return false;
    }
  }

  /**
   * Show purchase error alert
   */
  showPurchaseError(error: string): void {
    Alert.alert("Purchase Failed", error, [{ text: "OK", style: "default" }]);
  }

  /**
   * Show restore success alert
   */
  showRestoreSuccess(): void {
    Alert.alert(
      "Restore Successful",
      "Your purchases have been restored successfully.",
      [{ text: "OK", style: "default" }]
    );
  }

  /**
   * Show restore error alert
   */
  showRestoreError(error: string): void {
    Alert.alert("Restore Failed", error, [{ text: "OK", style: "default" }]);
  }

  /**
   * Get app store user ID
   */
  async getAppUserID(): Promise<string | null> {
    try {
      const appUserID = await Purchases.getAppUserID();
      return appUserID;
    } catch (error) {
      console.error("Failed to get app user ID:", error);
      return null;
    }
  }

  /**
   * Set user ID (for identified users)
   */
  async setUserID(userID: string): Promise<boolean> {
    try {
      await Purchases.logIn(userID);
      return true;
    } catch (error) {
      console.error("Failed to set user ID:", error);
      return false;
    }
  }

  /**
   * Logout user (for anonymous usage)
   */
  async logoutUser(): Promise<boolean> {
    try {
      await Purchases.logOut();
      return true;
    } catch (error) {
      console.error("Failed to logout user:", error);
      return false;
    }
  }
}

// Singleton instance
const revenueCatService = new RevenueCatService();

export default revenueCatService;
