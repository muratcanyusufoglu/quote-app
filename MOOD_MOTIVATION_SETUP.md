# Mood-Based Motivation Feature Setup

This feature provides personalized motivational messages based on the user's current mood using Google's Gemini AI.

## Features

- **AI-Powered Motivation**: Uses Gemini 2.0 Flash model to generate personalized motivational messages
- **Mood Assessment**: Three-step emoji-based mood evaluation
- **Smooth Animations**: Beautiful slide-up modal with smooth transitions
- **Share Functionality**: Users can share generated messages
- **Retry Option**: Generate different messages with the same mood inputs
- **Localization**: Full Turkish and English support

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variables

Create a `.env` file in your project root and add:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

The feature uses existing dependencies:
- `expo-linear-gradient` for beautiful gradients
- `react-native` for core functionality
- `expo-sharing` for share functionality

### 4. Usage

The feature is automatically integrated into the main screen. Users can:

1. Tap the brain icon (🧠) next to the search icon
2. Answer three mood questions with emoji selections
3. Receive a personalized motivational message
4. Share or generate a different message

## Architecture

### Components

- **AIMoodIcon**: Colorful brain icon with gradient design
- **MoodSelectionModal**: Three-step mood assessment modal
- **AIMessageCard**: Displays generated messages with actions
- **AIService**: Handles Gemini API communication

### Hooks

- **useMoodMotivation**: Manages feature state and logic

### Services

- **AIService**: Handles API calls to Gemini with proper error handling

## Localization

All text strings are localized in:
- `src/data/translations/en.json`
- `src/data/translations/tr.json`

Key translation namespace: `mood_motivation`

## Error Handling

The feature includes comprehensive error handling:
- API key validation
- Network error handling
- User-friendly error messages
- Graceful fallbacks

## Performance

- Lazy loading of AI components
- Optimized re-renders with useCallback
- Efficient state management
- Minimal API calls

## Security

- API key stored in environment variables
- Input validation and sanitization
- Safe content filtering via Gemini's safety settings
- No sensitive data stored locally 