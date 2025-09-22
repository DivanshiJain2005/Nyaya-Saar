import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GoogleCloudContextType {
  // AI Services
  geminiAI: GoogleGenerativeAI | null;
  
  // State
  isInitialized: boolean;
  error: string | null;
  
  // Methods
  initializeServices: () => Promise<void>;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
  analyzeDocument: (file: File) => Promise<any>;
  detectLanguage: (text: string) => Promise<string>;
  generateSimplifiedText: (complexText: string) => Promise<string>;
  detectRedFlags: (text: string) => Promise<any[]>;
  processBailDocument: (file: File) => Promise<any>;
}

const GoogleCloudContext = createContext<GoogleCloudContextType | undefined>(undefined);

export const useGoogleCloud = () => {
  const context = useContext(GoogleCloudContext);
  if (!context) {
    throw new Error('useGoogleCloud must be used within a GoogleCloudProvider');
  }
  return context;
};

export const GoogleCloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geminiAI, setGeminiAI] = useState<GoogleGenerativeAI | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const initializeServices = async () => {
    try {
      setError(null);
      
      // Initialize Gemini AI for direct use
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        setGeminiAI(genAI);
      }

      // Check if backend API is available
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          console.log('Backend API is available');
        }
      } catch (err) {
        console.warn('Backend API not available, using client-side only');
      }

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize services');
      console.error('Service initialization error:', err);
    }
  };

  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (err) {
      console.error('Translation error:', err);
      return text; // Return original text if translation fails
    }
  };

  const analyzeDocument = async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/analyze-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Document analysis failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Document analysis error:', err);
      throw err;
    }
  };

  const detectLanguage = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/detect-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Language detection failed');
      }

      const data = await response.json();
      return data.language || 'en';
    } catch (err) {
      console.error('Language detection error:', err);
      return 'en';
    }
  };

  const generateSimplifiedText = async (complexText: string): Promise<string> => {
    if (!geminiAI) {
      // Fallback to API if Gemini AI is not available
      try {
        const response = await fetch(`${API_BASE_URL}/simplify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: complexText }),
        });

        if (!response.ok) {
          throw new Error('Text simplification failed');
        }

        const data = await response.json();
        return data.simplifiedText || complexText;
      } catch (err) {
        console.error('API simplification error:', err);
        return complexText;
      }
    }

    try {
      const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Please simplify this legal text into plain, easy-to-understand language. 
        Break down complex legal concepts and jargon into simple terms that a regular person can understand.
        Keep the meaning accurate but make it accessible.
        
        Legal text: ${complexText}
        
        Provide a simplified version that includes:
        1. A clear summary of what this means
        2. Key points in bullet format
        3. Any important warnings or red flags
        4. Plain language explanation of complex terms
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('Text simplification error:', err);
      throw err;
    }
  };

  const detectRedFlags = async (text: string): Promise<any[]> => {
    if (!geminiAI) {
      // Fallback to API if Gemini AI is not available
      try {
        const response = await fetch(`${API_BASE_URL}/detect-red-flags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Red flag detection failed');
        }

        const data = await response.json();
        return data.redFlags || [];
      } catch (err) {
        console.error('API red flag detection error:', err);
        return [];
      }
    }

    try {
      const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Analyze this legal text for potential red flags or risky clauses that could be harmful to the signer.
        Look for:
        - High penalties or fees
        - Binding arbitration clauses
        - Unfair termination clauses
        - Hidden fees or charges
        - Unfavorable dispute resolution
        - Excessive liability clauses
        - Auto-renewal clauses
        - Data privacy concerns
        
        Legal text: ${text}
        
        Return a JSON array of red flags with this structure:
        [
          {
            "type": "penalty_clause",
            "severity": "high|medium|low",
            "description": "Clear description of the issue",
            "location": "Where in the text this appears",
            "recommendation": "What the user should do"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return [{
          type: 'analysis_error',
          severity: 'low',
          description: 'Could not parse red flag analysis',
          location: 'N/A',
          recommendation: 'Please review the document manually'
        }];
      }
    } catch (err) {
      console.error('Red flag detection error:', err);
      return [];
    }
  };

  const processBailDocument = async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/process-bail-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Bail document processing failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Bail document processing error:', err);
      throw err;
    }
  };

  useEffect(() => {
    initializeServices();
  }, []);

  const value: GoogleCloudContextType = {
    geminiAI,
    isInitialized,
    error,
    initializeServices,
    translateText,
    analyzeDocument,
    detectLanguage,
    generateSimplifiedText,
    detectRedFlags,
    processBailDocument,
  };

  return (
    <GoogleCloudContext.Provider value={value}>
      {children}
    </GoogleCloudContext.Provider>
  );
};