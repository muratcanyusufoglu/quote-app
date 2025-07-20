import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import {
  useCommonTranslations,
  usePaywallTranslations,
} from "../../hooks/useTranslation";
import {
  getPaywallService,
  SubscriptionPackage,
} from "../../services/PaywallService";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { useTheme } from "../../utils/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Debug Panel Component
const DebugPanel: React.FC<{
  theme: any;
  isVisible: boolean;
  triggerSource: string | null;
  subscriptionPackage: SubscriptionPackage | null;
  isLoading: boolean;
}> = ({ theme, isVisible, triggerSource, subscriptionPackage, isLoading }) => {
  if (!__DEV__) return null;

  // Use translations
  const paywall = usePaywallTranslations();

  return (
    <View
      style={[
        debugStyles.debugContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text style={[debugStyles.debugTitle, { color: theme.colors.text }]}>
        {paywall.debug.title}
      </Text>
      <View style={debugStyles.debugContent}>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {paywall.debug.modal_visible}
          </Text>
          <Text style={[debugStyles.debugValue, { color: theme.colors.text }]}>
            {isVisible.toString()}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {paywall.debug.trigger_source}
          </Text>
          <Text style={[debugStyles.debugValue, { color: theme.colors.text }]}>
            {triggerSource || paywall.debug.none}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {paywall.debug.loading_state}
          </Text>
          <Text style={[debugStyles.debugValue, { color: theme.colors.text }]}>
            {isLoading.toString()}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {paywall.debug.platform}
          </Text>
          <Text style={[debugStyles.debugValue, { color: theme.colors.text }]}>
            {Platform.OS}
          </Text>
        </View>
        {subscriptionPackage && (
          <>
            <View style={debugStyles.debugDivider} />
            <Text
              style={[debugStyles.debugSubtitle, { color: theme.colors.text }]}
            >
              {paywall.debug.subscription_package}
            </Text>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {paywall.debug.id}
              </Text>
              <Text
                style={[debugStyles.debugValue, { color: theme.colors.text }]}
              >
                {subscriptionPackage.id}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {paywall.debug.title_field}
              </Text>
              <Text
                style={[debugStyles.debugValue, { color: theme.colors.text }]}
              >
                {subscriptionPackage.title}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {paywall.debug.current_price}
              </Text>
              <Text
                style={[debugStyles.debugValue, { color: theme.colors.text }]}
              >
                {subscriptionPackage.currentPrice}
              </Text>
            </View>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {paywall.debug.trial_days}
              </Text>
              <Text
                style={[debugStyles.debugValue, { color: theme.colors.text }]}
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
    shadowOffset: { width: 0, height: 2 },
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

// Premium Feature Item Component
const PremiumFeature: React.FC<{
  feature: string;
  theme: any;
  index: number;
}> = ({ feature, theme, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        createStyles(theme).featureItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={createStyles(theme).featureIconContainer}>
        <IconSymbol
          name="checkmark"
          size={16}
          color={theme.colors.premium}
          strokeWidth={3}
        />
      </View>
      <Text style={createStyles(theme).featureText}>{feature}</Text>
    </Animated.View>
  );
};

// Pricing Card Component with enhanced visuals
const PricingCard: React.FC<{
  theme: any;
  subscriptionPackage: SubscriptionPackage | null;
}> = ({ theme, subscriptionPackage }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for pricing card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  if (!subscriptionPackage) return null;

  return (
    <Animated.View
      style={[
        createStyles(theme).pricingCard,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.premium,
          theme.colors.brandYellow,
          theme.colors.primary,
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={createStyles(theme).pricingGradient}
      >
        {/* Free Trial Badge */}
        {subscriptionPackage.freeTrialDays > 0 && (
          <Animated.View
            style={[
              createStyles(theme).trialBadge,
              {
                shadowColor: theme.colors.premium,
                shadowOpacity: glowAnim,
                shadowRadius: 10,
                elevation: 5,
              },
            ]}
          >
            <Text style={createStyles(theme).trialBadgeText}>
              🎉 {subscriptionPackage.freeTrialDays} Days FREE
            </Text>
          </Animated.View>
        )}

        {/* Pricing Info */}
        <View style={createStyles(theme).pricingContent}>
          <View style={createStyles(theme).priceRow}>
            <Text style={createStyles(theme).originalPrice}>
              {subscriptionPackage.originalPrice}
            </Text>
            <View style={createStyles(theme).discountBadge}>
              <Text style={createStyles(theme).discountText}>
                {subscriptionPackage.discount}
              </Text>
            </View>
          </View>

          <Text style={createStyles(theme).currentPrice}>
            {subscriptionPackage.currentPrice}
          </Text>

          <Text style={createStyles(theme).priceDetails}>
            Only {subscriptionPackage.pricePerMonth}/month •{" "}
            {subscriptionPackage.title}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Main PaywallModal Component
export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  onPurchase,
}) => {
  const { theme } = useTheme();
  const isVisible = usePaywallSelectors.isVisible();
  const triggerSource = usePaywallSelectors.triggerSource();
  const { hidePaywall } = usePaywallSelectors.actions();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPackage, setSubscriptionPackage] =
    useState<SubscriptionPackage | null>(null);

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
  });

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

  // Load subscription packages when modal becomes visible
  useEffect(() => {
    if (isVisible && !subscriptionPackage) {
      loadSubscriptionPackages();
    }
  }, [isVisible]);

  const loadSubscriptionPackages = async () => {
    try {
      const paywallService = getPaywallService();
      const packages = await paywallService.getSubscriptionPackages();

      // For now, use the first package (annual premium)
      if (packages.length > 0) {
        setSubscriptionPackage(packages[0]);
      }
    } catch (error) {
      console.error("Failed to load subscription packages:", error);
      Alert.alert(
        paywall.alerts.error,
        "Failed to load subscription options. Please try again."
      );
    }
  };

  const styles = createStyles(theme);

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

  const handleClose = () => {
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
      console.log("💰 Starting premium purchase...");
      const paywallService = getPaywallService();
      const result = await paywallService.purchaseSubscription(
        subscriptionPackage.id
      );

      if (result.success) {
        Alert.alert(
          paywall.alerts.purchase_successful,
          paywall.alerts.welcome_premium,
          [
            {
              text: paywall.alerts.get_started,
              onPress: () => {
                hidePaywall();
                onPurchase?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          paywall.alerts.purchase_failed,
          result.error || paywall.alerts.purchase_error_message,
          [{ text: common.ok }]
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(
        paywall.alerts.purchase_error,
        paywall.alerts.unexpected_error,
        [{ text: common.ok }]
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
        Alert.alert(
          paywall.alerts.purchases_restored,
          paywall.alerts.restored_successfully,
          [
            {
              text: paywall.alerts.continue,
              onPress: () => {
                hidePaywall();
                onPurchase?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          paywall.alerts.no_purchases,
          paywall.alerts.no_purchases_message,
          [{ text: common.ok }]
        );
      }
    } catch (error) {
      console.error("Restore purchases error:", error);
      Alert.alert(
        paywall.alerts.restore_error,
        paywall.alerts.restore_error_message,
        [{ text: common.ok }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  // Use the modern paywall design for all trigger sources
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modernContainer,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.premium,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 16,
            },
          ]}
        >
          {/* Modern Header with Enhanced Gradient */}
          <LinearGradient
            colors={[
              theme.colors.primary,
              theme.colors.brandYellow,
              theme.colors.premium,
            ]}
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modernHeader}
          >
            <TouchableOpacity
              style={[
                styles.modernCloseButton,
                {
                  backgroundColor: theme.colors.whiteOverlay20,
                  shadowColor: theme.colors.white,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                },
              ]}
              onPress={handleClose}
            >
              <IconSymbol
                name="xmark"
                size={18}
                color={theme.colors.white}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              {/* Premium Badge with sparkle animation */}
              <Animated.View
                style={{
                  alignSelf: "center",
                  marginBottom: 18,
                }}
              >
                <LinearGradient
                  colors={[theme.colors.white, theme.colors.whiteOverlay90]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    shadowColor: theme.colors.white,
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "800",
                      fontSize: 14,
                      letterSpacing: 1.5,
                    }}
                  >
                    ✨ {paywall.modern.premium_badge} ✨
                  </Text>
                </LinearGradient>
              </Animated.View>

              <Text
                style={[
                  styles.modernTitle,
                  {
                    color: theme.colors.white,
                    fontSize: 28,
                    fontWeight: "800",
                    marginBottom: 8,
                    textShadowColor: theme.colors.blackOverlay30,
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  },
                ]}
              >
                {content.title}
              </Text>
              <Text
                style={[
                  styles.modernSubtitle,
                  {
                    color: theme.colors.whiteOverlay90,
                    fontSize: 17,
                    fontWeight: "600",
                    textShadowColor: theme.colors.blackOverlay30,
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  },
                ]}
              >
                {content.subtitle}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.modernContent}
            contentContainerStyle={styles.modernContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Pricing Section */}
            <View
              style={[
                styles.pricingSection,
                {
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.colors.premium,
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.brandYellow + "30",
                },
              ]}
            >
              <View style={styles.pricingHeader}>
                <Text
                  style={[
                    styles.planName,
                    { color: theme.colors.text, fontWeight: "700" },
                  ]}
                >
                  {subscriptionPackage?.title || paywall.modern.plan_name}
                </Text>
                <LinearGradient
                  colors={[theme.colors.success, theme.colors.success]}
                  style={[
                    styles.savingsBadge,
                    {
                      shadowColor: theme.colors.success,
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[styles.savingsText, { color: theme.colors.white }]}
                  >
                    {subscriptionPackage?.discount || paywall.modern.save_badge}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.priceDisplay}>
                <View style={styles.modernPriceRow}>
                  <Text
                    style={[
                      styles.mainPrice,
                      {
                        color: theme.colors.primary,
                        textShadowColor: theme.colors.brandYellow + "40",
                        textShadowRadius: 4,
                      },
                    ]}
                  >
                    {subscriptionPackage?.currentPrice || "$39.99"}
                  </Text>
                  <Text
                    style={[
                      styles.periodText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    /{subscriptionPackage?.period || "year"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.monthlyEquivalent,
                    { color: theme.colors.premium, fontWeight: "600" },
                  ]}
                >
                  {subscriptionPackage?.pricePerMonth
                    ? `Just ${subscriptionPackage.pricePerMonth} per month`
                    : paywall.modern.price_per_month}
                </Text>
                <Text
                  style={[
                    styles.originalPriceStrike,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {subscriptionPackage?.originalPrice
                    ? `Regular price: ${subscriptionPackage.originalPrice}`
                    : paywall.modern.regular_price}
                </Text>
              </View>

              <View
                style={[
                  styles.trialCallout,
                  {
                    borderColor: theme.colors.premium,
                    backgroundColor: theme.colors.brandYellow + "10",
                    shadowColor: theme.colors.premium,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  },
                ]}
              >
                <IconSymbol
                  name="sparkles"
                  size={16}
                  color={theme.colors.premium}
                />
                <Text
                  style={[
                    styles.trialText,
                    { color: theme.colors.premium, fontWeight: "700" },
                  ]}
                >
                  {subscriptionPackage?.freeTrialDays
                    ? `Start with ${subscriptionPackage.freeTrialDays} days free`
                    : paywall.modern.trial_text}
                </Text>
              </View>
            </View>

            {/* Features Section with animations */}
            <View style={styles.modernFeaturesSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.text,
                    textAlign: "center",
                    fontWeight: "700",
                  },
                ]}
              >
                {paywall.modern.section_title}
              </Text>
              <View style={styles.featuresList}>
                {(subscriptionPackage?.features || content.features).map(
                  (feature, index) => (
                    <PremiumFeature
                      key={index}
                      feature={feature}
                      theme={theme}
                      index={index}
                    />
                  )
                )}
              </View>
            </View>

            {/* Enhanced Social Proof Section */}
            <View
              style={[
                styles.socialProofSection,
                {
                  backgroundColor: theme.colors.brandYellow + "08",
                  borderWidth: 1,
                  borderColor: theme.colors.brandYellow + "20",
                },
              ]}
            >
              <View style={styles.ratingDisplay}>
                <Text
                  style={[
                    styles.ratingStars,
                    { color: theme.colors.premium, fontSize: 24 },
                  ]}
                >
                  ★★★★★
                </Text>
                <Text
                  style={[
                    styles.ratingText,
                    {
                      color: theme.colors.white,
                      fontWeight: "600",
                      fontSize: 16,
                    },
                  ]}
                >
                  {paywall.modern.rating_text}
                </Text>
              </View>

              {content.testimonials && content.testimonials.length > 0 && (
                <View style={styles.testimonialsContainer}>
                  {content.testimonials.map(
                    (testimonial: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.modernTestimonialCard,
                          {
                            borderLeftColor: theme.colors.premium,
                            backgroundColor: theme.colors.white,
                            shadowColor: theme.colors.premium,
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modernTestimonialText,
                            { color: theme.colors.white, fontWeight: "500" },
                          ]}
                        >
                          {`"${testimonial.text}"`}
                        </Text>
                        <Text
                          style={[
                            styles.modernTestimonialAuthor,
                            {
                              color: theme.colors.whiteOverlay90,
                              fontWeight: "600",
                            },
                          ]}
                        >
                          {testimonial.author}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Enhanced Bottom CTA Section */}
          <LinearGradient
            colors={[theme.colors.surface, theme.colors.background]}
            style={[
              styles.ctaSection,
              {
                borderTopColor: theme.colors.brandYellow + "30",
                borderTopWidth: 2,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.primaryCTA, isLoading && styles.disabledButton]}
              onPress={handlePurchase}
              disabled={isLoading || !subscriptionPackage}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  theme.colors.premium,
                  theme.colors.brandYellow,
                  theme.colors.primary,
                ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.ctaGradient,
                  {
                    shadowColor: theme.colors.premium,
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ctaText,
                    {
                      color: theme.colors.white,
                      fontWeight: "800",
                      textShadowColor: theme.colors.blackOverlay30,
                      textShadowRadius: 2,
                    },
                  ]}
                >
                  {isLoading ? paywall.processing : content.cta}
                </Text>
                <Text
                  style={[
                    styles.ctaSubtext,
                    {
                      color: theme.colors.whiteOverlay90,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {subscriptionPackage?.freeTrialDays
                    ? `${subscriptionPackage.freeTrialDays} days free, then ${subscriptionPackage.currentPrice}/${subscriptionPackage.period}`
                    : paywall.pricing.trial_days}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreLink}
              onPress={handleRestorePurchases}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.restoreLinkText,
                  {
                    color: theme.colors.premium,
                    textDecorationLine: "underline",
                    fontWeight: "600",
                  },
                ]}
              >
                {paywall.modern.restore_purchase}
              </Text>
            </TouchableOpacity>

            <View style={styles.trustSection}>
              <Text
                style={[
                  styles.trustText,
                  {
                    color: theme.colors.whiteOverlay90,
                    fontWeight: "500",
                  },
                ]}
              >
                {paywall.modern.trust_text}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    modernContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 28,
      maxHeight: screenHeight * 0.92,
      width: screenWidth * 0.95,
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 16,
    },
    modernHeader: {
      paddingTop: 50,
      paddingHorizontal: 24,
      paddingBottom: 32,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    modernCloseButton: {
      alignSelf: "flex-end",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.whiteOverlay20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    headerContent: {
      alignItems: "center",
    },
    modernTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 32,
    },
    modernSubtitle: {
      fontSize: 16,
      color: theme.colors.whiteOverlay90,
      textAlign: "center",
      lineHeight: 24,
    },
    modernContent: {
      flex: 1,
    },
    modernContentContainer: {
      padding: 24,
    },
    pricingSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    pricingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    planName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.white,
    },
    savingsBadge: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    savingsText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.white,
    },
    priceDisplay: {
      alignItems: "center",
      marginBottom: 20,
    },
    modernPriceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 8,
    },
    mainPrice: {
      fontSize: 52,
      fontWeight: "800",
      color: theme.colors.white,
    },
    periodText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.whiteOverlay90,
      marginLeft: 4,
    },
    monthlyEquivalent: {
      fontSize: 16,
      color: theme.colors.whiteOverlay90,
      marginBottom: 4,
      fontWeight: "500",
    },
    originalPriceStrike: {
      fontSize: 14,
      color: theme.colors.whiteOverlay80,
      textDecorationLine: "line-through",
    },
    trialCallout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.colors.brandYellow,
    },
    trialText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.brandYellow,
      marginLeft: 8,
    },
    modernFeaturesSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    featuresList: {
      gap: 16,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    featureIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.premium + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      marginTop: 2,
      borderWidth: 2,
      borderColor: theme.colors.premium,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    featureIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.premium + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      borderWidth: 2,
      borderColor: theme.colors.premium,
    },
    modernFeatureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      lineHeight: 24,
      fontWeight: "500",
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      fontWeight: "500",
    },
    socialProofSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    ratingDisplay: {
      alignItems: "center",
      marginBottom: 20,
    },
    ratingStars: {
      fontSize: 22,
      color: theme.colors.brandYellow,
      marginBottom: 6,
    },
    ratingText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    testimonialsContainer: {
      gap: 16,
    },
    modernTestimonialCard: {
      backgroundColor: theme.colors.background,
      padding: 18,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.brandYellow,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    modernTestimonialText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: 8,
      fontStyle: "italic",
    },
    modernTestimonialAuthor: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    ctaSection: {
      padding: 24,
      paddingTop: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    primaryCTA: {
      borderRadius: 20,
      marginBottom: 16,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    disabledButton: {
      opacity: 0.6,
    },
    ctaGradient: {
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderRadius: 20,
      alignItems: "center",
    },
    ctaText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.white,
      marginBottom: 4,
    },
    ctaSubtext: {
      fontSize: 14,
      color: theme.colors.whiteOverlay90,
      fontWeight: "500",
    },
    restoreLink: {
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 16,
    },
    restoreLinkText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.primary,
    },
    trustSection: {
      alignItems: "center",
    },
    trustText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 18,
    },
    // Existing styles for backwards compatibility
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: screenHeight * 0.92,
      width: "100%",
      overflow: "hidden",
    },
    headerGradient: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 32,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    closeButton: {
      alignSelf: "flex-end",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    premiumIconContainer: {
      alignSelf: "center",
      marginBottom: 20,
    },
    premiumIconGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: 12,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.whiteOverlay90,
      textAlign: "center",
      lineHeight: 22,
    },
    contentScroll: {
      flex: 1,
    },
    contentContainer: {
      padding: 24,
      paddingTop: 0,
    },
    pricingCard: {
      marginBottom: 32,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    pricingGradient: {
      padding: 24,
      alignItems: "center",
    },
    trialBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 20,
    },
    trialBadgeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
    },
    pricingContent: {
      alignItems: "center",
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 8,
    },
    originalPrice: {
      fontSize: 18,
      color: theme.colors.whiteOverlay70,
      textDecorationLine: "line-through",
      marginRight: 12,
    },
    discountBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    discountText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.white,
    },
    currentPrice: {
      fontSize: 36,
      fontWeight: "700",
      color: theme.colors.white,
      marginBottom: 4,
    },
    priceDetails: {
      fontSize: 14,
      color: theme.colors.whiteOverlay80,
    },
    featuresSection: {
      marginBottom: 32,
    },
    featuresTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    featuresGrid: {
      gap: 12,
    },
    actionSection: {
      marginBottom: 24,
    },
    primaryButton: {
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 16,
      alignItems: "center",
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.white,
      marginBottom: 2,
    },
    primaryButtonSubtext: {
      fontSize: 14,
      color: theme.colors.whiteOverlay90,
    },
    restoreButton: {
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 8,
    },
    restoreButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.brandYellow,
    },
    secondaryButton: {
      paddingVertical: 16,
      alignItems: "center",
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },
    footer: {
      alignItems: "center",
      paddingBottom: 20,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 16,
    },
  });
