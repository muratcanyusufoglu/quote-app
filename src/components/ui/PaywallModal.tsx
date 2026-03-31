import {LinearGradient} from "expo-linear-gradient";
import React, {useEffect, useRef, useState} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {usePremium} from "../../hooks/usePremium";
import {useStoreReview} from "../../hooks/useStoreReview";
import {
  useCommonTranslations,
  usePaywallTranslations,
} from "../../hooks/useTranslation";
import {NotificationService} from "../../services/NotificationService";
import {
  getPaywallService,
  SubscriptionPackage,
} from "../../services/PaywallService";
import {useOnboardingSelectors} from "../../store/useOnboardingStore";
import {usePaywallSelectors} from "../../store/usePaywallStore";
import {getPreferredLanguage} from "../../utils/language";
import {useTheme} from "../../utils/ThemeContext";

const {width: screenWidth, height: screenHeight} = Dimensions.get("window");

// Debug Panel Component
const DebugPanel: React.FC<{
  theme: any;
  isVisible: boolean;
  triggerSource: string | null;
  subscriptionPackage: SubscriptionPackage | null;
  isLoading: boolean;
}> = ({theme, isVisible, triggerSource, subscriptionPackage, isLoading}) => {
  if (!__DEV__) return null;

  // Use translations
  const paywall = usePaywallTranslations();

  return (
    <View
      style={[
        debugStyles.debugContainer,
        {backgroundColor: theme.colors.surface},
      ]}
    >
      <Text style={[debugStyles.debugTitle, {color: theme.colors.text}]}>
        {paywall.debug.title}
      </Text>
      <View style={debugStyles.debugContent}>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              {color: theme.colors.textSecondary},
            ]}
          >
            {paywall.debug.modal_visible}
          </Text>
          <Text style={[debugStyles.debugValue, {color: theme.colors.text}]}>
            {isVisible.toString()}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              {color: theme.colors.textSecondary},
            ]}
          >
            {paywall.debug.trigger_source}
          </Text>
          <Text style={[debugStyles.debugValue, {color: theme.colors.text}]}>
            {triggerSource || paywall.debug.none}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              {color: theme.colors.textSecondary},
            ]}
          >
            {paywall.debug.loading_state}
          </Text>
          <Text style={[debugStyles.debugValue, {color: theme.colors.text}]}>
            {isLoading.toString()}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              {color: theme.colors.textSecondary},
            ]}
          >
            {paywall.debug.platform}
          </Text>
          <Text style={[debugStyles.debugValue, {color: theme.colors.text}]}>
            {Platform.OS}
          </Text>
        </View>
        {subscriptionPackage && (
          <>
            <View style={debugStyles.debugDivider} />
            <Text
              style={[debugStyles.debugSubtitle, {color: theme.colors.text}]}
            >
              {paywall.debug.subscription_package}
            </Text>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  {color: theme.colors.textSecondary},
                ]}
              >
                {paywall.debug.id}
              </Text>
              <Text
                style={[debugStyles.debugValue, {color: theme.colors.text}]}
              >
                {subscriptionPackage.id}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  {color: theme.colors.textSecondary},
                ]}
              >
                {paywall.debug.title_field}
              </Text>
              <Text
                style={[debugStyles.debugValue, {color: theme.colors.text}]}
              >
                {subscriptionPackage.title}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  {color: theme.colors.textSecondary},
                ]}
              >
                {paywall.debug.current_price}
              </Text>
              <Text
                style={[debugStyles.debugValue, {color: theme.colors.text}]}
              >
                {subscriptionPackage.currentPrice}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  {color: theme.colors.textSecondary},
                ]}
              >
                {paywall.debug.trial_days}
              </Text>
              <Text
                style={[debugStyles.debugValue, {color: theme.colors.text}]}
              >
                {subscriptionPackage.freeTrialDays}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const debugStyles = StyleSheet.create({
  debugContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  debugSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  debugContent: {
    gap: 8,
  },
  debugRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  debugValue: {
    fontSize: 14,
    fontWeight: "400",
  },
  debugDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 8,
  },
});

interface PaywallModalProps {
  onClose?: () => void;
  onPurchase?: () => void;
}

// Removed legacy components that are not used in the new full-screen design

// Main PaywallModal Component
export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  onPurchase,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const isVisible = usePaywallSelectors.isVisible();
  const triggerSource = usePaywallSelectors.triggerSource();
  const isFirstTimePaywall = usePaywallSelectors.isFirstTimePaywall();
  const isDiscountedPaywall = usePaywallSelectors.isDiscountedPaywall();
  const isSecondDiscountPaywall = usePaywallSelectors.isSecondDiscountPaywall();
  const [shouldShowDiscounted, setShouldShowDiscounted] = useState(false);
  const {hidePaywall, showPaywall} = usePaywallSelectors.actions();

  // Paywall #1: multi-plan selector state
  const [firstTimePackages, setFirstTimePackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0); // 0 = Annual (default)

  // UNIFIED: Use unified premium system
  const {
    isPremium,
    isLoading: isPremiumLoading,
    ensureFreshPremiumStatus,
    forceRefreshPremiumStatus,
  } = usePremium();

  // Store review for post-purchase requests
  const storeReview = useStoreReview();

  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPackage, setSubscriptionPackage] =
    useState<SubscriptionPackage | null>(null);
  const [allPackages, setAllPackages] = useState<SubscriptionPackage[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Translations
  const paywall = usePaywallTranslations();
  const common = useCommonTranslations();
  
  // Get user preferences for language
  const userPreferences = useOnboardingSelectors.userPreferences();

  console.log("💰 Modern PaywallModal render:", {
    isVisible,
    triggerSource,
    isLoading,
    isPremium,
    isDiscountedPaywall,
    subscriptionPackageId: subscriptionPackage?.id,
  });

  // Premium kontrol - eğer kullanıcı premium ise modal'ı otomatik kapat
  useEffect(() => {
    if (isVisible && isPremium) {
      console.log("✅ User is premium, hiding paywall automatically");
      hidePaywall();
      return;
    }
  }, [isVisible, isPremium, hidePaywall]);

  // Enhanced entrance animation
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      slideAnim.setValue(screenHeight);
      backdropAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [isVisible]);

  // Check if we should show discounted paywall by default
  useEffect(() => {
    const checkDiscountStatus = async () => {
      if (isVisible) {
        const paywallService = getPaywallService();
        const shouldShow = await paywallService.shouldShowDiscountedByDefault();
        setShouldShowDiscounted(shouldShow);
        console.log("🔍 Should show discounted by default:", shouldShow);
      }
    };
    checkDiscountStatus();
  }, [isVisible]);

  // Load subscription packages when modal becomes visible OR triggerSource changes
  useEffect(() => {
    if (isVisible) {
      console.log(
        "🔄 Modal visible or triggerSource changed, loading packages..."
      );
      loadSubscriptionPackages();
    }
  }, [isVisible, triggerSource]);

  // Calculate discount percentage when packages change
  useEffect(() => {
    if (
      allPackages.length >= 2 &&
      (isDiscountedPaywall || shouldShowDiscounted)
    ) {
      calculateDiscountPercentage();
    }
  }, [allPackages, isDiscountedPaywall, shouldShowDiscounted]);

  const calculateDiscountPercentage = () => {
    if (allPackages.length < 2) return;

    const regularPackage = allPackages[0];
    const discountedPackage = allPackages[1];

    const regularPrice =
      regularPackage.priceNumber ||
      parseFloat(regularPackage.currentPrice.replace(/[^0-9.]/g, ""));
    const discountedPrice =
      discountedPackage.priceNumber ||
      parseFloat(discountedPackage.currentPrice.replace(/[^0-9.]/g, ""));

    if (regularPrice > discountedPrice) {
      const discount = Math.round(
        ((regularPrice - discountedPrice) / regularPrice) * 100
      );
      setDiscountPercentage(discount);
      console.log(
        `💰 Calculated discount: ${discount}% (${regularPrice} -> ${discountedPrice})`
      );
    }
  };

  const loadSubscriptionPackages = async () => {
    try {
      console.log(`🚀 Loading packages for triggerSource: ${triggerSource}`);
      const paywallService = getPaywallService();

      if (triggerSource === "first_time") {
        // Paywall #1 — 3 plan seçeneği: Annual, Monthly, Weekly
        const packages = await paywallService.getFirstPaywallPackages();
        console.log(`📦 First paywall packages loaded: ${packages.length}`);

        if (packages.length === 0) {
          console.warn("⚠️ No first-paywall packages found");
          return;
        }

        setFirstTimePackages(packages);
        setSelectedPlanIndex(0); // Annual default (index 0)
        setSubscriptionPackage(packages[0]); // Annual seçili başlat
        setAllPackages(packages);

      } else if (triggerSource === "discounted") {
        // Paywall #2 — $29.99 sale paketi
        const pkg = await paywallService.getSalePackage();
        console.log(`📦 Sale package loaded: ${pkg?.id}`);

        if (!pkg) {
          // Fallback: ilk paketi kullan
          const all = await paywallService.getAllSubscriptionPackages();
          const fallback = all[0];
          if (fallback) setSubscriptionPackage(fallback);
          setAllPackages(all);
          return;
        }

        setSubscriptionPackage(pkg);
        setAllPackages([pkg]);

        // Discount % hesapla (orijinal annual ile karşılaştır)
        const all = await paywallService.getAllSubscriptionPackages();
        const annualPkg = all.find((p) => p.id === "aurora_premium_annual");
        if (annualPkg && annualPkg.priceNumber && pkg.priceNumber) {
          const discount = Math.round(
            ((annualPkg.priceNumber - pkg.priceNumber) / annualPkg.priceNumber) * 100
          );
          setDiscountPercentage(discount);
        }

      } else if (triggerSource === "second_discount") {
        // Paywall #3 — $19.99 final paketi
        const pkg = await paywallService.getFinalPackage();
        console.log(`📦 Final package loaded: ${pkg?.id}`);

        if (!pkg) {
          const all = await paywallService.getAllSubscriptionPackages();
          const fallback = all[0];
          if (fallback) setSubscriptionPackage(fallback);
          setAllPackages(all);
          return;
        }

        setSubscriptionPackage(pkg);
        setAllPackages([pkg]);

        // Discount % hesapla
        const all = await paywallService.getAllSubscriptionPackages();
        const annualPkg = all.find((p) => p.id === "aurora_premium_annual");
        if (annualPkg && annualPkg.priceNumber && pkg.priceNumber) {
          const discount = Math.round(
            ((annualPkg.priceNumber - pkg.priceNumber) / annualPkg.priceNumber) * 100
          );
          setDiscountPercentage(discount);
        }

      } else {
        // Diğer trigger'lar (action_limit, premium_category vb.) — eski mantık
        const packages = await paywallService.getAllSubscriptionPackages();
        if (packages.length === 0) return;

        const shouldShowDisc =
          (isDiscountedPaywall || shouldShowDiscounted) && packages.length > 1;

        if (shouldShowDisc) {
          const discountedPackage = packages[1];
          setSubscriptionPackage(discountedPackage);
        } else {
          setSubscriptionPackage(packages[0]);
        }
        setAllPackages(packages);
      }

    } catch (error) {
      console.error("Failed to load subscription packages:", error);
      Alert.alert(paywall.alerts.error, paywall.failedToLoadSubscription);
    }
  };

  // Responsive design için ekran boyutuna göre değerler
  const isVerySmallScreen = screenHeight < 650; // iPhone SE gibi çok küçük ekranlar
  const isSmallScreen = screenHeight < 700;
  const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

  const styles = createStyles(theme, isVerySmallScreen);

  // Content based on trigger source
  const getContent = () => {
    switch (triggerSource) {
      case "welcome":
        return {
          title: paywall.welcome.title,
          subtitle: paywall.welcome.subtitle,
          features: [
            paywall.features.unlimited_daily_quotes,
            paywall.features.access_premium_categories,
            paywall.features.inspiring_stories,
            paywall.features.advanced_personalization,
            paywall.features.exclusive_motivational,
            paywall.features.ad_free,
            paywall.features.offline_reading,
            paywall.features.weekly_insights,
          ],
          cta: paywall.startFreeTrial,
          highlight: paywall.pricing.trial_days,
        };

      case "premium_category":
        return {
          title: paywall.premiumCategory.title,
          subtitle: paywall.premiumCategory.subtitle,
          features: [
            paywall.features.leadership_success,
            paywall.features.mindfulness_spirituality,
            paywall.features.advanced_development,
            paywall.features.exclusive_authors,
            paywall.features.deep_dive_stories,
            paywall.features.personalized_recommendations,
            paywall.features.priority_updates,
            paywall.features.expert_collections,
          ],
          cta: paywall.getPremiumAccess,
          highlight: paywall.pricing.join_members,
        };

      case "story_limit":
        return {
          title: paywall.storyLimit.title,
          subtitle: paywall.storyLimit.subtitle,
          features: [
            paywall.features.unlimited_story_access,
            paywall.features.historical_contexts,
            paywall.features.author_biographies,
            paywall.features.motivational_backgrounds,
            paywall.features.lesson_summaries,
            paywall.features.shareable_insights,
            paywall.features.offline_library,
            paywall.features.weekly_collections,
          ],
          cta: paywall.unlockStories,
          highlight: paywall.pricing.stories_included,
        };

      case "action_limit":
        return {
          title: paywall.actionLimit.title,
          subtitle: paywall.actionLimit.subtitle,
          features: [
            paywall.features.unlimited_interactions,
            paywall.features.no_restrictions,
            paywall.features.full_functionality,
            paywall.features.premium_collections,
            paywall.features.advanced_sharing,
            paywall.features.personalized_insights,
            paywall.features.progress_tracking,
            paywall.features.unlimited_favorites,
          ],
          cta: paywall.removeLimits,
          highlight: paywall.pricing.unlimited_life,
        };

      case "daily_limit":
        return {
          title:
            (paywall as any).daily_limit?.title ||
            paywall.dailyLimitFallbackTitle,
          subtitle:
            (paywall as any).daily_limit?.subtitle ||
            paywall.dailyLimitFallbackSubtitle,
          features: [
            paywall.features.unlimited_daily_quotes,
            paywall.features.access_premium_categories,
            paywall.features.inspiring_stories,
            paywall.features.advanced_personalization,
            paywall.features.exclusive_motivational,
            paywall.features.ad_free,
            paywall.features.offline_reading,
            paywall.features.weekly_insights,
          ],
          cta:
            (paywall as any).daily_limit?.button ||
            paywall.dailyLimitFallbackButton,
          highlight:
            (paywall as any).daily_limit?.highlight ||
            paywall.dailyLimitFallbackHighlight,
        };

      case "real_purchase":
        return {
          title: paywall.realPurchase.title,
          subtitle: paywall.realPurchase.subtitle,
          features: [
            paywall.features.hand_picked_quotes,
            paywall.features.exclusive_stories,
            paywall.features.ai_personalization,
            paywall.features.daily_challenges,
            paywall.features.growth_tracking,
            paywall.features.premium_authors,
            paywall.features.distraction_free,
            paywall.features.live_sessions,
          ],
          cta: paywall.realPurchase.button,
          highlight: paywall.realPurchase.highlight,
          testimonials: Array.isArray(paywall.testimonials)
            ? paywall.testimonials
            : [],
        };

      default:
        return {
          title: paywall.default.title,
          subtitle: paywall.default.subtitle,
          features: [
            paywall.features.quotes_stories,
            paywall.features.all_premium_categories,
            paywall.features.personalized_experience,
            paywall.features.ad_free_reading,
            paywall.features.offline_access,
            paywall.features.progress_tracking,
            paywall.features.priority_support,
            paywall.features.exclusive_content,
          ],
          cta: paywall.getPremium,
          highlight: paywall.pricing.best_value,
        };
    }
  };

  const content = getContent();

  const handleClose = async () => {
    // 🔍 DEBUG: Kapatma mantığını logla
    console.log("🔍 CLOSE DEBUG:", {
      isDiscountedPaywall,
      isSecondDiscountPaywall,
      isFirstTimePaywall,
      triggerSource,
      currentPackage: subscriptionPackage?.id,
    });

    const isFirstTime = triggerSource === "first_time" || isFirstTimePaywall;
    const isAnyDiscount = isDiscountedPaywall || isSecondDiscountPaywall || shouldShowDiscounted;

    // İlk teklif reddedildi olarak işaretle (sadece Paywall #1 için)
    if (!isAnyDiscount) {
      try {
        const paywallService = getPaywallService();
        await paywallService.markFirstOfferRejected();
        console.log("✅ İlk teklif reddedildi olarak işaretlendi");
      } catch (error) {
        console.warn("⚠️ İlk teklif işaretlenirken hata:", error);
      }
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hidePaywall();
      onClose?.();

      // Paywall #1 kapandı → hemen Paywall #2 göster (0.8sn)
      if (isFirstTime) {
        console.log("💸 Paywall #1 kapandı → Paywall #2 gösteriliyor...");
        setTimeout(() => {
          showPaywall("discounted");
        }, 800);
      }
      // Paywall #2 kapandı → HomeScreen'deki swipe tracker devreye girer → Paywall #3
      // Paywall #3 kapandı → hasSeenSecondDiscountPaywall=true, bir daha gösterilmez
    });
  };

  const handlePurchase = async () => {
    // Paywall #1 için seçili planı kullan, diğerleri için mevcut subscriptionPackage
    const packageToPurchase =
      triggerSource === "first_time" && firstTimePackages.length > 0
        ? firstTimePackages[selectedPlanIndex] ?? subscriptionPackage
        : subscriptionPackage;

    if (!packageToPurchase) {
      Alert.alert(paywall.alerts.error, paywall.alerts.no_subscription);
      return;
    }

    setIsLoading(true);

    try {
      // ✅ STEP 1: Perform actual purchase via PaywallService
      console.log("💰 Starting purchase process...", packageToPurchase.id);
      const paywallService = getPaywallService();
      const purchaseResult = await paywallService.purchaseSubscription(
        packageToPurchase.id
      );

      if (purchaseResult.success) {
        console.log("✅ Purchase successful, verifying premium status...");

        try {
          // ✅ STEP 2: Force refresh premium status (ignore cache) from unified system
          const actualIsPremium = await forceRefreshPremiumStatus();
          console.log(
            "✅ Actual premium status (force refreshed):",
            actualIsPremium
          );

          // Only hide paywall if user is actually premium
          if (actualIsPremium) {
            // ✅ STEP 3: Trigger onPurchase callback immediately for app-wide updates
            onPurchase?.();

            // ✅ STEP 3.5: Schedule trial reminder notification if free trial exists
            if (packageToPurchase?.freeTrialDays && packageToPurchase.freeTrialDays > 0) {
              try {
                const language = getPreferredLanguage(
                  userPreferences?.language as any
                );
                const trialStartDate = new Date();
                const notificationServiceInstance = NotificationService.getInstance();
                await notificationServiceInstance.scheduleTrialReminder(
                  trialStartDate,
                  packageToPurchase.freeTrialDays,
                  language
                );
                console.log(
                  `📅 Trial reminder scheduled for ${packageToPurchase.freeTrialDays} days trial`
                );
              } catch (error) {
                console.error("❌ Failed to schedule trial reminder:", error);
                // Don't block purchase flow if reminder scheduling fails
              }
            }

            // ✅ STEP 3.6: Check if we should request store review (Premium users only)
            setTimeout(async () => {
              try {
                if (await storeReview.shouldRequestReview()) {
                  console.log(
                    "📱 PaywallModal: Requesting store review after purchase"
                  );
                  await storeReview.requestReview();
                }
              } catch (error) {
                console.error(
                  "❌ PaywallModal: Error with store review:",
                  error
                );
              }
            }, 1000); // 1 second delay to let success animation complete

            // ✅ STEP 4: Small delay to allow components to re-render with new premium status
            setTimeout(() => {
              hidePaywall();
              console.log(
                "🎉 PaywallModal hidden after premium status propagated"
              );
            }, 150);

            // ✅ STEP 5: Show success message after modal is hidden
            setTimeout(() => {
              Alert.alert(
                paywall.alerts.purchase_successful,
                paywall.alerts.welcome_premium,
                [
                  {
                    text: paywall.alerts.get_started,
                    onPress: () => {
                      // Modal is already hidden, premium features are now accessible
                    },
                  },
                ]
              );
            }, 300);
          } else {
            // Something went wrong, user is not premium according to verification
            console.error(
              "⚠️ Purchase successful but user is not premium after verification"
            );
            Alert.alert(
              paywall.purchaseVerification,
              paywall.purchaseVerificationMessage,
              [{text: common.ok}]
            );
          }
        } catch (error) {
          console.error(
            "❌ Failed to verify premium status after purchase:",
            error
          );
          Alert.alert(
            paywall.verificationError,
            paywall.verificationErrorMessage,
            [{text: common.ok}]
          );
        }
      } else if (purchaseResult.userCancelled) {
        console.log("❌ Purchase cancelled by user");
        // User cancelled, no need to show error
      } else {
        console.error("❌ Purchase failed:", purchaseResult.error);
        Alert.alert(
          paywall.alerts.purchase_error,
          purchaseResult.error || paywall.alerts.unexpected_error,
          [{text: common.ok}]
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(
        paywall.alerts.purchase_error,
        paywall.alerts.unexpected_error,
        [{text: common.ok}]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);

    try {
      const paywallService = getPaywallService();
      const result = await paywallService.restorePurchases();

      if (result.success) {
        console.log("✅ Purchases restored, verifying premium status...");

        try {
          // ✅ Use unified premium verification from usePremium hook (force refresh)
          const actualIsPremium = await forceRefreshPremiumStatus();
          console.log(
            "✅ Actual premium status after restore (force refreshed):",
            actualIsPremium
          );

          // Only hide paywall if user is actually premium
          if (actualIsPremium) {
            // ✅ Trigger onPurchase callback immediately for app-wide updates
            onPurchase?.();

            // ✅ Small delay to allow components to re-render with new premium status
            setTimeout(() => {
              hidePaywall();
              console.log(
                "🎉 PaywallModal hidden after restore and premium status propagated"
              );
            }, 150);

            setTimeout(() => {
              Alert.alert(
                paywall.alerts.purchases_restored,
                paywall.alerts.restored_successfully,
                [
                  {
                    text: paywall.alerts.continue,
                    onPress: () => {
                      // Modal is already hidden, premium features are now accessible
                    },
                  },
                ]
              );
            }, 300);
          } else {
            // No active subscription found
            Alert.alert(
              paywall.alerts.no_purchases,
              paywall.alerts.no_purchases_message,
              [{text: common.ok}]
            );
          }
        } catch (error) {
          console.error(
            "❌ Failed to verify premium status after restore:",
            error
          );
          Alert.alert(
            paywall.verificationError,
            paywall.restoreVerificationError,
            [{text: common.ok}]
          );
        }
      } else {
        Alert.alert(
          paywall.alerts.no_purchases,
          paywall.alerts.no_purchases_message,
          [{text: common.ok}]
        );
      }
    } catch (error) {
      console.error("Restore purchases error:", error);
      Alert.alert(
        paywall.alerts.restore_error,
        paywall.alerts.restore_error_message,
        [{text: common.ok}]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Critical: Do not render modal for premium users
  if (isPremium) {
    console.log("🚫 Premium user detected, not rendering paywall modal");
    return null;
  }

  if (!isVisible) return null;

  // Calculate trial dates
  const getTrialDates = () => {
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 2); // 2 days from today (day before trial ends)
    const membershipDate = new Date(today);
    membershipDate.setDate(today.getDate() + 3); // 3 days from today (trial ends)

    const formatDate = (date: Date) => {
      // Use translated month abbreviations so all languages can customize labels
      const monthsShort = [
        paywall.modern.month_short_jan || "Jan",
        paywall.modern.month_short_feb || "Feb",
        paywall.modern.month_short_mar || "Mar",
        paywall.modern.month_short_apr || "Apr",
        paywall.modern.month_short_may || "May",
        paywall.modern.month_short_jun || "Jun",
        paywall.modern.month_short_jul || "Jul",
        paywall.modern.month_short_aug || "Aug",
        paywall.modern.month_short_sep || "Sep",
        paywall.modern.month_short_oct || "Oct",
        paywall.modern.month_short_nov || "Nov",
        paywall.modern.month_short_dec || "Dec",
      ];

      const monthIndex = date.getMonth();
      const monthLabel = monthsShort[monthIndex] || "";
      const day = date.getDate();

      return `${monthLabel} ${day}`;
    };

    return {
      today: formatDate(today),
      reminderDate: formatDate(reminderDate),
      membershipDate: formatDate(membershipDate),
    };
  };

  const trialDates = getTrialDates();

  // Seçili planın annual olup olmadığını belirle (timeline + CTA için)
  const selectedPlan = firstTimePackages[selectedPlanIndex];
  const selectedPlanIsAnnual =
    selectedPlan?.packageType === "ANNUAL" ||
    selectedPlan?.id === "aurora_premium_annual";
  const selectedPlanIsMonthly =
    selectedPlan?.packageType === "MONTHLY" ||
    selectedPlan?.id === "$rc_monthly";

  // CTA buton metni — seçili plana göre dinamik
  const getCtaText = () => {
    if (isLoading) return paywall.processing;
    if (triggerSource === "first_time") {
      if (selectedPlanIsAnnual) return "Start your free 3-day trial →";
      if (selectedPlanIsMonthly) return "Get Monthly Access →";
      return "Get Weekly Access →";
    }
    if (isDiscountedPaywall || isSecondDiscountPaywall)
      return "Claim This Offer →";
    return paywall.modern.start_trial_button_full || "Start your free 3-day trial →";
  };

  // Calculate weekly and daily prices
  const calculatePricing = () => {
    if (!subscriptionPackage) return { weekly: "0", daily: "0" };

    const priceNum = subscriptionPackage.priceNumber || 0;
    const period = subscriptionPackage.period || "year";

    let weeklyPrice = 0;
    let dailyPrice = 0;

    if (period === "year") {
      weeklyPrice = priceNum / 52;
      dailyPrice = priceNum / 365;
    } else if (period === "month") {
      weeklyPrice = priceNum / 4.33;
      dailyPrice = priceNum / 30;
    } else if (period === "week") {
      weeklyPrice = priceNum;
      dailyPrice = priceNum / 7;
    }

    const currency = subscriptionPackage.currencyCode || "USD";
    const currencySymbol =
      currency === "USD"
        ? "$"
        : currency === "EUR"
        ? "€"
        : currency === "GBP"
        ? "£"
        : currency === "TRY"
        ? "₺"
        : "$";

    return {
      weekly: `${currencySymbol}${weeklyPrice.toFixed(2)}`,
      daily: `${currencySymbol}${dailyPrice.toFixed(2)}`,
      period: subscriptionPackage.currentPrice,
    };
  };

  const pricing = calculatePricing();

  // Render modal paywall with new design
  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <IconSymbol
            name="xmark"
            size={20}
            color={theme.colors.border}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            {/* Discount Badge for Discounted Paywalls (#2 and #3) */}
            {(isDiscountedPaywall || isSecondDiscountPaywall || shouldShowDiscounted) &&
              discountPercentage > 0 && (
                <View style={styles.discountBadgeContainer}>
                  <LinearGradient
                    colors={[theme.colors.error, theme.colors.premium]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.discountBadge}
                  >
                    <Text style={styles.discountBadgeText}>
                      🔥{" "}
                      {paywall.modern.discount_percentage.replace(
                        "{percentage}",
                        discountPercentage.toString()
                      )}
                    </Text>
                  </LinearGradient>
                </View>
              )}

            {/* Title */}
            <Text style={[styles.mainTitle, {color: theme.colors.text}]}>
              {isSecondDiscountPaywall
                ? "Last Chance — Final Offer"
                : isDiscountedPaywall || shouldShowDiscounted
                ? paywall.modern.discount_offer_title || "Don't Miss Out!"
                : paywall.modern.trial_title || "Try Aurora Premium"}
            </Text>

            {/* Free Trial Badge */}
          </View>

          {/* Timeline / Info Section — seçili plana göre dinamik */}
          {triggerSource === "first_time" ? (
            selectedPlanIsAnnual ? (
              /* Annual: tam trial timeline */
              <View style={styles.timelineSection}>
                <Text style={[styles.timelineTitle, {color: theme.colors.text}]}>
                  {paywall.modern.timeline_title || "How your free trial works:"}
                </Text>

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconCheck, {backgroundColor: theme.colors.success}]}>
                      <Text style={styles.timelineIconText}>✓</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      {paywall.modern.timeline_today || "Today"} — Free trial starts
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      Experience all premium features free for 3 days
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineConnector} />

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconEnvelope, {backgroundColor: theme.colors.textSecondary}]}>
                      <Text style={styles.timelineIconText}>✉</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      {trialDates.reminderDate} — Get a reminder
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      We'll let you know when your trial is ending
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineConnector} />

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconHeart, {backgroundColor: theme.colors.premium}]}>
                      <Text style={styles.timelineIconText}>♥</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      {trialDates.membershipDate} — Become a member
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      Your trial ends unless canceled. Enjoy!
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Monthly / Weekly: aynı 3 adımlı yapı, farklı içerik */
              <View style={styles.timelineSection}>
                <Text style={[styles.timelineTitle, {color: theme.colors.text}]}>
                  {selectedPlanIsMonthly ? "Your monthly plan includes:" : "Your weekly plan includes:"}
                </Text>

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconCheck, {backgroundColor: theme.colors.success}]}>
                      <Text style={styles.timelineIconText}>✓</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      Today — Access starts immediately
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      Full access to all premium quotes & features
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineConnector} />

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconEnvelope, {backgroundColor: theme.colors.textSecondary}]}>
                      <Text style={styles.timelineIconText}>✉</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      {selectedPlanIsMonthly ? "Billed monthly" : "Billed weekly"}
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      {selectedPlanIsMonthly
                        ? "Renews every month — you're in control"
                        : "Renews every week — you're in control"}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineConnector} />

                <View style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIconHeart, {backgroundColor: theme.colors.premium}]}>
                      <Text style={styles.timelineIconText}>♥</Text>
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                      Cancel anytime
                    </Text>
                    <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                      No long-term commitment. Cancel whenever you like.
                    </Text>
                  </View>
                </View>
              </View>
            )
          ) : (isDiscountedPaywall || isSecondDiscountPaywall || shouldShowDiscounted) ? (
            /* Paywall #2 & #3: Compact benefit list — trial yok, indirim var */
            <View style={styles.compactBenefitSection}>
              <View style={styles.compactBenefitRow}>
                <View style={[styles.compactBenefitIcon, {backgroundColor: theme.colors.success}]}>
                  <Text style={styles.compactBenefitIconText}>✓</Text>
                </View>
                <Text style={[styles.compactBenefitText, {color: theme.colors.text}]}>
                  {discountPercentage > 0
                    ? `Save ${discountPercentage}% — biggest discount available`
                    : "Special limited-time discount"}
                </Text>
              </View>
              <View style={styles.compactBenefitRow}>
                <View style={[styles.compactBenefitIcon, {backgroundColor: theme.colors.premium}]}>
                  <Text style={styles.compactBenefitIconText}>✦</Text>
                </View>
                <Text style={[styles.compactBenefitText, {color: theme.colors.text}]}>
                  Unlimited quotes, themes & all premium features
                </Text>
              </View>
              <View style={styles.compactBenefitRow}>
                <View style={[styles.compactBenefitIcon, {backgroundColor: theme.colors.textSecondary}]}>
                  <Text style={styles.compactBenefitIconText}>♥</Text>
                </View>
                <Text style={[styles.compactBenefitText, {color: theme.colors.text}]}>
                  No commitment — cancel anytime, no questions asked
                </Text>
              </View>
            </View>
          ) : (
            /* Diğer trigger'lar: mevcut tam timeline */
            <View style={styles.timelineSection}>
              <Text style={[styles.timelineTitle, {color: theme.colors.text}]}>
                {paywall.modern.timeline_title || "How your free trial works:"}
              </Text>

              <View style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View style={[styles.timelineIconCheck, {backgroundColor: theme.colors.success}]}>
                    <Text style={styles.timelineIconText}>✓</Text>
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                    {paywall.modern.timeline_today || "Today"} —{" "}
                    {paywall.modern.timeline_trial_starts || "Free trial Starts"}
                  </Text>
                  <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                    {paywall.modern.timeline_trial_description || "Experience all features free for 3 days"}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View style={[styles.timelineIconEnvelope, {backgroundColor: theme.colors.textSecondary}]}>
                    <Text style={styles.timelineIconText}>✉</Text>
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                    {trialDates.reminderDate} —{" "}
                    {paywall.modern.timeline_reminder || "Get a reminder"}
                  </Text>
                  <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                    {paywall.modern.timeline_reminder_description || "We'll let you know when your trial is ending"}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View style={[styles.timelineIconHeart, {backgroundColor: theme.colors.premium}]}>
                    <Text style={styles.timelineIconText}>♥</Text>
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStepTitle, {color: theme.colors.text}]}>
                    {trialDates.membershipDate} —{" "}
                    {paywall.modern.timeline_membership || "Become a member"}
                  </Text>
                  <Text style={[styles.timelineStepDescription, {color: theme.colors.textSecondary}]}>
                    {paywall.modern.timeline_membership_description || "Your trial ends unless canceled. Enjoy!"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            {triggerSource === "first_time" ? (
              /* ── Paywall #1: 3 Plan — Yatay (yan yana) ── */
              <View style={styles.planSelectorContainer}>
                {firstTimePackages.map((pkg, index) => {
                  const isSelected = selectedPlanIndex === index;
                  const isAnnual = pkg.packageType === "ANNUAL" || pkg.id === "aurora_premium_annual";
                  const isMonthly = pkg.packageType === "MONTHLY" || pkg.id === "$rc_monthly";

                  const periodLabel = isAnnual ? "/ year" : isMonthly ? "/ mo" : "/ week";
                  const planName = isAnnual ? "Annual" : isMonthly ? "Monthly" : "Weekly";
                  const subLabel = isAnnual && pkg.freeTrialDays > 0
                    ? `${pkg.freeTrialDays}-day free trial`
                    : isAnnual && pkg.priceNumber
                    ? `$${(pkg.priceNumber / 365).toFixed(2)}/day`
                    : null;

                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.planCard,
                        isSelected
                          ? {borderColor: theme.colors.premium, borderWidth: 2, backgroundColor: theme.colors.premium + "12"}
                          : {borderColor: theme.colors.border, borderWidth: 1},
                      ]}
                      onPress={() => {
                        setSelectedPlanIndex(index);
                        setSubscriptionPackage(pkg);
                      }}
                      activeOpacity={0.8}
                    >
                      {/* BEST VALUE badge — annual üstte ortalanmış */}
                      {isAnnual && (
                        <View style={[styles.popularBadge, {backgroundColor: theme.colors.premium}]}>
                          <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                        </View>
                      )}

                      {/* Plan adı */}
                      <Text style={[
                        styles.planPeriodLabel,
                        {color: isSelected ? theme.colors.premium : theme.colors.text},
                      ]}>
                        {planName}
                      </Text>

                      {/* Fiyat */}
                      <Text style={[
                        styles.planPrice,
                        {color: isSelected ? theme.colors.premium : theme.colors.text},
                      ]}>
                        {pkg.currentPrice}
                      </Text>

                      {/* Periyot */}
                      <Text style={[styles.planPricePeriod, {color: theme.colors.textSecondary}]}>
                        {periodLabel}
                      </Text>

                      {/* Alt bilgi (trial ya da günlük fiyat) */}
                      {subLabel && (
                        <Text style={[styles.planTrialLabel, {
                          color: isAnnual && pkg.freeTrialDays > 0
                            ? theme.colors.success
                            : theme.colors.textSecondary,
                        }]}>
                          {subLabel}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (isDiscountedPaywall || isSecondDiscountPaywall || shouldShowDiscounted) ? (
              /* ── Paywall #2 & #3: İndirimli tek seçenek ── */
              <View style={styles.discountedPricingContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.oldPriceLarge}>$39.99</Text>
                  <View style={styles.discountHighlight}>
                    <Text style={styles.discountHighlightText}>
                      {discountPercentage > 0 ? `${discountPercentage}% OFF` : "SALE"}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceWithPeriod}>
                  <Text style={[styles.newPriceLarge, {color: theme.colors.premium}]}>
                    {subscriptionPackage?.currentPrice || ""}
                  </Text>
                  <Text style={[styles.periodText, {color: theme.colors.textSecondary}]}>
                    / {paywall.modern.year || "Year"}
                  </Text>
                </View>
                <Text style={[styles.pricingText, {color: theme.colors.textSecondary}]}>
                  No commitment — cancel anytime
                </Text>
              </View>
            ) : (
              /* ── Diğer trigger'lar: mevcut tek plan görünümü ── */
              <>
                <View style={styles.priceWithPeriod}>
                  <Text style={[styles.newPriceLarge, {color: theme.colors.premium}]}>
                    {subscriptionPackage?.currentPrice || ""}
                  </Text>
                  <Text style={[styles.periodText, {color: theme.colors.textSecondary}]}>
                    / {paywall.modern.year || "Year"}
                  </Text>
                </View>
                <Text style={[styles.pricingText, {color: theme.colors.textSecondary}]}>
                  {paywall.modern.pricing_trial_text || "3 days free, then"}
                </Text>
                <Text style={[styles.dailyPriceText, {color: theme.colors.success}]}>
                  {paywall.modern.only || "Only"} {pricing.daily} /{" "}
                  {paywall.modern.day || "Day"}
                </Text>
              </>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA Section */}
        <View
          style={[
            styles.bottomSection,
            {paddingBottom: 20 + insets.bottom},
          ]}
        >
          {/* Secured by iTunes */}
          <View style={styles.securedSection}>
            <Text style={styles.securedIcon}>🔒</Text>
            <Text style={[styles.securedText, {color: theme.colors.textSecondary}]}>
              {paywall.modern.secured_by || "Secured by iTunes"}
            </Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.disabledButton]}
            onPress={handlePurchase}
            disabled={isLoading || !subscriptionPackage}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.colors.premium, theme.colors.accent]}
              locations={[0, 1]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaButtonText}>{getCtaText()}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Legal Links */}
          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
            >
              <Text style={[styles.legalText, {color: theme.colors.text}]}>{paywall.termsOfUse}</Text>
            </TouchableOpacity>
            <Text style={[styles.legalSeparator, {color: theme.colors.textSecondary}]}>•</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://quotesparkapp.netlify.app/privacy")
              }
            >
              <Text style={[styles.legalText, {color: theme.colors.text}]}>{paywall.privacyPolicy}</Text>
            </TouchableOpacity>
            <Text style={[styles.legalSeparator, {color: theme.colors.textSecondary}]}>•</Text>
            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={isLoading}
            >
              <Text style={[styles.legalText, {color: theme.colors.text}]}>
                {paywall.modern.restore_purchase || "Restore Purchases"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, isVerySmallScreen: boolean = false) => {
  // Responsive design için ekran boyutuna göre değerler
  const isSmallScreen = screenHeight < 700;
  const isMediumScreen = screenHeight >= 700 && screenHeight < 800;

  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    closeButton: {
      position: "absolute",
      top: isSmallScreen ? 50 : 60,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: isSmallScreen ? 100 : 120,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    headerSection: {
      alignItems: "flex-start",
      marginBottom: 10,
    },
    discountBadgeContainer: {
      width: "100%",
      marginBottom: 16,
    },
    discountBadge: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 24,
      alignSelf: "flex-start",
      shadowColor: theme.colors.premium,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    discountBadgeText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    priceComparisonContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 12,
    },
    oldPriceText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
    newPriceText: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.premium,
    },
    mainTitle: {
      fontSize: isSmallScreen ? 24 : 28,
      fontWeight: "700",
      marginBottom: 12,
      lineHeight: isSmallScreen ? 30 : 34,
    },
    freeTrialBadge: {
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "flex-start",
      borderWidth: 2,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    freeTrialText: {
      color: theme.colors.primaryDark,
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: "700",
    },
    timelineSection: {
      marginBottom: 32,
    },
    timelineTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "600",
      marginBottom: 20,
    },
    timelineStep: {
      flexDirection: "row",
      marginBottom: 16,
    },
    timelineIconContainer: {
      width: 40,
      alignItems: "center",
      marginRight: 16,
    },
    timelineIconCheck: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    timelineIconEnvelope: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    timelineIconHeart: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    timelineIconText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },
    timelineContent: {
      flex: 1,
      paddingTop: 4,
    },
    timelineStepTitle: {
      fontSize: isSmallScreen ? 15 : 17,
      fontWeight: "600",
      marginBottom: 4,
    },
    timelineStepDescription: {
      fontSize: isSmallScreen ? 13 : 15,
      fontWeight: "400",
      lineHeight: 20,
    },
    timelineConnector: {
      width: 2,
      height: 20,
      backgroundColor: theme.colors.border,
      marginLeft: 15,
      marginBottom: 4,
      marginTop: 4,
    },
    pricingSection: {
      alignItems: "center",
      marginBottom: 24,
      width: "100%",
    },
    // ── Plan Selector (Paywall #1) — Yatay 3 kart ──────────────────────────
    planSelectorContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 8,
    },
    planCard: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: "center",
      position: "relative",
      overflow: "visible",
      minHeight: 100,
      justifyContent: "center",
      gap: 3,
    },
    popularBadge: {
      position: "absolute",
      top: -11,
      alignSelf: "center",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
      zIndex: 1,
    },
    popularBadgeText: {
      color: "#000",
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    planCardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    planCardLeft: {
      flex: 1,
      gap: 2,
    },
    planCardRight: {
      flexDirection: "row",
      alignItems: "baseline",
      marginRight: 10,
    },
    planPeriodLabel: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    planTrialLabel: {
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
    },
    planDailyLabel: {
      fontSize: 10,
      textAlign: "center",
    },
    planPrice: {
      fontSize: 15,
      fontWeight: "700",
      textAlign: "center",
    },
    planPricePeriod: {
      fontSize: 10,
      textAlign: "center",
    },
    planRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    planRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#000",
    },
    // ── Compact benefit list (Discounted paywalls #2 & #3) ───────────────
    compactBenefitSection: {
      width: "100%",
      gap: 14,
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    compactBenefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    compactBenefitIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    compactBenefitIconText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    compactBenefitText: {
      flex: 1,
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: "500",
      lineHeight: 20,
    },
    // ── No-trial info (Monthly/Weekly seçilince) ──────────────────────────
    noTrialInfoSection: {
      width: "100%",
      gap: 10,
      paddingVertical: 8,
    },
    noTrialRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    noTrialIcon: {
      fontSize: 16,
      color: "#4CAF50",
      fontWeight: "700",
      width: 20,
      textAlign: "center",
    },
    noTrialText: {
      fontSize: 15,
      fontWeight: "500",
      flex: 1,
    },
    pricingText: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "400",
      marginBottom: 8,
      textAlign: "center",
    },
    dailyPriceText: {
      fontSize: isSmallScreen ? 28 : 32,
      fontWeight: "700",
      textAlign: "center",
    },
    discountedPricingContainer: {
      alignItems: "center",
      width: "100%",
    },
    priceWithPeriod: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      marginBottom: 8,
    },
    periodText: {
      fontSize: isSmallScreen ? 18 : 22,
      fontWeight: "600",
      marginLeft: 4,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginBottom: 8,
    },
    oldPriceLarge: {
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
    discountHighlight: {
      backgroundColor: theme.colors.premium,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    discountHighlightText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    newPriceLarge: {
      fontSize: isSmallScreen ? 32 : 40,
      fontWeight: "800",
      marginBottom: 8,
    },
    bottomSection: {
      paddingHorizontal: 24,
      paddingTop: 16,
      backgroundColor: theme.colors.background,
    },
    securedSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    securedIcon: {
      fontSize: 14,
      marginRight: 6,
    },
    securedText: {
      fontSize: 12,
      fontWeight: "400",
    },
    ctaButton: {
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: theme.colors.premium,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    ctaGradient: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    ctaButtonText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    ctaArrow: {
      fontSize: 20,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    legalLinks: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    legalText: {
      fontSize: 12,
      fontWeight: "400",
      textDecorationLine: "underline",
    },
    legalSeparator: {
      fontSize: 12,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
};
