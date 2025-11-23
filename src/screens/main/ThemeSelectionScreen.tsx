import {LinearGradient} from "expo-linear-gradient";
import React, {useEffect} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import {NavigationBar} from "../../components/layout/NavigationBar";
import {useAnalytics} from "../../hooks/useAnalytics";
import {
  useCommonTranslations,
  useTranslation,
} from "../../hooks/useTranslation";
import {getThemeByOption, themeMetadata} from "../../utils/theme";
import {useTheme} from "../../utils/ThemeContext";

// Define types locally to match ThemeContext
type ThemeOption =
  | "uprising"
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

  // Analytics
  const {trackScreen, trackThemeChange} = useAnalytics();

  const common = useCommonTranslations();
  const {t, tNamespace} = useTranslation();
  const themeTranslations = tNamespace("themes");

  // Track screen view
  useEffect(() => {
    trackScreen("ThemeSelectionScreen", "ThemeSelectionScreen");
  }, [trackScreen]);

  const handleThemeSelect = (themeOption: ThemeOption) => {
    const oldTheme = selectedTheme;
    setSelectedTheme(themeOption);

    // Track theme change
    trackThemeChange(oldTheme, themeOption);

    console.log(`🎨 Theme selected: ${themeOption}`);
  };

  const handleColorSchemeSelect = (scheme: ColorScheme) => {
    const oldScheme = colorScheme;
    setColorScheme(scheme);

    // Track color scheme change
    trackThemeChange(
      `${selectedTheme}_${oldScheme}`,
      `${selectedTheme}_${scheme}`
    );

    console.log(`🌓 Color scheme selected: ${scheme}`);
  };

  const styles = createStyles(theme);

  // Helper function to create smooth gradients for each theme - matching actual theme colors
  const getSmoothGradientColors = (
    themeKey: ThemeOption,
    previewTheme: any
  ): string[] => {
    const baseColors = {
      // Uprising - Classic Gradient Yellow to Pink (from HTML Variant 2)
      uprising: ["#FCE38A", "#FBD55A", "#FAC73C", "#F38181", "#EF5757"],
      // Ocean - Deep Blue & Navy
      ocean: ["#0A0D13", "#161C28", "#1C2331", "#273449", "#F4C47A"],
      // Forest - Light Minimalist
      forest: ["#E8E4DC", "#F3EFE9", "#FBF9F6", "#E0CDBA", "#4A5C6A"],
      // Sunset - Gradient Yellow to Pink
      sunset: ["#FCE38A", "#FBD55A", "#FAC73C", "#F38181", "#EF5757"],
      // Purple - Glassmorphism Dark
      purple: ["#020617", "#0F172A", "#111827", "#F59E0B", "#EC4899"],
      // Minimalist - Elegant Dark
      minimalist: ["#0F0F10", "#1C1C1E", "#2C2C2E", "#B8AB9F", "#D1C4B3"],
    };

    return baseColors[themeKey] || baseColors.uprising;
  };

  return (
    <BaseScreen style={styles.container} useGradientBackground={true}>
      <View style={styles.content}>
        {/* Navigation Bar */}
        <NavigationBar />

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, {color: theme.colors.white}]}>
            {themeTranslations.title}
          </Text>
          <Text style={[styles.subtitle, {color: "rgba(255, 255, 255, 0.8)"}]}>
            {themeTranslations.subtitle}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Color Scheme Section */}
          <View style={styles.section}>
            {/* <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
              {themeTranslations.brightness}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: "rgba(255, 255, 255, 0.7)" },
              ]}
            >
              {themeTranslations.brightness_description}
            </Text> */}

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
                      backgroundColor: theme.colors.whiteOverlay10,
                      borderColor:
                        colorScheme === option.key
                          ? theme.colors.brandYellow
                          : theme.colors.whiteOverlay20,
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
                        ? theme.colors.brandYellow
                        : theme.colors.white
                    }
                  />
                  <Text
                    style={[
                      styles.colorSchemeLabel,
                      {
                        color:
                          colorScheme === option.key
                            ? theme.colors.brandYellow
                            : theme.colors.white,
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
            <Text style={[styles.sectionTitle, {color: theme.colors.white}]}>
              {themeTranslations.color_themes}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                {color: "rgba(255, 255, 255, 0.7)"},
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

                // Get theme name and description from translations
                const themeName =
                  t(`themes.${themeKey}.name` as any) || themeKey;
                const themeDescription =
                  t(`themes.${themeKey}.description` as any) || "";

                return (
                  <TouchableOpacity
                    key={themeKey}
                    style={[
                      styles.themeOption,
                      {
                        borderColor: isSelected
                          ? theme.colors.brandYellow
                          : "transparent",
                        borderWidth: isSelected ? 3 : 0,
                        shadowColor: theme.colors.shadowColor,
                        shadowOffset: {width: 0, height: 4},
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                    ]}
                    onPress={() => handleThemeSelect(themeKey)}
                    activeOpacity={0.8}
                  >
                    {/* Theme Gradient Background */}
                    <LinearGradient
                      colors={
                        getSmoothGradientColors(themeKey, previewTheme) as any
                      }
                      locations={[0, 0.2, 0.5, 0.8, 1] as any}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.themeGradientBackground}
                    >
                      {/* Theme Preview Color Circle */}
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
                              color: "white",
                              fontWeight: isSelected ? "700" : "600",
                              textShadowColor: "rgba(0, 0, 0, 0.5)",
                              textShadowOffset: {width: 0, height: 1},
                              textShadowRadius: 3,
                            },
                          ]}
                        >
                          {themeName}
                        </Text>
                        <Text
                          style={[
                            styles.themeDescription,
                            {
                              color: "rgba(255, 255, 255, 0.95)",
                              textShadowColor: "rgba(0, 0, 0, 0.3)",
                              textShadowOffset: {width: 0, height: 1},
                              textShadowRadius: 2,
                            },
                          ]}
                        >
                          {themeDescription}
                        </Text>
                      </View>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <View
                          style={[
                            styles.selectionIndicator,
                            {backgroundColor: theme.colors.brandYellow},
                          ]}
                        >
                          <IconSymbol name="heart" size={16} color="#1a1a1a" />
                        </View>
                      )}

                      {/* Subtle Overlay for Better Text Readability */}
                      <LinearGradient
                        colors={[
                          "transparent",
                          "rgba(0, 0, 0, 0.05)",
                          "rgba(0, 0, 0, 0.15)",
                        ]}
                        locations={[0, 0.7, 1]}
                        style={styles.themeTextOverlay}
                        pointerEvents="none"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preview Section */}

          {/* Bottom spacing */}
          <View style={{height: 40}} />
        </ScrollView>
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
    scrollContent: {
      flex: 1,
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
      borderRadius: 20,
      minHeight: 80,
      overflow: "hidden",
    },
    themeGradientBackground: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      gap: 16,
      minHeight: 80,
      position: "relative",
    },
    themeTextOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    themePreview: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "rgba(0, 0, 0, 0.4)",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 6,
      zIndex: 2,
    },
    themeInfo: {
      flex: 1,
      zIndex: 2,
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
      zIndex: 3,
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
