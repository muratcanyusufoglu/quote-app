import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../../components/ui/IconSymbol";
import BaseScreen from "../../components/layout/BaseScreen";
import { getOnboardingQuestions } from "../../data/onboardingQuestions";
import {
  useScreenTranslations,
  useTranslation,
} from "../../hooks/useTranslation";
import { useOnboardingActions } from "../../store/useOnboardingStore";
import { OnboardingAnswer, OnboardingOption } from "../../types";
import { useTheme } from "../../utils/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

export function OnboardingScreen() {
  const { theme } = useTheme();
  const { addAnswer, generatePreferences, setCompleted } =
    useOnboardingActions();

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

  const totalSteps = onboardingQuestions.length + 2; // +2 for intro and completion
  const currentQuestion =
    currentStep >= 0 && currentStep < onboardingQuestions.length
      ? onboardingQuestions[currentStep]
      : null;

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
        return currentQuestion.id === "notification_time_range"
          ? answer?.start && answer?.end
          : answer !== undefined;
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
    generatePreferences();
    setCompleted(true);
    setCurrentStep(onboardingQuestions.length); // Show completion screen

    setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);
  };

  const renderIntroScreen = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.introContainer}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIconContainer}>
            <IconSymbol
              name="star"
              size={44}
              color={theme.colors.brandYellow}
              strokeWidth={2}
            />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            {onboarding.welcome_title}
          </Text>
        </View>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          {onboarding.welcome_subtitle}
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {onboarding.feature_personalized}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {onboarding.feature_notifications}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {onboarding.feature_fast}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderCompletionScreen = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.completionContainer}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={[styles.completionTitle, { color: theme.colors.text }]}>
          {onboarding.completion_title}
        </Text>
        <Text
          style={[
            styles.completionSubtitle,
            { color: theme.colors.textSecondary },
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
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              dynamicStyles.option,
              {
                backgroundColor: isSelected
                  ? theme.colors.brandYellow
                  : theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.brandYellow
                  : theme.colors.border,
                borderRadius: theme.borderRadius.lg,
              },
            ]}
            onPress={() => handleAnswer(question.id, option.value)}
          >
            <IconSymbol
              name={option.icon as any}
              size={28}
              color={isSelected ? theme.colors.white : theme.colors.brandYellow}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.optionText,
                {
                  color: isSelected ? theme.colors.white : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMultipleChoice = (question: any) => (
    <View style={styles.optionsContainer}>
      {question.options?.map((option: OnboardingOption) => {
        const selectedOptions = answers[question.id] || [];
        const isSelected = selectedOptions.includes(option.value);

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.multiOption,
              dynamicStyles.multiOption,
              {
                backgroundColor: isSelected
                  ? theme.colors.brandYellow
                  : theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.brandYellow
                  : theme.colors.border,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={() => {
              const newSelected = isSelected
                ? selectedOptions.filter((v: string) => v !== option.value)
                : [...selectedOptions, option.value];
              handleAnswer(question.id, newSelected);
            }}
          >
            <IconSymbol
              name={option.icon as any}
              size={20}
              color={isSelected ? theme.colors.white : theme.colors.brandYellow}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.multiOptionText,
                {
                  color: isSelected ? theme.colors.white : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
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
            style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}
          >
            {onboarding.notifications_per_day}
          </Text>
        </View>

        <View style={styles.sliderControls}>
          <TouchableOpacity
            style={[
              styles.sliderButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
                opacity: value <= min ? 0.5 : 1,
              },
            ]}
            onPress={() => {
              const newValue = Math.max(min, value - 1);
              handleAnswer(question.id, newValue);
            }}
            disabled={value <= min}
          >
            <Text
              style={[styles.sliderButtonText, { color: theme.colors.text }]}
            >
              −
            </Text>
          </TouchableOpacity>

          <View style={styles.valueDisplay}>
            <Text style={[styles.currentValue, { color: theme.colors.text }]}>
              {value}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.sliderButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
                opacity: value >= max ? 0.5 : 1,
              },
            ]}
            onPress={() => {
              const newValue = Math.min(max, value + 1);
              handleAnswer(question.id, newValue);
            }}
            disabled={value >= max}
          >
            <Text
              style={[styles.sliderButtonText, { color: theme.colors.text }]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderRange}>
          <Text
            style={[styles.rangeText, { color: theme.colors.textTertiary }]}
          >
            {min}
          </Text>
          <Text
            style={[styles.rangeText, { color: theme.colors.textTertiary }]}
          >
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

    // Predefined time ranges for better UX
    const timePresets = [
      {
        id: "early",
        label: "🌅 " + (onboarding.time_early || "Early Bird"),
        description: "06:00 - 12:00",
        value: { start: "06:00", end: "12:00" },
      },
      {
        id: "morning",
        label: "☀️ " + (onboarding.time_morning_range || "Morning"),
        description: "08:00 - 14:00",
        value: { start: "08:00", end: "14:00" },
      },
      {
        id: "regular",
        label: "💼 " + (onboarding.time_regular || "Work Hours"),
        description: "09:00 - 18:00",
        value: { start: "09:00", end: "18:00" },
      },
      {
        id: "extended",
        label: "🌙 " + (onboarding.time_extended || "Extended"),
        description: "07:00 - 21:00",
        value: { start: "07:00", end: "21:00" },
      },
      {
        id: "evening",
        label: "🌆 " + (onboarding.time_evening_range || "Evening Focus"),
        description: "15:00 - 20:00",
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
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.timePreset,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.brandYellow
                      : theme.colors.surface,
                    borderColor: isSelected
                      ? theme.colors.brandYellow
                      : theme.colors.border,
                    borderRadius: theme.borderRadius.lg,
                  },
                ]}
                onPress={() => {
                  handleAnswer("notification_time_range", preset.value);
                }}
              >
                <Text
                  style={[
                    styles.timePresetLabel,
                    {
                      color: isSelected
                        ? theme.colors.white
                        : theme.colors.text,
                    },
                  ]}
                >
                  {preset.label}
                </Text>
                <Text
                  style={[
                    styles.timePresetDescription,
                    {
                      color: isSelected
                        ? theme.colors.white
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {preset.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Selection Display */}
        <View style={styles.currentTimeDisplay}>
          <View
            style={[
              styles.timeDisplayCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
              },
            ]}
          >
            <Text
              style={[
                styles.timeDisplayTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {onboarding.selected_time_range || "Selected Time Range"}
            </Text>
            <Text
              style={[
                styles.timeDisplayTime,
                { color: theme.colors.brandYellow },
              ]}
            >
              {timeRange.start} - {timeRange.end}
            </Text>
          </View>
        </View>
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
        >
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.type === "single" &&
            renderSingleChoice(currentQuestion)}
          {currentQuestion.type === "multiple" &&
            renderMultipleChoice(currentQuestion)}
          {currentQuestion.type === "slider" && renderSlider(currentQuestion)}
          {currentQuestion.id === "notification_time_range" &&
            renderTimePicker()}
        </ScrollView>
      </Animated.View>
    );
  };

  const progressPercentage = ((currentStep + 2) / totalSteps) * 100;

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    option: {
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    multiOption: {
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    navButton: {
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  return (
    <BaseScreen style={styles.container}>
      {/* Progress Bar */}
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
          <Text
            style={[styles.progressText, { color: theme.colors.textSecondary }]}
          >
            {currentStep + 2} / {totalSteps}
          </Text>
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

      {/* Navigation Buttons */}
      {currentStep < onboardingQuestions.length && (
        <View style={styles.navigationContainer}>
          {currentStep > -1 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.prevButton,
                dynamicStyles.navButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handlePrevious}
            >
              <Text
                style={[styles.navButtonText, { color: theme.colors.text }]}
              >
                {onboarding.back}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              dynamicStyles.navButton,
              {
                backgroundColor: isStepComplete()
                  ? theme.colors.brandYellow
                  : theme.colors.border,
                borderRadius: theme.borderRadius.md,
                opacity: isStepComplete() ? 1 : 0.5,
              },
            ]}
            onPress={handleNext}
            disabled={!isStepComplete()}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.white }]}>
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
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  progressBar: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Intro Screen
  introContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeIconContainer: {
    marginRight: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 48,
  },
  featuresContainer: {
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Completion Screen
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 48,
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
    paddingVertical: 40,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 32,
  },
  // Options
  optionsContainer: {
    paddingVertical: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 2,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  // Multiple Choice
  multiOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    marginBottom: 6,
  },
  multiOptionText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    marginLeft: 10,
  },
  // Slider
  sliderContainer: {
    paddingVertical: 20,
  },
  sliderValueContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  sliderValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    minWidth: 80,
    alignItems: "center",
  },
  sliderButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  valueDisplay: {
    flex: 1,
    alignItems: "center",
  },
  currentValue: {
    fontSize: 48,
    fontWeight: "700",
  },
  sliderRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  rangeText: {
    fontSize: 14,
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
    marginBottom: 20,
  },
  timePreset: {
    width: "48%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    marginBottom: 8,
    alignItems: "center",
  },
  timePresetLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  timePresetDescription: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  currentTimeDisplay: {
    alignItems: "center",
    marginTop: 10,
  },
  timeDisplayCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    alignItems: "center",
    minWidth: 200,
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
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 100,
    alignItems: "center",
  },
  prevButton: {
    borderWidth: 2,
  },
  nextButton: {
    marginLeft: "auto",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
