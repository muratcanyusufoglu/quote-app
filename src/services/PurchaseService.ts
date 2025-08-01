import { PurchaseProduct } from "../types";
import {
  canReadStory,
  FREE_DAILY_STORY_LIMIT,
  FREE_QUOTE_CATEGORIES_LIMIT,
  getRemainingStoryReads,
} from "../utils/dailyReset";
import revenueCatService from "./revenueCat";

// Single Responsibility: PurchaseService handles only purchase and premium logic
class PurchaseService {
  private static readonly PREMIUM_ENTITLEMENT_ID = "premium_lifetime";
  private static readonly TRIAL_DURATION_DAYS = 7;

  // Initialize RevenueCat
  async initialize(): Promise<void> {
    try {
      await revenueCatService.initialize();
      console.log("PurchaseService initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PurchaseService:", error);
    }
  }

  // Get available products from RevenueCat
  async getProducts(): Promise<PurchaseProduct[]> {
    try {
      const offerings = await revenueCatService.getOfferings();
      if (!offerings || !offerings.packages) {
        console.warn("No offerings available");
        return [];
      }

      return offerings.packages.map((pkg) => ({
        identifier: pkg.identifier,
        price: pkg.product.priceString,
        title: pkg.product.title,
        description: pkg.product.description,
      }));
    } catch (error) {
      console.error("Failed to get products:", error);
      return [];
    }
  }

  // Check if user has premium access via RevenueCat
  async checkPremiumStatus(): Promise<boolean> {
    try {
      return await revenueCatService.isPremiumUser();
    } catch (error) {
      console.error("Failed to check premium status:", error);
      return false;
    }
  }

  // Purchase premium via RevenueCat
  async purchasePremium(productId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get available packages to find the correct one
      const offerings = await revenueCatService.getOfferings();
      if (!offerings) {
        return { success: false, error: "No packages available" };
      }

      const packageToPurchase = offerings.packages.find(
        (pkg) => pkg.identifier === productId
      );

      if (!packageToPurchase) {
        return { success: false, error: "Product not found" };
      }

      const result = await revenueCatService.purchasePackage(packageToPurchase);

      if (result.success) {
        console.log("✅ Purchase completed successfully");
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Purchase failed",
        };
      }
    } catch (error: any) {
      console.error("Purchase failed:", error);
      return {
        success: false,
        error: error.message || "Purchase failed",
      };
    }
  }

  // Restore purchases via RevenueCat
  async restorePurchases(): Promise<{
    success: boolean;
    hasPremium: boolean;
    error?: string;
  }> {
    try {
      const result = await revenueCatService.restorePurchases();

      if (result.success) {
        // Check premium status after restore
        const hasPremium = await revenueCatService.isPremiumUser();
        return {
          success: true,
          hasPremium,
        };
      } else {
        return {
          success: false,
          hasPremium: false,
          error: result.error || "Restore failed",
        };
      }
    } catch (error: any) {
      console.error("Restore failed:", error);
      return {
        success: false,
        hasPremium: false,
        error: error.message || "Restore failed",
      };
    }
  }

  // Check if user can read a story (free limit check)
  canReadStory(dailyReads: number, isPremium: boolean): boolean {
    return canReadStory(dailyReads, isPremium);
  }

  // Get remaining story reads for free users
  getRemainingStoryReads(dailyReads: number, isPremium: boolean): number {
    return getRemainingStoryReads(dailyReads, isPremium);
  }

  // Check if user can access category
  canAccessCategory(isPremium: boolean, categoryIsPremium: boolean): boolean {
    return isPremium || !categoryIsPremium;
  }

  // Get premium benefits description
  getPremiumBenefits(): string[] {
    return [
      "Unlimited story reads per day",
      "Access to all premium categories",
      "No advertisements",
      "Advanced personalization features",
      "Reading statistics and insights",
      "Dark theme customization",
      "Priority customer support",
    ];
  }

  // Get premium features for upsell
  getPremiumFeatures(): {
    icon: string;
    title: string;
    description: string;
  }[] {
    return [
      {
        icon: "📚",
        title: "Unlimited Stories",
        description:
          "Read as many inspiring stories as you want, no daily limits",
      },
      {
        icon: "🎯",
        title: "All Categories",
        description:
          "Access exclusive premium categories like Wisdom, Love, and Leadership",
      },
      {
        icon: "📊",
        title: "Reading Insights",
        description:
          "Track your progress with detailed reading statistics and streaks",
      },
      {
        icon: "🎨",
        title: "Premium Themes",
        description: "Customize your experience with beautiful premium themes",
      },
      {
        icon: "⭐",
        title: "No Ads",
        description: "Enjoy uninterrupted reading without any advertisements",
      },
      {
        icon: "🚀",
        title: "Early Access",
        description: "Get first access to new features and content updates",
      },
    ];
  }

  // Check trial status
  isTrialActive(installDate: string): boolean {
    const daysSinceInstall = Math.floor(
      (Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceInstall <= PurchaseService.TRIAL_DURATION_DAYS;
  }

  // Get trial days remaining
  getTrialDaysRemaining(installDate: string): number {
    const daysSinceInstall = Math.floor(
      (Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, PurchaseService.TRIAL_DURATION_DAYS - daysSinceInstall);
  }

  // Get free tier limitations info
  getFreeTierInfo(): {
    dailyStoryLimit: number;
    categoryLimit: number;
    description: string;
  } {
    return {
      dailyStoryLimit: FREE_DAILY_STORY_LIMIT,
      categoryLimit: FREE_QUOTE_CATEGORIES_LIMIT,
      description: `Free users can read up to ${FREE_DAILY_STORY_LIMIT} stories per day and access ${FREE_QUOTE_CATEGORIES_LIMIT} basic categories.`,
    };
  }

  // Calculate savings for lifetime purchase
  calculateSavings(): {
    monthlyPrice: number;
    lifetimePrice: number;
    savingsAmount: number;
    savingsPercentage: number;
  } {
    const monthlyPrice = 1.99;
    const lifetimePrice = 4.99;
    const equivalentMonths = 12; // How many months the lifetime price equals
    const totalMonthlyCost = monthlyPrice * equivalentMonths;
    const savingsAmount = totalMonthlyCost - lifetimePrice;
    const savingsPercentage = Math.round(
      (savingsAmount / totalMonthlyCost) * 100
    );

    return {
      monthlyPrice,
      lifetimePrice,
      savingsAmount,
      savingsPercentage,
    };
  }

  // Analytics tracking for premium features
  trackPremiumFeatureUsed(feature: string): void {
    // TODO: Implement analytics tracking
    console.log(`Premium feature used: ${feature}`);
  }

  // Track paywall events
  trackPaywallShown(trigger: string): void {
    // TODO: Implement analytics tracking
    console.log(`Paywall shown, trigger: ${trigger}`);
  }

  trackPurchaseStarted(productId: string): void {
    // TODO: Implement analytics tracking
    console.log(`Purchase started: ${productId}`);
  }

  trackPurchaseCompleted(productId: string, revenue: number): void {
    // TODO: Implement analytics tracking
    console.log(`Purchase completed: ${productId}, revenue: ${revenue}`);
  }

  // Get upsell message based on context
  getUpsellMessage(
    context: "story_limit" | "premium_category" | "feature_locked"
  ): string {
    const messages = {
      story_limit: `You've reached your daily limit of ${FREE_DAILY_STORY_LIMIT} stories. Upgrade to Premium for unlimited access!`,
      premium_category:
        "This category is exclusive to Premium users. Upgrade now to unlock all content!",
      feature_locked:
        "This feature is available in Premium. Upgrade to unlock advanced personalization!",
    };

    return messages[context] || "Upgrade to Premium for the full experience!";
  }
}

// Export singleton instance
export const purchaseService = new PurchaseService();
export default PurchaseService;
