import { Theme } from "../types";

export const darkTheme: Theme = {
  colors: {
    primary: "#6366F1", // Indigo
    secondary: "#EC4899", // Pink
    background: "#0F0F23", // Very dark navy
    surface: "#1A1B36", // Dark navy
    text: "#F8FAFC", // Light text
    textSecondary: "#94A3B8", // Muted text
    border: "#334155", // Slate border
    error: "#EF4444", // Red
    warning: "#F59E0B", // Amber
    success: "#10B981", // Emerald
    premium: "#F59E0B", // Gold for premium features
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// Category colors for visual distinction
export const categoryColors = {
  motivation: "#EC4899",
  success: "#10B981",
  wisdom: "#8B5CF6",
  happiness: "#F59E0B",
  love: "#F43F5E",
  life: "#06B6D4",
  inspiration: "#6366F1",
  growth: "#84CC16",
  courage: "#EF4444",
  peace: "#14B8A6",
  strength: "#F97316",
  dreams: "#A855F7",
  friendship: "#10B981",
  family: "#F59E0B",
  work: "#6366F1",
  health: "#22C55E",
  education: "#3B82F6",
  creativity: "#EC4899",
  leadership: "#F97316",
  spirituality: "#8B5CF6",
  mindfulness: "#14B8A6",
  resilience: "#EF4444",
  gratitude: "#F59E0B",
  change: "#06B6D4",
  adventure: "#84CC16",
  purpose: "#6366F1",
  balance: "#8B5CF6",
  confidence: "#EC4899",
  forgiveness: "#14B8A6",
  hope: "#F59E0B",
} as const;

// Icon mappings for categories
export const categoryIcons = {
  motivation: "🚀",
  success: "🏆",
  wisdom: "🧠",
  happiness: "😊",
  love: "❤️",
  life: "🌱",
  inspiration: "✨",
  growth: "📈",
  courage: "🦁",
  peace: "☮️",
  strength: "💪",
  dreams: "🌟",
  friendship: "🤝",
  family: "👨‍👩‍👧‍👦",
  work: "💼",
  health: "🏃‍♂️",
  education: "📚",
  creativity: "🎨",
  leadership: "👑",
  spirituality: "🙏",
  mindfulness: "🧘‍♀️",
  resilience: "🌊",
  gratitude: "🙏",
  change: "🔄",
  adventure: "🗺️",
  purpose: "🎯",
  balance: "⚖️",
  confidence: "💫",
  forgiveness: "🕊️",
  hope: "🌅",
} as const;
