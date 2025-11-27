import {LinearGradient} from "expo-linear-gradient";
import React, {useEffect, useRef, useState} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import {usePremium} from "../../hooks/usePremium";
import {useStoreReview} from "../../hooks/useStoreReview";
import {
  useCommonTranslations,
  usePaywallTranslations,
} from "../../hooks/useTranslation";
import {
  getPaywallService,
  SubscriptionPackage,
} from "../../services/PaywallService";
import {usePaywallSelectors} from "../../store/usePaywallStore";
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
  const [shouldShowDiscounted, setShouldShowDiscounted] = useState(false);
  const {hidePaywall, showPaywall} = usePaywallSelectors.actions();

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
      console.log("🚀 Starting to load subscription packages...");
      const paywallService = getPaywallService();

      // Deterministic selection based on triggerSource to avoid strategy races
      const packages = await paywallService.getAllSubscriptionPackages();
      console.log("🔄 loadSubscriptionPackages called", packages);

      // 🔍 DEBUG: Detailed package information
      if (packages && packages.length > 0) {
        packages.forEach((pkg, index) => {
          console.log(`📦 Package ${index}:`, {
            id: pkg.id,
            title: pkg.title,
            currentPrice: pkg.currentPrice,
            originalPrice: pkg.originalPrice,
            pricePerMonth: pkg.pricePerMonth,
            period: pkg.period,
            packageType: pkg.packageType,
            currencyCode: pkg.currencyCode,
            priceNumber: pkg.priceNumber,
            features: pkg.features?.length || 0,
          });
        });
      } else {
        console.warn("⚠️ No packages received from PaywallService");
      }

      // 🔍 DEBUG: Paket seçim mantığını detaylı logla
      console.log("🔍 PAYWALL DEBUG:", {
        triggerSource,
        packagesCount: packages.length,
        packages: packages.map((p) => ({
          id: p.id,
          price: p.currentPrice,
          type: p.packageType,
          discount: p.discount,
          title: p.title,
        })),
        selectedPackageIndex:
          triggerSource === "discounted" && packages.length > 1 ? 1 : 0,
        selectedPackage:
          triggerSource === "discounted" && packages.length > 1
            ? packages[1]?.id
            : packages[0]?.id,
      });

      if (packages.length === 0) return;

      // İndirimli paywall koşulunu kontrol et
      const shouldSelectDiscountedPackage =
        (triggerSource === "discounted" || shouldShowDiscounted) &&
        packages.length > 1;

      if (shouldSelectDiscountedPackage) {
        setSubscriptionPackage(packages[1]);
        console.log(
          "🔍 İNDİRİMLİ PAYWALL - Seçilen paket:",
          packages[1].currentPrice
        );
        console.log("✅ İndirimli paket seçildi:", packages[1].id);
        console.log("🔍 Seçilen paket detayları:", {
          id: packages[1].id,
          title: packages[1].title,
          period: packages[1].period,
          currentPrice: packages[1].currentPrice,
          pricePerMonth: packages[1].pricePerMonth,
          packageType: packages[1].packageType,
          currencyCode: packages[1].currencyCode,
          priceNumber: packages[1].priceNumber,
          discount: packages[1].discount,
        });
      } else {
        setSubscriptionPackage(packages[0]);
        console.log(
          "🔍 NORMAL PAYWALL - Seçilen paket:",
          packages[0].currentPrice
        );
        console.log("✅ İndirimsiz paket seçildi:", packages[0].id);
        console.log("🔍 Seçilen paket detayları:", {
          id: packages[0].id,
          title: packages[0].title,
          period: packages[0].period,
          currentPrice: packages[0].currentPrice,
          pricePerMonth: packages[0].pricePerMonth,
          packageType: packages[0].packageType,
          currencyCode: packages[0].currencyCode,
          priceNumber: packages[0].priceNumber,
          discount: packages[0].discount,
        });
      }

      // Store all packages for discount calculation
      setAllPackages(packages);
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
      triggerSource,
      currentPackage: subscriptionPackage?.id,
    });

    // If first offer is dismissed, just close and mark as rejected
    // DO NOT immediately reopen discounted modal
    if (!isDiscountedPaywall && !shouldShowDiscounted) {
      console.log(
        "🔄 İndirimsiz modal kapatılıyor, ilk teklif reddedildi olarak işaretleniyor..."
      );
      try {
        const paywallService = getPaywallService();
        await paywallService.markFirstOfferRejected();
        console.log("✅ İlk teklif reddedildi olarak işaretlendi");

        // Reset user interaction count for delayed discount paywall tracking
        const {resetInteractionCountForDiscount} =
          usePaywallSelectors.actions();
        resetInteractionCountForDiscount();
        console.log(
          "🎯 Kullanıcı etkileşim sayacı sıfırlandı, indirimli paywall tracking başlatıldı"
        );
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
    });
  };

  const handlePurchase = async () => {
    if (!subscriptionPackage) {
      Alert.alert(paywall.alerts.error, paywall.alerts.no_subscription);
      return;
    }

    setIsLoading(true);

    try {
      // ✅ STEP 1: Perform actual purchase via PaywallService
      console.log("💰 Starting purchase process...");
      const paywallService = getPaywallService();
      const purchaseResult = await paywallService.purchaseSubscription(
        subscriptionPackage.id
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

            // ✅ STEP 3.5: Check if we should request store review (Premium users only)
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

  // Render modal paywall with top spacing
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Background Image */}
          <Image
            source={require("../../../assets/images/paywall.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          {/* Dark overlay for better text readability */}
          <View style={styles.overlay} />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <IconSymbol
              name="xmark"
              size={20}
              color="#FFFFFF"
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Top Section */}
            <View style={styles.topSection}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                {/* Discount Badge for Discounted Paywall */}
                {(isDiscountedPaywall || shouldShowDiscounted) &&
                  discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        🔥{" "}
                        {paywall.modern.discount_percentage.replace(
                          "{percentage}",
                          discountPercentage.toString()
                        )}
                      </Text>
                    </View>
                  )}

                {/* Title */}
                <Text style={styles.mainTitle}>
                  {isDiscountedPaywall || shouldShowDiscounted
                    ? paywall.modern.discount_offer_title
                    : paywall.modern.title}
                </Text>

                {/* Subtitle */}
                <Text style={styles.mainSubtitle}>
                  {isDiscountedPaywall || shouldShowDiscounted
                    ? paywall.modern.discount_offer_subtitle
                    : paywall.modern.subtitle}
                </Text>
              </View>

              {/* Pricing Section */}
              <View style={styles.pricingContainer}>
                {/* Price comparison for discounted paywall */}
                {(isDiscountedPaywall || shouldShowDiscounted) &&
                  allPackages.length >= 2 && (
                    <View style={styles.priceComparison}>
                      <Text style={styles.wasPrice}>
                        {paywall.modern.was_price.replace(
                          "{price}",
                          allPackages[0].currentPrice
                        )}
                      </Text>
                      <Text style={styles.nowPrice}>
                        {paywall.modern.now_price.replace(
                          "{price}",
                          allPackages[1].currentPrice
                        )}
                      </Text>
                    </View>
                  )}

                {/* Current Price */}
                <View style={styles.currentPriceSection}>
                  <Text style={styles.currentPrice}>
                    {(() => {
                      // Always show the selected subscription package price for consistency
                      console.log(
                        "🔍 Paywall ana fiyat (subscriptionPackage):",
                        subscriptionPackage?.currentPrice || "...",
                        "Currency:",
                        subscriptionPackage?.currencyCode || "N/A"
                      );
                      return subscriptionPackage?.currentPrice || "...";
                    })()}
                  </Text>
                  <Text style={styles.periodText}>
                    {(() => {
                      // Always use subscriptionPackage for consistency
                      const period = subscriptionPackage?.period || "year";
                      return `/${paywall.modern.year}`;
                    })()}
                  </Text>
                </View>

                {/* Free Trial Highlight */}
                <View style={styles.trialHighlight}>
                  <Text style={styles.trialText}>
                    {paywall.modern.free_trial_highlight}
                  </Text>
                </View>
              </View>
            </View>

            {/* Testimonials Section */}
            <View style={styles.testimonialsContainer}>
              <Text style={styles.testimonialsTitle}>
                {paywall.modern.features_title}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.testimonialsScroll}
                contentContainerStyle={styles.testimonialsScrollContent}
                pagingEnabled={false}
                decelerationRate="fast"
                snapToInterval={
                  isSmallScreen
                    ? screenWidth * 0.75 + 16
                    : screenWidth * 0.7 + 20
                }
                snapToAlignment="start"
              >
                {(paywall.modern.testimonials as unknown as any[])?.map(
                  (testimonial: any, index: number) => (
                    <View key={index} style={styles.testimonialCard}>
                      <View style={styles.starsContainer}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Text key={i} style={styles.star}>
                            ★
                          </Text>
                        ))}
                      </View>
                      <Text style={styles.testimonialText}>
                        "{testimonial.text}"
                      </Text>
                      <Text style={styles.testimonialAuthor}>
                        - {testimonial.author}
                      </Text>
                    </View>
                  )
                )}
              </ScrollView>
            </View>
          </View>

          {/* Bottom CTA Section */}
          <View
            style={[
              styles.bottomSection,
              {paddingBottom: (isSmallScreen ? 30 : 40) + insets.bottom},
            ]}
          >
            <TouchableOpacity
              style={[styles.ctaButton, isLoading && styles.disabledButton]}
              onPress={handlePurchase}
              disabled={isLoading || !subscriptionPackage}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  "#D97706", // Daha koyu amber - okunabilirlik için
                  "#B45309", // Orta koyu amber
                  "#92400E", // En koyu amber
                ]}
                locations={[0, 0.5, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaButtonText}>
                  {isLoading
                    ? paywall.processing
                    : paywall.modern.start_trial_button}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust indicators */}

            {/* Restore Purchase Link */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={isLoading}
            >
              <Text style={styles.restoreText}>
                {paywall.modern.restore_purchase}
              </Text>
            </TouchableOpacity>

            {/* Legal Links */}
            <View style={styles.legalLinks}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://quotesparkapp.netlify.app/privacy")
                }
              >
                <Text style={styles.legalText}>{paywall.privacyPolicy}</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                  )
                }
              >
                <Text style={styles.legalText}>{paywall.termsOfUse}</Text>
              </TouchableOpacity>
            </View>
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
      paddingTop: isSmallScreen ? 40 : 60,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "#000000",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    closeButton: {
      position: "absolute",
      top: isSmallScreen ? 40 : 50,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    contentContainer: {
      flex: 1,
      paddingTop: isVerySmallScreen
        ? 50
        : isSmallScreen
        ? 60
        : isMediumScreen
        ? 70
        : 80,
      paddingHorizontal: isSmallScreen ? 16 : 24,
      justifyContent: "space-between",
    },
    topSection: {
      flex: 0,
      justifyContent: "flex-start",
    },
    headerSection: {
      alignItems: "center",
      marginBottom: isVerySmallScreen ? 10 : isSmallScreen ? 14 : 18,
    },
    discountBadge: {
      backgroundColor: "#FF4444",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingVertical: isSmallScreen ? 6 : 8,
      borderRadius: 20,
      marginBottom: isSmallScreen ? 10 : 12,
    },
    discountBadgeText: {
      color: "#FFFFFF",
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: "700",
      textAlign: "center",
    },
    mainTitle: {
      fontSize: isVerySmallScreen
        ? 20
        : isSmallScreen
        ? 22
        : isMediumScreen
        ? 25
        : 28,
      fontWeight: "800",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: isVerySmallScreen ? 4 : isSmallScreen ? 6 : 8,
      lineHeight: isVerySmallScreen
        ? 24
        : isSmallScreen
        ? 26
        : isMediumScreen
        ? 29
        : 32,
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: {width: 0, height: 2},
      textShadowRadius: 4,
    },
    mainSubtitle: {
      fontSize: isVerySmallScreen
        ? 12
        : isSmallScreen
        ? 14
        : isMediumScreen
        ? 16
        : 18,
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      lineHeight: isVerySmallScreen
        ? 16
        : isSmallScreen
        ? 18
        : isMediumScreen
        ? 20
        : 24,
      opacity: 0.9,
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
      marginBottom: isVerySmallScreen ? 2 : isSmallScreen ? 2 : 4,
    },
    pricingContainer: {
      alignItems: "center",
      marginTop: isVerySmallScreen ? 2 : isSmallScreen ? 4 : 6,
      marginBottom: isVerySmallScreen ? 10 : isSmallScreen ? 14 : 18,
    },
    priceComparison: {
      alignItems: "center",
      marginBottom: isSmallScreen ? 10 : 12,
    },
    wasPrice: {
      fontSize: isSmallScreen ? 14 : 16,
      color: "#FFFFFF",
      opacity: 0.7,
      textDecorationLine: "line-through",
      marginBottom: 4,
    },
    nowPrice: {
      fontSize: isSmallScreen ? 16 : 18,
      color: "#00FF88",
      fontWeight: "600",
    },
    currentPriceSection: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: isSmallScreen ? 12 : 14,
    },
    currentPrice: {
      fontSize: isVerySmallScreen
        ? 32
        : isSmallScreen
        ? 36
        : isMediumScreen
        ? 42
        : 48,
      fontWeight: "800",
      color: "#FFFFFF",
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: {width: 0, height: 2},
      textShadowRadius: 4,
    },
    periodText: {
      fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
      opacity: 0.8,
    },
    trialHighlight: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: isSmallScreen ? 12 : 16,
      paddingVertical: isSmallScreen ? 6 : 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    trialText: {
      color: "#FFFFFF",
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "600",
      textAlign: "center",
    },
    testimonialsContainer: {
      alignItems: "center",
      flex: 0,
      marginTop: isVerySmallScreen ? 4 : isSmallScreen ? 6 : 8,
      marginBottom: isVerySmallScreen ? 2 : isSmallScreen ? 4 : 6,
    },
    testimonialsTitle: {
      fontSize: isVerySmallScreen ? 14 : isSmallScreen ? 15 : 17,
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12,
      textShadowColor: "rgba(0, 0, 0, 0.8)",
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    testimonialsScroll: {
      maxHeight: isVerySmallScreen
        ? 80
        : isSmallScreen
        ? 90
        : isMediumScreen
        ? 100
        : 110,
    },
    testimonialsScrollContent: {
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingRight: isSmallScreen ? 40 : 50,
    },
    testimonialCard: {
      width: isSmallScreen ? screenWidth * 0.75 : screenWidth * 0.7,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 16,
      padding: isSmallScreen ? 10 : 12,
      marginHorizontal: isSmallScreen ? 8 : 10,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
      shadowColor: "rgba(0, 0, 0, 0.3)",
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 8,
    },
    starsContainer: {
      flexDirection: "row",
      marginBottom: isSmallScreen ? 6 : 8,
      justifyContent: "center",
    },
    star: {
      color: "#FFD700",
      fontSize: isSmallScreen ? 14 : 16,
      marginHorizontal: 1,
    },
    testimonialText: {
      fontSize: isSmallScreen ? 10 : 12,
      color: "#FFFFFF",
      fontWeight: "500",
      lineHeight: isSmallScreen ? 14 : 16,
      textAlign: "center",
      marginBottom: isSmallScreen ? 6 : 8,
      fontStyle: "italic",
    },
    testimonialAuthor: {
      fontSize: isSmallScreen ? 12 : 14,
      color: "#FFFFFF",
      fontWeight: "600",
      textAlign: "center",
      opacity: 0.8,
    },
    bottomSection: {
      paddingHorizontal: isSmallScreen ? 16 : 24,
      paddingBottom: isVerySmallScreen ? 30 : isSmallScreen ? 40 : 50,
      paddingTop: isVerySmallScreen ? 8 : isSmallScreen ? 12 : 16,
    },
    ctaButton: {
      borderRadius: 16,
      marginBottom: isSmallScreen ? 12 : 16,
      shadowColor: "#000000",
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    ctaGradient: {
      paddingVertical: isSmallScreen ? 14 : 16,
      paddingHorizontal: isSmallScreen ? 20 : 24,
      borderRadius: 16,
      alignItems: "center",
    },
    ctaButtonText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "800",
      color: "#FFFFFF",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    trustSection: {
      alignItems: "center",
      marginBottom: 16,
    },
    trustText: {
      fontSize: 14,
      color: "#FFFFFF",
      textAlign: "center",
      opacity: 0.8,
    },
    restoreButton: {
      alignItems: "center",
      paddingVertical: isSmallScreen ? 6 : 8,
      marginBottom: isSmallScreen ? 12 : 16,
    },
    restoreText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: "#FFFFFF",
      fontWeight: "500",
      textDecorationLine: "underline",
      opacity: 0.8,
    },
    legalLinks: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: isSmallScreen ? 8 : 12,
    },
    legalText: {
      fontSize: isSmallScreen ? 10 : 12,
      color: "#FFFFFF",
      opacity: 0.6,
      textDecorationLine: "underline",
    },
    legalSeparator: {
      fontSize: isSmallScreen ? 10 : 12,
      color: "#FFFFFF",
      opacity: 0.6,
    },
    disabledButton: {
      opacity: 0.6,
    },
    // Legacy styles removed to avoid duplicates - using new full-screen design
  });
};
