import { router } from "expo-router";
import React from "react";
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
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import { useQuoteCategories } from "../../hooks/useQuoteService";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import {
  useIsPremium,
  usePurchaseHydrated,
} from "../../store/usePurchaseStore";
import { useHasHydrated } from "../../store/useQuoteStore";
import { getCategoryColor } from "../../utils/categoryColors";
import { categoryIcons } from "../../utils/theme";
import { useTheme } from "../../utils/ThemeContext";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

export function ExploreScreen() {
  // Theme
  const { theme, isDark } = useTheme();

  // Store data
  const isPremium = useIsPremium();
  const { showPaywall, trackAction } = usePaywallSelectors.actions();

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Categories - Show ALL categories to everyone
  const { allCategories } = useQuoteCategories();

  console.log("📋 All categories loaded:", allCategories.length);

  const handleCategoryPress = (categoryId: string) => {
    // Track user action for paywall trigger
    trackAction();

    // Check if user can access this category
    const isGeneralCategory =
      categoryId.toLowerCase() === "general" ||
      categoryId.toLowerCase() === "genel";

    if (!isPremium && !isGeneralCategory) {
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
    const categoryColor = getCategoryColor(category.id, isDark);
    const categoryIconName =
      categoryIcons[category.id as keyof typeof categoryIcons] ||
      "message-circle";

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
          {/* Category Icon - Now using IconSymbol */}
          <View style={styles.categoryIconContainer}>
            <IconSymbol
              name={categoryIconName as any}
              size={28}
              color="#FFFFFF"
              strokeWidth={2}
            />
          </View>

          {/* Category Name */}
          <Text style={[styles.categoryName, { color: "#FFFFFF" }]}>
            {category.name}
          </Text>

          {/* Premium Badge - Show for non-premium users on non-general categories */}
          {!canAccess && (
            <View style={styles.premiumBadge}>
              <IconSymbol
                name="star"
                size={10}
                color="#FFD700"
                strokeWidth={2}
              />
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}

          {/* Free badge for general category */}
          {isGeneralCategory && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>ÜCRETSİZ</Text>
            </View>
          )}

          {/* Category Description */}
          {category.description && (
            <Text
              style={[
                styles.categoryDescription,
                { color: "rgba(255,255,255,0.9)" },
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
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Yükleniyor...
          </Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen style={styles.container}>
      <NavigationHeader title="Keşfet" currentRoute="/(tabs)/explore" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Kategoriler
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {isPremium
              ? "İstediğiniz kategoriyi seçebilirsiniz"
              : "Premium kategorileri denemek için dokunun"}
          </Text>
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

const styles = StyleSheet.create({
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  categoriesContainer: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
  },
  separator: {
    height: 16,
  },
  categoryCard: {
    width: ITEM_WIDTH,
    minHeight: 140,
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: "#000",
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
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  premiumBadgeText: {
    fontSize: 8,
    color: "#FFD700",
    fontWeight: "700",
  },
  freeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
