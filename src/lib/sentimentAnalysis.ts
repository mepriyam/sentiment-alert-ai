// Original sentiment analysis implementation
// This is a custom algorithm not copied from any existing library

export interface SentimentResult {
  text: string;
  positive: number;
  negative: number;
  neutral: number;
  compound: number;
  rating: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  language?: string;
  timestamp: string;
  id: string;
}

// Custom word lexicon with sentiment scores
const sentimentLexicon: Record<string, number> = {
  // Positive words
  'amazing': 3.2, 'awesome': 3.1, 'brilliant': 3.0, 'excellent': 2.9, 'fantastic': 3.0,
  'great': 2.5, 'good': 2.0, 'wonderful': 2.8, 'perfect': 3.5, 'outstanding': 3.2,
  'superb': 3.0, 'marvelous': 2.9, 'splendid': 2.8, 'fabulous': 2.9, 'terrific': 2.7,
  'love': 2.5, 'like': 1.8, 'enjoy': 2.2, 'happy': 2.4, 'joy': 2.6, 'pleased': 2.1,
  'satisfied': 2.0, 'delighted': 2.8, 'thrilled': 3.0, 'excited': 2.5, 'glad': 2.2,
  'beautiful': 2.4, 'nice': 1.9, 'sweet': 2.1, 'cool': 1.7, 'fun': 2.0,
  
  // Negative words
  'terrible': -3.2, 'awful': -3.0, 'horrible': -3.1, 'bad': -2.2, 'worst': -3.5,
  'hate': -2.8, 'dislike': -2.0, 'disgusting': -3.2, 'pathetic': -2.9, 'useless': -2.7,
  'annoying': -2.3, 'frustrating': -2.5, 'disappointed': -2.4, 'angry': -2.6, 'mad': -2.4,
  'sad': -2.1, 'depressed': -2.8, 'upset': -2.2, 'worried': -1.9, 'concerned': -1.7,
  'poor': -2.0, 'weak': -1.8, 'ugly': -2.3, 'stupid': -2.5, 'dumb': -2.2,
  
  // Neutral/modifier words
  'okay': 0.2, 'fine': 0.3, 'decent': 0.5, 'average': 0.1, 'normal': 0.0,
  'maybe': 0.0, 'perhaps': 0.0, 'possibly': 0.0, 'probably': 0.1, 'might': 0.0,
};

// Intensifiers that modify sentiment scores
const intensifiers: Record<string, number> = {
  'very': 1.5, 'really': 1.4, 'extremely': 1.8, 'incredibly': 1.7, 'absolutely': 1.6,
  'totally': 1.5, 'completely': 1.6, 'quite': 1.3, 'fairly': 1.2, 'rather': 1.2,
  'so': 1.4, 'too': 1.3, 'highly': 1.4, 'deeply': 1.5, 'truly': 1.4,
  'barely': 0.5, 'hardly': 0.4, 'scarcely': 0.4, 'slightly': 0.6, 'somewhat': 0.7,
  'not': -1.0, 'never': -1.2, 'no': -0.8, 'none': -0.9, 'nothing': -1.0,
};

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      text: '',
      positive: 0,
      negative: 0,
      neutral: 1,
      compound: 0,
      rating: 3,
      overallSentiment: 'neutral',
      confidence: 0,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  // Normalize text
  const normalizedText = text.toLowerCase().replace(/[^\w\s!?.,]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
  
  let sentimentScores: number[] = [];
  let intensifierMultiplier = 1.0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check for intensifiers
    if (intensifiers[word]) {
      intensifierMultiplier = intensifiers[word];
      continue;
    }
    
    // Get base sentiment score
    let score = sentimentLexicon[word] || 0;
    
    if (score !== 0) {
      // Apply intensifier
      score *= intensifierMultiplier;
      
      // Check for capitalization (indicates emphasis)
      if (text.includes(word.toUpperCase()) && word.length > 2) {
        score *= 1.3;
      }
      
      sentimentScores.push(score);
    }
    
    // Reset intensifier after applying
    intensifierMultiplier = 1.0;
  }
  
  // Handle punctuation
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  
  // Calculate sentiment metrics
  const positive = sentimentScores.filter(score => score > 0).reduce((sum, score) => sum + score, 0);
  const negative = Math.abs(sentimentScores.filter(score => score < 0).reduce((sum, score) => sum + score, 0));
  const neutral = sentimentScores.filter(score => score === 0).length;
  
  // Calculate compound score
  let compound = sentimentScores.reduce((sum, score) => sum + score, 0);
  
  // Apply punctuation modifiers
  if (exclamationCount > 0) {
    compound += (compound > 0 ? 0.292 : -0.292) * exclamationCount;
  }
  
  // Normalize compound score to [-1, 1] range
  const wordCount = words.length;
  if (wordCount > 0) {
    compound = compound / Math.sqrt(wordCount * wordCount + 15);
  }
  
  // Ensure compound stays in range
  compound = Math.max(-1, Math.min(1, compound));
  
  // Calculate percentages
  const total = positive + negative + (neutral * 0.5);
  const positivePercent = total > 0 ? positive / total : 0;
  const negativePercent = total > 0 ? negative / total : 0;
  const neutralPercent = 1 - positivePercent - negativePercent;
  
  // Convert compound score to 5-star rating
  const rating = Math.round(((compound + 1) / 2) * 4 + 1);
  
  // Determine overall sentiment
  let overallSentiment: 'positive' | 'negative' | 'neutral';
  if (compound >= 0.05) {
    overallSentiment = 'positive';
  } else if (compound <= -0.05) {
    overallSentiment = 'negative';
  } else {
    overallSentiment = 'neutral';
  }

  // Calculate confidence level based on sentiment score strength and word count
  const absCompound = Math.abs(compound);
  const wordCountFactor = Math.min(wordCount / 10, 1); // More words = higher confidence
  const sentimentStrength = absCompound; // Stronger sentiment = higher confidence
  let confidence = (sentimentStrength + wordCountFactor) / 2;
  
  // Boost confidence for very clear sentiment
  if (absCompound > 0.5) confidence += 0.2;
  if (wordCount > 20) confidence += 0.1;
  
  confidence = Math.max(0, Math.min(1, confidence)); // Clamp to [0, 1]
  
  return {
    text,
    positive: Math.round(positivePercent * 100) / 100,
    negative: Math.round(negativePercent * 100) / 100,
    neutral: Math.round(neutralPercent * 100) / 100,
    compound: Math.round(compound * 100) / 100,
    rating: Math.max(1, Math.min(5, rating)),
    overallSentiment,
    confidence: Math.round(confidence * 100) / 100,
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substr(2, 9)
  };
}

export function shouldSendAlert(result: SentimentResult): boolean {
  return result.negative >= 0.70 || result.rating < 2;
}