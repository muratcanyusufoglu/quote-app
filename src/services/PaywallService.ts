// PaywallService.ts - Business logic for paywall and subscription management
// Following SOLID principles for clean architecture

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
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  userCancelled?: boolean;
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
      const offerings = await revenueCatService.getOfferings();

      if (!offerings || !offerings.packages) {
        console.warn("No offerings found from RevenueCat");
        return this.getFallbackPackages();
      }

      this.revenueCatPackages = offerings.packages;
      this.packages = this.convertRevenueCatPackagesToSubscriptionPackages(
        offerings.packages
      );

      console.log(`📦 Found ${this.packages.length} packages`);
      return this.packages;
    } catch (error) {
      console.error("Failed to get packages from RevenueCat:", error);
      return this.getFallbackPackages();
    }
  }

  private convertRevenueCatPackagesToSubscriptionPackages(
    packages: RevenueCatPackage[]
  ): SubscriptionPackage[] {
    return packages.map((pkg, index) => {
      const isYearly =
        pkg.packageType === "ANNUAL" || pkg.identifier.includes("yearly");
      const isLifetime =
        pkg.packageType === "LIFETIME" || pkg.identifier.includes("lifetime");

      // Calculate monthly equivalent for yearly packages
      const monthlyPrice = isYearly
        ? (pkg.product.price / 12).toFixed(2)
        : pkg.product.priceString;

      // Determine discount and original price
      let discount = "50% OFF";
      let originalPrice = pkg.product.priceString;

      if (isYearly) {
        discount = "67% OFF";
        originalPrice = `$${(pkg.product.price * 1.5).toFixed(2)}`;
      }

      return {
        id: pkg.identifier,
        title: isLifetime
          ? "Lifetime Premium"
          : isYearly
          ? "Annual Premium"
          : "Premium Plan",
        originalPrice,
        currentPrice: pkg.product.priceString,
        discount,
        period: isLifetime ? "lifetime" : isYearly ? "year" : "month",
        freeTrialDays: 3, // Default trial period
        pricePerMonth: isYearly ? `$${monthlyPrice}` : pkg.product.priceString,
        packageType: pkg.packageType,
        currencyCode: pkg.product.currencyCode,
        features: this.getFeaturesByPackageType(pkg.packageType, index),
        isPopular: isYearly || index === 0, // First package or yearly is popular
      };
    });
  }

  private getFeaturesByPackageType(
    packageType: string,
    index: number
  ): string[] {
    // First package features (primary offer)
    if (index === 0) {
      return [
        "🎯 10,000+ hand-picked quotes from world leaders",
        "📚 Exclusive stories & life lessons from successful people",
        "🧠 AI-powered personalization based on your goals",
        "🔥 Daily motivational challenges to build habits",
        "📊 Track your personal growth & mindset shifts",
        "🌟 Access to premium authors & thought leaders",
        "💎 Ad-free, distraction-free reading experience",
        "🚀 Weekly live inspiration sessions (Premium only)",
      ];
    }

    // Second package features (fallback offer)
    return [
      "Unlimited daily quotes",
      "Access to all premium categories",
      "Inspiring stories behind quotes",
      "Advanced personalization",
      "Exclusive motivational content",
      "Ad-free experience",
      "Offline reading mode",
      "Weekly inspiration insights",
    ];
  }

  private getFallbackPackages(): SubscriptionPackage[] {
    // Fallback packages when RevenueCat is unavailable
    return [
      {
        id: "annual_premium_fallback",
        title: "Annual Premium",
        originalPrice: "$59.99",
        currentPrice: "$39.99",
        discount: "33% OFF",
        period: "year",
        freeTrialDays: 3,
        pricePerMonth: "$3.33",
        features: [
          "🎯 10,000+ hand-picked quotes from world leaders",
          "📚 Exclusive stories & life lessons from successful people",
          "🧠 AI-powered personalization based on your goals",
          "🔥 Daily motivational challenges to build habits",
          "📊 Track your personal growth & mindset shifts",
          "🌟 Access to premium authors & thought leaders",
          "💎 Ad-free, distraction-free reading experience",
          "🚀 Weekly live inspiration sessions (Premium only)",
        ],
        isPopular: true,
      },
      {
        id: "lifetime_premium_fallback",
        title: "Lifetime Premium",
        originalPrice: "$199.99",
        currentPrice: "$99.99",
        discount: "50% OFF",
        period: "lifetime",
        freeTrialDays: 7,
        pricePerMonth: "One-time",
        features: [
          "Everything in Annual Premium",
          "Lifetime access - pay once, use forever",
          "All future premium features included",
          "Priority customer support",
          "Exclusive lifetime member benefits",
          "No recurring payments",
          "Transfer to family members",
          "Lifetime updates guarantee",
        ],
        isPopular: false,
      },
    ];
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
    console.log("📊 Getting subscription status");

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
        isInTrialPeriod: false, // You can enhance this with trial period detection
        autoRenewEnabled: hasActiveEntitlements,
      };
    } catch (error) {
      console.error("Failed to get subscription status:", error);
      return {
        isActive: false,
        isInTrialPeriod: false,
        autoRenewEnabled: false,
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    console.log("🔄 Restoring purchases");

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
    // Always show first offer if it hasn't been shown yet
    return !this.firstOfferShown;
  }

  static async markFirstOfferShown(): Promise<void> {
    this.firstOfferShown = true;
    console.log("📊 First offer marked as shown");
  }

  static async markFirstOfferRejected(): Promise<void> {
    this.firstOfferRejected = true;
    this.actionCount = 0; // Reset action count
    console.log("📊 First offer marked as rejected, action count reset");
  }

  static async shouldShowSecondOffer(): Promise<boolean> {
    // Show second offer if first was rejected and user performed enough actions
    const shouldShow =
      this.firstOfferRejected &&
      this.actionCount >= this.ACTIONS_REQUIRED_FOR_SECOND_OFFER;
    console.log(
      `📊 Should show second offer: ${shouldShow} (rejected: ${this.firstOfferRejected}, actions: ${this.actionCount})`
    );
    return shouldShow;
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
    // Use RevenueCat provider instead of Mock
    this.purchaseProvider = new RevenueCatPurchaseProvider();
  }

  async initialize(): Promise<void> {
    await this.purchaseProvider.initialize();
    this.packages = await this.purchaseProvider.getAvailablePackages();
  }

  async getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    if (this.packages.length === 0) {
      this.packages = await this.purchaseProvider.getAvailablePackages();
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

  async purchaseSubscription(packageId: string): Promise<PurchaseResult> {
    const result = await this.purchaseProvider.purchasePackage(packageId);

    if (result.success) {
      console.log("✅ Purchase successful!");
    } else if (result.userCancelled) {
      console.log("❌ Purchase cancelled by user");
      await PaywallStrategy.markFirstOfferRejected();
    } else {
      console.log("❌ Purchase failed:", result.error);
    }

    return result;
  }

  async restorePurchases(): Promise<PurchaseResult> {
    return await this.purchaseProvider.restorePurchases();
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return await this.purchaseProvider.getSubscriptionStatus();
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
