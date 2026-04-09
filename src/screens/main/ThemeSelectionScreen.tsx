import {LinearGradient} from "expo-linear-gradient";
import React, {useEffect} from "react";
import {
  Dimensions,
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
import {useTranslation} from "../../hooks/useTranslation";
import {getThemeByOption, themeMetadata} from "../../utils/theme";
import {useTheme} from "../../utils/ThemeContext";

type ThemeOption =
  | "aura"
  | "uprising"
  | "ocean"
  | "forest"
  | "sunset"
  | "purple"
  | "minimalist";

const CARD_GAP = 12;
const SCREEN_PADDING = 16;
const CARD_WIDTH =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

// Sample quote shown on each card preview
const PREVIEW_QUOTES: Record<ThemeOption, string> = {
  aura: "Every day is a new beginning.",
  uprising: "Believe you can and you're halfway there.",
  ocean: "Calm mind brings inner strength.",
  forest: "Simplicity is the ultimate sophistication.",
  sunset: "Be rooted. Be present. Be you.",
  purple: "Dare to live the life you imagined.",
  minimalist: "Less, but better.",
};

const GRADIENT_COLORS: Record<ThemeOption, string[]> = {
  aura: ["#141210", "#1C1916", "#C8965A", "#E8C97A"],
  uprising: ["#FCE38A", "#FAC73C", "#F38181", "#EF5757"],
  ocean: ["#0A0D13", "#1C2331", "#273449", "#3A5F8A"],
  forest: ["#E8E4DC", "#F3EFE9", "#D0C8BC", "#9BA89A"],
  sunset: ["#E6D5C3", "#D4BFA6", "#B89880", "#8C6B50"],
  purple: ["#020617", "#0F172A", "#3B1F5E", "#7C3AED"],
  minimalist: ["#0F0F10", "#1C1C1E", "#2C2C2E", "#3A3A3C"],
};

// Whether the card needs light text
const LIGHT_TEXT_THEMES: ThemeOption[] = [
  "aura",
  "ocean",
  "purple",
  "minimalist",
];

export function ThemeSelectionScreen() {
  const {theme, selectedTheme, setSelectedTheme, isDark} = useTheme();
  const {trackScreen, trackThemeChange} = useAnalytics();
  const {t} = useTranslation();

  useEffect(() => {
    trackScreen("ThemeSelectionScreen", "ThemeSelectionScreen");
  }, [trackScreen]);

  const handleThemeSelect = (themeOption: ThemeOption) => {
    trackThemeChange(selectedTheme, themeOption);
    setSelectedTheme(themeOption);
  };

  const isLightText = (key: ThemeOption) => LIGHT_TEXT_THEMES.includes(key);

  const themeKeys = Object.keys(themeMetadata) as ThemeOption[];

  return (
    <BaseScreen style={styles.container} useGradientBackground={true}>
      <View style={styles.content}>
        <NavigationBar />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t("themes.title" as any) || "Themes"}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section label */}
          <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
            {t("themes.color_themes" as any) || "Color Themes"}
          </Text>

          {/* 2-column grid */}
          <View style={styles.grid}>
            {themeKeys.map((key) => {
              const isSelected = selectedTheme === key;
              const lightText = isLightText(key);
              const textColor = lightText
                ? "rgba(255,255,255,0.92)"
                : "rgba(30,20,10,0.88)";
              const subColor = lightText
                ? "rgba(255,255,255,0.6)"
                : "rgba(30,20,10,0.5)";
              const name = t(`themes.${key}.name` as any) || key;
              const quote = PREVIEW_QUOTES[key];

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.card,
                    isSelected && {
                      borderWidth: 2.5,
                      borderColor: theme.colors.brandYellow,
                    },
                  ]}
                  onPress={() => handleThemeSelect(key)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={GRADIENT_COLORS[key] as any}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.cardGradient}
                  >
                    {/* Quote preview text */}
                    <Text
                      style={[styles.quoteText, {color: textColor}]}
                      numberOfLines={3}
                    >
                      {quote}
                    </Text>

                    {/* Bottom row: theme name + checkmark */}
                    <View style={styles.cardBottom}>
                      <Text style={[styles.themeName, {color: subColor}]}>
                        {name}
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.checkBadge,
                            {backgroundColor: theme.colors.brandYellow},
                          ]}
                        >
                          <IconSymbol
                            name="checkmark"
                            size={11}
                            color={lightText ? "#1A1208" : "#FFFFFF"}
                          />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{height: 40}} />
        </ScrollView>
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
    paddingHorizontal: SCREEN_PADDING,
  },
  header: {
    marginTop: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  scrollContent: {
    paddingTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 14,
    marginTop: 6,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 0,
    borderColor: "transparent",
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  quoteText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.1,
    flex: 1,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  themeName: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
});
