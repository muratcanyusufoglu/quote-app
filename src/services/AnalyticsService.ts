import analytics from "@react-native-firebase/analytics";
import { Platform } from "react-native";

import {
  AnalyticsEvent,
  CategoryEvent,
  OnboardingEvent,
  PaywallEvent,
  PerformanceEvent,
  QuoteEvent,
  ScreenViewEvent,
  ShareEvent,
  UserActionEvent,
} from "../types";

class AnalyticsService {
  private isEnabled: boolean = true;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
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
    }
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
        step: event.step,
      },
    });
  }

  async trackPaywallAction(event: PaywallEvent): Promise<void> {
    await this.trackEvent({
      name: "paywall_action",
      parameters: {
        trigger_source: event.trigger_source,
        user_action: event.user_action,
        step: event.step,
      },
    });
  }

  // Purchase events
  async trackPurchaseStart(productId: string): Promise<void> {
    await this.trackEvent({
      name: "purchase_start",
      parameters: {
        product_id: productId,
        timestamp: Date.now(),
      },
    });
  }

  async trackPurchaseComplete(productId: string, price: string): Promise<void> {
    await this.trackEvent({
      name: "purchase_complete",
      parameters: {
        product_id: productId,
        price: price,
        timestamp: Date.now(),
      },
    });
  }

  async trackPurchaseFailed(productId: string, error: string): Promise<void> {
    await this.trackEvent({
      name: "purchase_failed",
      parameters: {
        product_id: productId,
        error_message: error,
        timestamp: Date.now(),
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
