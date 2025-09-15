import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import {
  OnboardingCard,
  OnboardingMultiCard,
  OnboardingTimeCard,
} from "../../components/onboarding";
import { getOnboardingQuestions } from "../../data/onboardingQuestions";
import { useAnalytics } from "../../hooks/useAnalytics";
import {
  useScreenTranslations,
  useTranslation,
} from "../../hooks/useTranslation";
import { useOnboardingActions } from "../../store/useOnboardingStore";
import { usePaywallSelectors } from "../../store/usePaywallStore";
import { OnboardingAnswer, OnboardingOption } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function OnboardingScreen() {
  const { theme } = useTheme();
  const { addAnswer, generatePreferences, setCompleted } =
    useOnboardingActions();

  // Progressive paywall actions (move to top level)
  const { markOnboardingCompleted, showFirstTimePaywall } =
    usePaywallSelectors.actions();

  // Analytics
  const {
    trackScreen,
    trackOnboardingStart,
    trackOnboardingStep,
    trackOnboardingComplete,
  } = useAnalytics();

  // Translations
  const onboarding = useScreenTranslations("onboarding");
  const { t } = useTranslation();

  // Get localized questions
  const onboardingQuestions = getOnboardingQuestions((key: string) =>
    t(key as any)
  );

  const [currentStep, setCurrentStep] = useState(-1); // Start with intro screen
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  // Enhanced animations for intro screen
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalSteps = onboardingQuestions.length + 2; // +2 for intro and completion
  const currentQuestion =
    currentStep >= 0 && currentStep < onboardingQuestions.length
      ? onboardingQuestions[currentStep]
      : null;

  // Track screen view and onboarding start
  useEffect(() => {
    trackScreen("OnboardingScreen", "OnboardingScreen");
    trackOnboardingStart();
  }, [trackScreen, trackOnboardingStart]);

  // Enhanced intro animation sequence
  useEffect(() => {
    if (currentStep === -1) {
      // Reset all animations
      badgeAnim.setValue(0);
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      featuresAnim.setValue(0);
      starAnim.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Free badge slides in from top
        Animated.spring(badgeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
          delay: 300,
        }),
        // Star appears with scale animation
        Animated.spring(starAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 6,
        }),
        // Title fades in
        Animated.spring(titleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        // Subtitle follows
        Animated.spring(subtitleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        // Features cascade in
        Animated.stagger(150, [
          Animated.spring(featuresAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }),
        ]),
      ]).start();

      // Continuous pulse animation for star
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    }
  }, [currentStep]);

  // Track step completion
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
    animateTransition();
  }, [currentStep]);

  const animateTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: currentStep,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    const answer: OnboardingAnswer = { questionId, value };
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
      // From intro to first question
      setCurrentStep(0);
    } else if (currentStep < onboardingQuestions.length - 1) {
      // Next question
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Track onboarding completion
    const selectedPreferences = Object.keys(answers);
    trackOnboardingComplete(selectedPreferences);

    generatePreferences();
    setCompleted(true);
    setCurrentStep(onboardingQuestions.length); // Show completion screen

    // Progressive paywall: Mark onboarding completed and trigger first paywall
    markOnboardingCompleted();

    setTimeout(() => {
      router.replace("/(tabs)");

      // Show first-time paywall after navigation to home screen
      setTimeout(() => {
        showFirstTimePaywall();
      }, 1500); // Delay to let home screen load
    }, 2000);
  };

  const renderIntroScreen = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.introScrollView}
        contentContainerStyle={styles.introContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          {/* Animated Star Icon */}
          <Animated.View
            style={[
              styles.welcomeIconContainer,
              {
                transform: [
                  { scale: Animated.multiply(starAnim, pulseAnim) },
                  {
                    rotate: starAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["180deg", "0deg"],
                    }),
                  },
                ],
                opacity: starAnim,
              },
            ]}
          >
            <LinearGradient
              colors={[
                theme.colors.brandYellow,
                theme.colors.premium,
                theme.colors.brandYellow,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.starGradientContainer}
            >
              <IconSymbol
                name="star"
                size={48}
                color={theme.colors.white}
                strokeWidth={2}
              />
            </LinearGradient>
          </Animated.View>

          {/* Animated Title */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
              opacity: titleAnim,
            }}
          >
            <Text style={[styles.welcomeTitle, { color: theme.colors.white }]}>
              {onboarding.welcome_title}
            </Text>
          </Animated.View>

          {/* Animated Subtitle */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
              opacity: subtitleAnim,
            }}
          >
            <Text
              style={[
                styles.welcomeSubtitle,
                { color: theme.colors.whiteOverlay90 },
              ]}
            >
              {onboarding.welcome_subtitle}
            </Text>
          </Animated.View>
        </View>

        {/* Enhanced Features Section */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              transform: [
                {
                  translateY: featuresAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: featuresAnim,
            },
          ]}
        >
          {[
            {
              icon: "🎯",
              title: onboarding.feature_personalized,
              subtitle: onboarding.feature_personalized_subtitle,
              color: theme.colors.primary,
            },
            {
              icon: "📱",
              title: onboarding.feature_notifications,
              subtitle: onboarding.feature_notifications_subtitle,
              color: theme.colors.secondary,
            },
            {
              icon: "⚡",
              title: onboarding.feature_fast,
              subtitle: onboarding.feature_fast_subtitle,
              color: theme.colors.brandYellow,
            },
          ].map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.modernFeatureCard,
                {
                  backgroundColor: `${feature.color}15`,
                  borderColor: `${feature.color}30`,
                },
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[`${feature.color}20`, `${feature.color}10`]}
                style={styles.featureCardGradient}
              >
                <View style={styles.featureIconContainer}>
                  <Text style={styles.modernFeatureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text
                    style={[
                      styles.modernFeatureTitle,
                      { color: theme.colors.white },
                    ]}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={[
                      styles.modernFeatureSubtitle,
                      { color: theme.colors.whiteOverlay70 },
                    ]}
                  >
                    {feature.subtitle}
                  </Text>
                </View>
                <View style={styles.featureArrow}>
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={feature.color}
                    strokeWidth={2}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );

  const renderCompletionScreen = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.completionContainer}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={[styles.completionTitle, { color: theme.colors.white }]}>
          {onboarding.completion_title}
        </Text>
        <Text
          style={[
            styles.completionSubtitle,
            { color: theme.colors.whiteOverlay90 },
          ]}
        >
          {onboarding.completion_subtitle}
        </Text>

        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View
            style={[
              styles.loadingDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View
            style={[
              styles.loadingDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

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
            variant="default"
          />
        );
      })}
    </View>
  );

  const renderMultipleChoice = (question: any) => (
    <View style={styles.multiOptionsContainer}>
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
          />
        );
      })}
    </View>
  );

  const renderSlider = (question: any) => {
    const value = answers[question.id] || question.min || 1;
    const min = question.min || 1;
    const max = question.max || 10;

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderValueContainer}>
          <Text
            style={[styles.sliderValue, { color: theme.colors.brandYellow }]}
          >
            {value}
          </Text>
          <Text
            style={[styles.sliderLabel, { color: theme.colors.whiteOverlay80 }]}
          >
            {onboarding.notifications_per_day}
          </Text>
        </View>

        <View style={styles.sliderTrackContainer}>
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            value={value}
            onValueChange={(newValue: number) =>
              handleAnswer(question.id, Math.round(newValue))
            }
            minimumTrackTintColor={theme.colors.brandYellow}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.brandYellow}
            step={1}
          />

          <View style={styles.sliderRange}>
            <Text
              style={[styles.rangeText, { color: theme.colors.whiteOverlay70 }]}
            >
              {min}
            </Text>
            <Text
              style={[styles.rangeText, { color: theme.colors.whiteOverlay70 }]}
            >
              {max}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const timeRange = answers["notification_time_range"] || {
      start: "09:00",
      end: "18:00",
    };

    // Import time format utilities
    const {
      uses12HourFormat,
      formatTimeForUser,
      parseTimeToMilitary,
    } = require("../../utils/language");
    const use12Hour = uses12HourFormat();

    // Helper function to format time ranges for display
    const formatTimeRange = (start: string, end: string) => {
      const startTime = parseTimeToMilitary(start);
      const endTime = parseTimeToMilitary(end);
      const startFormatted = formatTimeForUser(
        startTime.hour,
        startTime.minute
      );
      const endFormatted = formatTimeForUser(endTime.hour, endTime.minute);
      return `${startFormatted} - ${endFormatted}`;
    };

    // Predefined time ranges for better UX with locale-aware formatting
    const timePresets = [
      {
        id: "early",
        icon: "🌅",
        label: onboarding.time_early,
        description: formatTimeRange("06:00", "12:00"),
        value: { start: "06:00", end: "12:00" },
      },
      {
        id: "morning",
        icon: "☀️",
        label: onboarding.time_morning_range,
        description: formatTimeRange("08:00", "14:00"),
        value: { start: "08:00", end: "14:00" },
      },
      {
        id: "regular",
        icon: "💼",
        label: onboarding.time_regular,
        description: formatTimeRange("09:00", "18:00"),
        value: { start: "09:00", end: "18:00" },
      },
      {
        id: "extended",
        icon: "🌙",
        label: onboarding.time_extended,
        description: formatTimeRange("07:00", "21:00"),
        value: { start: "07:00", end: "21:00" },
      },
      {
        id: "evening",
        icon: "🌆",
        label: onboarding.time_evening_range,
        description: formatTimeRange("15:00", "20:00"),
        value: { start: "15:00", end: "20:00" },
      },
    ];

    const currentPresetId = timePresets.find(
      (preset) =>
        preset.value.start === timeRange.start &&
        preset.value.end === timeRange.end
    )?.id;

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePresetsContainer}>
          {timePresets.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <OnboardingTimeCard
                key={preset.id}
                icon={preset.icon}
                title={preset.label}
                timeRange={preset.description}
                isSelected={isSelected}
                onPress={() => {
                  handleAnswer("notification_time_range", preset.value);
                }}
              />
            );
          })}
        </View>

        {/* Current Selection Display */}
        <View style={styles.currentTimeDisplay}>
          <View
            style={[
              styles.timeDisplayCard,
              {
                backgroundColor: `${theme.colors.surface}25`,
                borderColor: `${theme.colors.border}50`,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <Text
              style={[styles.timeDisplayTitle, { color: theme.colors.white }]}
            >
              {onboarding.selected_time_range}
            </Text>
            <Text
              style={[
                styles.timeDisplayTime,
                { color: theme.colors.brandYellow },
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
      <View style={styles.textInputContainer}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.whiteOverlay10,
              borderColor: theme.colors.border,
              color: theme.colors.white,
            },
          ]}
          value={value}
          onChangeText={(text) => handleAnswer(question.id, text)}
          placeholder={question.placeholder || ""}
          placeholderTextColor={theme.colors.whiteOverlay70}
          maxLength={question.maxLength || 100}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          selectionColor={theme.colors.brandYellow}
        />

        {/* Character count indicator */}
        {question.maxLength && (
          <Text
            style={[
              styles.characterCount,
              { color: theme.colors.whiteOverlay70 },
            ]}
          >
            {value.length}/{question.maxLength}
          </Text>
        )}
      </View>
    );
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.questionContainer}
          contentContainerStyle={styles.questionContent}
        >
          <Text style={[styles.questionText, { color: theme.colors.white }]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.type === "single" &&
            renderSingleChoice(currentQuestion)}
          {currentQuestion.type === "multiple" &&
            renderMultipleChoice(currentQuestion)}
          {currentQuestion.type === "slider" && renderSlider(currentQuestion)}
          {currentQuestion.id === "notification_time_range" &&
            renderTimePicker()}
          {currentQuestion.type === "text" && renderTextInput(currentQuestion)}
        </ScrollView>
      </Animated.View>
    );
  };

  const progressPercentage = ((currentStep + 2) / totalSteps) * 100;

  return (
    <BaseScreen style={styles.container}>
      {/* Enhanced Progress Bar */}
      {currentStep >= -1 && currentStep < onboardingQuestions.length && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.brandYellow,
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>
          {/* <Text
            style={[
              styles.progressText,
              { color: theme.colors.whiteOverlay80 },
            ]}
          >
            {currentStep + 2} / {totalSteps}
          </Text> */}
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

      {/* Enhanced Navigation Buttons */}
      {currentStep < onboardingQuestions.length && (
        <View style={styles.navigationContainer}>
          {currentStep > -1 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.prevButton,
                {
                  backgroundColor: `${theme.colors.surface}20`,
                  borderRadius: theme.borderRadius.md,
                  borderColor: `${theme.colors.border}50`,
                  borderWidth: 1,
                },
              ]}
              onPress={handlePrevious}
            >
              <Text
                style={[styles.navButtonText, { color: theme.colors.textSoft }]}
              >
                {onboarding.back}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              {
                backgroundColor: isStepComplete()
                  ? theme.colors.brandYellow
                  : `${theme.colors.border}60`,
                borderRadius: theme.borderRadius.md,
                opacity: isStepComplete() ? 1 : 0.6,
              },
            ]}
            onPress={handleNext}
            disabled={!isStepComplete()}
          >
            <Text
              style={[
                styles.navButtonText,
                {
                  color: isStepComplete()
                    ? theme.colors.blackOverlay70
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {currentStep === onboardingQuestions.length - 1
                ? onboarding.complete
                : onboarding.next_step}
            </Text>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  progressBar: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  // Enhanced Intro Screen
  introScrollView: {
    flex: 1,
  },
  introContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 24,
    minHeight: screenHeight * 0.8,
  },
  freeBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  freeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  freeBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
    flex: 1,
    justifyContent: "center",
  },
  welcomeIconContainer: {
    marginBottom: 24,
  },
  starGradientContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 44,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: "100%",
    alignItems: "stretch",
    marginBottom: 30,
  },
  modernFeatureCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modernFeatureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  modernFeatureTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  modernFeatureSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  featureArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },
  // Completion Screen
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  completionEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Question Container
  questionContainer: {
    flex: 1,
  },
  questionContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  // Options
  optionsContainer: {
    paddingVertical: 10,
  },
  multiOptionsContainer: {
    paddingVertical: 10,
  },
  // Slider
  sliderContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  sliderValueContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  sliderValue: {
    fontSize: 56,
    fontWeight: "700",
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  sliderTrackContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 50,
  },
  sliderRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 16,
    width: "100%",
  },
  rangeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Time Picker
  timePickerContainer: {
    paddingVertical: 20,
  },
  timePresetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  currentTimeDisplay: {
    alignItems: "center",
    marginTop: 10,
  },
  timeDisplayCard: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderWidth: 1.5,
    alignItems: "center",
    minWidth: 200,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeDisplayTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  timeDisplayTime: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  // Navigation
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButton: {
    // Styles applied inline
  },
  nextButton: {
    marginLeft: "auto",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Text Input
  textInputContainer: {
    marginTop: 20,
  },
  textInput: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "center",
    minHeight: 50,
    width: "100%",
  },
  characterCount: {
    fontSize: 14,
    textAlign: "right",
    marginTop: 8,
    paddingHorizontal: 10,
  },
});
