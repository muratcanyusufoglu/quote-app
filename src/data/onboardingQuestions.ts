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
        label: "Motivasyon",
        value: "motivation",
        icon: "🚀",
      },
      {
        id: "learning",
        label: "Öğrenme",
        value: "learning",
        icon: "📚",
      },
      {
        id: "relaxation",
        label: "Rahatlama",
        value: "relaxation",
        icon: "😌",
      },
      {
        id: "growth",
        label: "Kişisel Gelişim",
        value: "growth",
        icon: "📈",
      },
      {
        id: "inspiration",
        label: "İlham Alma",
        value: "inspiration",
        icon: "✨",
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
        icon: "🏆",
      },
      {
        id: "happiness",
        label: "Mutluluk",
        value: "happiness",
        icon: "😊",
      },
      {
        id: "wisdom",
        label: "Bilgelik",
        value: "wisdom",
        icon: "🧠",
      },
      {
        id: "love",
        label: "Aşk",
        value: "love",
        icon: "❤️",
      },
      {
        id: "growth",
        label: "Gelişim",
        value: "growth",
        icon: "🌱",
      },
      {
        id: "peace",
        label: "Huzur",
        value: "peace",
        icon: "☮️",
      },
      {
        id: "strength",
        label: "Güç",
        value: "strength",
        icon: "💪",
      },
      {
        id: "creativity",
        label: "Yaratıcılık",
        value: "creativity",
        icon: "🎨",
      },
      {
        id: "leadership",
        label: "Liderlik",
        value: "leadership",
        icon: "👑",
      },
      {
        id: "courage",
        label: "Cesaret",
        value: "courage",
        icon: "🦁",
      },
      {
        id: "mindfulness",
        label: "Farkındalık",
        value: "mindfulness",
        icon: "🧘‍♀️",
      },
      {
        id: "gratitude",
        label: "Şükür",
        value: "gratitude",
        icon: "🙏",
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
        label: "Yumuşak ve Destekleyici",
        value: "gentle",
        icon: "🤗",
      },
      {
        id: "strong",
        label: "Güçlü ve Enerjik",
        value: "strong",
        icon: "⚡",
      },
      {
        id: "balanced",
        label: "Dengeli ve Ölçülü",
        value: "balanced",
        icon: "⚖️",
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
        label: "Sabahları",
        value: "morning",
        icon: "🌅",
      },
      {
        id: "afternoon",
        label: "Öğleden Sonra",
        value: "afternoon",
        icon: "☀️",
      },
      {
        id: "evening",
        label: "Akşamları",
        value: "evening",
        icon: "🌙",
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
        label: "Kısa ve Öz",
        value: "short",
        icon: "⚡",
      },
      {
        id: "medium",
        label: "Orta Uzunlukta",
        value: "medium",
        icon: "📝",
      },
      {
        id: "long",
        label: "Uzun ve Detaylı",
        value: "long",
        icon: "📖",
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
        label: "Her Gün",
        value: "daily",
        icon: "📅",
      },
      {
        id: "weekly",
        label: "Haftada Birkaç Kez",
        value: "weekly",
        icon: "📊",
      },
      {
        id: "occasional",
        label: "Arada Sırada",
        value: "occasional",
        icon: "🎯",
      },
    ],
  },
];
