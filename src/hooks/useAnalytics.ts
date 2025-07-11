import { useCallback, useEffect } from "react";
import analyticsService from "../services/AnalyticsService";
import {
  CategoryEvent,
  OnboardingEvent,
  PaywallEvent,
  PerformanceEvent,
  QuoteEvent,
  ShareEvent,
  UserActionEvent,
} from "../types";

export const useAnalytics = () => {
  // Initialize analytics on hook mount
  useEffect(() => {
    analyticsService.initialize();
  }, []);

  // Screen tracking
  const trackScreen = useCallback(
    (screenName: string, screenClass?: string) => {
      analyticsService.trackScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });
    },
    []
  );

  // Quote events
  const trackQuoteView = useCallback((quote: QuoteEvent) => {
    analyticsService.trackQuoteView(quote);
  }, []);

  const trackQuoteFavorite = useCallback(
    (quote: QuoteEvent, action: "add" | "remove") => {
      analyticsService.trackQuoteFavorite(quote, action);
    },
    []
  );

  const trackQuoteShare = useCallback((shareEvent: ShareEvent) => {
    analyticsService.trackQuoteShare(shareEvent);
  }, []);

  // Category events
  const trackCategoryView = useCallback((category: CategoryEvent) => {
    analyticsService.trackCategoryView(category);
  }, []);

  const trackCategoryFilter = useCallback((category: CategoryEvent) => {
    analyticsService.trackCategoryFilter(category);
  }, []);

  // User actions
  const trackUserAction = useCallback((action: UserActionEvent) => {
    analyticsService.trackUserAction(action);
  }, []);

  const trackThemeChange = useCallback((oldTheme: string, newTheme: string) => {
    analyticsService.trackThemeChange(oldTheme, newTheme);
  }, []);

  const trackLanguageChange = useCallback(
    (oldLang: string, newLang: string) => {
      analyticsService.trackLanguageChange(oldLang, newLang);
    },
    []
  );

  // Onboarding
  const trackOnboardingStart = useCallback(() => {
    analyticsService.trackOnboardingStart();
  }, []);

  const trackOnboardingStep = useCallback((event: OnboardingEvent) => {
    analyticsService.trackOnboardingStep(event);
  }, []);

  const trackOnboardingComplete = useCallback((preferences: string[]) => {
    analyticsService.trackOnboardingComplete(preferences);
  }, []);

  // Paywall
  const trackPaywallView = useCallback((event: PaywallEvent) => {
    analyticsService.trackPaywallView(event);
  }, []);

  const trackPaywallAction = useCallback((event: PaywallEvent) => {
    analyticsService.trackPaywallAction(event);
  }, []);

  // Purchase
  const trackPurchaseStart = useCallback((productId: string) => {
    analyticsService.trackPurchaseStart(productId);
  }, []);

  const trackPurchaseComplete = useCallback(
    (productId: string, price: string) => {
      analyticsService.trackPurchaseComplete(productId, price);
    },
    []
  );

  const trackPurchaseFailed = useCallback(
    (productId: string, error: string) => {
      analyticsService.trackPurchaseFailed(productId, error);
    },
    []
  );

  // Performance
  const trackPerformance = useCallback((event: PerformanceEvent) => {
    analyticsService.trackPerformance(event);
  }, []);

  const trackAppStart = useCallback((duration: number) => {
    analyticsService.trackAppStart(duration);
  }, []);

  // Search
  const trackSearch = useCallback((searchTerm: string, resultCount: number) => {
    analyticsService.trackSearch(searchTerm, resultCount);
  }, []);

  // User properties
  const setUserProperty = useCallback((name: string, value: string) => {
    analyticsService.setUserProperty(name, value);
  }, []);

  const setUserId = useCallback((userId: string) => {
    analyticsService.setUserId(userId);
  }, []);

  // Engagement
  const trackDailyStreak = useCallback((streak: number) => {
    analyticsService.trackDailyStreak(streak);
  }, []);

  const trackReadingSession = useCallback(
    (duration: number, quotesRead: number) => {
      analyticsService.trackReadingSession(duration, quotesRead);
    },
    []
  );

  // Settings
  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    analyticsService.setEnabled(enabled);
  }, []);

  // Custom event tracking
  const trackCustomEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      analyticsService.trackEvent({
        name: eventName,
        parameters,
      });
    },
    []
  );

  return {
    // Screen tracking
    trackScreen,

    // Quote events
    trackQuoteView,
    trackQuoteFavorite,
    trackQuoteShare,

    // Category events
    trackCategoryView,
    trackCategoryFilter,

    // User actions
    trackUserAction,
    trackThemeChange,
    trackLanguageChange,

    // Onboarding
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,

    // Paywall
    trackPaywallView,
    trackPaywallAction,

    // Purchase
    trackPurchaseStart,
    trackPurchaseComplete,
    trackPurchaseFailed,

    // Performance
    trackPerformance,
    trackAppStart,

    // Search
    trackSearch,

    // User properties
    setUserProperty,
    setUserId,

    // Engagement
    trackDailyStreak,
    trackReadingSession,

    // Settings
    setAnalyticsEnabled,

    // Custom events
    trackCustomEvent,
  };
};

export default useAnalytics;
