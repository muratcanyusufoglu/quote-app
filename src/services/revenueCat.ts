import { Alert, NativeModules, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { APP_CONFIG, REVENUECAT_CONFIG } from "../constants/config";

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
      console.log(
        `🔑 Using API Key: ${REVENUECAT_CONFIG.API_KEY.substring(0, 10)}...`
      );
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`📦 App Version: ${APP_CONFIG.VERSION}`);

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

      // Get device locale for better localization
      const deviceLocale =
        Platform.OS === "ios"
          ? NativeModules.SettingsManager?.settings?.AppleLocale ||
            NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
          : NativeModules.I18nManager?.localeIdentifier;

      console.log("🌍 Device locale detected:", deviceLocale);

      // Set user attributes for better localization
      await Purchases.setAttributes({
        app_version: APP_CONFIG.VERSION,
        platform: Platform.OS,
        locale: deviceLocale || "en_US",
      });

      // Force RevenueCat to use device locale for pricing
      if (deviceLocale) {
        console.log("🌍 Setting RevenueCat locale to:", deviceLocale);
        // Note: RevenueCat automatically uses device locale for pricing
        // This is just for logging purposes
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
        app_version: APP_CONFIG.VERSION,
      });
    } catch (error) {
      console.error("Failed to set user attributes:", error);
    }
  }

  /**
   * Clear cache and refresh offerings
   */
  async refreshOfferings(): Promise<void> {
    try {
      console.log("🔄 Refreshing RevenueCat offerings...");
      this.offerings = [];
      await Purchases.invalidateCustomerInfoCache();
      console.log("✅ RevenueCat cache cleared successfully");
    } catch (error) {
      console.error("❌ Failed to refresh offerings:", error);
    }
  }

  /**
   * Get available offerings and packages
   */
  async getOfferings(): Promise<OfferingData | null> {
    try {
      console.log("🔍 getOfferings called");

      if (!this.isInitialized) {
        console.log("🔄 RevenueCat not initialized, initializing now...");
        await this.initialize();
      }

      console.log("🔄 Calling Purchases.getOfferings()...");
      const offerings = await Purchases.getOfferings();
      console.log("📦 Raw RevenueCat offerings received:", offerings);

      if (!offerings.current) {
        console.warn("⚠️ No current offering found in RevenueCat");
        console.log("🔍 Available offerings:", offerings);
        return null;
      }

      console.log("✅ Current offering found:", offerings.current.identifier);
      console.log(
        "📦 Available packages count:",
        offerings.current.availablePackages.length
      );

      const packages: PurchasePackage[] =
        offerings.current.availablePackages.map((pkg: PurchasesPackage) => {
          console.log("🔍 Processing package:", {
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            title: pkg.product.title,
            price: pkg.product.priceString,
            actualPrice: pkg.product.price,
            currencyCode: pkg.product.currencyCode,
            description: pkg.product.description,
          });

          return {
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
          };
        });

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

      const result = {
        packages,
        lifetime,
        yearly,
      };

      console.log("✅ Returning offerings data:", {
        packagesCount: result.packages.length,
        lifetime: result.lifetime?.identifier,
        yearly: result.yearly?.identifier,
      });

      return result;
    } catch (error) {
      console.error("❌ Failed to get offerings:", error);
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
   * Force refresh customer info by invalidating RevenueCat cache
   */
  async refreshCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Invalidate cache then fetch fresh customer info
      // Note: invalidateCustomerInfoCache does not reject; safe to await
      // @ts-ignore: API is available in react-native-purchases
      await Purchases.invalidateCustomerInfoCache?.();
      return await this.getCustomerInfo();
    } catch (error) {
      console.error("Failed to refresh customer info:", error);
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
   * Subscribe to RevenueCat customer info updates and surface premium state
   * Returns an unsubscribe function
   */
  addCustomerInfoUpdateListener(
    onUpdate: (isPremium: boolean, customerInfo: CustomerInfo) => void
  ): () => void {
    // Ensure initialized; fire-and-forget
    this.initialize().catch(() => undefined);

    const listener: any = Purchases.addCustomerInfoUpdateListener(
      (customerInfo: CustomerInfo) => {
        try {
          const activeSubscriptions = customerInfo.activeSubscriptions;
          const hasActiveSubscription = activeSubscriptions.length > 0;

          const latestExpirationDate = customerInfo.latestExpirationDate;
          const hasValidExpiration = latestExpirationDate
            ? new Date(latestExpirationDate) > new Date()
            : false;

          const allPurchasedProducts =
            customerInfo.allPurchasedProductIdentifiers;
          const hasLifetimePurchase = allPurchasedProducts.includes(
            REVENUECAT_CONFIG.PRODUCT_IDS.LIFETIME
          );

          const isPremium =
            hasActiveSubscription || hasValidExpiration || hasLifetimePurchase;

          onUpdate(isPremium, customerInfo);
        } catch (e) {
          console.error("Failed processing customer info update:", e);
        }
      }
    );

    return () => {
      try {
        // Newer SDKs expose remove(); fall back to no-op otherwise
        listener?.remove?.();
      } catch {
        // ignore
      }
    };
  }

  /**
   * Enhanced isPremiumUser with direct subscription checking (no entitlements required)
   */
  async isPremiumUser(): Promise<boolean> {
    try {
      // Ensure we are not using stale cached info when explicitly verifying
      // @ts-ignore: API is available when using recent react-native-purchases
      await Purchases.invalidateCustomerInfoCache?.();
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

      // METHOD 3: Check lifetime purchase specifically (non-consumable)
      // IMPORTANT: Do NOT treat any historical purchase as premium. Subscriptions
      // appear in allPurchasedProductIdentifiers even after cancellation/expiry.
      // Only grant permanent premium for an explicit lifetime product.
      const allPurchasedProducts = customerInfo.allPurchasedProductIdentifiers;
      const hasLifetimePurchase = allPurchasedProducts.includes(
        REVENUECAT_CONFIG.PRODUCT_IDS.LIFETIME
      );

      // User is premium if:
      // 1. Has active subscription OR
      // 2. Has valid expiration date OR
      // 3. Has lifetime purchase (non-consumable)
      const isPremium =
        hasActiveSubscription || hasValidExpiration || hasLifetimePurchase;

      console.log("📊 RevenueCat Premium Check (Direct Subscription):", {
        hasCustomerInfo: !!customerInfo,
        activeSubscriptions: activeSubscriptions,
        latestExpirationDate: latestExpirationDate,
        allPurchasedProducts: allPurchasedProducts,
        hasActiveSubscription,
        hasValidExpiration,
        hasLifetimePurchase,
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
   * Validate RevenueCat configuration and connection
   */
  async validateConfiguration(): Promise<{
    isValid: boolean;
    apiKey: string;
    platform: string;
    appVersion: string;
    customerInfo: any;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        return {
          isValid: false,
          apiKey: REVENUECAT_CONFIG.API_KEY.substring(0, 10) + "...",
          platform: Platform.OS,
          appVersion: APP_CONFIG.VERSION,
          customerInfo: null,
          error: "RevenueCat not initialized",
        };
      }

      // Test customer info retrieval
      const customerInfo = await this.getCustomerInfo();

      return {
        isValid: true,
        apiKey: REVENUECAT_CONFIG.API_KEY.substring(0, 10) + "...",
        platform: Platform.OS,
        appVersion: APP_CONFIG.VERSION,
        customerInfo: customerInfo ? "Available" : "Not available",
        error: undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        apiKey: REVENUECAT_CONFIG.API_KEY.substring(0, 10) + "...",
        platform: Platform.OS,
        appVersion: APP_CONFIG.VERSION,
        customerInfo: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
