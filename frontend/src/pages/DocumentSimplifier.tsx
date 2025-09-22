import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Languages,
  Eye,
  Copy,
  Share2,
  Scale,
  ArrowRight,
} from "lucide-react";
import { useGoogleCloud } from "../contexts/GoogleCloudContext";

const DocumentSimplifier: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [simplifiedText, setSimplifiedText] = useState<string>("");
  const [redFlags, setRedFlags] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    generateSimplifiedText,
    detectRedFlags,
    translateText,
    isInitialized,
  } = useGoogleCloud();

  const features = [
    {
      icon: FileText,
      title: "Document Simplification",
      description:
        "Transform complex legal documents into plain, understandable language",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Languages,
      title: "Multilingual Support",
      description:
        "Translate simplified documents into regional Indian languages",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: AlertTriangle,
      title: "Red Flag Detection",
      description: "Automatically identify potential issues and risks",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: CheckCircle,
      title: "Smart Analysis",
      description: "AI-powered analysis with actionable recommendations",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    try {
      // Read file content
      const text = await readFileContent(selectedFile);

      // Generate simplified text
      const simplified = await generateSimplifiedText(text);
      setSimplifiedText(simplified);

      // Detect red flags
      const flags = await detectRedFlags(text);
      setRedFlags(flags);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process document"
      );
    } finally {
      setIsProcessing(false);
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

  const handleTranslate = async () => {
    if (!simplifiedText) return;

    setIsProcessing(true);
    try {
      const translated = await translateText(simplifiedText, selectedLanguage);
      setSimplifiedText(translated);
    } catch (err) {
      setError("Translation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([simplifiedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "simplified-document.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(simplifiedText);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
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
                  Document Simplifier
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
                Document Simplifier
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary font-medium">
                AI-Powered Simplification
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Simplifier
          </h1>
          <p className="text-gray-600">
            Upload a legal document and get a simplified, easy-to-understand
            version powered by Google Cloud AI
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Simplification Features
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Document
              </h2>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, TXT files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      {file.name}
                    </span>
                    <span className="ml-auto text-sm text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Translation Options
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translate to:
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="input-field"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={!simplifiedText || isProcessing}
                  className="btn-primary flex items-center"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </button>
              </div>
            </div>

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  Red Flags Detected
                </h3>
                <div className="space-y-3">
                  {redFlags.map((flag, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(
                        flag.severity
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium capitalize">
                            {flag.type.replace("_", " ")}
                          </h4>
                          <p className="text-sm mt-1">{flag.description}</p>
                          <p className="text-xs mt-2 font-medium">
                            Recommendation: {flag.recommendation}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            flag.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : flag.severity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {flag.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Simplified Text Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Simplified Document
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showOriginal ? "Show Simplified" : "Show Original"}
                  </button>
                </div>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                    <p className="text-gray-600">Processing document...</p>
                  </div>
                </div>
              ) : simplifiedText ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {simplifiedText}
                    </pre>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="btn-secondary flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-primary flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button className="btn-secondary flex items-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document to see the simplified version here</p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {simplifiedText && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {simplifiedText.split(" ").length}
                    </div>
                    <div className="text-sm text-blue-800">Words</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {redFlags.length}
                    </div>
                    <div className="text-sm text-green-800">Red Flags</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSimplifier;
