# 📱 QuoteSpark - Daily Motivational Quotes

> A beautiful React Native app that delivers daily inspiration through carefully curated quotes and stories.

## 🌟 Features

- 📚 **10,000+ Curated Quotes** - Hand-picked motivational quotes from world leaders
- 🎯 **25+ Categories** - Motivation, Success, Leadership, Mindfulness and more
- 📖 **Inspiring Stories** - Background stories behind famous quotes
- 🎨 **Beautiful Themes** - Multiple dark/light themes with smooth transitions
- 🌍 **Multi-language** - English and Turkish support
- 💎 **Premium Features** - Unlimited access, ad-free experience
- 🔔 **Smart Notifications** - Daily inspiration reminders
- 📊 **Analytics** - Track your reading habits and growth
- 🎭 **Reels Experience** - TikTok-style quote browsing

## 🚀 Quick Start

### Prerequisites

- Node.js (18+)
- Expo CLI
- iOS Simulator / Android Emulator
- Firebase Project
- RevenueCat Account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quote

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android
```

## 🔧 Configuration

### 1. Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add iOS app with bundle ID: `com.quotespark.dailyinspiration`
3. Add Android app with package name: `com.quotespark.dailyinspiration`
4. Download configuration files:
   - `GoogleService-Info.plist` (iOS) → Root directory
   - `google-services.json` (Android) → Root directory

### 2. RevenueCat Setup

1. Create account at [revenuecat.com](https://revenuecat.com)
2. Create new project and add your app
3. Configure products:
   - `com.quotespark.dailyinspiration.lifetime`
   - `com.quotespark.dailyinspiration.yearly`
4. Update API key in `src/constants/config.ts`

### 3. Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your_production_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourapp.com
```

## 📱 App Store Deployment

### iOS

1. Configure certificates in Apple Developer Console
2. Update `app.json` with correct bundle identifier
3. Build with EAS:

```bash
eas build --platform ios --profile production
```

### Android

1. Generate keystore for signing
2. Configure Play Console
3. Build AAB:

```bash
eas build --platform android --profile production
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Analytics Events

- `screen_view` - Page views
- `quote_view` - Quote interactions
- `quote_share` - Social sharing
- `category_filter` - Category selections
- `paywall_view` - Premium upgrade flows
- `purchase_complete` - Successful purchases

## 🛡️ Privacy & Legal

- [Privacy Policy](https://quotespark.com/privacy)
- [Terms of Service](https://quotespark.com/terms)
- GDPR/CCPA compliant
- No personal data collection without consent

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # Business logic & API
├── store/          # State management (Zustand)
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
├── types/          # TypeScript definitions
├── data/           # Static data & quotes
└── constants/      # App configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Email: support@quotespark.com
- Documentation: [docs.quotespark.com](https://docs.quotespark.com)
- Issues: [GitHub Issues](https://github.com/youruser/quote/issues)

---

Made with ❤️ by QuoteSpark Team
