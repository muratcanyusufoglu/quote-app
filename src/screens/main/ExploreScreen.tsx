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
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import { useQuoteCategories } from "../../hooks/useQuoteService";
import { useOnboardingHydrated } from "../../store/useOnboardingStore";
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

  // Hydration checks
  const quoteStoreHydrated = useHasHydrated();
  const purchaseStoreHydrated = usePurchaseHydrated();
  const onboardingStoreHydrated = useOnboardingHydrated();

  // Categories
  const { availableCategories, premiumCategories } = useQuoteCategories();

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to home page with selected category
    // You can pass the category as a parameter or set it in a store
    router.push({
      pathname: "/(tabs)",
      params: { selectedCategory: categoryId },
    });
  };

  const renderCategoryCard = ({ item: category }: { item: any }) => {
    const isPremiumCategory = premiumCategories.some(
      (cat) => cat.id === category.id
    );
    const canAccess = isPremium || !isPremiumCategory;
    const categoryColor = getCategoryColor(category.id, isDark);
    const categoryIcon =
      categoryIcons[category.id as keyof typeof categoryIcons] || "💭";

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: canAccess ? categoryColor : theme.colors.surface,
            opacity: canAccess ? 1 : 0.6,
          },
        ]}
        onPress={() => canAccess && handleCategoryPress(category.id)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryCardContent}>
          {/* Category Icon */}
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>

          {/* Category Name */}
          <Text
            style={[
              styles.categoryName,
              { color: canAccess ? "#FFFFFF" : theme.colors.textSecondary },
            ]}
          >
            {category.name}
          </Text>

          {/* Premium Lock */}
          {!canAccess && (
            <View style={styles.lockContainer}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}

          {/* Category Description */}
          {category.description && (
            <Text
              style={[
                styles.categoryDescription,
                {
                  color: canAccess
                    ? "rgba(255,255,255,0.9)"
                    : theme.colors.textTertiary,
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
            İlginizi çeken bir kategori seçin
          </Text>
        </View>

        {/* Categories Grid */}
        <FlatList
          data={availableCategories}
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
  categoryIcon: {
    fontSize: 32,
    textAlign: "center",
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
  lockContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 12,
  },
});
