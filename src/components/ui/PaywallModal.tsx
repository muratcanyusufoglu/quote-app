import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
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

  return (
    <View
      style={[
        debugStyles.debugContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text style={[debugStyles.debugTitle, { color: theme.colors.text }]}>
        🐛 Debug Info
      </Text>
      <View style={debugStyles.debugContent}>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Modal Visible:
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
            Trigger Source:
          </Text>
          <Text style={[debugStyles.debugValue, { color: theme.colors.text }]}>
            {triggerSource || "none"}
          </Text>
        </View>
        <View style={debugStyles.debugRow}>
          <Text
            style={[
              debugStyles.debugLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Loading State:
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
            Platform:
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
              Subscription Package:
            </Text>
            <View style={debugStyles.debugRow}>
              <Text
                style={[
                  debugStyles.debugLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                ID:
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
                Title:
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
                Current Price:
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
                Trial Days:
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
}> = ({ feature, theme, index }) => (
  <View
    style={[
      createStyles(theme).featureItem,
      {
        transform: [{ translateX: index % 2 === 0 ? -5 : 5 }],
      },
    ]}
  >
    <View style={createStyles(theme).featureIconContainer}>
      <IconSymbol
        name="checkmark"
        size={16}
        color={theme.colors.brandYellow}
        strokeWidth={3}
      />
    </View>
    <Text style={createStyles(theme).featureText}>{feature}</Text>
  </View>
);

// Pricing Card Component
const PricingCard: React.FC<{
  theme: any;
  subscriptionPackage: SubscriptionPackage | null;
}> = ({ theme, subscriptionPackage }) => {
  if (!subscriptionPackage) return null;

  return (
    <View style={createStyles(theme).pricingCard}>
      <LinearGradient
        colors={[theme.colors.brandYellow, theme.colors.premium]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={createStyles(theme).pricingGradient}
      >
        {/* Free Trial Badge */}
        {subscriptionPackage.freeTrialDays > 0 && (
          <View style={createStyles(theme).trialBadge}>
            <Text style={createStyles(theme).trialBadgeText}>
              🎉 {subscriptionPackage.freeTrialDays} Days FREE
            </Text>
          </View>
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
    </View>
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

  // Translations
  const paywall = usePaywallTranslations();
  const common = useCommonTranslations();

  console.log("💰 Modern PaywallModal render:", {
    isVisible,
    triggerSource,
    isLoading,
  });

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
          testimonials: [
            {
              text: "This app completely changed how I start my mornings. I'm more motivated than ever!",
              author: "Sarah K., CEO",
            },
            {
              text: "The personalized quotes and stories are exactly what I needed for my entrepreneurial journey.",
              author: "Michael R., Founder",
            },
          ],
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
    hidePaywall();
    onClose?.();
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
      animationType="slide"
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
        <View
          style={[
            styles.modernContainer,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadowColor,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 16,
            },
          ]}
        >
          {/* Modern Header */}
          <View style={styles.modernHeader}>
            <TouchableOpacity
              style={styles.modernCloseButton}
              onPress={handleClose}
            >
              <IconSymbol
                name="xmark"
                size={18}
                color={theme.colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              {/* Premium Badge */}
              <LinearGradient
                colors={[theme.colors.brandYellow, theme.colors.premium]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  alignSelf: "center",
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  paddingVertical: 7,
                  marginBottom: 18,
                  shadowColor: theme.colors.brandYellow,
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.background,
                    fontWeight: "700",
                    fontSize: 13,
                    letterSpacing: 1.2,
                  }}
                >
                  {paywall.modern.premium_badge}
                </Text>
              </LinearGradient>
              <Text
                style={[
                  styles.modernTitle,
                  {
                    color: theme.colors.text,
                    fontSize: 26,
                    fontWeight: "700",
                    marginBottom: 6,
                  },
                ]}
              >
                {content.title}
              </Text>
              <Text
                style={[
                  styles.modernSubtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: 16,
                    fontWeight: "500",
                  },
                ]}
              >
                {content.subtitle}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.modernContent}
            contentContainerStyle={styles.modernContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <View style={styles.pricingHeader}>
                <Text
                  style={[
                    styles.planName,
                    { color: theme.colors.text, fontWeight: "600" },
                  ]}
                >
                  {subscriptionPackage?.title || paywall.modern.plan_name}
                </Text>
                <View
                  style={[
                    styles.savingsBadge,
                    { backgroundColor: theme.colors.success },
                  ]}
                >
                  <Text
                    style={[styles.savingsText, { color: theme.colors.white }]}
                  >
                    {subscriptionPackage?.discount || paywall.modern.save_badge}
                  </Text>
                </View>
              </View>

              <View style={styles.priceDisplay}>
                <View style={styles.modernPriceRow}>
                  <Text
                    style={[styles.mainPrice, { color: theme.colors.text }]}
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
                    { color: theme.colors.textSecondary },
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
                  { borderColor: theme.colors.brandYellow },
                ]}
              >
                <IconSymbol
                  name="sparkles"
                  size={16}
                  color={theme.colors.brandYellow}
                />
                <Text
                  style={[
                    styles.trialText,
                    { color: theme.colors.brandYellow },
                  ]}
                >
                  {subscriptionPackage?.freeTrialDays
                    ? `Start with ${subscriptionPackage.freeTrialDays} days free`
                    : paywall.modern.trial_text}
                </Text>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.modernFeaturesSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {paywall.modern.section_title}
              </Text>
              <View style={styles.featuresList}>
                {(subscriptionPackage?.features || content.features).map(
                  (feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View
                        style={[
                          styles.featureIcon,
                          {
                            borderColor: theme.colors.brandYellow,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                      >
                        <IconSymbol
                          name="checkmark"
                          size={14}
                          color={theme.colors.brandYellow}
                          strokeWidth={3}
                        />
                      </View>
                      <Text
                        style={[
                          styles.modernFeatureText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {feature}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            {/* Social Proof Section */}
            <View style={styles.socialProofSection}>
              <View style={styles.ratingDisplay}>
                <Text
                  style={[
                    styles.ratingStars,
                    { color: theme.colors.brandYellow },
                  ]}
                >
                  ★★★★★
                </Text>
                <Text
                  style={[
                    styles.ratingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {paywall.modern.rating_text}
                </Text>
              </View>

              {content.testimonials && content.testimonials.length > 0 && (
                <View style={styles.testimonialsContainer}>
                  {content.testimonials.map((testimonial, index) => (
                    <View
                      key={index}
                      style={[
                        styles.modernTestimonialCard,
                        {
                          borderLeftColor: theme.colors.brandYellow,
                          backgroundColor: theme.colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modernTestimonialText,
                          { color: theme.colors.text },
                        ]}
                      >
                        "{testimonial.text}"
                      </Text>
                      <Text
                        style={[
                          styles.modernTestimonialAuthor,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {testimonial.author}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom CTA Section */}
          <View
            style={[
              styles.ctaSection,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
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
                colors={[theme.colors.primary, theme.colors.brandYellow]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={[styles.ctaText, { color: theme.colors.white }]}>
                  {isLoading ? paywall.processing : content.cta}
                </Text>
                <Text
                  style={[
                    styles.ctaSubtext,
                    { color: theme.colors.whiteOverlay90 },
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
                    color: theme.colors.primary,
                    textDecorationLine: "underline",
                  },
                ]}
              >
                {paywall.modern.restore_purchase}
              </Text>
            </TouchableOpacity>

            <View style={styles.trustSection}>
              <Text
                style={[styles.trustText, { color: theme.colors.textTertiary }]}
              >
                {paywall.modern.trust_text}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  //   return (
  //     <Modal
  //       visible={isVisible}
  //       transparent
  //       animationType="slide"
  //       statusBarTranslucent
  //     >
  //       <View style={styles.backdrop}>
  //         <View style={styles.container}>
  //           {/* Header with Gradient Background */}
  //           <LinearGradient
  //             colors={theme.colors.gradientColors as any}
  //             locations={theme.colors.gradientLocations as any}
  //             start={{ x: 0, y: 0 }}
  //             end={{ x: 1, y: 1 }}
  //             style={styles.headerGradient}
  //           >
  //             {/* Close Button */}
  //             <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
  //               <IconSymbol
  //                 name="xmark"
  //                 size={20}
  //                 color={theme.colors.whiteOverlay80}
  //                 strokeWidth={2}
  //               />
  //             </TouchableOpacity>

  //             {/* Premium Icon */}
  //             <View style={styles.premiumIconContainer}>
  //               <LinearGradient
  //                 colors={[theme.colors.brandYellow, theme.colors.premium]}
  //                 style={styles.premiumIconGradient}
  //               >
  //                 <IconSymbol
  //                   name="crown"
  //                   size={32}
  //                   color={theme.colors.white}
  //                   strokeWidth={2}
  //                 />
  //               </LinearGradient>
  //             </View>

  //             {/* Header Text */}
  //             <Text style={styles.headerTitle}>{content.title}</Text>
  //             <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
  //           </LinearGradient>

  //           {/* Content */}
  //           <ScrollView
  //             style={styles.contentScroll}
  //             contentContainerStyle={styles.contentContainer}
  //             showsVerticalScrollIndicator={false}
  //           >
  //             {/* Pricing Card */}
  //             <PricingCard
  //               theme={theme}
  //               subscriptionPackage={subscriptionPackage}
  //             />

  //             {/* Features Section */}
  //             <View style={styles.featuresSection}>
  //               <Text style={styles.featuresTitle}>
  //                 What you'll get with Premium:
  //               </Text>

  //               <View style={styles.featuresGrid}>
  //                 {content.features.map((feature, index) => (
  //                   <PremiumFeature
  //                     key={index}
  //                     feature={feature}
  //                     theme={theme}
  //                     index={index}
  //                   />
  //                 ))}
  //               </View>
  //             </View>

  //             {/* Testimonials for real_purchase */}
  //             {triggerSource === "real_purchase" && content.testimonials && (
  //               <View style={styles.testimonialsSection}>
  //                 <Text style={styles.testimonialsTitle}>
  //                   What Our Premium Members Say:
  //                 </Text>
  //                 {content.testimonials.map((testimonial, index) => (
  //                   <View key={index} style={styles.testimonialCardReal}>
  //                     <Text style={styles.testimonialQuote}>
  //                       "{testimonial.text}"
  //                     </Text>
  //                     <Text style={styles.testimonialAuthorReal}>
  //                       — {testimonial.author}
  //                     </Text>
  //                   </View>
  //                 ))}
  //               </View>
  //             )}

  //             {/* Action Buttons */}
  //             <View style={styles.actionSection}>
  //               <TouchableOpacity
  //                 style={[
  //                   styles.primaryButton,
  //                   isLoading && styles.disabledButton,
  //                 ]}
  //                 onPress={handlePurchase}
  //                 disabled={isLoading || !subscriptionPackage}
  //               >
  //                 <LinearGradient
  //                   colors={[theme.colors.brandYellow, theme.colors.premium]}
  //                   style={styles.buttonGradient}
  //                 >
  //                   <Text style={styles.primaryButtonText}>
  //                     {isLoading ? paywall.processing : content.cta}
  //                   </Text>
  //                   {subscriptionPackage && (
  //                     <Text style={styles.primaryButtonSubtext}>
  //                       {content.highlight}
  //                     </Text>
  //                   )}
  //                 </LinearGradient>
  //               </TouchableOpacity>

  //               <TouchableOpacity
  //                 style={styles.restoreButton}
  //                 onPress={handleRestorePurchases}
  //                 disabled={isLoading}
  //               >
  //                 <Text style={styles.restoreButtonText}>
  //                   Restore Previous Purchases
  //                 </Text>
  //               </TouchableOpacity>

  //               <TouchableOpacity
  //                 style={styles.secondaryButton}
  //                 onPress={handleClose}
  //               >
  //                 <Text style={styles.secondaryButtonText}>
  //                   Continue with Free Version
  //                 </Text>
  //               </TouchableOpacity>
  //             </View>

  //             {/* Footer */}
  //             <View style={styles.footer}>
  //               <Text style={styles.footerText}>{paywall.footer}</Text>
  //             </View>
  //           </ScrollView>
  //         </View>
  //       </View>
  //     </Modal>
  //   );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "flex-end",
    },
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
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    featureIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      borderWidth: 1,
      borderColor: theme.colors.brandYellow,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      fontWeight: "500",
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
    disabledButton: {
      opacity: 0.6,
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

    realPurchaseHeader: {
      padding: 24,
      paddingTop: 60,
      paddingBottom: 32,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    limitedTimeBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 20,
      marginBottom: 20,
    },
    limitedTimeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
    },
    mainOfferContainer: {
      alignItems: "center",
    },
    realPurchaseTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.white,
      textAlign: "center",
      marginBottom: 12,
    },
    realPurchaseSubtitle: {
      fontSize: 16,
      color: theme.colors.whiteOverlay90,
      textAlign: "center",
      lineHeight: 22,
    },
    massivePricingCard: {
      marginBottom: 24,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    priceComparison: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    originalPriceLabel: {
      fontSize: 18,
      color: theme.colors.whiteOverlay70,
      marginRight: 12,
    },
    originalPriceMassive: {
      fontSize: 18,
      color: theme.colors.whiteOverlay70,
    },
    discountBanner: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 8,
    },
    discountPercent: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.white,
    },
    currentPriceContainer: {
      alignItems: "center",
    },
    currentPriceLabel: {
      fontSize: 18,
      color: theme.colors.whiteOverlay70,
      marginBottom: 4,
    },
    currentPriceMassive: {
      fontSize: 36,
      fontWeight: "700",
      color: theme.colors.white,
    },
    freeTrialHighlight: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 20,
      marginBottom: 20,
    },
    freeTrialText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
    },
    socialProofContainer: {
      alignItems: "center",
    },
    socialProofText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
    },
    socialProofSubtext: {
      fontSize: 12,
      color: theme.colors.whiteOverlay90,
    },
    realPurchaseContent: {
      flex: 1,
    },
    realPurchaseContentContainer: {
      padding: 24,
      paddingTop: 0,
    },
    whatYouGetSection: {
      marginBottom: 32,
    },
    whatYouGetTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    premiumFeaturesList: {
      gap: 12,
    },
    premiumFeatureItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    featureIconBig: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      borderWidth: 1,
      borderColor: theme.colors.brandYellow,
    },
    premiumFeatureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      fontWeight: "500",
    },
    testimonialsSection: {
      marginBottom: 32,
    },
    testimonialsTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    testimonialCardReal: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    testimonialQuote: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
    },
    testimonialAuthorReal: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    testimonialStars: {
      flexDirection: "row",
      alignItems: "center",
    },
    starsText: {
      fontSize: 14,
      color: theme.colors.brandYellow,
    },
    urgencySection: {
      marginBottom: 32,
    },
    urgencyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    urgencyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    bottomActionBar: {
      marginBottom: 24,
    },
    massivePurchaseButton: {
      borderRadius: 16,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    massiveButtonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 16,
      alignItems: "center",
    },
    massiveButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.white,
      marginBottom: 2,
    },
    massiveButtonSubtext: {
      fontSize: 14,
      color: theme.colors.whiteOverlay90,
    },
    restoreButtonReal: {
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 8,
    },
    restoreTextReal: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.brandYellow,
    },
    trustBadges: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 20,
      marginBottom: 20,
    },
    trustBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.white,
    },

    // Modern Clean Design Styles
    modernContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: screenHeight * 0.9,
      width: "100%",
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    modernHeader: {
      backgroundColor: theme.colors.surface,
      paddingTop: 50,
      paddingHorizontal: 24,
      paddingBottom: 32,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modernCloseButton: {
      alignSelf: "flex-end",
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerContent: {
      alignItems: "center",
    },
    premiumBadge: {
      backgroundColor: theme.colors.brandYellow,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 16,
    },
    premiumBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.background,
      letterSpacing: 0.5,
    },
    modernTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 30,
    },
    modernSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    modernContent: {
      flex: 1,
    },
    modernContentContainer: {
      padding: 24,
    },
    pricingSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
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
      color: theme.colors.text,
    },
    savingsBadge: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    savingsText: {
      fontSize: 12,
      fontWeight: "600",
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
      fontSize: 48,
      fontWeight: "700",
      color: theme.colors.text,
    },
    periodText: {
      fontSize: 18,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    monthlyEquivalent: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    originalPriceStrike: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textDecorationLine: "line-through",
    },
    trialCallout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
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
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    featuresList: {
      gap: 16,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    featureIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      marginTop: 2,
      borderWidth: 1,
      borderColor: theme.colors.brandYellow,
    },
    modernFeatureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      lineHeight: 24,
    },
    socialProofSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    ratingDisplay: {
      alignItems: "center",
      marginBottom: 20,
    },
    ratingStars: {
      fontSize: 20,
      color: theme.colors.brandYellow,
      marginBottom: 4,
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
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.brandYellow,
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
      fontWeight: "500",
    },
    ctaSection: {
      padding: 24,
      paddingTop: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    primaryCTA: {
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    ctaGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderRadius: 16,
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
  });
