import { SentimentResult } from './sentimentAnalysis';

export interface EmailConfig {
  apiKey?: string;
  senderEmail?: string;
  recipientEmail: string;
}

export async function sendAlertEmail(
  result: SentimentResult,
  config: EmailConfig
): Promise<boolean> {
  if (!config.apiKey) {
    console.log('Email would be sent (no API key provided):', {
      to: config.recipientEmail,
      subject: 'Negative Sentiment Alert',
      sentiment: result
    });
    return false;
  }

  try {
    // Using EmailJS or similar service
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'your_service_id', // Would be configured
        template_id: 'your_template_id', // Would be configured
        user_id: config.apiKey,
        template_params: {
          to_email: config.recipientEmail,
          from_email: config.senderEmail || 'noreply@sentiment-analyzer.com',
          subject: 'Negative Sentiment Alert - Action Required',
          message: `
            Negative sentiment detected in feedback analysis:
            
            Text: "${result.text}"
            Rating: ${result.rating}/5
            Negative Percentage: ${Math.round(result.negative * 100)}%
            Confidence: ${Math.round(result.confidence * 100)}%
            Timestamp: ${new Date(result.timestamp).toLocaleString()}
            
            Please review and take appropriate action.
          `
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}