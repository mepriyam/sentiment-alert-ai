import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { analyzeSentiment, shouldSendAlert, type SentimentResult } from '@/lib/sentimentAnalysis';
import { translateToEnglish } from '@/lib/translationService';
import { sendAlertEmail } from '@/lib/emailService';
import { saveToHistory, getHistory } from '@/lib/historyService';
import LandingSection from './LandingSection';
import UploadSection from './UploadSection';
import Dashboard from './Dashboard';
import HistoryPanel from './HistoryPanel';
import SettingsPanel from './SettingsPanel';
import { Upload, BarChart3, Clock, Settings, Download } from 'lucide-react';

const GovernmentDashboard = () => {
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [currentTab, setCurrentTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings states
  const [emailSettings, setEmailSettings] = useState({
    apiKey: '',
    senderEmail: 'alerts@gov-dashboard.com',
    recipientEmail: '',
    alertsEnabled: true
  });
  
  const [translationSettings, setTranslationSettings] = useState({
    apiKey: '',
    autoTranslate: true
  });

  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load history on mount
  useEffect(() => {
    const history = getHistory();
    setResults(history);
  }, []);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  };

  const processText = async (text: string, source: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      let processedText = text;
      let detectedLanguage = 'en';

      // Translation if enabled and API key available
      if (translationSettings.autoTranslate) {
        const translationResult = await translateToEnglish(text, translationSettings.apiKey);
        processedText = translationResult.translatedText;
        detectedLanguage = translationResult.detectedLanguage;
        
        if (translationResult.detectedLanguage !== 'en') {
          toast({
            title: "Translation Applied",
            description: `Text translated from ${translationResult.detectedLanguage} to English`,
          });
        }
      }

      // Analyze sentiment
      const result = analyzeSentiment(processedText);
      result.language = detectedLanguage;

      // Save to history
      saveToHistory(result);

      // Update results
      setResults(prev => [result, ...prev]);

      // Check for alerts
      if (shouldSendAlert(result) && emailSettings.alertsEnabled) {
        const emailSent = await sendAlertEmail(result, emailSettings);
        
        toast({
          title: emailSent ? "Alert Sent" : "Alert Triggered",
          description: emailSent 
            ? `Negative sentiment alert sent to ${emailSettings.recipientEmail}`
            : `High negative sentiment detected (${Math.round(result.negative * 100)}% negative, ${result.rating}/5 rating)`,
          variant: "destructive",
        });
      }

      // Switch to dashboard
      setCurrentTab('dashboard');

      toast({
        title: "Analysis Complete",
        description: `Sentiment analysis completed with ${Math.round(result.confidence * 100)}% confidence`,
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (!results.length) return;

    const csvContent = [
      ['Text', 'Sentiment', 'Rating', 'Confidence', 'Positive %', 'Neutral %', 'Negative %', 'Timestamp'].join(','),
      ...results.map(result => [
        `"${result.text.replace(/"/g, '""')}"`,
        result.overallSentiment,
        result.rating,
        result.confidence,
        Math.round(result.positive * 100),
        Math.round(result.neutral * 100), 
        Math.round(result.negative * 100),
        result.timestamp
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analysis results exported to CSV file",
    });
  };

  const selectHistoryAnalysis = (result: SentimentResult) => {
    setResults(prev => [result, ...prev.filter(r => r.id !== result.id)]);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Landing Section */}
      <LandingSection onScrollToUpload={scrollToUpload} />

      {/* Main Dashboard */}
      <div ref={uploadSectionRef} className="container mx-auto px-6 py-12">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {results.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="upload" className="space-y-6">
            <UploadSection onTextSubmit={processText} />
            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-muted-foreground">Processing your text...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard results={results} onExport={exportResults} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryPanel onSelectAnalysis={selectHistoryAnalysis} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel 
              emailSettings={emailSettings}
              translationSettings={translationSettings}
              onUpdateEmailSettings={setEmailSettings}
              onUpdateTranslationSettings={setTranslationSettings}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  );
};

export default GovernmentDashboard;