import { OnboardingQuestion } from "../types";

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "purpose",
    type: "single",
    question: "Uygulamayı hangi amaçla kullanmak istiyorsunuz?",
    required: true,
    options: [
      {
        id: "motivation",
        label: "Motivasyon ve ilham",
        value: "motivation",
        icon: "star",
      },
      {
        id: "learning",
        label: "Öğrenme ve gelişim",
        value: "learning",
        icon: "book",
      },
      {
        id: "relaxation",
        label: "Rahatlama ve huzur",
        value: "relaxation",
        icon: "heart",
      },
      {
        id: "growth",
        label: "Kişisel büyüme",
        value: "growth",
        icon: "trending-up",
      },
      {
        id: "inspiration",
        label: "Yaratıcı ilham",
        value: "inspiration",
        icon: "lightbulb",
      },
    ],
  },
  {
    id: "topics",
    type: "multiple",
    question: "Hangi konularla ilgili quote'lar sizi daha çok ilgilendiriyor?",
    required: true,
    options: [
      {
        id: "success",
        label: "Başarı",
        value: "success",
        icon: "crown",
      },
      {
        id: "happiness",
        label: "Mutluluk",
        value: "happiness",
        icon: "heart",
      },
      {
        id: "wisdom",
        label: "Bilgelik",
        value: "wisdom",
        icon: "book",
      },
      {
        id: "love",
        label: "Aşk",
        value: "love",
        icon: "heart",
      },
      {
        id: "growth",
        label: "Gelişim",
        value: "growth",
        icon: "tree-pine",
      },
      {
        id: "peace",
        label: "Huzur",
        value: "peace",
        icon: "heart",
      },
      {
        id: "strength",
        label: "Güç",
        value: "strength",
        icon: "zap",
      },
      {
        id: "creativity",
        label: "Yaratıcılık",
        value: "creativity",
        icon: "palette",
      },
      {
        id: "leadership",
        label: "Liderlik",
        value: "leadership",
        icon: "crown",
      },
      {
        id: "courage",
        label: "Cesaret",
        value: "courage",
        icon: "shield",
      },
      {
        id: "mindfulness",
        label: "Farkındalık",
        value: "mindfulness",
        icon: "church",
      },
      {
        id: "gratitude",
        label: "Şükür",
        value: "gratitude",
        icon: "gift",
      },
    ],
  },
  {
    id: "motivation_style",
    type: "single",
    question: "Hangi tarzda motivasyon sizi daha çok etkiler?",
    required: true,
    options: [
      {
        id: "gentle",
        label: "Yumuşak ve nazik",
        value: "gentle",
        icon: "heart",
      },
      {
        id: "strong",
        label: "Güçlü ve cesur",
        value: "strong",
        icon: "zap",
      },
      {
        id: "balanced",
        label: "Dengeli",
        value: "balanced",
        icon: "scale",
      },
    ],
  },
  {
    id: "preferred_time",
    type: "single",
    question: "Quote'ları genellikle ne zaman okumayı tercih edersiniz?",
    required: true,
    options: [
      {
        id: "morning",
        label: "Sabah",
        value: "morning",
        icon: "sunrise",
      },
      {
        id: "afternoon",
        label: "Öğle",
        value: "afternoon",
        icon: "zap",
      },
      {
        id: "evening",
        label: "Akşam",
        value: "evening",
        icon: "moon",
      },
    ],
  },
  {
    id: "reading_length",
    type: "single",
    question: "Ne kadar uzun quote'ları okumayı seviyorsunuz?",
    required: true,
    options: [
      {
        id: "short",
        label: "Kısa ve özlü",
        value: "short",
        icon: "zap",
      },
      {
        id: "medium",
        label: "Orta uzunlukta",
        value: "medium",
        icon: "book",
      },
      {
        id: "long",
        label: "Uzun ve detaylı",
        value: "long",
        icon: "book",
      },
    ],
  },
  {
    id: "notification_count",
    type: "slider",
    question: "Günde kaç bildirim almak istersiniz?",
    required: true,
    min: 1,
    max: 10,
    step: 1,
  },
  {
    id: "notification_time_range",
    type: "text", // Will be handled as custom time picker
    question: "Hangi saatler arasında bildirim almak istersiniz?",
    required: true,
  },
  {
    id: "frequency",
    type: "single",
    question: "Ne sıklıkla yeni içerik keşfetmek istersiniz?",
    required: true,
    options: [
      {
        id: "daily",
        label: "Her gün",
        value: "daily",
        icon: "calendar",
      },
      {
        id: "weekly",
        label: "Haftada birkaç kez",
        value: "weekly",
        icon: "calendar",
      },
      {
        id: "occasional",
        label: "Arada Sırada",
        value: "occasional",
        icon: "target",
      },
    ],
  },
];
