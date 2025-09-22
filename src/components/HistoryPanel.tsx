import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Search, Star, Calendar } from 'lucide-react';
import { SentimentResult } from '@/lib/sentimentAnalysis';
import { getHistory, deleteHistoryItem, clearHistory, getHistoryStats } from '@/lib/historyService';

interface HistoryPanelProps {
  onSelectAnalysis: (result: SentimentResult) => void;
}

const HistoryPanel = ({ onSelectAnalysis }: HistoryPanelProps) => {
  const [history, setHistory] = useState<SentimentResult[]>(getHistory());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  const stats = getHistoryStats();

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSentiment === 'all' || item.overallSentiment === filterSentiment;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteItem = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!history.length) {
    return (
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No analysis history available</p>
            <p className="text-sm mt-1">Start analyzing some text to see your history here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Analysis History Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.sentimentCounts.positive}</div>
                <div className="text-sm text-muted-foreground">Positive</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.sentimentCounts.negative}</div>
                <div className="text-sm text-muted-foreground">Negative</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Previous sentiment analyses</CardDescription>
            </div>
            <Button onClick={handleClearAll} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'positive', 'neutral', 'negative'].map((filter) => (
                <Button
                  key={filter}
                  variant={filterSentiment === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSentiment(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* History Items */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => onSelectAnalysis(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSentimentColor(item.overallSentiment)} border`}>
                        {item.overallSentiment}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < item.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(item.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>
                      P: {Math.round(item.positive * 100)}% | 
                      N: {Math.round(item.neutral * 100)}% | 
                      Neg: {Math.round(item.negative * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {filteredHistory.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No analyses match your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPanel;