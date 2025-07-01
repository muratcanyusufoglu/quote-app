// PaywallService.ts - Business logic for paywall and subscription management
// Following SOLID principles for clean architecture

export interface SubscriptionPackage {
  id: string;
  title: string;
  originalPrice: string;
  currentPrice: string;
  discount: string;
  period: "month" | "year";
  freeTrialDays: number;
  pricePerMonth: string;
  features: string[];
  isPopular?: boolean;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  expirationDate?: Date;
  isInTrialPeriod: boolean;
  autoRenewEnabled: boolean;
}

// Interface for RevenueCat integration (to be implemented)
export interface IPurchaseProvider {
  initialize(): Promise<void>;
  getAvailablePackages(): Promise<SubscriptionPackage[]>;
  purchasePackage(packageId: string): Promise<PurchaseResult>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
  restorePurchases(): Promise<PurchaseResult>;
}

// Mock implementation for development - Replace with RevenueCat implementation
export class MockPurchaseProvider implements IPurchaseProvider {
  async initialize(): Promise<void> {
    console.log("🔄 MockPurchaseProvider initialized");
    // Simulate initialization delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async getAvailablePackages(): Promise<SubscriptionPackage[]> {
    console.log("📦 Getting available packages");
    // Return mock packages
    return [
      {
        id: "annual_premium",
        title: "Annual Premium",
        originalPrice: "$59.99",
        currentPrice: "$39.99",
        discount: "33% OFF",
        period: "year",
        freeTrialDays: 3,
        pricePerMonth: "$3.33",
        features: [
          "Unlimited premium quotes",
          "Unlimited stories & content",
          "Ad-free experience",
          "Advanced personalization",
          "Daily motivation reminders",
          "Offline access",
          "Premium categories",
          "Priority support",
        ],
        isPopular: true,
      },
    ];
  }

  async purchasePackage(packageId: string): Promise<PurchaseResult> {
    console.log(`💰 Purchasing package: ${packageId}`);
    // Simulate purchase process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock successful purchase (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        transactionId: `mock_transaction_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: "Purchase failed. Please try again.",
      };
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    console.log("📊 Getting subscription status");
    // Mock subscription status
    return {
      isActive: false,
      isInTrialPeriod: false,
      autoRenewEnabled: false,
    };
  }

  async restorePurchases(): Promise<PurchaseResult> {
    console.log("🔄 Restoring purchases");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: "restored_purchase",
    };
  }
}

// Main PaywallService class - Single Responsibility Principle
export class PaywallService {
  private purchaseProvider: IPurchaseProvider;
  private isInitialized: boolean = false;

  constructor(purchaseProvider: IPurchaseProvider) {
    this.purchaseProvider = purchaseProvider;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.purchaseProvider.initialize();
      this.isInitialized = true;
      console.log("✅ PaywallService initialized");
    } catch (error) {
      console.error("❌ PaywallService initialization failed:", error);
      throw error;
    }
  }

  async getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    this.ensureInitialized();
    return await this.purchaseProvider.getAvailablePackages();
  }

  async purchaseSubscription(packageId: string): Promise<PurchaseResult> {
    this.ensureInitialized();

    try {
      console.log(`🛒 Starting purchase for package: ${packageId}`);
      const result = await this.purchaseProvider.purchasePackage(packageId);

      if (result.success) {
        console.log("🎉 Purchase successful:", result.transactionId);
        // Here you would typically update user's subscription status
        // and sync with your backend
      } else {
        console.error("❌ Purchase failed:", result.error);
      }

      return result;
    } catch (error) {
      console.error("❌ Purchase error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during purchase.",
      };
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    this.ensureInitialized();
    return await this.purchaseProvider.getSubscriptionStatus();
  }

  async restorePurchases(): Promise<PurchaseResult> {
    this.ensureInitialized();

    try {
      console.log("🔄 Restoring purchases");
      const result = await this.purchaseProvider.restorePurchases();

      if (result.success) {
        console.log("✅ Purchases restored successfully");
      } else {
        console.error("❌ Purchase restoration failed:", result.error);
      }

      return result;
    } catch (error) {
      console.error("❌ Restore purchases error:", error);
      return {
        success: false,
        error: "Failed to restore purchases. Please try again.",
      };
    }
  }

  // Helper method to check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isActive;
    } catch (error) {
      console.error("❌ Error checking subscription status:", error);
      return false;
    }
  }

  // Helper method to check if user is in trial period
  async isInTrialPeriod(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isInTrialPeriod;
    } catch (error) {
      console.error("❌ Error checking trial status:", error);
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "PaywallService not initialized. Call initialize() first."
      );
    }
  }
}

// Factory for creating PaywallService instances - Dependency Injection
export class PaywallServiceFactory {
  static createWithMockProvider(): PaywallService {
    const mockProvider = new MockPurchaseProvider();
    return new PaywallService(mockProvider);
  }

  // TODO: Implement when RevenueCat is integrated
  // static createWithRevenueCatProvider(): PaywallService {
  //   const revenueCatProvider = new RevenueCatPurchaseProvider();
  //   return new PaywallService(revenueCatProvider);
  // }
}

// Singleton instance for app-wide usage
let paywallServiceInstance: PaywallService | null = null;

export const getPaywallService = (): PaywallService => {
  if (!paywallServiceInstance) {
    paywallServiceInstance = PaywallServiceFactory.createWithMockProvider();
  }
  return paywallServiceInstance;
};

// Initialize the service on app startup
export const initializePaywallService = async (): Promise<void> => {
  const service = getPaywallService();
  await service.initialize();
};
