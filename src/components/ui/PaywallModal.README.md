# PaywallModal System

Modern, component-based paywall solution for React Native apps with RevenueCat integration support.

## 🏗️ Architecture

The paywall system follows SOLID principles with clear separation of concerns:

```
PaywallService (Business Logic)
    ↓
PaywallStore (State Management)
    ↓
PaywallModal (UI Component)
    ↓
usePaywall Hook (Easy Integration)
```

## 🎯 Features

- ✅ **Modern UI Design** - Gradient backgrounds, premium animations
- ✅ **Single Annual Subscription** - Focus on yearly plans with 3-day free trial
- ✅ **RevenueCat Ready** - Designed for easy RevenueCat integration
- ✅ **Component-based Architecture** - Reusable and maintainable
- ✅ **SOLID Principles** - Clean, extensible code structure
- ✅ **Global Access** - Paywall accessible from anywhere in the app
- ✅ **Action Tracking** - Automatic trigger after user actions
- ✅ **Multiple Contexts** - Different paywall content based on trigger source
- ✅ **Theme Integration** - Matches app's design system
- ✅ **Mock Support** - Works without RevenueCat during development

## 🚀 Quick Start

### 1. Show Paywall

```typescript
import { usePaywall } from '../hooks/usePaywall';

function MyComponent() {
  const { showPremiumCategoryPaywall, trackAction } = usePaywall();

  const handlePremiumFeature = () => {
    // Track user action (will show paywall after 15 actions)
    trackAction();
    
    // Or show paywall immediately for premium features
    showPremiumCategoryPaywall();
  };

  return (
    <TouchableOpacity onPress={handlePremiumFeature}>
      <Text>Access Premium Feature</Text>
    </TouchableOpacity>
  );
}
```

### 2. Check Premium Access

```typescript
import { usePremiumAccess } from '../hooks/usePaywall';

function PremiumFeature() {
  const { requirePremiumAccess } = usePremiumAccess();

  const handleAccessPremium = () => {
    requirePremiumAccess(
      () => {
        // User has premium access
        console.log('Access granted!');
      },
      () => {
        // User doesn't have premium access, paywall shown
        console.log('Premium required');
      }
    );
  };

  return (
    <TouchableOpacity onPress={handleAccessPremium}>
      <Text>Premium Feature</Text>
    </TouchableOpacity>
  );
}
```

### 3. Purchase Management

```typescript
import { useSubscriptionStatus } from '../hooks/usePaywall';

function SubscriptionManager() {
  const { getDetailedStatus } = useSubscriptionStatus();

  const checkStatus = async () => {
    const status = await getDetailedStatus();
    console.log('Subscription status:', status);
    // { status, isActive, inTrial, isPremium }
  };

  return (
    <TouchableOpacity onPress={checkStatus}>
      <Text>Check Subscription</Text>
    </TouchableOpacity>
  );
}
```

## 🎨 Paywall Contexts

The paywall adapts its content based on the trigger source:

### Welcome Paywall
```typescript
const { showWelcomePaywall } = usePaywall();
showWelcomePaywall(); // Shows on first app launch
```

### Premium Category Access
```typescript
const { showPremiumCategoryPaywall } = usePaywall();
showPremiumCategoryPaywall(); // Shows when accessing premium content
```

### Story Limit Reached
```typescript
const { showStoryLimitPaywall } = usePaywall();
showStoryLimitPaywall(); // Shows when story reading limit reached
```

### Action Limit Reached
```typescript
const { showActionLimitPaywall } = usePaywall();
// Automatically triggered after 15 user actions
```

## 🔧 Configuration

### Subscription Package Configuration

Edit `src/services/PaywallService.ts`:

```typescript
const MOCK_SUBSCRIPTION = {
  id: "annual_premium",
  title: "Annual Premium", 
  originalPrice: "$59.99",
  currentPrice: "$39.99",
  discount: "33% OFF",
  period: "year",
  freeTrialDays: 3,
  pricePerMonth: "$3.33",
  features: [
    "Unlimited premium quotes",
    "Unlimited stories & content",
    "Ad-free experience",
    // Add more features...
  ]
};
```

### Action Limit Configuration

Edit `src/store/usePaywallStore.ts`:

```typescript
const ACTION_LIMIT = 15; // Show paywall every 15 actions
```

## 🔌 RevenueCat Integration

### 1. Install RevenueCat

```bash
npm install react-native-purchases
```

### 2. Create RevenueCat Provider

Create `src/services/RevenueCatProvider.ts`:

```typescript
import Purchases from 'react-native-purchases';
import { IPurchaseProvider, SubscriptionPackage, PurchaseResult } from './PaywallService';

export class RevenueCatPurchaseProvider implements IPurchaseProvider {
  async initialize(): Promise<void> {
    await Purchases.configure({
      apiKey: 'your_revenuecat_api_key',
    });
  }

  async getAvailablePackages(): Promise<SubscriptionPackage[]> {
    const offerings = await Purchases.getOfferings();
    // Transform RevenueCat offerings to SubscriptionPackage[]
  }

  async purchasePackage(packageId: string): Promise<PurchaseResult> {
    // Implement RevenueCat purchase logic
  }

  // ... implement other methods
}
```

### 3. Update Service Factory

Edit `src/services/PaywallService.ts`:

```typescript
export class PaywallServiceFactory {
  static createWithRevenueCatProvider(): PaywallService {
    const revenueCatProvider = new RevenueCatPurchaseProvider();
    return new PaywallService(revenueCatProvider);
  }
}

export const getPaywallService = (): PaywallService => {
  if (!paywallServiceInstance) {
    // Use RevenueCat in production, Mock in development
    paywallServiceInstance = __DEV__ 
      ? PaywallServiceFactory.createWithMockProvider()
      : PaywallServiceFactory.createWithRevenueCatProvider();
  }
  return paywallServiceInstance;
};
```

## 🎨 Customization

### UI Customization

The paywall uses your app's theme colors automatically. Key theme colors used:

- `theme.colors.brandYellow` - Primary accent color
- `theme.colors.premium` - Premium/upgrade color  
- `theme.colors.gradientColors` - Background gradients
- `theme.colors.white` - Text on colored backgrounds
- `theme.colors.text` - Primary text color

### Content Customization

Edit content in `src/components/ui/PaywallModal.tsx`:

```typescript
const getContentBySource = (source: PaywallTriggerSource | null) => {
  // Customize titles, subtitles, and CTA text for each context
};
```

## 📱 Component Structure

```
PaywallModal
├── HeaderGradient (with close button and premium icon)
├── PricingCard (subscription details with trial badge)
├── FeaturesSection (premium features list)
├── ActionSection (purchase and restore buttons)
└── Footer (legal text)
```

### Key Components

- **PremiumFeature** - Individual feature item with icon
- **PricingCard** - Subscription pricing with gradient
- **Gradient Backgrounds** - Match app theme
- **IconSymbol** - Consistent iconography

## 🔍 Debugging

Enable detailed logging:

```typescript
// All paywall actions are logged with prefixes:
// 💰 PaywallService operations
// 📱 Paywall show/hide actions  
// 🛒 Purchase operations
// 📊 Action tracking
// ✅ Successful operations
// ❌ Error operations
```

## 🧪 Testing

### Mock Data Testing

The system works out-of-the-box with mock data for testing:

```typescript
// Mock purchase (90% success rate)
const { purchaseSubscription } = usePaywall();
await purchaseSubscription(); // Will simulate purchase process
```

### Production Testing

1. Test with RevenueCat Sandbox
2. Test purchase flows
3. Test restore purchases
4. Test subscription status checking

## 🏆 Best Practices

1. **Always track actions** - Use `trackAction()` for user interactions
2. **Check premium access** - Use `requirePremiumAccess()` for premium features
3. **Handle errors gracefully** - The system includes comprehensive error handling
4. **Test thoroughly** - Test all paywall contexts and purchase flows
5. **Monitor analytics** - Track paywall conversion rates and user behavior

## 🚨 Important Notes

- PaywallModal is rendered globally in `app/_layout.tsx`
- PaywallService is initialized on app startup
- Action counting persists across app sessions
- Premium status should be checked server-side for security
- Always test purchase flows in sandbox environment first

## 📖 API Reference

See individual hook documentation:
- `usePaywall()` - Main paywall management
- `usePaywallActionTracker()` - Action tracking
- `useSubscriptionStatus()` - Subscription status
- `usePremiumAccess()` - Premium access control 