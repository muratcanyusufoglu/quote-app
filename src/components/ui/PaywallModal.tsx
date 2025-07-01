import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
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
        "Error",
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
          title: "Welcome to Premium! 🎉",
          subtitle:
            "Unlock unlimited inspiration and transform your daily routine",
          features: [
            "Unlimited daily quotes",
            "Access to all premium categories",
            "Inspiring stories behind quotes",
            "Advanced personalization",
            "Exclusive motivational content",
            "Ad-free experience",
            "Offline reading mode",
            "Weekly inspiration insights",
          ],
          cta: "Start Free Trial",
          highlight: "3 days free, then $39.99/year",
        };

      case "premium_category":
        return {
          title: "Unlock Premium Categories 🔓",
          subtitle: "Access exclusive content designed for personal growth",
          features: [
            "Leadership & Success quotes",
            "Mindfulness & Spirituality",
            "Advanced personal development",
            "Exclusive author collections",
            "Deep-dive stories & context",
            "Personalized recommendations",
            "Priority content updates",
            "Expert-curated collections",
          ],
          cta: "Get Premium Access",
          highlight: "Join 50,000+ premium members",
        };

      case "story_limit":
        return {
          title: "Stories Await You! 📖",
          subtitle: "Discover the powerful stories behind life-changing quotes",
          features: [
            "Unlimited story access",
            "Historical quote contexts",
            "Author biographies",
            "Motivational backgrounds",
            "Lesson summaries",
            "Shareable insights",
            "Offline story library",
            "Weekly story collections",
          ],
          cta: "Unlock All Stories",
          highlight: "Over 1,000 inspiring stories included",
        };

      case "action_limit":
        return {
          title: "Continue Your Journey! 🚀",
          subtitle: "Don't let limits stop your personal growth",
          features: [
            "Unlimited daily interactions",
            "No action restrictions",
            "Full app functionality",
            "Premium quote collections",
            "Advanced sharing options",
            "Personalized insights",
            "Progress tracking",
            "Unlimited favorites",
          ],
          cta: "Remove All Limits",
          highlight: "Unlimited access for life",
        };

      case "real_purchase":
        return {
          title: "Transform Your Life Today! ✨",
          subtitle:
            "Join thousands who changed their mindset with daily inspiration",
          features: [
            "🎯 10,000+ hand-picked quotes from world leaders",
            "📚 Exclusive stories & life lessons from successful people",
            "🧠 AI-powered personalization based on your goals",
            "🔥 Daily motivational challenges to build habits",
            "📊 Track your personal growth & mindset shifts",
            "🌟 Access to premium authors & thought leaders",
            "💎 Ad-free, distraction-free reading experience",
            "🚀 Weekly live inspiration sessions (Premium only)",
          ],
          cta: "Transform My Life Now",
          highlight: "⚡ Limited Time: 67% OFF - Only $39.99/year",
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
          title: "Upgrade to Premium 🌟",
          subtitle: "Unlock your full potential with unlimited access",
          features: [
            "Unlimited quotes & stories",
            "All premium categories",
            "Personalized experience",
            "Ad-free reading",
            "Offline access",
            "Progress tracking",
            "Priority support",
            "Exclusive content",
          ],
          cta: "Get Premium",
          highlight: "Best value plan",
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
      Alert.alert("Error", "No subscription package available");
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
          "Purchase Successful! 🎉",
          "Welcome to Premium! You now have access to all premium features.",
          [
            {
              text: "Get Started",
              onPress: () => {
                hidePaywall();
                onPurchase?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Purchase Failed",
          result.error ||
            "An error occurred during purchase. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(
        "Purchase Error",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK" }]
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
          "Purchases Restored",
          "Your previous purchases have been restored successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                hidePaywall();
                onPurchase?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "No previous purchases were found to restore.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Restore purchases error:", error);
      Alert.alert(
        "Restore Error",
        "Failed to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  // Special layout for real purchase paywall
  if (triggerSource === ("real_purchase" as any)) {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.backdrop}>
          <View style={styles.modernContainer}>
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
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
                <Text style={styles.modernTitle}>
                  Unlock Your Full Potential
                </Text>
                <Text style={styles.modernSubtitle}>
                  Get unlimited access to all premium features
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
                  <Text style={styles.planName}>Annual Premium Plan</Text>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save 67%</Text>
                  </View>
                </View>

                <View style={styles.priceDisplay}>
                  <View style={styles.modernPriceRow}>
                    <Text style={styles.mainPrice}>$39.99</Text>
                    <Text style={styles.periodText}>/year</Text>
                  </View>
                  <Text style={styles.monthlyEquivalent}>
                    Just $3.33 per month
                  </Text>
                  <Text style={styles.originalPriceStrike}>
                    Regular price: $59.99
                  </Text>
                </View>

                <View style={styles.trialCallout}>
                  <IconSymbol
                    name="sparkles"
                    size={16}
                    color={theme.colors.brandYellow}
                  />
                  <Text style={styles.trialText}>Start with 3 days free</Text>
                </View>
              </View>

              {/* Features Section */}
              <View style={styles.modernFeaturesSection}>
                <Text style={styles.sectionTitle}>What's included:</Text>
                <View style={styles.featuresList}>
                  {content.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={styles.featureIcon}>
                        <IconSymbol
                          name="checkmark"
                          size={14}
                          color={theme.colors.brandYellow}
                          strokeWidth={3}
                        />
                      </View>
                      <Text style={styles.modernFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Social Proof Section */}
              <View style={styles.socialProofSection}>
                <View style={styles.ratingDisplay}>
                  <Text style={styles.ratingStars}>★★★★★</Text>
                  <Text style={styles.ratingText}>4.9 • 50,000+ users</Text>
                </View>

                {content.testimonials && content.testimonials.length > 0 && (
                  <View style={styles.testimonialsContainer}>
                    {content.testimonials.map((testimonial, index) => (
                      <View key={index} style={styles.modernTestimonialCard}>
                        <Text style={styles.modernTestimonialText}>
                          "{testimonial.text}"
                        </Text>
                        <Text style={styles.modernTestimonialAuthor}>
                          {testimonial.author}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom CTA Section */}
            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={[styles.primaryCTA, isLoading && styles.disabledButton]}
                onPress={handlePurchase}
                disabled={isLoading || !subscriptionPackage}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.brandYellow]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>
                    {isLoading ? "Processing..." : "Start Free Trial"}
                  </Text>
                  <Text style={styles.ctaSubtext}>
                    3 days free, then $39.99/year
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreLink}
                onPress={handleRestorePurchases}
                disabled={isLoading}
              >
                <Text style={styles.restoreLinkText}>Restore Purchase</Text>
              </TouchableOpacity>

              <View style={styles.trustSection}>
                <Text style={styles.trustText}>
                  Cancel anytime • Secure payment • 30-day guarantee
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header with Gradient Background */}
          <LinearGradient
            colors={theme.colors.gradientColors as any}
            locations={theme.colors.gradientLocations as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <IconSymbol
                name="xmark"
                size={20}
                color={theme.colors.whiteOverlay80}
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Premium Icon */}
            <View style={styles.premiumIconContainer}>
              <LinearGradient
                colors={[theme.colors.brandYellow, theme.colors.premium]}
                style={styles.premiumIconGradient}
              >
                <IconSymbol
                  name="crown"
                  size={32}
                  color={theme.colors.white}
                  strokeWidth={2}
                />
              </LinearGradient>
            </View>

            {/* Header Text */}
            <Text style={styles.headerTitle}>{content.title}</Text>
            <Text style={styles.headerSubtitle}>{content.subtitle}</Text>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Pricing Card */}
            <PricingCard
              theme={theme}
              subscriptionPackage={subscriptionPackage}
            />

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>
                What you'll get with Premium:
              </Text>

              <View style={styles.featuresGrid}>
                {content.features.map((feature, index) => (
                  <PremiumFeature
                    key={index}
                    feature={feature}
                    theme={theme}
                    index={index}
                  />
                ))}
              </View>
            </View>

            {/* Testimonials for real_purchase */}
            {triggerSource === "real_purchase" && content.testimonials && (
              <View style={styles.testimonialsSection}>
                <Text style={styles.testimonialsTitle}>
                  What Our Premium Members Say:
                </Text>
                {content.testimonials.map((testimonial, index) => (
                  <View key={index} style={styles.testimonialCardReal}>
                    <Text style={styles.testimonialQuote}>
                      "{testimonial.text}"
                    </Text>
                    <Text style={styles.testimonialAuthorReal}>
                      — {testimonial.author}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handlePurchase}
                disabled={isLoading || !subscriptionPackage}
              >
                <LinearGradient
                  colors={[theme.colors.brandYellow, theme.colors.premium]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Processing..." : content.cta}
                  </Text>
                  {subscriptionPackage && (
                    <Text style={styles.primaryButtonSubtext}>
                      {content.highlight}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={isLoading}
              >
                <Text style={styles.restoreButtonText}>
                  Restore Previous Purchases
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
              >
                <Text style={styles.secondaryButtonText}>
                  Continue with Free Version
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Cancel anytime. Auto-renewal can be turned off in Account
                Settings.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
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
