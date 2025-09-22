import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Download,
  RefreshCw,
  Scale,
  ArrowRight,
  Gavel,
  BookOpen,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useGoogleCloud } from "../contexts/GoogleCloudContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LegalAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { generateSimplifiedText, isInitialized } = useGoogleCloud();

  const features = [
    {
      icon: Gavel,
      title: "Legal Guidance",
      description: "Get expert legal advice powered by AI",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BookOpen,
      title: "Legal Research",
      description: "Access comprehensive legal knowledge and precedents",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Understand potential risks and legal implications",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: CheckCircle,
      title: "Actionable Advice",
      description: "Get practical next steps and recommendations",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Generate legal advice using Gemini AI
      const advice = await generateSimplifiedText(`
        You are a legal advisor. Please provide helpful, accurate legal guidance for this question: ${inputMessage}
        
        Please provide:
        1. A clear answer to the question
        2. Relevant legal principles
        3. Practical next steps
        4. Important warnings or disclaimers
        5. When to consult a lawyer
        
        Keep the response professional but accessible.
      `);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: advice,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError("Failed to get legal advice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError("Voice input is not supported in this browser");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setError("Voice recognition failed: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTextToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      setError("Text-to-speech is not supported in this browser");
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadChat = () => {
    const chatData = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "legal-advisor-chat.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
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
                  Legal Advisor
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
                Legal Advisor
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary font-medium">
                AI-Powered Guidance
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Legal Advisor
          </h1>
          <p className="text-gray-600">
            Get AI-powered legal guidance and advice for your questions and
            concerns
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Advisor Features
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

        <div className="card h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Legal Advisor Chat
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearChat}
                className="btn-secondary text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </button>
              <button
                onClick={handleDownloadChat}
                className="btn-secondary text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  Welcome to Legal Advisor
                </p>
                <p>
                  Ask me any legal question and I'll provide helpful guidance
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === "assistant" && (
                        <Bot className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === "user" && (
                        <User className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {message.role === "assistant" && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTextToSpeech(message.content)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary-600" />
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-gray-600">Thinking...</span>
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

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a legal question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="btn-primary p-2"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-400 mr-2">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Legal Disclaimer</p>
              <p>
                This AI legal advisor provides general information only and does
                not constitute legal advice. For specific legal matters, please
                consult with a qualified attorney. The information provided may
                not be complete, accurate, or up-to-date for your specific
                situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAdvisor;
