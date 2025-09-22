import React from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Zap,
  AlertTriangle,
  Tag,
  BookOpen,
  Languages,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: "Proactive Red Flags & Warnings",
      description:
        "Automatically detect high-risk clauses (e.g., excessive penalties, unfair termination terms) and suggest actionable next steps, empowering users to avoid financial or legal pitfalls.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Tag,
      title: "Intelligent Clause Tagging & Categorization",
      description:
        "Automatically tag clauses into meaningful categories (Termination, Payment Terms, Liability, etc.), making navigation intuitive and efficient.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BookOpen,
      title: "Statute & Precedent Linking",
      description:
        "Contextually link clauses to the exact Indian statutes and relevant legal precedents, making explanations trustworthy and grounded in law.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Languages,
      title: "Multilingual Simplification",
      description:
        "Deliver clear summaries in regional Indian languages, making complex legal documents accessible to a broad user base, from individuals to small business owners.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description:
        "Deep analysis of legal documents with comprehensive red flag detection and risk assessment.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Mic,
      title: "Voice Assistant",
      description:
        "Interact with legal documents using voice commands powered by Google Cloud Speech.",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  const benefits = [
    "Demystify complex legal jargon",
    "Identify potential red flags automatically",
    "Get instant legal document analysis",
    "Access multilingual legal support",
    "Voice-enabled document interaction",
    "Secure and private document processing",
  ];

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
                Nyaya Saar Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-secondary hover:text-white font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link to="/dashboard" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-secondary text-gray-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🏛️ ProfessionalNyaya Saar Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Demystify Legal Documents with
              <span className="text-gradient block">
                AI-Powered Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform complex legal jargon into clear, accessible guidance.
              Make informed decisions with our Google Cloud AI-powered legal
              document analysis platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 inline-flex items-center">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Legal Document Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leverage Google Cloud AI to understand, analyze, and simplify
              complex legal documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Nyaya Saar?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform combines the power of Google Cloud AI with legal
                expertise to provide you with the most accurate and accessible
                legal document analysis.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="card p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Powered by Google Cloud AI
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Advanced machine learning models ensure accurate analysis
                    and reliable legal document processing.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Secure
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Accurate
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Multilingual
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: "#C89B00" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Simplify Your Legal Documents?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Nyaya Saar for their legal
            document analysis needs.
          </p>
          <Link
            to="/dashboard"
            className="bg-white text-primary hover:bg-gray-50 font-medium py-3 px-8 rounded-lg text-lg inline-flex items-center transition-colors duration-200"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Scale className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Nyaya Saar</span>
              </div>
              <p className="text-gray-400">
                Demystifying legal documents with AI-powered intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Red Flags Detection</li>
                <li>Clause Tagging</li>
                <li>Statute Linking</li>
                <li>Multilingual Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Powered by</h3>
              <div className="text-gray-400">
                <p>Google Cloud AI</p>
                <p>Vertex AI</p>
                <p>Document AI</p>
                <p>Translation API</p>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800">
            <p>
              © {new Date().getFullYear()} Nayaya Saar. All rights reserved.
            </p>
            <p>Made with ❤️ by Team PartTimeHumans</p>
            <p>
              Follow us on
              <a
                href="https://twitter.com/akarsh__jain"
                className="mx-1 text-primary hover:underline"
              >
                X
              </a>
              &
              <a
                href="https://www.linkedin.com/in/akarshjain158/"
                className="mx-1 text-primary hover:underline"
              >
                LinkedIn
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
