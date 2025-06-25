import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useCommonTranslations,
  usePaywallTranslations,
} from "../../hooks/useTranslation";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { usePurchaseSelectors } from "../../store/usePurchaseStore";
import { PaywallTriggerSource } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PaywallModalProps {
  onClose?: () => void;
  onPurchase?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  onPurchase,
}) => {
  const { theme } = useTheme();
  const isVisible = usePaywallSelectors.isVisible();
  const triggerSource = usePaywallSelectors.triggerSource();
  const { hidePaywall } = usePaywallSelectors.actions();
  const isLoading = usePurchaseSelectors.isLoading();
  const { purchaseProduct } = usePurchaseSelectors.actions();

  // Translations
  const paywall = usePaywallTranslations();
  const common = useCommonTranslations();

  console.log("💰 PaywallModal render:", {
    isVisible,
    triggerSource,
    isLoading,
  });

  const styles = createStyles(theme);

  const getContent = (source: PaywallTriggerSource | null) => {
    switch (source) {
      case "welcome":
        return {
          title: paywall.welcome.title,
          subtitle: paywall.welcome.subtitle,
          features: [
            paywall.features.all_categories,
            paywall.features.unlimited_stories,
            paywall.features.personalized_content,
            paywall.features.daily_notifications,
            paywall.features.favorites_history,
          ],
          icon: "star",
          buttonText: paywall.welcome.button,
        };
      case "premium_category":
        return {
          title: paywall.premiumCategory.title,
          subtitle: paywall.premiumCategory.subtitle,
          features: [
            paywall.features.premium_categories,
            paywall.features.personalized_experience,
            paywall.features.unlimited_stories,
            paywall.features.ad_free,
          ],
          icon: "lock",
          buttonText: paywall.premiumCategory.button,
        };
      case "story_limit":
        return {
          title: paywall.storyLimit.title,
          subtitle: paywall.storyLimit.subtitle,
          features: [
            paywall.features.unlimited_stories,
            paywall.features.story_collections,
            paywall.features.audio_stories,
            paywall.features.offline_access,
          ],
          icon: "book",
          buttonText: paywall.storyLimit.button,
        };
      case "action_limit":
        return {
          title: paywall.actionLimit.title,
          subtitle: paywall.actionLimit.subtitle,
          features: [
            paywall.features.unlimited_access,
            paywall.features.premium_categories,
            paywall.features.advanced_personalization,
            paywall.features.priority_support,
          ],
          icon: "zap",
          buttonText: paywall.actionLimit.button,
        };
      default:
        return {
          title: paywall.default.title,
          subtitle: paywall.default.subtitle,
          features: [
            paywall.features.all_premium_features,
            paywall.features.unlimited_everything,
            paywall.features.personal_assistant,
            paywall.features.vip_support,
          ],
          icon: "crown",
          buttonText: paywall.default.button,
        };
    }
  };

  const content = getContent(triggerSource);

  const handleClose = () => {
    hidePaywall();
    onClose?.();
  };

  const handlePurchase = async () => {
    try {
      console.log("💰 Starting purchase process...");
      onPurchase?.();
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={{ fontSize: 24, color: theme.colors.textSecondary }}>
                ×
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={{ fontSize: 48, color: theme.colors.premium }}>
                  {content.icon === "star"
                    ? "⭐"
                    : content.icon === "lock"
                    ? "🔒"
                    : content.icon === "book"
                    ? "📚"
                    : content.icon === "zap"
                    ? "⚡"
                    : "👑"}
                </Text>
              </View>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.subtitle}>{content.subtitle}</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {content.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Text style={{ fontSize: 16, color: theme.colors.premium }}>
                      ✓
                    </Text>
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricingContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{paywall.pricing.monthly}</Text>
                <View style={styles.priceInfo}>
                  <Text style={styles.oldPrice}>
                    {paywall.pricing.old_price}
                  </Text>
                  <Text style={styles.newPrice}>
                    {paywall.pricing.new_price}
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {paywall.pricing.discount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handlePurchase}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? paywall.processing : content.buttonText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleClose}
              >
                <Text style={styles.secondaryButtonText}>
                  {common.maybe_later}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{paywall.footer}</Text>
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
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: screenHeight * 0.9,
      width: "100%",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    closeButton: {
      alignSelf: "flex-end",
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.premium,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    featuresContainer: {
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    pricingContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    priceLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    priceInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    oldPrice: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textDecorationLine: "line-through",
    },
    newPrice: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.premium,
    },
    discountBadge: {
      backgroundColor: theme.colors.premium,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    discountText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    actionContainer: {
      gap: 12,
      marginBottom: 24,
    },
    primaryButton: {
      backgroundColor: theme.colors.premium,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      shadowColor: theme.colors.premium,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    disabledButton: {
      opacity: 0.6,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    footer: {
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
  });
