import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Scale,
  ArrowRight,
} from "lucide-react";
import { useGoogleCloud } from "../contexts/GoogleCloudContext";

interface VoiceMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

const VoiceAssistant: React.FC = () => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPaused, setIsPaused] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { generateSimplifiedText, isInitialized } = useGoogleCloud();

  const features = [
    {
      icon: Mic,
      title: "Voice Commands",
      description: "Interact with legal documents using natural voice commands",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload and analyze documents through voice interaction",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Volume2,
      title: "Audio Responses",
      description: "Get spoken responses for better accessibility",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: CheckCircle,
      title: "Real-time Processing",
      description: "Instant voice recognition and AI-powered responses",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        await handleVoiceInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setError("Voice recognition failed: " + event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentAudio) {
        currentAudio.pause();
      }
      if (synthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [currentAudio]);

  const handleVoiceInput = async (transcript: string) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: "user",
      content: transcript,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      // Generate response using Gemini AI
      const response = await generateSimplifiedText(`
        You are a legal voice assistant. Respond to this legal question in a conversational, helpful manner: ${transcript}
        
        Keep the response concise and suitable for voice output. Provide practical legal guidance.
      `);

      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Convert response to speech
      await speakText(response);
    } catch (err) {
      setError("Failed to process voice input. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);
        reject(new Error("Speech synthesis failed: " + event.error));
      };

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const pauseSpeaking = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileContent(file);
      await handleVoiceInput(`Please analyze this document: ${text}`);
    } catch (err) {
      setError("Failed to read file");
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const downloadConversation = () => {
    const conversation = messages.map((msg) => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(conversation, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "voice-conversation.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen legal-content">
        <header className="legal-gradient sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Scale className="h-10 w-10 text-primary" />
                <span className="ml-2 text-2xl font-bold text-white">
                  Nyaya Saar
                </span>
                <span className="ml-2 text-sm text-secondary font-medium">
                  Voice Assistant
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600">
              Initializing Google Cloud AI services...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen legal-content">
      {/* Header */}
      <header className="legal-gradient sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Scale className="h-10 w-10 text-primary" />
              <span className="ml-2 text-2xl font-bold text-white">
                Nyaya Saar
              </span>
              <span className="ml-2 text-sm text-secondary font-medium">
                Voice Assistant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary font-medium">
                AI-Powered Voice
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Voice Assistant
          </h1>
          <p className="text-gray-600">
            Interact with legal documents using voice commands powered by Google
            Cloud Speech
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Voice Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Controls */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Voice Controls
              </h2>

              {/* Main Voice Button */}
              <div className="text-center mb-6">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-primary-600 hover:bg-primary-700"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {isListening ? "Listening..." : "Click to speak"}
                </p>
              </div>

              {/* Speech Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Speech Status:
                  </span>
                  <div className="flex items-center space-x-2">
                    {isSpeaking && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={isPaused ? resumeSpeaking : pauseSpeaking}
                          className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        >
                          {isPaused ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={stopSpeaking}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isSpeaking
                          ? "bg-green-100 text-green-800"
                          : isListening
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isSpeaking
                        ? "Speaking"
                        : isListening
                        ? "Listening"
                        : "Ready"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Document
              </h3>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Upload document for voice analysis
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleVoiceInput(
                      "What are the key points in this document?"
                    )
                  }
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Summarize document
                </button>
                <button
                  onClick={() =>
                    handleVoiceInput(
                      "Are there any red flags in this contract?"
                    )
                  }
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Check for red flags
                </button>
                <button
                  onClick={() =>
                    handleVoiceInput("What should I be careful about?")
                  }
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Get recommendations
                </button>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Voice Conversation
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadConversation}
                    className="btn-secondary text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      Start a voice conversation
                    </p>
                    <p>
                      Click the microphone button or upload a document to begin
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === "user"
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "assistant" && (
                            <Volume2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                          )}
                          {message.type === "user" && (
                            <Mic className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          {message.type === "assistant" && (
                            <button
                              onClick={() => speakText(message.content)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-5 w-5 text-primary-600" />
                        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                        <span className="text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400">
                  <div className="flex items-center">
                    <div className="text-red-400 mr-2">⚠️</div>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Voice Commands
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Document Analysis
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Summarize this document"</li>
                <li>• "What are the key points?"</li>
                <li>• "Are there any red flags?"</li>
                <li>• "What should I be careful about?"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Legal Questions
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "What does this clause mean?"</li>
                <li>• "Is this contract fair?"</li>
                <li>• "What are my rights here?"</li>
                <li>• "Should I sign this?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
