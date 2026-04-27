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
import {NotificationService} from "../../services/NotificationService";
import {OnboardingAnswer, OnboardingOption} from "../../types";
import {useTheme} from "../../utils/ThemeContext";

const {height: screenHeight} = Dimensions.get("window");

// ─── Flow definition ──────────────────────────────────────────────────────────
// Each item in the flow is either a question (by index in onboardingQuestions)
// or an interstitial motivational screen.

type FlowStep =
  | {kind: "question"; qIndex: number}
  | {kind: "interstitial"; id: "taste" | "reminder"};

// Question order: user_name first so every subsequent screen can say "Hi [name]"
// qIndex matches position in getOnboardingQuestions array:
// 0=user_name, 1=purpose, 2=content_type, 3=topics,
// 4=motivation_style, 5=preferred_time, 6=reading_length,
// 7=notification_count, 8=notification_time_range
const FLOW: FlowStep[] = [
  {kind: "question", qIndex: 0}, // user_name
  {kind: "question", qIndex: 1}, // purpose
  {kind: "question", qIndex: 2}, // content_type
  {kind: "question", qIndex: 3}, // topics
  {kind: "interstitial", id: "taste"},    // ✦ "Great taste, [name]!"
  {kind: "question", qIndex: 4}, // motivation_style
  {kind: "question", qIndex: 5}, // preferred_time
  {kind: "question", qIndex: 6}, // reading_length
  {kind: "interstitial", id: "reminder"}, // ✦ "Consistency is the secret"
  {kind: "question", qIndex: 7}, // notification_count
  {kind: "question", qIndex: 8}, // notification_time_range
];

const TOTAL_QUESTIONS = FLOW.filter((s) => s.kind === "question").length;

// ─── Component ────────────────────────────────────────────────────────────────

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

  // currentStep: -1=intro, 0..FLOW.length-1=flow items, FLOW.length=completion
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Shared fade animation for step transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Intro entrance animations
  const introHeadlineAnim = useRef(new Animated.Value(0)).current;
  const introTaglineAnim = useRef(new Animated.Value(0)).current;
  const introSocialAnim = useRef(new Animated.Value(0)).current;
  const introBtnAnim = useRef(new Animated.Value(0)).current;

  // Interstitial animations
  const interstitialIconAnim = useRef(new Animated.Value(0)).current;
  const interstitialTitleAnim = useRef(new Animated.Value(0)).current;
  const interstitialBodyAnim = useRef(new Animated.Value(0)).current;
  const interstitialCardAnim = useRef(new Animated.Value(0)).current;

  // Completion animation
  const completionStarAnim = useRef(new Animated.Value(0)).current;
  const completionTextAnim = useRef(new Animated.Value(0)).current;

  // ─── Derived state ─────────────────────────────────────────────────────────

  const currentFlowItem =
    currentStep >= 0 && currentStep < FLOW.length
      ? FLOW[currentStep]
      : null;

  const currentQuestion =
    currentFlowItem?.kind === "question"
      ? onboardingQuestions[currentFlowItem.qIndex]
      : null;

  const currentInterstitialId =
    currentFlowItem?.kind === "interstitial" ? currentFlowItem.id : null;

  // The user's name (answered in step 0)
  const userName: string =
    typeof answers["user_name"] === "string" && answers["user_name"].trim()
      ? answers["user_name"].trim()
      : "";

  // Progress: count how many question steps are completed (at or before current)
  const questionsAnswered =
    currentStep < 0
      ? 0
      : FLOW.slice(0, currentStep).filter((s) => s.kind === "question").length;
  const progressPercent = (questionsAnswered / TOTAL_QUESTIONS) * 100;

  // Question step label (e.g. "3 of 9") — only count real questions
  const questionNumber =
    currentFlowItem?.kind === "question"
      ? FLOW.slice(0, currentStep + 1).filter((s) => s.kind === "question").length
      : 0;

  // ─── Analytics ─────────────────────────────────────────────────────────────

  useEffect(() => {
    trackScreen("OnboardingScreen", "OnboardingScreen");
    trackOnboardingStart();
  }, [trackScreen, trackOnboardingStart]);

  useEffect(() => {
    if (currentQuestion) {
      const completionRate = (questionsAnswered / TOTAL_QUESTIONS) * 100;
      trackOnboardingStep({
        step: questionNumber,
        total_steps: TOTAL_QUESTIONS,
        completion_rate: completionRate,
        selected_preferences: Object.keys(answers),
      });
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Transition fade ───────────────────────────────────────────────────────

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {toValue: 0, duration: 110, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
    ]).start();
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Intro entrance ────────────────────────────────────────────────────────

  useEffect(() => {
    if (currentStep === -1) {
      introHeadlineAnim.setValue(0);
      introTaglineAnim.setValue(0);
      introSocialAnim.setValue(0);
      introBtnAnim.setValue(0);

      Animated.stagger(130, [
        Animated.spring(introHeadlineAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.spring(introTaglineAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.spring(introSocialAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.spring(introBtnAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
      ]).start();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Interstitial entrance ─────────────────────────────────────────────────

  useEffect(() => {
    if (currentInterstitialId) {
      interstitialIconAnim.setValue(0);
      interstitialTitleAnim.setValue(0);
      interstitialBodyAnim.setValue(0);
      interstitialCardAnim.setValue(0);

      Animated.stagger(100, [
        Animated.spring(interstitialIconAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.spring(interstitialTitleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 75,
          friction: 9,
        }),
        Animated.spring(interstitialBodyAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }),
        Animated.spring(interstitialCardAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
      ]).start();
    }
  }, [currentInterstitialId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Completion entrance ───────────────────────────────────────────────────

  useEffect(() => {
    if (currentStep === FLOW.length) {
      completionStarAnim.setValue(0);
      completionTextAnim.setValue(0);

      Animated.stagger(150, [
        Animated.spring(completionStarAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.spring(completionTextAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
      ]).start();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAnswer = (questionId: string, value: any) => {
    const newAnswers = {...answers, [questionId]: value};
    setAnswers(newAnswers);
    const answer: OnboardingAnswer = {questionId, value};
    addAnswer(answer);
  };

  const isStepComplete = (): boolean => {
    // Interstitials are always "complete" (just tap to continue)
    if (currentInterstitialId) return true;
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
          return !!(answer?.start && answer?.end);
        }
        if (currentQuestion.id === "user_name") {
          return typeof answer === "string" && answer.trim().length >= 2;
        }
        return answer !== undefined;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === -1) {
      setCurrentStep(0);
      return;
    }

    // Request notification permission after the time-range step
    if (currentQuestion?.id === "notification_time_range") {
      setTimeout(() => {
        NotificationService.getInstance()
          .requestPermissions()
          .catch(() => {/* silent */});
      }, 300);
    }

    if (currentStep < FLOW.length - 1) {
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
    setCurrentStep(FLOW.length); // show completion screen

    await new Promise((r) => setTimeout(r, 700));

    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) await StoreReview.requestReview();
    } catch {
      // Non-critical
    }

    router.replace("/personalization");
  };

  // ─── Utility ───────────────────────────────────────────────────────────────

  const animSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  const animScale = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1],
        }),
      },
    ],
  });

  // ─── Intro Screen ──────────────────────────────────────────────────────────

  const renderIntroScreen = () => {
    const headline = onboarding.intro_headline || "Words have the power\nto change everything.";
    const tagline = onboarding.intro_tagline || "Build the mindset you deserve.";
    const socialProof = onboarding.intro_social_proof || "Joined by 2,000,000+ daily readers";
    const beginLabel = onboarding.begin_journey || "Begin My Journey";
    const freeStart = onboarding.free_start || "Free to start · Takes 2 minutes";

    return (
      <View style={styles.introContainer}>
        {/* Large decorative quote mark */}
        <Animated.View style={[styles.introQuoteWrap, animSlide(introHeadlineAnim)]}>
          <Text style={[styles.introQuoteChar, {color: theme.colors.brandYellow}]}>
            {"\u201C"}
          </Text>
        </Animated.View>

        {/* Headline */}
        <Animated.Text
          style={[
            styles.introHeadline,
            {color: theme.colors.text},
            animSlide(introHeadlineAnim),
          ]}
        >
          {headline}
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.introTagline,
            {color: theme.colors.textSecondary},
            animSlide(introTaglineAnim),
          ]}
        >
          {tagline}
        </Animated.Text>

        {/* Social proof */}
        <Animated.View
          style={[styles.socialProofRow, animSlide(introSocialAnim)]}
        >
          <View
            style={[
              styles.socialProofPill,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.05)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(0,0,0,0.09)",
              },
            ]}
          >
            <Text
              style={[styles.socialProofDot, {color: theme.colors.brandYellow}]}
            >
              ✦
            </Text>
            <Text
              style={[styles.socialProofText, {color: theme.colors.textSecondary}]}
            >
              {socialProof}
            </Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.introBtnWrap, animSlide(introBtnAnim)]}>
          <TouchableOpacity
            style={[
              styles.introBtn,
              {backgroundColor: theme.colors.brandYellow},
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.introBtnText,
                {color: isDark ? "#141210" : "#1a1a1a"},
              ]}
            >
              {beginLabel}
            </Text>
            <IconSymbol
              name="chevron.right"
              size={18}
              color={isDark ? "#141210" : "#1a1a1a"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <Text style={[styles.introFreeText, {color: theme.colors.textTertiary}]}>
            {freeStart}
          </Text>
        </Animated.View>
      </View>
    );
  };

  // ─── Interstitial Screens ──────────────────────────────────────────────────

  const renderInterstitialTaste = () => {
    const rawTitle = onboarding.interstitial_taste_title || "You have great taste, {{name}}.";
    const title = rawTitle.replace("{{name}}", userName || "friend");
    const body = onboarding.interstitial_taste_body ||
      "Based on your choices, we matched you with over 1,200 transformative quotes.";
    const previewQuote =
      onboarding.interstitial_taste_preview_quote ||
      "You have power over your mind, not outside events. Realize this, and you will find strength.";
    const previewAuthor =
      onboarding.interstitial_taste_preview_author || "Marcus Aurelius";
    const ctaLabel = onboarding.interstitial_taste_cta || "Keep Going";

    return (
      <View style={styles.interstitialContainer}>
        {/* Glowing icon */}
        <Animated.View style={[styles.interstitialIconWrap, animScale(interstitialIconAnim)]}>
          <LinearGradient
            colors={[`${theme.colors.brandYellow}30`, `${theme.colors.brandYellow}08`]}
            style={styles.interstitialIconGlow}
            start={{x: 0.5, y: 0.5}}
            end={{x: 0.5, y: 1}}
          />
          <View
            style={[
              styles.interstitialIconCircle,
              {
                backgroundColor: `${theme.colors.brandYellow}20`,
                borderColor: `${theme.colors.brandYellow}40`,
              },
            ]}
          >
            <Text style={styles.interstitialEmoji}>✨</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.interstitialTitle,
            {color: theme.colors.text},
            animSlide(interstitialTitleAnim),
          ]}
        >
          {title}
        </Animated.Text>

        {/* Body */}
        <Animated.Text
          style={[
            styles.interstitialBody,
            {color: theme.colors.textSecondary},
            animSlide(interstitialBodyAnim),
          ]}
        >
          {body}
        </Animated.Text>

        {/* Quote preview card */}
        <Animated.View
          style={[
            styles.quotePreviewCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.08)",
            },
            animSlide(interstitialCardAnim),
          ]}
        >
          <Text
            style={[
              styles.quotePreviewMark,
              {color: theme.colors.brandYellow},
            ]}
          >
            {"\u201C"}
          </Text>
          <Text
            style={[styles.quotePreviewText, {color: theme.colors.text}]}
            numberOfLines={3}
          >
            {previewQuote}
          </Text>
          <Text
            style={[
              styles.quotePreviewAuthor,
              {color: theme.colors.textSecondary},
            ]}
          >
            — {previewAuthor}
          </Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.interstitialCtaWrap, animSlide(interstitialCardAnim)]}>
          <TouchableOpacity
            style={[
              styles.interstitialBtn,
              {backgroundColor: theme.colors.brandYellow},
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.interstitialBtnText,
                {color: isDark ? "#141210" : "#1a1a1a"},
              ]}
            >
              {ctaLabel}
            </Text>
            <IconSymbol
              name="chevron.right"
              size={17}
              color={isDark ? "#141210" : "#1a1a1a"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderInterstitialReminder = () => {
    const title = onboarding.interstitial_reminder_title || "Consistency is the secret.";
    const body = onboarding.interstitial_reminder_body ||
      "People who receive daily inspiration are 4× more likely to achieve their goals consistently.";
    const stat1 = onboarding.interstitial_reminder_stat1 || "4× more consistent";
    const stat2 = onboarding.interstitial_reminder_stat2 || "Daily habit";
    const stat3 = onboarding.interstitial_reminder_stat3 || "Proven system";
    const ctaLabel = onboarding.interstitial_reminder_cta || "Set My Reminders";

    const statBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
    const statBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

    return (
      <View style={styles.interstitialContainer}>
        {/* Glowing icon */}
        <Animated.View style={[styles.interstitialIconWrap, animScale(interstitialIconAnim)]}>
          <LinearGradient
            colors={[`${theme.colors.brandYellow}28`, `${theme.colors.brandYellow}06`]}
            style={styles.interstitialIconGlow}
            start={{x: 0.5, y: 0.5}}
            end={{x: 0.5, y: 1}}
          />
          <View
            style={[
              styles.interstitialIconCircle,
              {
                backgroundColor: `${theme.colors.brandYellow}20`,
                borderColor: `${theme.colors.brandYellow}40`,
              },
            ]}
          >
            <Text style={styles.interstitialEmoji}>🔔</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.interstitialTitle,
            {color: theme.colors.text},
            animSlide(interstitialTitleAnim),
          ]}
        >
          {title}
        </Animated.Text>

        {/* Body */}
        <Animated.Text
          style={[
            styles.interstitialBody,
            {color: theme.colors.textSecondary},
            animSlide(interstitialBodyAnim),
          ]}
        >
          {body}
        </Animated.Text>

        {/* Stat pills */}
        <Animated.View
          style={[styles.statRow, animSlide(interstitialCardAnim)]}
        >
          {[stat1, stat2, stat3].map((stat, i) => (
            <View
              key={i}
              style={[
                styles.statPill,
                {backgroundColor: statBg, borderColor: statBorder},
              ]}
            >
              <Text style={[styles.statText, {color: theme.colors.textSecondary}]}>
                {stat}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.interstitialCtaWrap, animSlide(interstitialCardAnim)]}>
          <TouchableOpacity
            style={[
              styles.interstitialBtn,
              {backgroundColor: theme.colors.brandYellow},
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.interstitialBtnText,
                {color: isDark ? "#141210" : "#1a1a1a"},
              ]}
            >
              {ctaLabel}
            </Text>
            <IconSymbol
              name="chevron.right"
              size={17}
              color={isDark ? "#141210" : "#1a1a1a"}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // ─── Completion Screen ─────────────────────────────────────────────────────

  const renderCompletionScreen = () => {
    const rawTitle = userName
      ? (onboarding.completion_title_with_name || "You're all set, {{name}}!").replace(
          "{{name}}",
          userName
        )
      : onboarding.completion_title || "You're all set!";
    const body =
      onboarding.completion_body ||
      "Your personalized experience is being crafted just for you.";

    return (
      <Animated.View style={[styles.completionContainer, {opacity: fadeAnim}]}>
        {/* Star burst */}
        <Animated.View style={[styles.completionStarWrap, animScale(completionStarAnim)]}>
          <LinearGradient
            colors={[`${theme.colors.brandYellow}30`, `${theme.colors.brandYellow}06`]}
            style={styles.completionGlow}
            start={{x: 0.5, y: 0.5}}
            end={{x: 0.5, y: 1}}
          />
          <View
            style={[
              styles.completionStar,
              {
                backgroundColor: `${theme.colors.brandYellow}20`,
                borderColor: `${theme.colors.brandYellow}50`,
              },
            ]}
          >
            <Text style={styles.completionEmoji}>🌟</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.completionTitle,
            {color: theme.colors.text},
            animSlide(completionTextAnim),
          ]}
        >
          {rawTitle}
        </Animated.Text>

        {/* Body */}
        <Animated.Text
          style={[
            styles.completionBody,
            {color: theme.colors.textSecondary},
            animSlide(completionTextAnim),
          ]}
        >
          {body}
        </Animated.Text>

        {/* Animated dots */}
        <Animated.View style={[styles.loadingDots, {opacity: completionTextAnim}]}>
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
        </Animated.View>
      </Animated.View>
    );
  };

  // ─── Question option renderers ─────────────────────────────────────────────

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

    const intensityLevels = [
      {max: 2, label: "Minimal", emoji: "🌙"},
      {max: 4, label: "Light", emoji: "🌤"},
      {max: 6, label: "Balanced", emoji: "☀️"},
      {max: 8, label: "Active", emoji: "⚡"},
      {max: 10, label: "Intensive", emoji: "🔥"},
    ];
    const intensity =
      intensityLevels.find((l) => value <= l.max) ?? intensityLevels[4];

    const dotBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)";

    return (
      <View style={styles.sliderContainer}>
        {/* Number display card */}
        <View
          style={[
            styles.sliderCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
              borderColor: isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(0,0,0,0.07)",
            },
          ]}
        >
          {/* Big number */}
          <Text style={[styles.sliderValue, {color: theme.colors.text}]}>
            {value}
          </Text>
          <Text
            style={[styles.sliderValueLabel, {color: theme.colors.textSecondary}]}
          >
            {onboarding.notifications_per_day}
          </Text>

          {/* Intensity badge */}
          <View
            style={[
              styles.intensityBadge,
              {backgroundColor: `${theme.colors.brandYellow}20`},
            ]}
          >
            <Text style={styles.intensityEmoji}>{intensity.emoji}</Text>
            <Text
              style={[styles.intensityLabel, {color: theme.colors.brandYellow}]}
            >
              {intensity.label}
            </Text>
          </View>
        </View>

        {/* Dot row — visual count indicator */}
        <View style={styles.dotRow}>
          {Array.from({length: max - min + 1}).map((_, i) => {
            const dotValue = min + i;
            const filled = dotValue <= value;
            const isCurrent = dotValue === value;
            return (
              <View
                key={dotValue}
                style={[
                  styles.dot,
                  {
                    backgroundColor: filled
                      ? theme.colors.brandYellow
                      : dotBg,
                    transform: [{scale: isCurrent ? 1.35 : 1}],
                    opacity: filled ? (isCurrent ? 1 : 0.65) : 0.45,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Slider */}
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
            isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.10)"
          }
          thumbTintColor={theme.colors.brandYellow}
          step={1}
        />

        {/* Range labels */}
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

    const {formatTimeForUser, parseTimeToMilitary} = require("../../utils/language");

    const formatTimeRange = (start: string, end: string) => {
      const s = parseTimeToMilitary(start);
      const e = parseTimeToMilitary(end);
      return `${formatTimeForUser(s.hour, s.minute)} – ${formatTimeForUser(e.hour, e.minute)}`;
    };

    const timePresets = [
      {
        id: "early",
        icon: "sunrise",
        label: onboarding.time_early,
        description: formatTimeRange("06:00", "12:00"),
        value: {start: "06:00", end: "12:00"},
      },
      {
        id: "morning",
        icon: "coffee",
        label: onboarding.time_morning_range,
        description: formatTimeRange("08:00", "14:00"),
        value: {start: "08:00", end: "14:00"},
      },
      {
        id: "regular",
        icon: "briefcase",
        label: onboarding.time_regular,
        description: formatTimeRange("09:00", "18:00"),
        value: {start: "09:00", end: "18:00"},
      },
      {
        id: "extended",
        icon: "clock",
        label: onboarding.time_extended,
        description: formatTimeRange("07:00", "21:00"),
        value: {start: "07:00", end: "21:00"},
      },
      {
        id: "evening",
        icon: "moon",
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
              style={[styles.selectedTimeLabel, {color: theme.colors.textSecondary}]}
            >
              {onboarding.selected_time_range}
            </Text>
            <Text
              style={[styles.selectedTimeValue, {color: theme.colors.brandYellow}]}
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
    const isNameInput = question.id === "user_name";

    return (
      <View style={styles.textInputWrap}>
        <TextInput
          style={[
            styles.textInput,
            isNameInput && styles.textInputLarge,
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
          autoCapitalize={isNameInput ? "words" : "sentences"}
          autoCorrect={false}
          returnKeyType="done"
          selectionColor={theme.colors.brandYellow}
          autoFocus={isNameInput}
        />
        {question.maxLength && !isNameInput && (
          <Text
            style={[styles.charCount, {color: theme.colors.textTertiary}]}
          >
            {value.length}/{question.maxLength}
          </Text>
        )}
      </View>
    );
  };

  // ─── Question screen ───────────────────────────────────────────────────────

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const isTimeQuestion = currentQuestion.id === "notification_time_range";
    const isNameQuestion = currentQuestion.id === "user_name";

    // Personalize the step label
    const stepLabel = `${questionNumber} / ${TOTAL_QUESTIONS}`;

    return (
      <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.questionScroll}
          contentContainerStyle={styles.questionContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question text — personalized with name if available */}
          <Text style={[styles.questionText, {color: theme.colors.text}]}>
            {isNameQuestion
              ? currentQuestion.question
              : userName
              ? currentQuestion.question
              : currentQuestion.question}
          </Text>

          {/* Gold accent line */}
          <View
            style={[
              styles.questionAccent,
              {backgroundColor: theme.colors.brandYellow},
            ]}
          />

          {/* Options / Input */}
          <View style={styles.optionsWrap}>
            {currentQuestion.type === "single" && renderSingleChoice(currentQuestion)}
            {currentQuestion.type === "multiple" && renderMultipleChoice(currentQuestion)}
            {currentQuestion.type === "slider" && renderSlider(currentQuestion)}
            {isTimeQuestion && renderTimePicker()}
            {currentQuestion.type === "text" &&
              !isTimeQuestion &&
              renderTextInput(currentQuestion)}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  // ─── Progress bar ──────────────────────────────────────────────────────────

  const trackColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const showProgress = currentStep >= 0 && currentStep < FLOW.length;

  // ─── Button labels ─────────────────────────────────────────────────────────

  const isLastFlowStep = currentStep === FLOW.length - 1;
  const isInterstitialStep = currentFlowItem?.kind === "interstitial";
  const stepComplete = isStepComplete();

  const nextLabel = isInterstitialStep
    ? (currentInterstitialId === "taste"
        ? (onboarding.interstitial_taste_cta || "Keep Going")
        : (onboarding.interstitial_reminder_cta || "Set My Reminders"))
    : isLastFlowStep
    ? onboarding.complete
    : onboarding.next_step;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <BaseScreen style={styles.container}>
      {/* Progress bar — shown during question & interstitial steps */}
      {showProgress && (
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
              style={[styles.progressFill, {width: `${progressPercent}%`}]}
            />
          </View>
        </View>
      )}

      {/* Content area */}
      <View style={styles.content}>
        {/* Intro */}
        {currentStep === -1 && (
          <ScrollView
            style={styles.introScroll}
            contentContainerStyle={[
              styles.introScrollContent,
              {
                paddingTop: insets.top > 0 ? insets.top + 24 : 40,
                paddingBottom: Math.max(insets.bottom, 20) + 16,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {renderIntroScreen()}
          </ScrollView>
        )}

        {/* Questions */}
        {currentStep >= 0 &&
          currentFlowItem?.kind === "question" &&
          renderQuestion()}

        {/* Interstitials */}
        {currentStep >= 0 && currentInterstitialId === "taste" && (
          <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.interstitialScroll}
            >
              {renderInterstitialTaste()}
            </ScrollView>
          </Animated.View>
        )}
        {currentStep >= 0 && currentInterstitialId === "reminder" && (
          <Animated.View style={[styles.stepContainer, {opacity: fadeAnim}]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.interstitialScroll}
            >
              {renderInterstitialReminder()}
            </ScrollView>
          </Animated.View>
        )}

        {/* Completion */}
        {currentStep === FLOW.length && renderCompletionScreen()}
      </View>

      {/* Navigation bar — shown during question steps only (interstitials have their own CTA) */}
      {showProgress && !isInterstitialStep && (
        <View
          style={[
            styles.navBar,
            {paddingBottom: Math.max(insets.bottom, 16) + 8},
          ]}
        >
          {/* Back button */}
          {currentStep > 0 ? (
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

          {/* Next / Complete button */}
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
              {nextLabel}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // ─── Intro ─────────────────────────────────────────────────────────────────
  introScroll: {
    flex: 1,
  },
  introScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  introContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: screenHeight * 0.7,
  },
  introQuoteWrap: {
    marginBottom: 16,
  },
  introQuoteChar: {
    fontSize: 72,
    fontWeight: "200",
    lineHeight: 80,
    opacity: 0.85,
  },
  introHeadline: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 14,
  },
  introTagline: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "400",
    marginBottom: 36,
    maxWidth: 280,
  },
  socialProofRow: {
    marginBottom: 52,
  },
  socialProofPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 7,
  },
  socialProofDot: {
    fontSize: 10,
  },
  socialProofText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  introBtnWrap: {
    gap: 14,
  },
  introBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 16,
    gap: 8,
  },
  introBtnText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  introFreeText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "400",
  },

  // ─── Interstitials ─────────────────────────────────────────────────────────
  interstitialScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  interstitialContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: screenHeight * 0.55,
  },
  interstitialIconWrap: {
    alignSelf: "flex-start",
    marginBottom: 28,
    position: "relative",
  },
  interstitialIconGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  interstitialIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  interstitialEmoji: {
    fontSize: 36,
  },
  interstitialTitle: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  interstitialBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 28,
    maxWidth: 320,
  },

  // Quote preview card (interstitial taste)
  quotePreviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 28,
  },
  quotePreviewMark: {
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
    marginBottom: 4,
  },
  quotePreviewText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 12,
    fontStyle: "italic",
  },
  quotePreviewAuthor: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Stat pills (interstitial reminder)
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },

  interstitialCtaWrap: {},
  interstitialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 16,
    gap: 8,
  },
  interstitialBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ─── Completion ────────────────────────────────────────────────────────────
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  completionStarWrap: {
    position: "relative",
    marginBottom: 32,
  },
  completionGlow: {
    position: "absolute",
    top: -30,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  completionStar: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  completionEmoji: {
    fontSize: 48,
  },
  completionTitle: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  completionBody: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: "400",
    maxWidth: 280,
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

  // ─── Question ──────────────────────────────────────────────────────────────
  questionScroll: {
    flex: 1,
  },
  questionContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
  optionsWrap: {},

  // Single choice
  optionsContainer: {},

  // Multi choice grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridCell: {
    width: "47.5%",
  },

  // Slider
  sliderContainer: {
    paddingTop: 8,
    gap: 0,
  },
  sliderCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
    gap: 4,
  },
  sliderValue: {
    fontSize: 72,
    fontWeight: "800",
    lineHeight: 80,
    letterSpacing: -3,
  },
  sliderValueLabel: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  intensityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },
  intensityEmoji: {
    fontSize: 14,
  },
  intensityLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Dot row
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
    marginBottom: 20,
    flexWrap: "nowrap",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  slider: {
    width: "100%",
    height: 44,
    marginTop: -4,
  },
  sliderRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: -4,
  },
  rangeText: {
    fontSize: 12,
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
  textInputLarge: {
    fontSize: 24,
    fontWeight: "600",
    paddingVertical: 20,
    minHeight: 68,
    letterSpacing: -0.3,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    paddingHorizontal: 4,
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
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
