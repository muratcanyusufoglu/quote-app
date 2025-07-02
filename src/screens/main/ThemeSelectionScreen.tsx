import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import { NavigationHeader } from "../../components/layout/NavigationHeader";
import {
  useCommonTranslations,
  useScreenTranslations,
} from "../../hooks/useTranslation";
import { getThemeByOption, themeMetadata } from "../../utils/theme";
import { useTheme } from "../../utils/ThemeContext";

// Define types locally to match ThemeContext
type ThemeOption =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "purple"
  | "minimalist";
type ColorScheme = "light" | "dark" | "system";

export function ThemeSelectionScreen() {
  const {
    theme,
    selectedTheme,
    colorScheme,
    setSelectedTheme,
    setColorScheme,
    isDark,
  } = useTheme();
  const common = useCommonTranslations();
  const themeTranslations = useScreenTranslations("themes");

  const handleThemeSelect = (themeOption: ThemeOption) => {
    setSelectedTheme(themeOption);
    console.log(`🎨 Theme selected: ${themeOption}`);
  };

  const handleColorSchemeSelect = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    console.log(`🌓 Color scheme selected: ${scheme}`);
  };

  const styles = createStyles(theme);

  return (
    <BaseScreen>
      <NavigationHeader
        title={themeTranslations.title}
        currentRoute="/themes"
        showBackButton={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Color Scheme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {themeTranslations.brightness}
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {themeTranslations.brightness_description}
          </Text>

          <View style={styles.optionsGrid}>
            {[
              {
                key: "light" as ColorScheme,
                icon: "sunrise" as const,
                label: themeTranslations.light,
              },
              {
                key: "dark" as ColorScheme,
                icon: "moon" as const,
                label: themeTranslations.dark,
              },
              {
                key: "system" as ColorScheme,
                icon: "home" as const,
                label: themeTranslations.system,
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.colorSchemeOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor:
                      colorScheme === option.key
                        ? theme.colors.primary
                        : theme.colors.border,
                    borderWidth: colorScheme === option.key ? 2 : 1,
                  },
                ]}
                onPress={() => handleColorSchemeSelect(option.key)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={option.icon}
                  size={24}
                  color={
                    colorScheme === option.key
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.colorSchemeLabel,
                    {
                      color:
                        colorScheme === option.key
                          ? theme.colors.primary
                          : theme.colors.text,
                      fontWeight: colorScheme === option.key ? "600" : "500",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Selection Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {themeTranslations.color_themes}
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {themeTranslations.color_themes_description}
          </Text>

          <View style={styles.themesGrid}>
            {(Object.keys(themeMetadata) as ThemeOption[]).map((themeKey) => {
              const metadata = themeMetadata[themeKey];
              const isSelected = selectedTheme === themeKey;

              // Get preview theme for this option
              const previewTheme = getThemeByOption(themeKey, isDark);

              // Map theme icons to available icons
              const getValidIcon = (iconName: string) => {
                const iconMap: Record<string, any> = {
                  sun: "sunrise",
                  waves: "heart",
                  "tree-pine": "tree-pine",
                  sunset: "sunrise",
                  crown: "crown",
                  square: "menu",
                };
                return iconMap[iconName] || "heart";
              };

              // Use dark text for excellent readability on light theme backgrounds
              const cardBackgroundColor = previewTheme.colors.brandYellow;
              const textColor = "#1a1a1a"; // Dark text for all themes

              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: cardBackgroundColor,
                      borderColor: isSelected ? "#1a1a1a" : "transparent",
                      borderWidth: isSelected ? 3 : 0,
                      shadowColor: theme.colors.shadowColor,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 8,
                    },
                  ]}
                  onPress={() => handleThemeSelect(themeKey)}
                  activeOpacity={0.8}
                >
                  {/* Theme Preview Color */}
                  <View
                    style={[
                      styles.themePreview,
                      {
                        backgroundColor: previewTheme.colors.primary,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={getValidIcon(metadata.icon)}
                      size={20}
                      color="white"
                    />
                  </View>

                  {/* Theme Info */}
                  <View style={styles.themeInfo}>
                    <Text
                      style={[
                        styles.themeName,
                        {
                          color: textColor,
                          fontWeight: isSelected ? "700" : "600",
                        },
                      ]}
                    >
                      {metadata.name.tr}
                    </Text>
                    <Text
                      style={[
                        styles.themeDescription,
                        {
                          color: "rgba(26, 26, 26, 0.8)", // Dark text with opacity for secondary text
                        },
                      ]}
                    >
                      {metadata.description.tr}
                    </Text>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View
                      style={[
                        styles.selectionIndicator,
                        { backgroundColor: "rgba(26, 26, 26, 0.1)" },
                      ]}
                    >
                      <IconSymbol name="heart" size={16} color="#1a1a1a" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {themeTranslations.preview}
          </Text>
          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View
              style={[
                styles.previewGradient,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: 0.1,
                },
              ]}
            />
            <Text style={[styles.previewText, { color: theme.colors.text }]}>
              {themeTranslations.sample_text}
            </Text>
            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[
                  styles.previewButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.previewButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  {common.primary || "Birincil"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.previewButton,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {common.secondary || "İkincil"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </BaseScreen>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      marginBottom: 20,
      lineHeight: 20,
    },

    // Color Scheme Options
    optionsGrid: {
      flexDirection: "row",
      gap: 12,
    },
    colorSchemeOption: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 8,
    },
    colorSchemeLabel: {
      fontSize: 14,
      textAlign: "center",
    },

    // Theme Options
    themesGrid: {
      gap: 16,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderRadius: 20,
      gap: 16,
      minHeight: 80,
    },
    themePreview: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "rgba(0, 0, 0, 0.3)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 4,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 13,
      lineHeight: 18,
    },
    selectionIndicator: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },

    // Preview Section
    previewCard: {
      padding: 20,
      borderRadius: 16,
      position: "relative",
      overflow: "hidden",
    },
    previewGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    previewText: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      zIndex: 1,
    },
    previewButtons: {
      flexDirection: "row",
      gap: 12,
      zIndex: 1,
    },
    previewButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    previewButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
