interface MoodResponse {
  feeling: string;
  energy: string;
  affecting: string;
}

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
    const feelingMap: { [key: string]: string } = {
      "😄": "çok iyi",
      "🙂": "iyi",
      "😐": "normal",
      "😟": "kötü",
      "😔": "çok kötü",
    };

    const energyMap: { [key: string]: string } = {
      "⚡": "yüksek enerji",
      "💪": "güçlü",
      "😴": "düşük enerji",
      "🔋": "şarj olmuş",
    };

    const affectingMap: { [key: string]: string } = {
      "😊": "mutluluk",
      "😥": "üzüntü",
      "😠": "stres",
      "💡": "ilham",
      "🌧️": "kasvet",
      "✨": "umut",
    };

    const feeling = feelingMap[moodResponse.feeling] || moodResponse.feeling;
    const energy = energyMap[moodResponse.energy] || moodResponse.energy;
    const affecting =
      affectingMap[moodResponse.affecting] || moodResponse.affecting;

    return `Sen bir motivasyon uzmanısın. Kullanıcının ruh haline göre kişiselleştirilmiş, kısa ve etkili bir motivasyon mesajı yaz.

Kullanıcının durumu:
- Genel ruh hali: ${feeling}
- Enerji seviyesi: ${energy}
- En çok etkilendiği şey: ${affecting}

Lütfen şu kriterlere uygun bir mesaj yaz:
1. Sadece Türkçe kullan
2. 2-3 cümle uzunluğunda olsun
3. Pozitif ve cesaretlendirici olsun
4. Kullanıcının mevcut durumunu anladığını göstersin
5. Pratik ve uygulanabilir öneriler sun
6. Empatik ve destekleyici bir ton kullan
7. Gereksiz uzunluktan kaçın, öz ve etkili olsun

Mesajı doğrudan yaz, başlık veya açıklama ekleme.`;
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
