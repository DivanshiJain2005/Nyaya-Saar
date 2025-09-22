import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Gavel,
  Download,
  Eye,
  Copy,
  Scale,
  ArrowRight,
} from "lucide-react";
import { useGoogleCloud } from "../contexts/GoogleCloudContext";

interface BailDocumentData {
  documentType?: string;
  defendantInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    idNumber?: string;
  };
  bailAmount?: string;
  conditions?: string[];
  suretyInfo?: {
    name?: string;
    address?: string;
    relationship?: string;
  };
  courtInfo?: {
    name?: string;
    address?: string;
    caseNumber?: string;
  };
  importantDates?: {
    hearingDate?: string;
    bailPostedDate?: string;
    expirationDate?: string;
  };
  specialConditions?: string[];
  riskAssessment?: string;
  complianceRequirements?: string[];
  error?: string;
  rawText?: string;
}

const BailRecognizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [bailData, setBailData] = useState<BailDocumentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { processBailDocument, isInitialized } = useGoogleCloud();

  const features = [
    {
      icon: Shield,
      title: "Bail Document Analysis",
      description:
        "Intelligent analysis of bail documents with automated extraction",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: User,
      title: "Defendant Information",
      description: "Extract key personal and contact information automatically",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: DollarSign,
      title: "Financial Details",
      description: "Identify bail amounts and financial conditions",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Calendar,
      title: "Date Extraction",
      description: "Extract important dates and deadlines",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
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
      const result = await processBailDocument(selectedFile);
      setBailData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process bail document"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!bailData) return;

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(bailData, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "bail-document-analysis.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!bailData) return;
    navigator.clipboard.writeText(JSON.stringify(bailData, null, 2));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
                  Bail Recognizer
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
                Bail Recognizer
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
            Bail Document Recognizer
          </h1>
          <p className="text-gray-600">
            Upload bail documents to automatically extract key information using
            Google Cloud AI
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recognition Features
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
                Upload Bail Document
              </h2>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : "Click to upload bail document"}
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

            {/* Document Type */}
            {bailData?.documentType && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Type
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">
                      {bailData.documentType}
                    </span>
                  </div>
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
                    <p className="text-gray-600">Analyzing bail document...</p>
                  </div>
                </div>
              </div>
            ) : bailData ? (
              <div className="space-y-6">
                {/* Defendant Information */}
                {bailData.defendantInfo && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 text-primary-600 mr-2" />
                      Defendant Information
                    </h3>
                    <div className="space-y-3">
                      {bailData.defendantInfo.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            {bailData.defendantInfo.name}
                          </span>
                        </div>
                      )}
                      {bailData.defendantInfo.address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium">
                            {bailData.defendantInfo.address}
                          </span>
                        </div>
                      )}
                      {bailData.defendantInfo.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">
                            {bailData.defendantInfo.phone}
                          </span>
                        </div>
                      )}
                      {bailData.defendantInfo.idNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Number:</span>
                          <span className="font-medium">
                            {bailData.defendantInfo.idNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bail Amount */}
                {bailData.bailAmount && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      Bail Amount
                    </h3>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-2xl font-bold text-green-800">
                        {bailData.bailAmount}
                      </div>
                    </div>
                  </div>
                )}

                {/* Court Information */}
                {bailData.courtInfo && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Gavel className="h-5 w-5 text-purple-600 mr-2" />
                      Court Information
                    </h3>
                    <div className="space-y-3">
                      {bailData.courtInfo.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Court:</span>
                          <span className="font-medium">
                            {bailData.courtInfo.name}
                          </span>
                        </div>
                      )}
                      {bailData.courtInfo.caseNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Case Number:</span>
                          <span className="font-medium">
                            {bailData.courtInfo.caseNumber}
                          </span>
                        </div>
                      )}
                      {bailData.courtInfo.address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium">
                            {bailData.courtInfo.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Important Dates */}
                {bailData.importantDates && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      Important Dates
                    </h3>
                    <div className="space-y-3">
                      {bailData.importantDates.hearingDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hearing Date:</span>
                          <span className="font-medium">
                            {formatDate(bailData.importantDates.hearingDate)}
                          </span>
                        </div>
                      )}
                      {bailData.importantDates.bailPostedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bail Posted:</span>
                          <span className="font-medium">
                            {formatDate(bailData.importantDates.bailPostedDate)}
                          </span>
                        </div>
                      )}
                      {bailData.importantDates.expirationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expiration:</span>
                          <span className="font-medium">
                            {formatDate(bailData.importantDates.expirationDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {bailData.conditions && bailData.conditions.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Bail Conditions
                    </h3>
                    <ul className="space-y-2">
                      {bailData.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Special Conditions */}
                {bailData.specialConditions &&
                  bailData.specialConditions.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Special Conditions
                      </h3>
                      <ul className="space-y-2">
                        {bailData.specialConditions.map((condition, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Risk Assessment */}
                {bailData.riskAssessment && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Risk Assessment
                    </h3>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">
                        {bailData.riskAssessment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowRawData(!showRawData)}
                      className="btn-secondary flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showRawData ? "Hide" : "Show"} Raw Data
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

                {/* Raw Data */}
                {showRawData && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Raw Analysis Data
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {JSON.stringify(bailData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload a bail document to see the analysis here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BailRecognizer;
