import Slider from "@react-native-community/slider";
import * as StoreReview from "expo-store-review";
import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {IconSymbol} from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import {
  OnboardingCard,
  OnboardingMultiCard,
  OnboardingTimeCard,
} from "../../components/onboarding";
import {getOnboardingQuestions} from "../../data/onboardingQuestions";
import {useAnalytics} from "../../hooks/useAnalytics";
import {
  useScreenTranslations,
  useTranslation,
} from "../../hooks/useTranslation";
import {useOnboardingActions} from "../../store/useOnboardingStore";
import {usePaywallSelectors} from "../../store/usePaywallStore";
import {NotificationService} from "../../services/NotificationService";
import {OnboardingAnswer, OnboardingOption} from "../../types";
import {useTheme} from "../../utils/ThemeContext";

const {height: screenHeight} = Dimensions.get("window");

export function OnboardingScreen() {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {addAnswer, generatePreferences, setCompleted} = useOnboardingActions();

  const {
    trackScreen,
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,
  } = useAnalytics();

  const onboarding = useScreenTranslations("onboarding");
  const {t} = useTranslation();

  const onboardingQuestions = getOnboardingQuestions((key: string) =>
    t(key as any)
  );

  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [fadeAnim] = useState(new Animated.Value(1));

  // Intro animations
  const markAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = onboardingQuestions.length + 2;
  const currentQuestion =
    currentStep >= 0 && currentStep < onboardingQuestions.length
      ? onboardingQuestions[currentStep]
      : null;

  useEffect(() => {
    trackScreen("OnboardingScreen", "OnboardingScreen");
    trackOnboardingStart();
  }, [trackScreen, trackOnboardingStart]);

  // Intro animation sequence
  useEffect(() => {
    if (currentStep === -1) {
      markAnim.setValue(0);
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      featuresAnim.setValue(0);

      Animated.stagger(120, [
        Animated.spring(markAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.spring(titleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.spring(subtitleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.spring(featuresAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }),
      ]).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < onboardingQuestions.length) {
      const completionRate =
        ((currentStep + 1) / onboardingQuestions.length) * 100;
      trackOnboardingStep({
        step: currentStep + 1,
        total_steps: onboardingQuestions.length,
        completion_rate: completionRate,
        selected_preferences: Object.keys(answers),
      });
    }
  }, [currentStep, onboardingQuestions.length, answers, trackOnboardingStep]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = {...answers, [questionId]: value};
    setAnswers(newAnswers);
    const answer: OnboardingAnswer = {questionId, value};
    addAnswer(answer);
  };

  const isStepComplete = () => {
    if (!currentQuestion) return true;
    const answer = answers[currentQuestion.id];
    if (!currentQuestion.required) return true;
    switch (currentQuestion.type) {
      case "single":
        return answer !== undefined;
      case "multiple":
        return Array.isArray(answer) && answer.length > 0;
      case "slider":
        return answer !== undefined;
      case "text":
        if (currentQuestion.id === "notification_time_range") {
          return answer?.start && answer?.end;
        } else if (currentQuestion.id === "user_name") {
          return (
            answer && typeof answer === "string" && answer.trim().length >= 2
          );
        } else {
          return answer !== undefined;
        }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === -1) {
      setCurrentStep(0);
      return;
    }

    // Request notification permission after the notification time-range step
    if (currentQuestion?.id === "notification_time_range") {
      setTimeout(() => {
        NotificationService.getInstance()
          .requestPermissions()
          .catch(() => {/* silent — permission is optional */});
      }, 300);
    }

    if (currentStep < onboardingQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    const selectedPreferences = Object.keys(answers);
    trackOnboardingComplete(selectedPreferences);
    generatePreferences();
    setCompleted(true);
    // Show brief completion screen while we trigger the review dialog
    setCurrentStep(onboardingQuestions.length);

    // Short delay so the completion screen renders first
    await new Promise((r) => setTimeout(r, 600));

    // Request native store review (bypasses conservative hook — onboarding is the right moment)
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      }
    } catch {
      // Non-critical — proceed regardless
    }

    // Navigate to personalisation loading screen
    router.replace("/personalization");
  };

  // ─── Intro Screen ───────────────────────────────────────────────────────────

  const renderIntroScreen = () => {
    const dividerColor = isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.08)";

    const features = [
      {
        icon: "star" as const,
        title: onboarding.feature_personalized,
        subtitle: onboarding.feature_personalized_subtitle,
      },
      {
        icon: "target" as const,
        title: onboarding.feature_notifications,
        subtitle: onboarding.feature_notifications_subtitle,
      },
      {
        icon: "book" as const,
        title: onboarding.feature_fast,
        subtitle: onboarding.feature_fast_subtitle,
      },
    ];

    return (
      <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
        <ScrollView
          style={styles.introScroll}
          contentContainerStyle={styles.introContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mark */}
          <Animated.View
            style={[
              styles.introMarkWrap,
              {
                opacity: markAnim,
                transform: [
                  {
                    translateY: markAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.introMark,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            >
              <Text
                style={[styles.quoteChar, {color: theme.colors.brandYellow}]}
              >
                {"\u201C"}
              </Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.introTitle, {color: theme.colors.text}]}>
              {onboarding.welcome_title}
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View
            style={{
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            <Text
              style={[
                styles.introSubtitle,
                {color: theme.colors.textSecondary},
              ]}
            >
              {onboarding.welcome_subtitle}
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[
              styles.featureBlock,
              {
                opacity: featuresAnim,
                transform: [
                  {
                    translateY: featuresAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.featureDivider, {backgroundColor: dividerColor}]} />

            {features.map((f, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIconWrap,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <IconSymbol
                    name={f.icon}
                    size={16}
                    color={theme.colors.brandYellow}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text
                    style={[
                      styles.featureTitle,
                      {color: theme.colors.text},
                    ]}
                  >
                    {f.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureSubtitle,
                      {color: theme.colors.textSecondary},
                    ]}
                  >
                    {f.subtitle}
                  </Text>
                </View>
              </View>
            ))}

            <View style={[styles.featureDivider, {backgroundColor: dividerColor}]} />
          </Animated.View>
        </ScrollView>
      </Animated.View>
    );
  };

  // ─── Completion Screen ───────────────────────────────────────────────────────

  const renderCompletionScreen = () => (
    <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
      <View style={styles.completionContainer}>
        <View
          style={[
            styles.completionMark,
            {
              backgroundColor: `${theme.colors.brandYellow}20`,
              borderColor: `${theme.colors.brandYellow}40`,
            },
          ]}
        >
          <IconSymbol
            name="checkmark"
            size={32}
            color={theme.colors.brandYellow}
            strokeWidth={2}
          />
        </View>

        <Text style={[styles.completionTitle, {color: theme.colors.text}]}>
          {onboarding.completion_title}
        </Text>
        <Text
          style={[
            styles.completionSubtitle,
            {color: theme.colors.textSecondary},
          ]}
        >
          {onboarding.completion_subtitle}
        </Text>

        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.loadingDot,
                {
                  backgroundColor:
                    i === 0
                      ? theme.colors.brandYellow
                      : `${theme.colors.brandYellow}50`,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );

  // ─── Option Renderers ────────────────────────────────────────────────────────

  const renderSingleChoice = (question: any) => (
    <View style={styles.optionsContainer}>
      {question.options?.map((option: OnboardingOption) => {
        const isSelected = answers[question.id] === option.value;
        return (
          <OnboardingCard
            key={option.id}
            icon={option.icon}
            title={option.label}
            isSelected={isSelected}
            onPress={() => handleAnswer(question.id, option.value)}
          />
        );
      })}
    </View>
  );

  const renderMultipleChoice = (question: any) => (
    <View style={styles.gridContainer}>
      {question.options?.map((option: OnboardingOption) => {
        const selectedOptions = answers[question.id] || [];
        const isSelected = selectedOptions.includes(option.value);
        return (
          <OnboardingMultiCard
            key={option.id}
            icon={option.icon}
            title={option.label}
            isSelected={isSelected}
            onPress={() => {
              const newSelected = isSelected
                ? selectedOptions.filter((v: string) => v !== option.value)
                : [...selectedOptions, option.value];
              handleAnswer(question.id, newSelected);
            }}
            style={styles.gridCell}
          />
        );
      })}
    </View>
  );

  const renderSlider = (question: any) => {
    const value =
      answers[question.id] ||
      (question.id === "notification_count" ? 7 : question.min || 1);
    const min = question.min || 1;
    const max = question.max || 10;

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderValueWrap}>
          <Text style={[styles.sliderValue, {color: theme.colors.text}]}>
            {value}
          </Text>
          <Text
            style={[
              styles.sliderValueLabel,
              {color: theme.colors.textSecondary},
            ]}
          >
            {onboarding.notifications_per_day}
          </Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={(v: number) =>
            handleAnswer(question.id, Math.round(v))
          }
          minimumTrackTintColor={theme.colors.brandYellow}
          maximumTrackTintColor={
            isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
          }
          thumbTintColor={theme.colors.brandYellow}
          step={1}
        />

        <View style={styles.sliderRange}>
          <Text style={[styles.rangeText, {color: theme.colors.textTertiary}]}>
            {min}
          </Text>
          <Text style={[styles.rangeText, {color: theme.colors.textTertiary}]}>
            {max}
          </Text>
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const timeRange = answers["notification_time_range"] || {
      start: "09:00",
      end: "18:00",
    };

    const {
      formatTimeForUser,
      parseTimeToMilitary,
    } = require("../../utils/language");

    const formatTimeRange = (start: string, end: string) => {
      const s = parseTimeToMilitary(start);
      const e = parseTimeToMilitary(end);
      return `${formatTimeForUser(s.hour, s.minute)} – ${formatTimeForUser(e.hour, e.minute)}`;
    };

    const timePresets = [
      {
        id: "early",
        icon: "🌅",
        label: onboarding.time_early,
        description: formatTimeRange("06:00", "12:00"),
        value: {start: "06:00", end: "12:00"},
      },
      {
        id: "morning",
        icon: "☀️",
        label: onboarding.time_morning_range,
        description: formatTimeRange("08:00", "14:00"),
        value: {start: "08:00", end: "14:00"},
      },
      {
        id: "regular",
        icon: "💼",
        label: onboarding.time_regular,
        description: formatTimeRange("09:00", "18:00"),
        value: {start: "09:00", end: "18:00"},
      },
      {
        id: "extended",
        icon: "🌙",
        label: onboarding.time_extended,
        description: formatTimeRange("07:00", "21:00"),
        value: {start: "07:00", end: "21:00"},
      },
      {
        id: "evening",
        icon: "🌆",
        label: onboarding.time_evening_range,
        description: formatTimeRange("15:00", "20:00"),
        value: {start: "15:00", end: "20:00"},
      },
    ];

    const currentPresetId = timePresets.find(
      (p) => p.value.start === timeRange.start && p.value.end === timeRange.end
    )?.id;

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePresetsGrid}>
          {timePresets.map((preset) => (
            <OnboardingTimeCard
              key={preset.id}
              icon={preset.icon}
              title={preset.label}
              timeRange={preset.description}
              isSelected={currentPresetId === preset.id}
              onPress={() =>
                handleAnswer("notification_time_range", preset.value)
              }
            />
          ))}
        </View>

        {/* Current selection pill */}
        <View style={styles.selectedTimeWrap}>
          <View
            style={[
              styles.selectedTimePill,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.04)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.08)",
              },
            ]}
          >
            <Text
              style={[
                styles.selectedTimeLabel,
                {color: theme.colors.textSecondary},
              ]}
            >
              {onboarding.selected_time_range}
            </Text>
            <Text
              style={[
                styles.selectedTimeValue,
                {color: theme.colors.brandYellow},
              ]}
            >
              {formatTimeRange(timeRange.start, timeRange.end)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTextInput = (question: any) => {
    const value = answers[question.id] || "";
    return (
      <View style={styles.textInputWrap}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              borderColor: isDark
                ? "rgba(255,255,255,0.14)"
                : "rgba(0,0,0,0.10)",
              color: theme.colors.text,
            },
          ]}
          value={value}
          onChangeText={(text) => handleAnswer(question.id, text)}
          placeholder={question.placeholder || ""}
          placeholderTextColor={theme.colors.textTertiary}
          maxLength={question.maxLength || 100}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          selectionColor={theme.colors.brandYellow}
        />
        {question.maxLength && (
          <Text
            style={[
              styles.charCount,
              {color: theme.colors.textTertiary},
            ]}
          >
            {value.length}/{question.maxLength}
          </Text>
        )}
      </View>
    );
  };

  // ─── Question Screen ─────────────────────────────────────────────────────────

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const stepLabel = `${currentStep + 1} / ${onboardingQuestions.length}`;
    const isTimeQuestion =
      currentQuestion.id === "notification_time_range";

    return (
      <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.questionScroll}
          contentContainerStyle={styles.questionContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step counter */}
          <Text style={[styles.stepCounter, {color: theme.colors.textTertiary}]}>
            {stepLabel}
          </Text>

          {/* Question text */}
          <Text style={[styles.questionText, {color: theme.colors.text}]}>
            {currentQuestion.question}
          </Text>

          {/* Thin accent line under question */}
          <View
            style={[
              styles.questionAccent,
              {backgroundColor: theme.colors.brandYellow},
            ]}
          />

          {/* Options */}
          <View style={styles.optionsWrap}>
            {currentQuestion.type === "single" &&
              renderSingleChoice(currentQuestion)}
            {currentQuestion.type === "multiple" &&
              renderMultipleChoice(currentQuestion)}
            {currentQuestion.type === "slider" &&
              renderSlider(currentQuestion)}
            {isTimeQuestion && renderTimePicker()}
            {currentQuestion.type === "text" &&
              !isTimeQuestion &&
              renderTextInput(currentQuestion)}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  // ─── Progress Bar ─────────────────────────────────────────────────────────────

  const progressPercentage = ((currentStep + 2) / totalSteps) * 100;
  const trackColor = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(0,0,0,0.08)";

  // ─── Render ───────────────────────────────────────────────────────────────────

  const isLastQuestion = currentStep === onboardingQuestions.length - 1;
  const nextLabel = isLastQuestion ? onboarding.complete : onboarding.next_step;
  const stepComplete = isStepComplete();

  return (
    <BaseScreen style={styles.container}>
      {/* Progress bar */}
      {currentStep < onboardingQuestions.length && (
        <View
          style={[
            styles.progressWrap,
            {paddingTop: insets.top > 0 ? insets.top + 8 : 16},
          ]}
        >
          <View style={[styles.progressTrack, {backgroundColor: trackColor}]}>
            <LinearGradient
              colors={[theme.colors.brandYellow, `${theme.colors.brandYellow}BB`]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[styles.progressFill, {width: `${progressPercentage}%`}]}
            />
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {currentStep === -1 && renderIntroScreen()}
        {currentStep >= 0 &&
          currentStep < onboardingQuestions.length &&
          renderQuestion()}
        {currentStep === onboardingQuestions.length && renderCompletionScreen()}
      </View>

      {/* Navigation */}
      {currentStep < onboardingQuestions.length && (
        <View
          style={[
            styles.navBar,
            {paddingBottom: Math.max(insets.bottom, 16) + 8},
          ]}
        >
          {/* Back button */}
          {currentStep > -1 ? (
            <TouchableOpacity
              style={[
                styles.backBtn,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(0,0,0,0.10)",
                },
              ]}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.backBtnText, {color: theme.colors.textSecondary}]}
              >
                ← {onboarding.back}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}

          {/* Next / Get Started button */}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor: stepComplete
                  ? theme.colors.brandYellow
                  : isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.07)",
                opacity: stepComplete ? 1 : 0.55,
              },
            ]}
            onPress={handleNext}
            disabled={!stepComplete}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextBtnText,
                {
                  color: stepComplete
                    ? isDark
                      ? "#141210"
                      : "#1a1a1a"
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {currentStep === -1 ? onboarding.next_step : nextLabel}
            </Text>
            {stepComplete && (
              <IconSymbol
                name="chevron.right"
                size={16}
                color={isDark ? "#141210" : "#1a1a1a"}
                strokeWidth={2.5}
                style={{marginLeft: 4}}
              />
            )}
          </TouchableOpacity>
        </View>
      )}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },

  // Progress
  progressWrap: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },

  // ─── Intro ───────────────────────────────────────────────────────────────────
  introScroll: {
    flex: 1,
  },
  introContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: "center",
    minHeight: screenHeight * 0.72,
  },
  introMarkWrap: {
    marginBottom: 28,
  },
  introMark: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteChar: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "300",
    marginTop: -4,
  },
  introTitle: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 36,
    maxWidth: 300,
  },

  // Features
  featureBlock: {
    width: "100%",
  },
  featureDivider: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },

  // ─── Completion ──────────────────────────────────────────────────────────────
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  completionMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  completionSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    fontWeight: "400",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ─── Question ────────────────────────────────────────────────────────────────
  questionScroll: {
    flex: 1,
  },
  questionContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  questionText: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 33,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  questionAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 28,
  },
  optionsWrap: {
    flex: 1,
  },

  // Single choice
  optionsContainer: {},

  // Multi choice grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  gridCell: {
    width: "50%",
    padding: 5,
  },

  // Slider
  sliderContainer: {
    paddingTop: 16,
  },
  sliderValueWrap: {
    alignItems: "center",
    marginBottom: 32,
  },
  sliderValue: {
    fontSize: 64,
    fontWeight: "700",
    lineHeight: 72,
    letterSpacing: -2,
  },
  sliderValueLabel: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  slider: {
    width: "100%",
    height: 48,
  },
  sliderRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Time picker
  timePickerContainer: {
    paddingTop: 4,
  },
  timePresetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  selectedTimeWrap: {
    alignItems: "center",
  },
  selectedTimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  selectedTimeLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  selectedTimeValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  // Text input
  textInputWrap: {
    marginTop: 8,
  },
  textInput: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    minHeight: 56,
    width: "100%",
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    paddingHorizontal: 4,
  },

  // ─── Navigation ──────────────────────────────────────────────────────────────
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  backBtnPlaceholder: {
    minWidth: 80,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    flex: 1,
    maxWidth: 240,
    marginLeft: "auto",
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
