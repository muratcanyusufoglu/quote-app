import { router } from "expo-router";
import React from "react";
import {
  Alert,
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

  // Categories - Show ALL categories to everyone
  const { availableCategories } = useQuoteCategories();

  const handleCategoryPress = (categoryId: string) => {
    // Check if user can access this category
    const isGeneralCategory =
      categoryId.toLowerCase() === "general" ||
      categoryId.toLowerCase() === "genel";

    if (!isPremium && !isGeneralCategory) {
      // Show premium required alert
      Alert.alert(
        "Premium Gerekli",
        "Bu kategoriye erişmek için premium üyelik gereklidir. Premium olmak ister misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Premium Ol",
            onPress: () => {
              // Navigate to purchase screen
              router.push("/purchase" as any);
            },
          },
        ]
      );
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
            opacity: canAccess ? 1 : 0.7,
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

          {/* Premium Lock - Show for non-premium users on non-general categories */}
          {!canAccess && (
            <View style={styles.lockContainer}>
              <IconSymbol
                name="lock"
                size={12}
                color="#FFFFFF"
                strokeWidth={2}
              />
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
              : "Premium üyelikle tüm kategorilere erişebilirsiniz"}
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
  lockContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
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
