import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationBar } from "../../components/layout/NavigationBar";
import { useAnalytics } from "../../hooks/useAnalytics";
import { usePremium } from "../../hooks/usePremium"; // UNIFIED: Single premium source
import { useQuoteCategories } from "../../hooks/useQuoteService";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { usePurchaseHydrated } from "../../store/usePurchaseStore";
import { useQuoteSelectors } from "../../store/useQuoteStore";
import { useTheme } from "../../utils/ThemeContext";
import { getCategoryIcon } from "../../utils/theme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

export function ExploreScreen() {
  // Theme
  const { theme, isDark } = useTheme();

  // Analytics
  const { trackScreen, trackCategoryView, trackPaywallView } = useAnalytics();

  // Progressive paywall tracking
  const { trackUserInteraction } = usePaywallSelectors.actions();

  // Store data
  const { isPremium } = usePremium(); // UNIFIED: Extract isPremium boolean
  const { showPaywall, trackAction } = usePaywallSelectors.actions();

  // Hydration checks
  const quoteStoreHydrated = useQuoteSelectors.hasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Categories - Show ALL categories to everyone
  const { allCategories } = useQuoteCategories();

  // Translations
  const explore = useScreenTranslations("explore");
  const common = useCommonTranslations();

  // Create styles with theme
  const styles = createStyles(theme);

  // Track screen view
  useEffect(() => {
    trackScreen("ExploreScreen", "ExploreScreen");
  }, [trackScreen]);

  console.log("📋 All categories loaded:", allCategories.length);

  // Debug: Log all categories and their icons
  if (allCategories.length > 0) {
    console.log("🎨 Category icon debugging:");
    allCategories.forEach((category) => {
      const iconName = getCategoryIcon(category.id);
      console.log(
        `  📁 ${category.id} -> ${iconName || `EMOJI: ${category.icon}`}`
      );
    });
  }

  const handleCategoryPress = (categoryId: string) => {
    // Track user action for paywall trigger
    trackAction();

    // Track user interaction for progressive paywall (only for non-premium users)
    if (!isPremium) {
      trackUserInteraction();
      console.log("🎯 User interaction tracked (category press)");
    } else {
      console.log("👑 Premium user - skipping interaction tracking");
    }

    // Find category data for analytics
    const category = allCategories.find((cat) => cat.id === categoryId);

    if (category) {
      // Track category view analytics
      trackCategoryView({
        category_id: category.id,
        category_name: category.name,
        is_premium: category.isPremium,
      });
    }

    // Check if user can access this category
    const isGeneralCategory =
      categoryId.toLowerCase() === "general" ||
      categoryId.toLowerCase() === "genel";

    if (!isPremium && !isGeneralCategory) {
      // Track paywall view
      trackPaywallView({
        trigger_source: "premium_category",
        user_action: "viewed",
      });

      // Show paywall modal for premium category
      showPaywall("premium_category");
      return;
    }

    // Navigate to home page with selected category
    router.push({
      pathname: "/(tabs)",
      params: { selectedCategory: categoryId },
    });
  };

  const renderCategoryCard = ({ item: category }: { item: any }) => {
    const isGeneralCategory =
      category.id.toLowerCase() === "general" ||
      category.id.toLowerCase() === "genel";
    const canAccess = isPremium || isGeneralCategory;

    // Kategori kartı için renk ayarları
    const categoryColor = theme.colors.brandYellow;

    // Arka plan rengi açık olduğu için koyu text kullan
    const textColor = "#2c3e50"; // Koyu mavi-gri, çok iyi contrast
    const iconColor = "#34495e"; // Biraz daha açık koyu gri
    const descriptionColor = "rgba(44, 62, 80, 0.8)"; // Şeffaflıklı koyu renk

    const categoryIconName = getCategoryIcon(category.id);

    // ENHANCED DEBUG: Let's see everything
    console.log(`🔍 DEBUGGING CATEGORY: ${category.id}`);
    console.log(`  → Icon mapping result: ${categoryIconName}`);
    console.log(`  → Category emoji: ${category.icon}`);

    // Test if the icon exists in IconSymbol
    if (categoryIconName) {
      console.log(`  → Testing icon "${categoryIconName}" in IconSymbol...`);
      console.log(`🎯 Will render IconSymbol with name: ${categoryIconName}`);
    } else {
      console.log(`😀 Will render emoji fallback: ${category.icon}`);
    }

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: categoryColor,
            opacity: canAccess ? 1 : 0.8, // Slightly less opacity for premium categories
          },
        ]}
        onPress={() => handleCategoryPress(category.id)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryCardContent}>
          {/* Category Icon - IconSymbol with emoji fallback */}
          <View style={styles.categoryIconContainer}>
            {categoryIconName ? (
              <IconSymbol
                name={categoryIconName as any}
                size={28}
                color={iconColor}
                strokeWidth={2}
              />
            ) : (
              <Text style={[styles.categoryEmoji, { color: iconColor }]}>
                {category.icon || "💭"}
              </Text>
            )}
          </View>

          {/* Category Name */}
          <Text
            style={[
              styles.categoryName,
              {
                color: textColor,
                textShadowColor: "rgba(255, 255, 255, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              },
            ]}
          >
            {category.name}
          </Text>

          {/* Premium Badge - Show for non-premium users on non-general categories */}
          {!canAccess && (
            <View style={styles.premiumBadge}>
              <IconSymbol
                name="star"
                size={10}
                color={theme.colors.goldAccent}
                strokeWidth={2}
              />
              <Text style={styles.premiumBadgeText}>{common.premium}</Text>
            </View>
          )}

          {/* Free badge for general category */}
          {isGeneralCategory && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>{common.free}</Text>
            </View>
          )}

          {/* Category Description */}
          {category.description && (
            <Text
              style={[
                styles.categoryDescription,
                {
                  color: descriptionColor,
                  textShadowColor: "rgba(255, 255, 255, 0.2)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                },
              ]}
            >
              {category.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading while stores are hydrating
  if (
    !quoteStoreHydrated ||
    !purchaseStoreHydrated ||
    !onboardingStoreHydrated
  ) {
    return (
      <BaseScreen useGradientBackground={true}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.white }]}>
            {common.loading}
          </Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen style={styles.container} useGradientBackground={true}>
      {/* <NavigationHeader title={explore.title} currentRoute="/(tabs)/explore" /> */}

      <View style={styles.content}>
        {/* Navigation Bar */}
        <NavigationBar />

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.white }]}>
                {explore.categories}
              </Text>
              <Text
                style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.8)" }]}
              >
                {isPremium ? explore.subtitle_premium : explore.subtitle_free}
              </Text>
            </View>

            {/* Theme Settings Button */}
          </View>
        </View>

        {/* Categories Grid */}
        <FlatList
          data={allCategories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </BaseScreen>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 18,
      fontWeight: "500",
      textAlign: "center",
    },
    headerContainer: {
      marginTop: 20,
      marginBottom: 24,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 22,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 16,
    },
    categoriesContainer: {
      paddingBottom: 40,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: 8,
    },
    separator: {
      height: 20,
    },
    categoryCard: {
      width: ITEM_WIDTH,
      minHeight: 140,
      borderRadius: 16,
      marginHorizontal: 4,
      overflow: "hidden",
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    categoryCardContent: {
      flex: 1,
      padding: 16,
      justifyContent: "space-between",
    },
    categoryIconContainer: {
      alignItems: "center",
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 4,
    },
    categoryDescription: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 16,
      opacity: 0.9,
    },
    premiumBadge: {
      backgroundColor: theme.colors.successLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-end",
    },
    premiumBadgeText: {
      fontSize: 8,
      color: theme.colors.goldAccent,
      fontWeight: "700",
    },
    freeBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.colors.successLight,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    freeBadgeText: {
      fontSize: 8,
      color: theme.colors.white,
      fontWeight: "700",
    },
    categoryEmoji: {
      fontSize: 28,
      textAlign: "center",
    },
    categoryOverlay: {
      flex: 1,
      backgroundColor: theme.colors.blackOverlay60,
      justifyContent: "space-between",
      padding: 16,
    },
    categoryContent: {
      alignItems: "center",
      gap: 8,
    },
    categoryFooter: {
      alignItems: "center",
    },
  });
