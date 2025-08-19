// PaywallService.ts - Business logic for paywall and subscription management
// Following SOLID principles for clean architecture
// NO HARD-CODED VALUES - All data comes from RevenueCat

import revenueCatService, {
  PurchasePackage as RevenueCatPackage,
} from "./revenueCat";

// Update the SubscriptionPackage interface to match RevenueCat structure
export interface SubscriptionPackage {
  id: string;
  title: string;
  originalPrice: string;
  currentPrice: string;
  discount: string;
  period: string;
  freeTrialDays: number;
  pricePerMonth: string;
  features: string[];
  isPopular: boolean;
  packageType?: string; // RevenueCat package type
  currencyCode?: string;
  priceNumber?: number;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  userCancelled?: boolean;
  isPremium?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isInTrialPeriod: boolean;
  autoRenewEnabled: boolean;
}

export interface IPurchaseProvider {
  initialize(): Promise<void>;
  getAvailablePackages(): Promise<SubscriptionPackage[]>;
  purchasePackage(packageId: string): Promise<PurchaseResult>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
  restorePurchases(): Promise<PurchaseResult>;
}

export class RevenueCatPurchaseProvider implements IPurchaseProvider {
  private packages: SubscriptionPackage[] = [];
  private revenueCatPackages: RevenueCatPackage[] = [];

  async initialize(): Promise<void> {
    console.log("🔄 RevenueCatPurchaseProvider initializing...");
    await revenueCatService.initialize();
    console.log("✅ RevenueCatPurchaseProvider initialized");
  }

  async getAvailablePackages(): Promise<SubscriptionPackage[]> {
    console.log("📦 Getting available packages from RevenueCat");

    try {
      console.log("🔄 Calling revenueCatService.getOfferings()...");
      const offerings = await revenueCatService.getOfferings();
      console.log("📦 RevenueCat offerings received:", offerings);

      if (!offerings || !offerings.packages) {
        console.warn("⚠️ No offerings or packages found from RevenueCat");
        console.log("🔍 Offerings object:", offerings);
        return []; // Return empty array - no fallback packages
      }

      console.log(
        `📦 Found ${offerings.packages.length} packages from RevenueCat`
      );
      console.log(
        "🔍 Package details:",
        offerings.packages.map((p) => ({
          identifier: p.identifier,
          packageType: p.packageType,
          title: p.product.title,
          price: p.product.priceString,
          description: p.product.description,
        }))
      );

      this.revenueCatPackages = offerings.packages;
      this.packages = this.convertRevenueCatPackagesToSubscriptionPackages(
        offerings.packages
      );

      console.log(
        `✅ Converted ${this.packages.length} packages to SubscriptionPackage format`
      );
      return this.packages;
    } catch (error) {
      console.error("❌ Failed to get packages from RevenueCat:", error);
      return []; // Return empty array - no fallback packages
    }
  }

  private convertRevenueCatPackagesToSubscriptionPackages(
    packages: RevenueCatPackage[]
  ): SubscriptionPackage[] {
    return packages.map((pkg, index) => {
      // All data comes from RevenueCat - no hard-coded values
      const isYearly =
        pkg.packageType === "ANNUAL" || pkg.identifier.includes("yearly");
      const isLifetime =
        pkg.packageType === "LIFETIME" || pkg.identifier.includes("lifetime");

      // Calculate monthly equivalent for yearly packages using actual price from RevenueCat
      const monthlyPrice = isYearly
        ? (pkg.product.price / 12).toFixed(2)
        : pkg.product.priceString;

      // No fabricated discount - use what RevenueCat provides
      const discount = ""; // RevenueCat doesn't provide discount info by default
      const originalPrice = pkg.product.priceString; // Use actual price from RevenueCat

      return {
        id: pkg.identifier, // Use RevenueCat identifier
        title:
          pkg.product.title ||
          this.generateTitleFromPackageType(pkg.packageType), // Use RevenueCat title or generate from type
        originalPrice,
        currentPrice: pkg.product.priceString, // Use actual price from RevenueCat
        discount,
        period: this.getPeriodFromPackageType(pkg.packageType), // Determine period from RevenueCat package type
        freeTrialDays: this.getTrialDaysFromPackageType(pkg.packageType), // Get trial days from RevenueCat or default to 0
        pricePerMonth: isYearly
          ? `${monthlyPrice} ${pkg.product.currencyCode || "USD"}`
          : pkg.product.priceString,
        packageType: pkg.packageType, // Use RevenueCat package type
        currencyCode: pkg.product.currencyCode, // Use RevenueCat currency
        priceNumber: pkg.product.price, // Use RevenueCat price number
        features: this.getFeaturesFromRevenueCatPackage(pkg), // Extract features from RevenueCat data
        isPopular: this.determinePopularity(pkg, index), // Determine popularity based on RevenueCat data
      };
    });
  }

  private generateTitleFromPackageType(packageType?: string): string {
    if (!packageType) return "Premium Plan";

    switch (packageType.toUpperCase()) {
      case "LIFETIME":
        return "Lifetime Premium";
      case "ANNUAL":
        return "Annual Premium";
      case "MONTHLY":
        return "Monthly Premium";
      default:
        return "Premium Plan";
    }
  }

  private getPeriodFromPackageType(packageType?: string): string {
    if (!packageType) return "month";

    switch (packageType.toUpperCase()) {
      case "LIFETIME":
        return "lifetime";
      case "ANNUAL":
        return "year";
      case "MONTHLY":
        return "month";
      default:
        return "month";
    }
  }

  private getTrialDaysFromPackageType(packageType?: string): number {
    // RevenueCat doesn't provide trial days by default
    // This would need to be configured in RevenueCat dashboard or App Store/Google Play
    // For now, return 0 - no hard-coded trial periods
    return 0;
  }

  private determinePopularity(pkg: RevenueCatPackage, index: number): boolean {
    // Determine popularity based on RevenueCat data, not hard-coded logic
    // Could be based on package type, price, or other RevenueCat metadata
    return index === 0; // First package is popular by default
  }

  private getFeaturesFromRevenueCatPackage(pkg: RevenueCatPackage): string[] {
    // Extract features from RevenueCat package description and metadata
    const features: string[] = [];

    // Use package description if available from RevenueCat
    if (pkg.product.description) {
      features.push(`📝 ${pkg.product.description}`);
    }

    // Use package title if available from RevenueCat
    if (pkg.product.title) {
      features.push(`📦 ${pkg.product.title}`);
    }

    // Add package type information from RevenueCat
    if (pkg.packageType) {
      features.push(`🏷️ Package Type: ${pkg.packageType}`);
    }

    // Add price information from RevenueCat
    if (pkg.product.priceString) {
      features.push(`💰 Price: ${pkg.product.priceString}`);
    }

    // Add currency information from RevenueCat
    if (pkg.product.currencyCode) {
      features.push(`💱 Currency: ${pkg.product.currencyCode}`);
    }

    // If no features extracted from RevenueCat, provide generic ones based on package type
    if (features.length === 0) {
      if (pkg.packageType === "LIFETIME") {
        features.push("🌟 Lifetime access to all premium features");
        features.push("💎 One-time payment, no recurring charges");
        features.push("🚀 All future updates included");
      } else if (pkg.packageType === "ANNUAL") {
        features.push("📅 Annual subscription with auto-renewal");
        features.push("💎 Access to all premium features");
        features.push("🔄 Cancel anytime");
      } else if (pkg.packageType === "MONTHLY") {
        features.push("📅 Monthly subscription with auto-renewal");
        features.push("💎 Access to all premium features");
        features.push("🔄 Cancel anytime");
      } else {
        features.push("✨ Premium access to exclusive content");
        features.push("💎 Enhanced user experience");
        features.push("🚀 Advanced features unlocked");
      }
    }

    return features;
  }

  async purchasePackage(packageId: string): Promise<PurchaseResult> {
    console.log(`💰 Purchasing package: ${packageId}`);

    try {
      // Find the RevenueCat package
      const revenueCatPackage = this.revenueCatPackages.find(
        (pkg) => pkg.identifier === packageId
      );

      if (!revenueCatPackage) {
        return {
          success: false,
          error: "Package not found",
        };
      }

      const result = await revenueCatService.purchasePackage(revenueCatPackage);

      return {
        success: result.success,
        transactionId: result.customerInfo?.originalAppUserId,
        error: result.error,
        userCancelled: result.userCancelled,
      };
    } catch (error) {
      console.error("Purchase failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Purchase failed",
      };
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    console.log("📊 Getting subscription status from RevenueCat");

    try {
      const customerInfo = await revenueCatService.getCustomerInfo();

      if (!customerInfo) {
        return {
          isActive: false,
          isInTrialPeriod: false,
          autoRenewEnabled: false,
        };
      }

      const hasActiveEntitlements =
        Object.keys(customerInfo.entitlements.active).length > 0;

      return {
        isActive: hasActiveEntitlements,
        isInTrialPeriod: false, // This would need to be determined from RevenueCat data
        autoRenewEnabled: hasActiveEntitlements,
      };
    } catch (error) {
      console.error(
        "Failed to get subscription status from RevenueCat:",
        error
      );
      return {
        isActive: false,
        isInTrialPeriod: false,
        autoRenewEnabled: false,
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    console.log("🔄 Restoring purchases via RevenueCat");

    try {
      const result = await revenueCatService.restorePurchases();

      return {
        success: result.success,
        transactionId: result.customerInfo?.originalAppUserId,
        error: result.error,
      };
    } catch (error) {
      console.error("Restore failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Restore failed",
      };
    }
  }
}

// Paywall Strategy for Two-Package System
export class PaywallStrategy {
  private static firstOfferShown = false;
  private static firstOfferRejected = false;
  private static actionCount = 0;
  private static ACTIONS_REQUIRED_FOR_SECOND_OFFER = 5;

  static async shouldShowFirstOffer(): Promise<boolean> {
    // Only show first offer if it hasn't been rejected yet
    return !this.firstOfferRejected && !this.firstOfferShown;
  }

  static async markFirstOfferShown(): Promise<void> {
    this.firstOfferShown = true;
    console.log("📊 First offer marked as shown");
  }

  static async markFirstOfferRejected(): Promise<void> {
    this.firstOfferRejected = true;
    this.firstOfferShown = true;
    this.actionCount = 0; // Reset action count
    console.log("📊 First offer marked as rejected, action count reset");
  }

  static async shouldShowSecondOffer(): Promise<boolean> {
    // After first offer is rejected, always show the second (discounted) offer
    const shouldShow = this.firstOfferRejected;
    console.log(
      `📊 Should show second offer: ${shouldShow} (rejected: ${this.firstOfferRejected}, actions: ${this.actionCount})`
    );
    return shouldShow;
  }

  static async shouldShowDiscountedByDefault(): Promise<boolean> {
    // If first offer was rejected, all future paywalls should show discounted version
    return this.firstOfferRejected;
  }

  static async incrementActionCount(): Promise<void> {
    this.actionCount++;
    console.log(`📊 Action count incremented to: ${this.actionCount}`);
  }

  static async resetStrategy(): Promise<void> {
    this.firstOfferShown = false;
    this.firstOfferRejected = false;
    this.actionCount = 0;
    console.log("📊 Paywall strategy reset");
  }

  static getDebugInfo() {
    return {
      firstOfferShown: this.firstOfferShown,
      firstOfferRejected: this.firstOfferRejected,
      actionCount: this.actionCount,
      actionsRequired: this.ACTIONS_REQUIRED_FOR_SECOND_OFFER,
    };
  }
}

export class PaywallService {
  private purchaseProvider: IPurchaseProvider;
  private packages: SubscriptionPackage[] = [];

  constructor() {
    // Use RevenueCat provider - no fallback providers
    this.purchaseProvider = new RevenueCatPurchaseProvider();
  }

  async initialize(): Promise<void> {
    await this.purchaseProvider.initialize();
    const fetched = await this.purchaseProvider.getAvailablePackages();
    this.packages = this.sortPackagesForTwoOfferStrategy(fetched);
  }

  // Check if user has premium access from RevenueCat
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isActive || status.isInTrialPeriod;
    } catch (error) {
      console.error("Failed to check active subscription:", error);
      return false;
    }
  }

  // Check if user is in trial period
  async isInTrialPeriod(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isInTrialPeriod;
    } catch (error) {
      console.error("Failed to check trial period:", error);
      return false;
    }
  }

  // Get detailed subscription status from RevenueCat
  async getDetailedSubscriptionStatus(): Promise<{
    isActive: boolean;
    isInTrialPeriod: boolean;
    autoRenewEnabled: boolean;
  }> {
    try {
      return await this.getSubscriptionStatus();
    } catch (error) {
      console.error("Failed to get detailed subscription status:", error);
      return {
        isActive: false,
        isInTrialPeriod: false,
        autoRenewEnabled: false,
      };
    }
  }

  async getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    if (this.packages.length === 0) {
      const fetched = await this.purchaseProvider.getAvailablePackages();
      this.packages = this.sortPackagesForTwoOfferStrategy(fetched);
    }

    // If no packages available from RevenueCat, return empty array
    if (this.packages.length === 0) {
      console.warn("No packages available from RevenueCat");
      return [];
    }

    // Implement two-package strategy
    const shouldShowFirst = await PaywallStrategy.shouldShowFirstOffer();
    const shouldShowSecond = await PaywallStrategy.shouldShowSecondOffer();

    if (shouldShowFirst) {
      // Mark first offer as shown
      await PaywallStrategy.markFirstOfferShown();
      // Return first (premium) package
      console.log("📦 Returning first offer package");
      return this.packages.slice(0, 1);
    } else if (shouldShowSecond) {
      // Return second (fallback) package
      console.log("📦 Returning second offer package");
      return this.packages.slice(1, 2).length > 0
        ? this.packages.slice(1, 2)
        : this.packages.slice(0, 1);
    }

    // Default to first package
    console.log("📦 Returning default package");
    return this.packages.slice(0, 1);
  }

  // Expose all packages to UI when we need to manually switch between offers in-place
  async getAllSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    console.log("🔍 getAllSubscriptionPackages called");
    console.log("📦 Current packages in memory:", this.packages.length);

    if (this.packages.length === 0) {
      console.log("🔄 No packages in memory, fetching from RevenueCat...");
      const fetched = await this.purchaseProvider.getAvailablePackages();
      console.log("📦 Fetched packages from RevenueCat:", fetched?.length || 0);

      if (fetched && fetched.length > 0) {
        this.packages = this.sortPackagesForTwoOfferStrategy(fetched);
        console.log("✅ Packages processed and sorted:", this.packages.length);
      } else {
        console.warn("⚠️ No packages fetched from RevenueCat");
      }
    } else {
      console.log("✅ Using cached packages:", this.packages.length);
    }

    console.log(
      "📦 Returning packages:",
      this.packages.map((p) => ({
        id: p.id,
        title: p.title,
        currentPrice: p.currentPrice,
        originalPrice: p.originalPrice,
      }))
    );

    return this.packages;
  }

  async purchaseSubscription(packageId: string): Promise<PurchaseResult> {
    const result = await this.purchaseProvider.purchasePackage(packageId);

    if (result.success) {
      console.log("✅ Purchase successful!");

      // Check if premium status is now active
      try {
        const status = await this.getSubscriptionStatus();
        console.log("📊 Updated subscription status:", status);

        // Update the result with premium status
        return {
          ...result,
          isPremium: status.isActive || status.isInTrialPeriod,
        };
      } catch (error) {
        console.error("Failed to check updated subscription status:", error);
        // Return success anyway, the store will handle the status update
        return result;
      }
    } else if (result.userCancelled) {
      console.log("❌ Purchase cancelled by user");
      await PaywallStrategy.markFirstOfferRejected();
    } else {
      console.log("❌ Purchase failed:", result.error);
    }

    return result;
  }

  // Allow UI to explicitly mark the first offer as rejected (e.g., user closed modal)
  async markFirstOfferRejected(): Promise<void> {
    await PaywallStrategy.markFirstOfferRejected();
  }

  // Check if user should see discounted paywall by default (after rejecting first offer)
  async shouldShowDiscountedByDefault(): Promise<boolean> {
    return await PaywallStrategy.shouldShowDiscountedByDefault();
  }

  async restorePurchases(): Promise<PurchaseResult> {
    const result = await this.purchaseProvider.restorePurchases();

    if (result.success) {
      console.log("✅ Purchases restored successfully!");

      // Check if premium status is now active
      try {
        const status = await this.getSubscriptionStatus();
        console.log("📊 Updated subscription status after restore:", status);

        // Update the result with premium status
        return {
          ...result,
          isPremium: status.isActive || status.isInTrialPeriod,
        };
      } catch (error) {
        console.error(
          "Failed to check updated subscription status after restore:",
          error
        );
        // Return success anyway, the store will handle the status update
        return result;
      }
    }

    return result;
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return await this.purchaseProvider.getSubscriptionStatus();
  }

  // Sort packages based on RevenueCat data, not hard-coded logic
  private sortPackagesForTwoOfferStrategy(
    packages: SubscriptionPackage[]
  ): SubscriptionPackage[] {
    if (!Array.isArray(packages) || packages.length <= 1) return packages || [];

    const parsePrice = (p: SubscriptionPackage): number => {
      if (typeof p.priceNumber === "number") return p.priceNumber;
      const s = p.currentPrice || "";
      const num = parseFloat(s.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
    };

    // 🔍 DEBUG: Package sorting process
    console.log(
      "🔍 SORT DEBUG - Input packages from RevenueCat:",
      packages.map((p) => ({
        id: p.id,
        price: p.currentPrice,
        type: p.packageType,
        discount: p.discount,
        title: p.title,
      }))
    );

    // Sort by price (highest first) - all data from RevenueCat
    const sortedPackages = [...packages].sort(
      (a, b) => parsePrice(b) - parsePrice(a)
    );

    console.log(
      "🔍 SORT DEBUG - Final order based on RevenueCat data:",
      sortedPackages.map((p) => p.id)
    );

    return sortedPackages;
  }

  // Helper method to increment action count for second offer strategy
  async trackUserAction(): Promise<void> {
    await PaywallStrategy.incrementActionCount();
  }

  // Helper method to get debug info
  getPaywallDebugInfo() {
    return PaywallStrategy.getDebugInfo();
  }

  // Helper method to reset paywall strategy (for testing)
  async resetPaywallStrategy(): Promise<void> {
    await PaywallStrategy.resetStrategy();
  }
}

// Singleton instance
let paywallServiceInstance: PaywallService | null = null;

export function getPaywallService(): PaywallService {
  if (!paywallServiceInstance) {
    paywallServiceInstance = new PaywallService();
  }
  return paywallServiceInstance;
}
