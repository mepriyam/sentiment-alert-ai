import { SentimentResult } from './sentimentAnalysis';

const HISTORY_KEY = 'sentiment_analysis_history';
const MAX_HISTORY_ITEMS = 100;

export function saveToHistory(result: SentimentResult): void {
  try {
    const history = getHistory();
    history.unshift(result);
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

export function getHistory(): SentimentResult[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
}

export function getHistoryStats() {
  const history = getHistory();
  if (history.length === 0) return null;

  const totalAnalyses = history.length;
  const sentimentCounts = {
    positive: history.filter(h => h.overallSentiment === 'positive').length,
    neutral: history.filter(h => h.overallSentiment === 'neutral').length,
    negative: history.filter(h => h.overallSentiment === 'negative').length,
  };

  const avgRating = history.reduce((sum, h) => sum + h.rating, 0) / totalAnalyses;
  const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / totalAnalyses;

  return {
    totalAnalyses,
    sentimentCounts,
    avgRating: Math.round(avgRating * 10) / 10,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    recentAnalyses: history.slice(0, 10)
  };
}