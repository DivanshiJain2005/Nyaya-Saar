import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Copy,
  Eye,
  Gavel,
  Scale,
  Tag,
  BookOpen,
  Languages,
} from "lucide-react";
import { apiService } from "../services/api";

interface AnalysisResult {
  redFlags: Array<{
    type: string;
    severity: string;
    description: string;
    location: string;
    recommendation: string;
    indianLawReference?: string;
  }>;
  clauseTags: Array<{
    category: string;
    clauses: Array<{
      text: string;
      riskLevel: string;
      description: string;
      recommendation: string;
    }>;
  }>;
  statuteLinks: Array<{
    clause: string;
    statute: string;
    precedent: string;
    explanation: string;
    implications: string;
    riskLevel: string;
  }>;
  riskAssessment: {
    overallRisk: string;
    score: number;
    concerns: string[];
  };
  simplifiedSummary: string;
  summary: string;
  multilingualSummary: {
    hindi: string;
    english: string;
    tamil: string;
    telugu: string;
    bengali: string;
    marathi: string;
  };
  recommendations: string[];
  keyPoints: string[];
  riskScore: number;
}

const DocumentAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [textInput, setTextInput] = useState("");

  const features = [
    {
      icon: AlertTriangle,
      title: "Proactive Red Flags & Warnings",
      description:
        "Automatically detect high-risk clauses and suggest actionable next steps",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Tag,
      title: "Intelligent Clause Tagging",
      description: "Automatically tag clauses into meaningful categories",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BookOpen,
      title: "Statute & Precedent Linking",
      description: "Link clauses to exact Indian statutes and legal precedents",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Languages,
      title: "Multilingual Simplification",
      description: "Clear summaries in regional Indian languages",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const handleAnalyze = async () => {
    if (!file && !textInput.trim()) {
      setError("Please upload a file or enter text to analyze");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await apiService.analyzeDocument(
        file || undefined,
        textInput.trim() || undefined
      );
      setAnalysisResult(result as AnalysisResult);
    } catch (err) {
      setError("Failed to analyze document. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return "text-red-600 bg-red-50 border-red-200";
    if (riskScore >= 40)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 70) return "High Risk";
    if (riskScore >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const handleDownload = () => {
    if (!analysisResult) return;

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(analysisResult, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "document-analysis.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
  };

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
                Document Analysis
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary font-medium">
                AI-Powered Analysis
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of legal documents with red flag detection
            and risk assessment
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Analysis Features
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
                Upload Document or Enter Text
              </h2>

              {/* File Upload */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : "Click to upload document for analysis"}
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

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste text directly:
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your legal document text here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isProcessing || (!file && !textInput.trim())}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </button>

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

            {/* Analysis Controls */}
            {analysisResult && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analysis Controls
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="btn-secondary flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showDetails ? "Hide" : "Show"} Details
                  </button>
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
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {isProcessing ? (
              <div className="card">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                    <p className="text-gray-600">Analyzing document...</p>
                  </div>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6">
                {/* Risk Assessment */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Risk Assessment
                  </h3>
                  <div
                    className={`p-4 rounded-lg border ${getRiskColor(
                      analysisResult.riskScore
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Risk Score</span>
                      <span className="text-2xl font-bold">
                        {analysisResult.riskScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {getRiskLabel(analysisResult.riskScore)}
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            analysisResult.riskScore >= 70
                              ? "bg-red-500"
                              : analysisResult.riskScore >= 40
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${analysisResult.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Summary */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Document Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{analysisResult.summary}</p>
                  </div>
                </div>

                {/* Multilingual Summary */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Languages className="h-5 w-5 text-green-600 mr-2" />
                    Multilingual Summary (Hindi)
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-gray-800">
                      {analysisResult.multilingualSummary.hindi}
                    </p>
                  </div>
                </div>

                {/* Clause Tags */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 text-blue-600 mr-2" />
                    Clause Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.clauseTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag.category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statute Links */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                    Relevant Statutes
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.statuteLinks.map((statute, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-purple-50 rounded-lg"
                      >
                        <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-gray-800">{statute.statute}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Red Flags */}
                {analysisResult.redFlags.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      Red Flags ({analysisResult.redFlags.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.redFlags.map((flag, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            flag.severity === "high"
                              ? "bg-red-50 border-red-200"
                              : flag.severity === "medium"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                          }`}
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

                {/* Recommendations */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <Gavel className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Raw Data */}
                {showDetails && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Raw Analysis Data
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document to see the analysis here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
