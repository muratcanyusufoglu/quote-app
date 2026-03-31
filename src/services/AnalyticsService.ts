import analytics from "@react-native-firebase/analytics";
import { Platform } from "react-native";

import {
  AnalyticsEvent,
  CategoryEvent,
  OnboardingEvent,
  PaywallEvent,
  PerformanceEvent,
  PurchaseAnalyticsEvent,
  QuoteEvent,
  ScreenViewEvent,
  ShareEvent,
  UserActionEvent,
} from "../types";

class AnalyticsService {
  private isEnabled: boolean = true;
  private initialized: boolean = false;
  private initializing: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    // If currently initializing, return the existing promise
    if (this.initializing) {
      return this.initializing;
    }

    // Create and store the initialization promise
    this.initializing = (async () => {
      try {
        // Enable analytics collection
        await analytics().setAnalyticsCollectionEnabled(true);

        // Set default user properties
        await analytics().setUserProperty("platform", Platform.OS);
        await analytics().setUserProperty("app_version", "1.0.0");

        this.initialized = true;
        console.log("🔥 Firebase Analytics initialized");
      } catch (error) {
        console.error("❌ Failed to initialize analytics:", error);
        this.isEnabled = false;
      } finally {
        // Clear the initializing promise after completion
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    analytics().setAnalyticsCollectionEnabled(enabled);
  }

  // Generic event tracking
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled || !this.initialized) return;

    try {
      await analytics().logEvent(event.name, event.parameters);
      console.log(`📊 Analytics: ${event.name}`, event.parameters);
    } catch (error) {
      console.error("❌ Failed to track event:", error);
    }
  }

  // Screen view tracking
  async trackScreenView(screen: ScreenViewEvent): Promise<void> {
    if (!this.isEnabled || !this.initialized) return;

    try {
      await analytics().logScreenView({
        screen_name: screen.screen_name,
        screen_class: screen.screen_class || screen.screen_name,
      });
      console.log(`📱 Screen View: ${screen.screen_name}`);
    } catch (error) {
      console.error("❌ Failed to track screen view:", error);
    }
  }

  // Quote related events
  async trackQuoteView(quote: QuoteEvent): Promise<void> {
    await this.trackEvent({
      name: "quote_view",
      parameters: {
        quote_id: quote.quote_id,
        quote_category: quote.quote_category,
        quote_author: quote.quote_author,
        language: quote.language,
      },
    });
  }

  async trackQuoteFavorite(
    quote: QuoteEvent,
    action: "add" | "remove"
  ): Promise<void> {
    await this.trackEvent({
      name: action === "add" ? "quote_favorite_add" : "quote_favorite_remove",
      parameters: {
        quote_id: quote.quote_id,
        quote_category: quote.quote_category,
        quote_author: quote.quote_author,
        language: quote.language,
      },
    });
  }

  async trackQuoteShare(shareEvent: ShareEvent): Promise<void> {
    await this.trackEvent({
      name: "quote_share",
      parameters: {
        quote_id: shareEvent.quote_id,
        quote_category: shareEvent.quote_category,
        quote_author: shareEvent.quote_author,
        language: shareEvent.language,
        share_method: shareEvent.share_method,
        content_type: shareEvent.content_type,
      },
    });
  }

  // Category events
  async trackCategoryView(category: CategoryEvent): Promise<void> {
    await this.trackEvent({
      name: "category_view",
      parameters: {
        category_id: category.category_id,
        category_name: category.category_name,
        is_premium: category.is_premium,
      },
    });
  }

  async trackCategoryFilter(category: CategoryEvent): Promise<void> {
    await this.trackEvent({
      name: "category_filter",
      parameters: {
        category_id: category.category_id,
        category_name: category.category_name,
        is_premium: category.is_premium,
      },
    });
  }

  // User action events
  async trackUserAction(action: UserActionEvent): Promise<void> {
    await this.trackEvent({
      name: "user_action",
      parameters: {
        action_type: action.action_type,
        item_id: action.item_id,
        old_value: action.old_value,
        new_value: action.new_value,
      },
    });
  }

  // Theme change
  async trackThemeChange(oldTheme: string, newTheme: string): Promise<void> {
    await this.trackUserAction({
      action_type: "theme_change",
      old_value: oldTheme,
      new_value: newTheme,
    });
  }

  // Language change
  async trackLanguageChange(oldLang: string, newLang: string): Promise<void> {
    await this.trackUserAction({
      action_type: "language_change",
      old_value: oldLang,
      new_value: newLang,
    });
  }

  // Onboarding events
  async trackOnboardingStart(): Promise<void> {
    await this.trackEvent({
      name: "onboarding_start",
      parameters: {
        timestamp: Date.now(),
      },
    });
  }

  async trackOnboardingStep(event: OnboardingEvent): Promise<void> {
    await this.trackEvent({
      name: "onboarding_step",
      parameters: {
        step: event.step,
        total_steps: event.total_steps,
        completion_rate: event.completion_rate,
        selected_preferences: event.selected_preferences?.join(","),
      },
    });
  }

  async trackOnboardingComplete(preferences: string[]): Promise<void> {
    await this.trackEvent({
      name: "onboarding_complete",
      parameters: {
        selected_preferences: preferences.join(","),
        timestamp: Date.now(),
      },
    });
  }

  // Paywall events
  async trackPaywallView(event: PaywallEvent): Promise<void> {
    await this.trackEvent({
      name: "paywall_view",
      parameters: {
        trigger_source: event.trigger_source,
        paywall_number: event.paywall_number ?? 1,
        product_id: event.product_id,
        price: event.price,
        has_trial: event.has_trial,
      },
    });
  }

  async trackPaywallAction(event: PaywallEvent): Promise<void> {
    await this.trackEvent({
      name: "paywall_action",
      parameters: {
        trigger_source: event.trigger_source,
        user_action: event.user_action,
        paywall_number: event.paywall_number ?? 1,
        product_id: event.product_id,
        price: event.price,
      },
    });
  }

  // Purchase events
  async trackPurchaseStart(event: PurchaseAnalyticsEvent): Promise<void> {
    await this.trackEvent({
      name: "purchase_start",
      parameters: {
        product_id: event.product_id,
        price: event.price,
        paywall_number: event.paywall_number ?? 1,
        trigger_source: event.trigger_source,
        has_trial: event.has_trial,
        trial_days: event.trial_days,
      },
    });
  }

  async trackPurchaseComplete(event: PurchaseAnalyticsEvent): Promise<void> {
    // 1. Custom event — funnel analizi için
    await this.trackEvent({
      name: "purchase_complete",
      parameters: {
        product_id: event.product_id,
        price: event.price,
        paywall_number: event.paywall_number ?? 1,
        trigger_source: event.trigger_source,
        has_trial: event.has_trial,
        trial_days: event.trial_days,
      },
    });

    // 2. Firebase'in native logPurchase eventi — Revenue dashboard için zorunlu
    if (this.isEnabled && this.initialized && event.price_value && event.currency) {
      try {
        await analytics().logPurchase({
          value: event.price_value,
          currency: event.currency,
          items: [
            {
              item_id: event.product_id,
              item_name: event.product_id,
              price: event.price_value,
            },
          ],
        });
        console.log(`💰 Firebase logPurchase: ${event.price_value} ${event.currency}`);
      } catch (error) {
        console.error("❌ Firebase logPurchase failed:", error);
      }
    }
  }

  async trackTrialStart(event: PurchaseAnalyticsEvent): Promise<void> {
    await this.trackEvent({
      name: "trial_start",
      parameters: {
        product_id: event.product_id,
        trial_days: event.trial_days,
        paywall_number: event.paywall_number ?? 1,
        trigger_source: event.trigger_source,
      },
    });
  }

  async trackPurchaseFailed(
    productId: string,
    error: string,
    paywallNumber?: 1 | 2 | 3
  ): Promise<void> {
    await this.trackEvent({
      name: "purchase_failed",
      parameters: {
        product_id: productId,
        error_message: error,
        paywall_number: paywallNumber ?? 1,
      },
    });
  }

  async trackPurchaseCancelled(
    productId: string,
    paywallNumber?: 1 | 2 | 3
  ): Promise<void> {
    await this.trackEvent({
      name: "purchase_cancelled",
      parameters: {
        product_id: productId,
        paywall_number: paywallNumber ?? 1,
      },
    });
  }

  // Performance events
  async trackPerformance(event: PerformanceEvent): Promise<void> {
    await this.trackEvent({
      name: `performance_${event.event_type}`,
      parameters: {
        duration_ms: event.duration_ms,
        success: event.success,
        error_message: event.error_message,
      },
    });
  }

  async trackAppStart(duration: number): Promise<void> {
    await this.trackPerformance({
      event_type: "app_start",
      duration_ms: duration,
      success: true,
    });
  }

  // Search events
  async trackSearch(searchTerm: string, resultCount: number): Promise<void> {
    await this.trackEvent({
      name: "search",
      parameters: {
        search_term: searchTerm,
        result_count: resultCount,
      },
    });
  }

  // User properties
  async setUserProperty(name: string, value: string): Promise<void> {
    if (!this.isEnabled || !this.initialized) return;

    try {
      await analytics().setUserProperty(name, value);
      console.log(`👤 User Property: ${name} = ${value}`);
    } catch (error) {
      console.error("❌ Failed to set user property:", error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isEnabled || !this.initialized) return;

    try {
      await analytics().setUserId(userId);
      console.log(`🆔 User ID set: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to set user ID:", error);
    }
  }

  // User engagement
  async trackDailyStreak(streak: number): Promise<void> {
    await this.trackEvent({
      name: "daily_streak",
      parameters: {
        streak_count: streak,
        timestamp: Date.now(),
      },
    });
  }

  async trackReadingSession(
    duration: number,
    quotesRead: number
  ): Promise<void> {
    await this.trackEvent({
      name: "reading_session",
      parameters: {
        duration_minutes: Math.round(duration / 60000), // Convert ms to minutes
        quotes_read: quotesRead,
        timestamp: Date.now(),
      },
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
