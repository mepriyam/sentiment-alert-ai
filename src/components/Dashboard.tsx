import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, TrendingDown, Minus, Download, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SentimentResult } from '@/lib/sentimentAnalysis';

interface DashboardProps {
  results: SentimentResult[];
  onExport: () => void;
}

const Dashboard = ({ results, onExport }: DashboardProps) => {
  if (!results.length) return null;

  const latest = results[0];
  
  // Calculate aggregate statistics
  const totalAnalyses = results.length;
  const avgRating = results.reduce((sum, r) => sum + r.rating, 0) / totalAnalyses;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / totalAnalyses;
  
  const sentimentCounts = {
    positive: results.filter(r => r.overallSentiment === 'positive').length,
    neutral: results.filter(r => r.overallSentiment === 'neutral').length,
    negative: results.filter(r => r.overallSentiment === 'negative').length,
  };

  // Data for charts
  const pieData = [
    { name: 'Positive', value: sentimentCounts.positive, color: '#22c55e' },
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#64748b' },
    { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
  ];

  const trendData = results.slice(0, 10).reverse().map((result, index) => ({
    analysis: index + 1,
    rating: result.rating,
    confidence: result.confidence * 100,
    positive: result.positive * 100,
    negative: result.negative * 100,
  }));

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
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { level: 'High', color: 'bg-green-500' };
    if (confidence >= 0.6) return { level: 'Medium', color: 'bg-yellow-500' };
    return { level: 'Low', color: 'bg-red-500' };
  };

  const confidenceLevel = getConfidenceLevel(latest.confidence);

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Dashboard
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Comprehensive sentiment analysis results
            </p>
          </div>
          <Button onClick={onExport} variant="outline" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Export Results
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Rating */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                Overall Rating
                {getSentimentIcon(latest.overallSentiment)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-1">
                  {renderStars(latest.rating)}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{latest.rating}/5</div>
                  <Badge variant="secondary" className="mt-1">
                    {latest.overallSentiment.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Level */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Confidence Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${confidenceLevel.color}`}></div>
                  <span className="font-semibold">{confidenceLevel.level}</span>
                </div>
                <Progress value={latest.confidence * 100} className="h-3" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(latest.confidence * 100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Analyses */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-center">{totalAnalyses}</div>
                <div className="text-sm text-muted-foreground text-center">
                  Avg Rating: {avgRating.toFixed(1)}/5
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Avg Confidence: {Math.round(avgConfidence * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Status */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alert Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latest.negative >= 0.7 || latest.rating < 2 ? (
                  <Badge variant="destructive" className="w-full justify-center">
                    ALERT ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="default" className="w-full justify-center bg-green-500">
                    NORMAL
                  </Badge>
                )}
                <div className="text-sm text-center">
                  Negative: {Math.round(latest.negative * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Distribution Pie Chart */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Overall sentiment breakdown across all analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} analyses`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sentiment Trend</CardTitle>
              <CardDescription>Rating and confidence trends over recent analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="analysis" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Rating (1-5)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Confidence (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Latest Analysis Breakdown</CardTitle>
            <CardDescription>Detailed sentiment percentages for the most recent analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-600">Positive</span>
                  <span className="text-sm font-bold">{Math.round(latest.positive * 100)}%</span>
                </div>
                <Progress value={latest.positive * 100} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Neutral</span>
                  <span className="text-sm font-bold">{Math.round(latest.neutral * 100)}%</span>
                </div>
                <Progress value={latest.neutral * 100} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-600">Negative</span>
                  <span className="text-sm font-bold">{Math.round(latest.negative * 100)}%</span>
                </div>
                <Progress value={latest.negative * 100} className="h-3" />
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground">
                The text shows a <strong>{latest.overallSentiment}</strong> sentiment with{' '}
                <strong>{Math.round(latest.confidence * 100)}%</strong> confidence. 
                {latest.language && ` Language detected: ${latest.language}.`}
                {' '}Rating: {latest.rating}/5 stars.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;