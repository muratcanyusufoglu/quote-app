import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { Platform, Alert } from "react-native";
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
   * Initialize RevenueCat with configuration
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Set log level for debugging (remove in production)
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.API_KEY,
        appUserID: null, // Will use anonymous ID
      });

      // Set attributes for analytics (optional)
      await this.setUserAttributes();

      this.isInitialized = true;
      console.log("RevenueCat initialized successfully");
      return true;
    } catch (error) {
      console.error("RevenueCat initialization failed:", error);
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
   * Check if user has active premium subscription
   */
  async isPremiumUser(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();

      if (!customerInfo) {
        return false;
      }

      // Check for any active entitlements
      const hasActiveEntitlements =
        Object.keys(customerInfo.entitlements.active).length > 0;

      return hasActiveEntitlements;
    } catch (error) {
      console.error("Failed to check premium status:", error);
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
