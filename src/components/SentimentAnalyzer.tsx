import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { analyzeSentiment, shouldSendAlert, type SentimentResult } from '@/lib/sentimentAnalysis';
import { useToast } from '@/hooks/use-toast';
import { Star, Mail, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentAnalyzer = () => {
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Real-time analysis with debouncing
  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      const analysisResult = analyzeSentiment(text);
      setResult(analysisResult);
      setIsLoading(false);

      // Check if alert should be sent
      if (shouldSendAlert(analysisResult) && email) {
        handleSendAlert(analysisResult);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [text, email]);

  const handleSendAlert = async (sentimentResult: SentimentResult) => {
    try {
      // In a real app, this would send an actual email via Supabase Edge Functions
      // For now, we'll show a toast notification
      toast({
        title: "Alert Triggered",
        description: `Negative sentiment detected (${Math.round(sentimentResult.negative * 100)}% negative, ${sentimentResult.rating}/5 rating). Alert sent to ${email}`,
        variant: "destructive",
      });
      
      console.log('Alert would be sent to:', email);
      console.log('Sentiment data:', sentimentResult);
    } catch (error) {
      toast({
        title: "Alert Failed",
        description: "Failed to send sentiment alert email",
        variant: "destructive",
      });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-positive';
      case 'negative': return 'text-negative';
      default: return 'text-neutral';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-gradient-positive';
      case 'negative': return 'bg-gradient-negative';
      default: return 'bg-gradient-neutral';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-positive" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-negative" />;
      default: return <Minus className="w-5 h-5 text-neutral" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Sentiment Analysis Tool
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze text sentiment with real-time feedback and automatic alerting
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Text Analysis
            </CardTitle>
            <CardDescription>
              Enter your text below to analyze its emotional sentiment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text to Analyze</Label>
              <Textarea
                id="text-input"
                placeholder="Enter your text here for sentiment analysis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32 resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {text.length} characters | {text.trim().split(/\s+/).filter(w => w).length} words
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-input" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Alert Email (Optional)
              </Label>
              <Input
                id="email-input"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get notified when negative sentiment exceeds 70% or rating drops below 2/5
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(result || isLoading) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Overall Rating
                  {result && getSentimentIcon(result.overallSentiment)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </div>
                ) : result && (
                  <>
                    <div className="flex items-center justify-center space-x-1">
                      {renderStars(result.rating)}
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{result.rating}/5</div>
                      <Badge 
                        variant="secondary" 
                        className={`mt-2 ${getSentimentBg(result.overallSentiment)} text-white`}
                      >
                        {result.overallSentiment.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      Compound Score: {result.compound}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sentiment Breakdown */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
                <CardDescription>Detailed percentage analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : result && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-positive">Positive</span>
                        <span className="text-sm font-bold">{Math.round(result.positive * 100)}%</span>
                      </div>
                      <Progress value={result.positive * 100} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral">Neutral</span>
                        <span className="text-sm font-bold">{Math.round(result.neutral * 100)}%</span>
                      </div>
                      <Progress value={result.neutral * 100} className="h-3" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-negative">Negative</span>
                        <span className="text-sm font-bold">{Math.round(result.negative * 100)}%</span>
                      </div>
                      <Progress value={result.negative * 100} className="h-3" />
                    </div>

                    {shouldSendAlert(result) && (
                      <div className="mt-4 p-3 bg-negative-light border border-negative/20 rounded-lg">
                        <p className="text-sm font-medium text-negative">
                          ⚠️ Alert Threshold Reached
                        </p>
                        <p className="text-xs text-negative/80 mt-1">
                          High negative sentiment detected
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!result && !isLoading && (
          <Card className="shadow-card border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start typing to see real-time sentiment analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalyzer;