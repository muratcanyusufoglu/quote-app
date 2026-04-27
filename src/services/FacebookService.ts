import { AppEventsLogger, Settings } from "react-native-fbsdk-next";

export const FacebookService = {
  initialize() {
    Settings.initializeSDK();
    Settings.setAutoLogAppEventsEnabled(true);

    Settings.getAppID().then((appID) => {
      if (appID) {
        console.log("✅ Facebook SDK initialized. App ID:", appID);
      } else {
        console.warn("❌ Facebook SDK: App ID bulunamadı. app.json kontrol et.");
      }
    }).catch((e) => {
      console.error("❌ Facebook SDK init error:", e);
    });
  },

  setAdvertisingTracking(enabled: boolean) {
    Settings.setAdvertiserTrackingEnabled(enabled);
  },

  // Onboarding tamamlandığında
  logOnboardingComplete(userName?: string) {
    AppEventsLogger.logEvent("fb_mobile_complete_registration", {
      registration_method: "onboarding",
      user_name: userName || "unknown",
    });
  },

  // Kullanıcı ödeme yaptığında
  logPurchase(amount: number, currency: string = "USD", planType?: string) {
    AppEventsLogger.logPurchase(amount, currency, {
      plan_type: planType || "unknown",
    });
  },

  // Trial başladığında
  logTrialStarted(planType?: string) {
    AppEventsLogger.logEvent("StartTrial", {
      plan_type: planType || "annual",
    });
  },

  // Paywall görüntülendiğinde
  logPaywallViewed(source?: string) {
    AppEventsLogger.logEvent("fb_mobile_initiated_checkout", {
      source: source || "unknown",
    });
  },

  // Alıntı görüntülendiğinde
  logQuoteViewed(quoteId: string, category?: string) {
    AppEventsLogger.logEvent("ViewContent", {
      content_id: quoteId,
      content_type: "quote",
      content_category: category || "general",
    });
  },

  // Alıntı favorilere eklendiğinde
  logQuoteFavorited(quoteId: string) {
    AppEventsLogger.logEvent("AddToWishlist", {
      content_id: quoteId,
      content_type: "quote",
    });
  },

  // Alıntı paylaşıldığında
  logQuoteShared(quoteId: string) {
    AppEventsLogger.logEvent("fb_mobile_share", {
      content_id: quoteId,
      content_type: "quote",
    });
  },

  // Uygulama aktif olduğunda (AppState change)
  logAppActivated() {
    AppEventsLogger.logEvent("fb_mobile_activate_app");
  },
};
