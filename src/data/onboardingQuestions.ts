import { OnboardingQuestion } from "../types";

export const getOnboardingQuestions = (
  t: (key: string) => string
): OnboardingQuestion[] => [
  {
    id: "purpose",
    type: "single",
    question: t("onboarding.questions.purpose"),
    required: true,
    options: [
      {
        id: "motivation",
        label: t("onboarding.options.motivation"),
        value: "motivation",
        icon: "star",
      },
      {
        id: "learning",
        label: t("onboarding.options.learning"),
        value: "learning",
        icon: "book",
      },
      {
        id: "relaxation",
        label: t("onboarding.options.relaxation"),
        value: "relaxation",
        icon: "heart",
      },
      {
        id: "growth",
        label: t("onboarding.options.growth"),
        value: "growth",
        icon: "star",
      },
      {
        id: "inspiration",
        label: t("onboarding.options.inspiration"),
        value: "inspiration",
        icon: "lightbulb",
      },
    ],
  },
  {
    id: "topics",
    type: "multiple",
    question: t("onboarding.questions.topics"),
    required: true,
    options: [
      {
        id: "success",
        label: t("onboarding.options.success"),
        value: "success",
        icon: "crown",
      },
      {
        id: "happiness",
        label: t("onboarding.options.happiness"),
        value: "happiness",
        icon: "heart",
      },
      {
        id: "wisdom",
        label: t("onboarding.options.wisdom"),
        value: "wisdom",
        icon: "book",
      },
      {
        id: "love",
        label: t("onboarding.options.love"),
        value: "love",
        icon: "heart",
      },
      {
        id: "growth",
        label: t("onboarding.options.growth"),
        value: "growth",
        icon: "star",
      },
      {
        id: "peace",
        label: t("onboarding.options.peace"),
        value: "peace",
        icon: "heart",
      },
      {
        id: "strength",
        label: t("onboarding.options.strength"),
        value: "strength",
        icon: "shield",
      },
      {
        id: "creativity",
        label: t("onboarding.options.creativity"),
        value: "creativity",
        icon: "lightbulb",
      },
      {
        id: "leadership",
        label: t("onboarding.options.leadership"),
        value: "leadership",
        icon: "crown",
      },
      {
        id: "courage",
        label: t("onboarding.options.courage"),
        value: "courage",
        icon: "shield",
      },
      {
        id: "mindfulness",
        label: t("onboarding.options.mindfulness"),
        value: "mindfulness",
        icon: "brain",
      },
      {
        id: "gratitude",
        label: t("onboarding.options.gratitude"),
        value: "gratitude",
        icon: "gift",
      },
    ],
  },
  {
    id: "motivation_style",
    type: "single",
    question: t("onboarding.questions.motivation_style"),
    required: true,
    options: [
      {
        id: "gentle",
        label: t("onboarding.options.gentle"),
        value: "gentle",
        icon: "heart",
      },
      {
        id: "strong",
        label: t("onboarding.options.strong"),
        value: "strong",
        icon: "crown",
      },
      {
        id: "balanced",
        label: t("onboarding.options.balanced"),
        value: "balanced",
        icon: "scale",
      },
    ],
  },
  {
    id: "preferred_time",
    type: "single",
    question: t("onboarding.questions.preferred_time"),
    required: true,
    options: [
      {
        id: "morning",
        label: t("onboarding.options.morning"),
        value: "morning",
        icon: "sunrise",
      },
      {
        id: "afternoon",
        label: t("onboarding.options.afternoon"),
        value: "afternoon",
        icon: "star",
      },
      {
        id: "evening",
        label: t("onboarding.options.evening"),
        value: "evening",
        icon: "moon",
      },
    ],
  },
  {
    id: "reading_length",
    type: "single",
    question: t("onboarding.questions.reading_length"),
    required: true,
    options: [
      {
        id: "short",
        label: t("onboarding.options.short"),
        value: "short",
        icon: "target",
      },
      {
        id: "medium",
        label: t("onboarding.options.medium"),
        value: "medium",
        icon: "book",
      },
      {
        id: "long",
        label: t("onboarding.options.long"),
        value: "long",
        icon: "book",
      },
    ],
  },
  {
    id: "notification_count",
    type: "slider",
    question: t("onboarding.questions.notification_count"),
    required: true,
    min: 1,
    max: 10,
    step: 1,
  },
  {
    id: "notification_time_range",
    type: "text", // Will be handled as custom time picker
    question: t("onboarding.questions.notification_time_range"),
    required: true,
  },
  {
    id: "frequency",
    type: "single",
    question: t("onboarding.questions.frequency"),
    required: true,
    options: [
      {
        id: "daily",
        label: t("onboarding.options.daily"),
        value: "daily",
        icon: "calendar",
      },
      {
        id: "weekly",
        label: t("onboarding.options.weekly"),
        value: "weekly",
        icon: "calendar",
      },
      {
        id: "occasional",
        label: t("onboarding.options.occasional"),
        value: "occasional",
        icon: "target",
      },
    ],
  },
];

// Backward compatibility export
export const onboardingQuestions = (t: (key: string) => string) =>
  getOnboardingQuestions(t);
