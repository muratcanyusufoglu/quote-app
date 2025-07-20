// Modern, smooth icons using Lucide React Native

import {
  AlertTriangle,
  Angry,
  ArrowLeft,
  ArrowRight,
  Battery,
  Bed,
  Bookmark,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Church,
  Clock,
  Cloud,
  CloudRain,
  Code,
  Coffee,
  Compass,
  Cpu,
  Crown,
  Download,
  Dumbbell,
  Eye,
  EyeOff,
  Filter,
  Flame,
  Frown,
  Gift,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Hourglass,
  Lightbulb,
  Lock,
  Map,
  Meh,
  Menu,
  MessageCircle,
  Moon,
  Mountain,
  Palette,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Send,
  Settings,
  Share,
  Shield,
  Smile,
  Sparkles,
  Star,
  Sunrise,
  Target,
  TargetIcon,
  TreePine,
  TrendingUp,
  Unlock,
  Upload,
  User,
  Users,
  X,
  Zap,
} from "lucide-react-native";
import {
  OpaqueColorValue,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

// Map of icon names to Lucide components
const ICON_MAPPING = {
  "house.fill": Home,
  home: Home,
  magnifyingglass: Search,
  search: Search,
  "heart.fill": Heart,
  heart: Heart,
  "clock.fill": Clock,
  clock: Clock,
  "chevron.right": ChevronRight,
  "chevron.down": ChevronDown,
  "chevron.left.forwardslash.chevron.right": Code,
  "paperplane.fill": Send,
  send: Send,
  menu: Menu,
  star: Star,
  "star.fill": Star,
  book: BookOpen,
  "book.fill": BookOpen,
  settings: Settings,
  person: User,
  "person.fill": User,
  plus: Plus,
  xmark: X,
  "arrow.left": ArrowLeft,
  "arrow.right": ArrowRight,
  checkmark: Check,
  "line.horizontal.3.decrease": Filter,
  bookmark: Bookmark,
  "bookmark.fill": Bookmark,
  "square.and.arrow.up": Share,
  "arrow.down.circle": Download,
  "arrow.up.circle": Upload,
  eye: Eye,
  "eye.slash": EyeOff,
  lock: Lock,
  "lock.open": Unlock,
  crown: Crown,

  // Category icons - comprehensive mapping
  lightbulb: Lightbulb,
  "trending-up": TrendingUp,
  shield: Shield,
  users: Users,
  briefcase: Briefcase,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  palette: Palette,
  church: Church,
  brain: Brain,
  mountain: Mountain,
  gift: Gift,
  "refresh-cw": RefreshCw,
  map: Map,
  target: Target,
  scale: Scale,
  zap: Zap,
  "message-circle": MessageCircle,
  compass: Compass,
  "tree-pine": TreePine,
  cpu: Cpu,
  hourglass: Hourglass,
  moon: Moon,
  sunrise: Sunrise,
  calendar: Calendar,
  sparkles: Sparkles,

  // Mood-related icons
  smile: Smile,
  frown: Frown,
  meh: Meh,
  angry: Angry,
  cloud: Cloud,
  flame: Flame,
  battery: Battery,
  coffee: Coffee,
  bed: Bed,
  dumbbell: Dumbbell,
  "alert-triangle": AlertTriangle,
  "cloud-rain": CloudRain,
  "target-icon": TargetIcon,
} as const;

export type IconName = keyof typeof ICON_MAPPING;

/**
 * Modern icon component using Lucide React Native for smooth, minimal icons
 * that look great across all platforms with consistent styling.
 */
export function IconSymbol({
  name,
  size = 24,
  color = "#000000",
  style,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}) {
  const IconComponent = ICON_MAPPING[name];

  // Debug logging
  console.log(`🔍 IconSymbol: Requesting icon "${name}"`);
  console.log(`🔍 IconComponent found:`, !!IconComponent);

  if (!IconComponent) {
    console.warn(`❌ Icon "${name}" not found in IconSymbol mapping`);
    console.log("Available icons:", Object.keys(ICON_MAPPING));

    // Return a debug text instead of fallback icon to identify the issue
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red",
          },
          style,
        ]}
      >
        <Text style={{ color: "white", fontSize: 8 }}>?</Text>
      </View>
    );
  }

  try {
    console.log(
      `✅ Rendering icon "${name}" with component:`,
      IconComponent.name
    );
    return (
      <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        style={style}
      />
    );
  } catch (error) {
    console.error(`❌ Error rendering icon "${name}":`, error);
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "orange",
          },
          style,
        ]}
      >
        <Text style={{ color: "white", fontSize: 8 }}>!</Text>
      </View>
    );
  }
}
