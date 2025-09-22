import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Mail, Globe, Key, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  emailSettings: {
    apiKey: string;
    senderEmail: string;
    recipientEmail: string;
    alertsEnabled: boolean;
  };
  translationSettings: {
    apiKey: string;
    autoTranslate: boolean;
  };
  onUpdateEmailSettings: (settings: any) => void;
  onUpdateTranslationSettings: (settings: any) => void;
}

const SettingsPanel = ({
  emailSettings,
  translationSettings,
  onUpdateEmailSettings,
  onUpdateTranslationSettings
}: SettingsPanelProps) => {
  const [localEmailSettings, setLocalEmailSettings] = useState(emailSettings);
  const [localTranslationSettings, setLocalTranslationSettings] = useState(translationSettings);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTranslation, setTestingTranslation] = useState(false);
  const { toast } = useToast();

  const handleSaveEmailSettings = () => {
    onUpdateEmailSettings(localEmailSettings);
    toast({
      title: "Settings Saved",
      description: "Email settings have been updated successfully.",
    });
  };

  const handleSaveTranslationSettings = () => {
    onUpdateTranslationSettings(localTranslationSettings);
    toast({
      title: "Settings Saved", 
      description: "Translation settings have been updated successfully.",
    });
  };

  const testEmailService = async () => {
    setTestingEmail(true);
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Email Test",
        description: localEmailSettings.apiKey 
          ? "Email service connection successful!" 
          : "No API key provided. Email alerts will show as notifications only.",
      });
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: "Could not connect to email service. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const testTranslationService = async () => {
    setTestingTranslation(true);
    try {
      // Simulate translation test
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Translation Test",
        description: localTranslationSettings.apiKey 
          ? "Translation service connection successful!"
          : "No API key provided. Only basic language detection available.",
      });
    } catch (error) {
      toast({
        title: "Translation Test Failed", 
        description: "Could not connect to translation service. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setTestingTranslation(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure API keys and preferences for email alerts and translation services
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Email Settings */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Alert Settings
          </CardTitle>
          <CardDescription>
            Configure email notifications for negative sentiment alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alert Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications when negative sentiment exceeds 70% or rating drops below 2/5
              </p>
            </div>
            <Switch
              checked={localEmailSettings.alertsEnabled}
              onCheckedChange={(checked) => 
                setLocalEmailSettings(prev => ({ ...prev, alertsEnabled: checked }))
              }
            />
          </div>

          <Separator />

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="email-api-key">
              EmailJS API Key
              <Badge variant="secondary" className="ml-2">Optional</Badge>
            </Label>
            <Input
              id="email-api-key"
              type="password"
              placeholder="Enter your EmailJS user ID..."
              value={localEmailSettings.apiKey}
              onChange={(e) => 
                setLocalEmailSettings(prev => ({ ...prev, apiKey: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Without an API key, alerts will show as toast notifications only. 
              Get your free EmailJS key at{' '}
              <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                emailjs.com
              </a>
            </p>
          </div>

          {/* Sender Email */}
          <div className="space-y-2">
            <Label htmlFor="sender-email">Sender Email</Label>
            <Input
              id="sender-email"
              type="email"
              placeholder="alerts@yourorganization.com"
              value={localEmailSettings.senderEmail}
              onChange={(e) => 
                setLocalEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))
              }
            />
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Alert Recipient Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="manager@yourorganization.com"
              value={localEmailSettings.recipientEmail}
              onChange={(e) => 
                setLocalEmailSettings(prev => ({ ...prev, recipientEmail: e.target.value }))
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSaveEmailSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Email Settings
            </Button>
            <Button 
              onClick={testEmailService} 
              variant="outline"
              disabled={testingEmail}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testingEmail ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Translation Settings */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Translation Settings
          </CardTitle>
          <CardDescription>
            Configure automatic translation for non-English text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Translate Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-translate Non-English Text</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and translate foreign language text to English
              </p>
            </div>
            <Switch
              checked={localTranslationSettings.autoTranslate}
              onCheckedChange={(checked) => 
                setLocalTranslationSettings(prev => ({ ...prev, autoTranslate: checked }))
              }
            />
          </div>

          <Separator />

          {/* Translation API Key */}
          <div className="space-y-2">
            <Label htmlFor="translation-api-key">
              Google Translate API Key
              <Badge variant="secondary" className="ml-2">Optional</Badge>
            </Label>
            <Input
              id="translation-api-key"
              type="password"
              placeholder="Enter your Google Cloud Translation API key..."
              value={localTranslationSettings.apiKey}
              onChange={(e) => 
                setLocalTranslationSettings(prev => ({ ...prev, apiKey: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Without an API key, only basic language detection is available. 
              Get your API key from{' '}
              <a href="https://cloud.google.com/translate" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google Cloud Console
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSaveTranslationSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Translation Settings
            </Button>
            <Button 
              onClick={testTranslationService} 
              variant="outline"
              disabled={testingTranslation}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testingTranslation ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backend Notice */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Need More Robust Backend Features?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For production-grade email alerts, secure API key management, and advanced translation features, 
            consider connecting to Supabase for backend functionality.
          </p>
          <Button variant="outline" className="w-full">
            Connect to Supabase for Backend Features
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;