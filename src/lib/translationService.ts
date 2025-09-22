export interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  confidence: number;
}

export async function translateToEnglish(
  text: string,
  apiKey?: string
): Promise<TranslationResult> {
  if (!apiKey) {
    // Fallback: simple language detection and return original if English
    const isEnglish = /^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(text);
    return {
      originalText: text,
      translatedText: text,
      detectedLanguage: isEnglish ? 'en' : 'unknown',
      confidence: isEnglish ? 0.9 : 0.1
    };
  }

  try {
    // Using Google Translate API (requires API key)
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: 'en',
          format: 'text'
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const translation = data.data.translations[0];
    
    return {
      originalText: text,
      translatedText: translation.translatedText,
      detectedLanguage: translation.detectedSourceLanguage || 'unknown',
      confidence: 0.9
    };
  } catch (error) {
    console.error('Translation failed:', error);
    return {
      originalText: text,
      translatedText: text,
      detectedLanguage: 'unknown',
      confidence: 0.1
    };
  }
}