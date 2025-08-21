import { MoodResponse } from "./MoodMotivationService";

interface AIMessageResponse {
  message: string;
  success: boolean;
  error?: string;
}

class AIService {
  private readonly GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
  private readonly API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  async generateMoodBasedMotivation(
    moodResponse: MoodResponse
  ): Promise<AIMessageResponse> {
    try {
      if (!this.API_KEY) {
        console.error("❌ Gemini API key not found");
        return {
          message: "",
          success: false,
          error: "API key not configured",
        };
      }

      const prompt = this.buildPrompt(moodResponse);

      const response = await fetch(
        `${this.GEMINI_API_URL}?key=${this.API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Gemini API error:", errorData);
        return {
          message: "",
          success: false,
          error: `API Error: ${response.status}`,
        };
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error("❌ Unexpected API response format:", data);
        return {
          message: "",
          success: false,
          error: "Invalid response format",
        };
      }

      const generatedText = data.candidates[0].content.parts[0].text;

      // Clean up the response
      const cleanMessage = this.cleanGeneratedMessage(generatedText);

      console.log("✅ AI generated message:", cleanMessage);

      return {
        message: cleanMessage,
        success: true,
      };
    } catch (error) {
      console.error("❌ Error generating AI message:", error);
      return {
        message: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private buildPrompt(moodResponse: MoodResponse): string {
    // Universal emoji mapping for all languages
    const feelingMap: { [key: string]: string } = {
      "😄": "very good",
      "🙂": "good", 
      "😐": "neutral",
      "😟": "bad",
      "😔": "very bad",
    };

    const energyMap: { [key: string]: string } = {
      "⚡": "high energy",
      "💪": "strong",
      "😴": "low energy", 
      "🔋": "charged up",
    };

    const affectingMap: { [key: string]: string } = {
      "😊": "happiness",
      "😥": "sadness",
      "😠": "stress",
      "💡": "inspiration",
      "🌧️": "gloom",
      "✨": "hope",
    };

    const feeling = feelingMap[moodResponse.mood] || moodResponse.mood;
    const energy = energyMap[moodResponse.energy] || moodResponse.energy;
    const affecting = affectingMap[moodResponse.affecting] || moodResponse.affecting;

    const userNamePart = moodResponse.userName
      ? `User's name is ${moodResponse.userName}.`
      : "User is anonymous.";

    // Language mapping for all supported languages
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'tr': 'Turkish',
      'de': 'German',
      'es': 'Spanish',
      'fr': 'French',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'ru': 'Russian',
      'ja': 'Japanese',
      'th': 'Thai',
      'id': 'Indonesian',
      'ms': 'Malay'
    };

    const targetLanguage = languageMap[moodResponse.language] || 'English';

    return `You are a motivational expert. ${userNamePart} Write a personalized, short and effective motivational message based on the user's mood.

IMPORTANT: Write the message in ${targetLanguage} language.

User's current state:
- General mood: ${feeling}
- Energy level: ${energy}
- Most affected by: ${affecting}

Please write a message that meets these criteria:
1. Use ${targetLanguage} language
2. Keep it 2-3 sentences long
3. Be positive and encouraging
4. Show understanding of their current state
5. Provide practical and actionable suggestions
6. Use an empathetic and supportive tone
7. Avoid unnecessary length, be concise and effective
${moodResponse.userName ? `8. Naturally include the user's name (${moodResponse.userName}) in the message` : ""}

Write the message directly, no headers or explanations.`;
  }

  private cleanGeneratedMessage(message: string): string {
    // Remove any markdown formatting, quotes, or extra whitespace
    return message
      .replace(/^["""']|["""']$/g, "") // Remove surrounding quotes
      .replace(/^\s*[-*]\s*/gm, "") // Remove list markers
      .replace(/^\s*#+\s*/gm, "") // Remove markdown headers
      .trim();
  }
}

export const aiService = new AIService();
export default aiService;
