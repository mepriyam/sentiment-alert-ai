import { Button } from '@/components/ui/button';
import { ArrowDown, Shield, BarChart3, Users } from 'lucide-react';

interface LandingSectionProps {
  onScrollToUpload: () => void;
}

const LandingSection = ({ onScrollToUpload }: LandingSectionProps) => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        {/* Government Emblem */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
            AI Sentiment Dashboard
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300">
            for Draft Legislations
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Analyze citizen feedback with advanced AI sentiment analysis. 
            Get insights from multiple data sources including CSV files, PDFs, images, and raw text.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
            <BarChart3 className="w-10 h-10 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Instant sentiment analysis with confidence scoring and detailed breakdowns
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
            <Users className="w-10 h-10 text-purple-600 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Multi-format Support</h3>
            <p className="text-sm text-muted-foreground">
              Process CSV files, PDFs, images, and raw text with automatic language detection
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-transform duration-300">
            <Shield className="w-10 h-10 text-orange-600 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Automated notifications for negative feedback requiring immediate attention
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button 
            onClick={onScrollToUpload}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Upload Your Feedback Data
            <ArrowDown className="w-6 h-6 ml-2 animate-bounce" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingSection;