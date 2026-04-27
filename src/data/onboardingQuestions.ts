import { OnboardingQuestion } from "../types";

export const getOnboardingQuestions = (
  t: (key: string) => string
): OnboardingQuestion[] => [
  // 0 — user_name: asked FIRST so the rest of the flow can personalize by name
  {
    id: "user_name",
    type: "text",
    question: t("onboarding.questions.user_name"),
    required: true,
    placeholder: t("onboarding.placeholders.user_name"),
    maxLength: 50,
  },
  // 1 — purpose
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
  // 2 — content_type
  {
    id: "content_type",
    type: "single",
    question: t("onboarding.questions.content_type"),
    required: true,
    options: [
      {
        id: "quotes",
        label: t("onboarding.options.quotes"),
        value: "quotes",
        icon: "book",
      },
      {
        id: "affirmations",
        label: t("onboarding.options.affirmations"),
        value: "affirmations",
        icon: "heart",
      },
      {
        id: "both",
        label: t("onboarding.options.both"),
        value: "both",
        icon: "star",
      },
    ],
  },
  // 3 — topics
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
        id: "resilience",
        label: t("onboarding.options.resilience"),
        value: "resilience",
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
      {
        id: "balance",
        label: t("onboarding.options.balance"),
        value: "balance",
        icon: "scale",
      },
      {
        id: "nature",
        label: t("onboarding.options.nature"),
        value: "nature",
        icon: "leaf",
      },
      {
        id: "dreams",
        label: t("onboarding.options.dreams"),
        value: "dreams",
        icon: "moon",
      },
      {
        id: "health",
        label: t("onboarding.options.health"),
        value: "health",
        icon: "heart",
      },
      {
        id: "family",
        label: t("onboarding.options.family"),
        value: "family",
        icon: "home",
      },
      {
        id: "friendship",
        label: t("onboarding.options.friendship"),
        value: "friendship",
        icon: "heart",
      },
    ],
  },
  // 4 — motivation_style
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
  // 5 — preferred_time
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
  // 6 — reading_length
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
  // 7 — notification_count
  {
    id: "notification_count",
    type: "slider",
    question: t("onboarding.questions.notification_count"),
    required: true,
    min: 1,
    max: 10,
    step: 6,
  },
  // 8 — notification_time_range
  {
    id: "notification_time_range",
    type: "text", // handled as custom time picker
    question: t("onboarding.questions.notification_time_range"),
    required: true,
  },
];

// Backward compatibility export
export const onboardingQuestions = (t: (key: string) => string) =>
  getOnboardingQuestions(t);
