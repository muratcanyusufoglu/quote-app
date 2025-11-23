import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationBar } from "../../components/layout/NavigationBar";
import { PaywallModal } from "../../components/ui/PaywallModal";
import categoriesData from "../../data/categories.json";
import { usePaywall } from "../../hooks/usePaywall";
import { usePremium } from "../../hooks/usePremium";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import {
  useOnboardingActions,
  useUserPreferences,
} from "../../store/useOnboardingStore";
import { useTheme } from "../../utils/ThemeContext";
import {
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "../../utils/language";
import { getCategoryIcon } from "../../utils/theme";

interface CategoryItem {
  id: string;
  names: Record<string, string>;
  descriptions: Record<string, string>;
  icon: string;
  color: string;
  isPremium: boolean;
}

export function SettingsScreen() {
  const { theme } = useTheme();
  const common = useCommonTranslations();
  const settings = useScreenTranslations("settings");
  const { isPremium } = usePremium();
  const { restorePurchases, showPremiumCategoryPaywall } = usePaywall();
  const userPreferences = useUserPreferences();
  const { updateAnswer, generatePreferences } = useOnboardingActions();

  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Get available categories from data
  const allCategories: CategoryItem[] = categoriesData.categories;

  // Filter categories by user's language
  const language = (userPreferences?.language || "tr") as SupportedLanguage;

  const handleRestorePurchase = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert(
        settings.restore_success || "Success",
        settings.restore_success_message || "Purchases restored successfully!"
      );
    }
  };

  const handlePremiumStatusPress = () => {
    if (!isPremium) {
      showPremiumCategoryPaywall();
    }
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    // Update the language in user preferences
    updateAnswer("languages", [newLanguage]);
    generatePreferences();
    setShowLanguageModal(false);
  };

  // Language flags mapping
  const languageFlags = {
    en: "🇬🇧",
    tr: "🇹🇷",
    fr: "🇫🇷",
    es: "🇪🇸",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    ru: "🇷🇺",
    nl: "🇳🇱",
    id: "🇮🇩",
    ja: "🇯🇵",
    th: "🇹🇭",
    ms: "🇲🇾",
  } as const;

  const handleCategoryToggle = (categoryId: string) => {
    if (!userPreferences) return;

    const currentCategories = userPreferences.selectedCategories || [];
    let newCategories: string[];

    if (currentCategories.includes(categoryId)) {
      // Remove category (but keep at least one)
      if (currentCategories.length > 1) {
        newCategories = currentCategories.filter((id) => id !== categoryId);
      } else {
        Alert.alert(
          settings.minimum_categories_title || "Minimum Categories",
          settings.minimum_categories_message ||
            "You must have at least one category selected."
        );
        return;
      }
    } else {
      // Add category
      newCategories = [...currentCategories, categoryId];
    }

    // Update the onboarding store
    updateAnswer("topics", newCategories);
    generatePreferences();
  };

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => {
    const isSelected =
      userPreferences?.selectedCategories?.includes(item.id) || false;
    const categoryName =
      item.names[language] || item.names["en"] || item.names["tr"];
    const categoryDescription =
      item.descriptions[language] ||
      item.descriptions["en"] ||
      item.descriptions["tr"];
    const isAccessible = isPremium || !item.isPremium;

    const cardStyles = {
      backgroundColor: isSelected
        ? `${theme.colors.brandYellow}20`
        : theme.colors.whiteOverlay20,
      borderColor: isSelected
        ? theme.colors.brandYellow
        : theme.colors.whiteOverlay25,
      borderWidth: isSelected ? 2 : 1,
      opacity: isAccessible ? 1 : 0.6,
    };

    return (
      <TouchableOpacity
        style={[styles.categoryItem, cardStyles]}
        onPress={() => isAccessible && handleCategoryToggle(item.id)}
        disabled={!isAccessible}
        activeOpacity={0.8}
      >
        {isSelected && (
          <LinearGradient
            colors={[
              `${theme.colors.brandYellow}15`,
              `${theme.colors.premium}10`,
              `${theme.colors.brandYellow}15`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <LinearGradient
          colors={[
            "transparent",
            isSelected ? `${theme.colors.brandYellow}05` : "transparent",
          ]}
          style={[styles.categoryContent, { borderRadius: 12 }]}
        >
          {/* Category Icon - IconSymbol with emoji fallback */}
          <View style={styles.categoryIconContainer}>
            {getCategoryIcon(item.id) ? (
              <IconSymbol
                name={getCategoryIcon(item.id) as any}
                size={24}
                color={
                  isSelected
                    ? theme.colors.brandYellow
                    : theme.colors.text
                }
                strokeWidth={2}
              />
            ) : (
              <Text
                style={[
                  styles.categoryIcon,
                  {
                    color: isSelected
                      ? theme.colors.brandYellow
                      : theme.colors.text,
                  },
                ]}
              >
                {item.icon || "💭"}
              </Text>
            )}
          </View>
          <View style={styles.categoryInfo}>
            <Text
              style={[
                styles.categoryName,
                {
                  color: isSelected
                    ? theme.colors.text
                    : theme.colors.text,
                  fontWeight: isSelected ? "700" : "600",
                },
              ]}
            >
              {categoryName}
            </Text>
            <Text
              style={[
                styles.categoryDescription,
                {
                  color: isSelected
                    ? theme.colors.textSecondary
                    : theme.colors.textSecondary,
                  opacity: 0.95,
                },
              ]}
            >
              {categoryDescription}
            </Text>
          </View>
          {!isAccessible && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
          {isSelected && (
            <IconSymbol
              name="checkmark"
              size={20}
              color={theme.colors.brandYellow}
              strokeWidth={2.5}
              style={styles.checkIcon}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSettingCard = (
    icon: string,
    title: string,
    subtitle: string,
    onPress?: () => void,
    showArrow = false
  ) => {
    const cardStyles = {
      backgroundColor: theme.colors.whiteOverlay20,
      borderColor: theme.colors.whiteOverlay25,
      borderWidth: 1,
    };

    return (
      <TouchableOpacity
        style={[styles.settingItem, cardStyles]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
      >
        <LinearGradient
          colors={["transparent", "transparent"]}
          style={[styles.settingContent, { borderRadius: 12 }]}
        >
          <IconSymbol
            name={icon as any}
            size={24}
            color={theme.colors.text}
            strokeWidth={2}
            style={styles.settingIcon}
          />
          <View style={styles.settingInfo}>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: theme.colors.text,
                  fontWeight: "600",
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.settingSubtitle,
                {
                  color: theme.colors.textSecondary,
                  opacity: 0.95,
                },
              ]}
            >
              {subtitle}
            </Text>
          </View>
          {showArrow && (
            <IconSymbol
              name="chevron.right"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.arrowIcon}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
      >
        {settings.general || "General Settings"}
      </Text>

      {renderSettingCard(
        "person",
        settings.user_name || "User Name",
        userPreferences?.userName || "User"
      )}

      {renderSettingCard(
        "compass",
        settings.language || "Language",
        `${languageFlags[language]} ${LANGUAGE_NAMES[language]}`,
        () => setShowLanguageModal(true),
        true
      )}

      {renderSettingCard(
        "crown",
        settings.premium_status || "Premium Status",
        isPremium ? common.premium || "Premium" : common.free || "Free",
        handlePremiumStatusPress,
        !isPremium
      )}

      {renderSettingCard(
        "refresh-cw",
        settings.restore_purchase || "Restore Purchase",
        settings.restore_purchase_subtitle || "Restore your previous purchases",
        handleRestorePurchase,
        true
      )}

      {renderSettingCard(
        "shield",
        settings.privacy_policy || "Privacy Policy",
        settings.privacy_policy_subtitle || "View our privacy policy",
        () => Linking.openURL("https://quotesparkapp.netlify.app/privacy"),
        true
      )}

      {renderSettingCard(
        "book",
        settings.terms_of_use || "Terms of Use",
        settings.terms_of_use_subtitle || "Apple Standard EULA",
        () =>
          Linking.openURL(
            "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
          ),
        true
      )}
    </View>
  );

  const renderCategorySettings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.text }]}
        >
          {settings.my_categories || "My Categories"}
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          {settings.categories_subtitle || "Customize which categories you see"}
        </Text>
      </View>

      <FlatList
        data={allCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        scrollEnabled={false}
      />
    </View>
  );

  const renderLanguageModal = () => (
    <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
      <TouchableOpacity
        style={styles.modalBackdrop}
        onPress={() => setShowLanguageModal(false)}
        activeOpacity={1}
      />
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[styles.modalTitle, { color: theme.colors.text }]}
          >
            {settings.select_language || "Select Language"}
          </Text>

          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            {SUPPORTED_LANGUAGES.map((langCode) => (
              <TouchableOpacity
                key={langCode}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor:
                        language === langCode
                          ? `${theme.colors.brandYellow}30`
                          : theme.colors.whiteOverlay20,
                      borderColor:
                        language === langCode
                          ? theme.colors.brandYellow
                          : theme.colors.border,
                    },
                  ]}
                onPress={() => handleLanguageChange(langCode)}
              >
                <Text
                  style={[
                    styles.languageText,
                    { color: theme.colors.text },
                  ]}
                >
                  {languageFlags[langCode]} {LANGUAGE_NAMES[langCode]}
                </Text>
                {language === langCode && (
                  <IconSymbol
                    name="checkmark"
                    size={20}
                    color={theme.colors.brandYellow}
                    strokeWidth={2.5}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <BaseScreen style={styles.container} useGradientBackground={true}>
        <View style={styles.content}>
          {/* Navigation Bar */}
          <NavigationBar />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderGeneralSettings()}
            {renderCategorySettings()}
          </ScrollView>

          {/* Language Modal */}
        </View>
      </BaseScreen>
      {showLanguageModal && renderLanguageModal()}
      <PaywallModal onClose={() => {}} onPurchase={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    position: "relative",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    position: "relative",
  },
  categoryIconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    lineHeight: 20,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  premiumBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  checkIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 350,
    maxHeight: "70%",
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "500",
  },
  languageScrollView: {
    maxHeight: 400,
  },
});
