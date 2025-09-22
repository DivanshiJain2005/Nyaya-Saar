import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  Gavel,
  Search,
  Mic,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Tag,
  BookOpen,
  Languages,
  Scale,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const features = [
    {
      title: "Proactive Red Flags & Warnings",
      description:
        "Automatically detect high-risk clauses and suggest actionable next steps",
      icon: AlertTriangle,
      href: "/document-analysis",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      stats: "89 flags detected",
    },
    {
      title: "Intelligent Clause Tagging",
      description: "Automatically tag clauses into meaningful categories",
      icon: Tag,
      href: "/document-analysis",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      stats: "15 categories",
    },
    {
      title: "Statute & Precedent Linking",
      description: "Link clauses to exact Indian statutes and legal precedents",
      icon: BookOpen,
      href: "/document-analysis",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      stats: "200+ statutes",
    },
    {
      title: "Multilingual Simplification",
      description: "Clear summaries in regional Indian languages",
      icon: Languages,
      href: "/document-analysis",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      stats: "10+ languages",
    },
    {
      title: "Document Analysis",
      description: "Deep analysis with comprehensive red flag detection",
      icon: Search,
      href: "/document-analysis",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      stats: "1,247 processed",
    },
    {
      title: "Voice Assistant",
      description: "Interact with documents using voice commands",
      icon: Mic,
      href: "/voice-assistant",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      stats: "95% accuracy",
    },
  ];

  const stats = [
    {
      label: "Documents Processed",
      value: "1,247",
      change: "+12% from last month",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Red Flags Detected",
      value: "89",
      change: "-5% from last month",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Languages Supported",
      value: "10+",
      change: "+2 new languages",
      icon: Languages,
      color: "text-green-600",
    },
    {
      label: "Success Rate",
      value: "98.5%",
      change: "+2.1% from last month",
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  const recentActivity = [
    {
      action: "Document simplified",
      document: "Rental Agreement.pdf",
      time: "2 minutes ago",
      status: "completed",
      type: "Document Simplifier",
    },
    {
      action: "Bail document analyzed",
      document: "Bail Bond 2024.pdf",
      time: "15 minutes ago",
      status: "completed",
      type: "Bail Recognizer",
    },
    {
      action: "Red flags detected",
      document: "Employment Contract.docx",
      time: "1 hour ago",
      status: "warning",
      type: "Document Analysis",
    },
    {
      action: "Legal advice provided",
      document: "Property Dispute Query",
      time: "2 hours ago",
      status: "completed",
      type: "Legal Advisor",
    },
  ];

  const upcomingTasks = [
    {
      title: "Review Contract Analysis",
      time: "Today, 2:00 PM",
      priority: "high",
      type: "Document Analysis",
    },
    {
      title: "Bail Application Review",
      time: "Tomorrow, 10:00 AM",
      priority: "medium",
      type: "Bail Recognizer",
    },
    {
      title: "Legal Consultation",
      time: "Friday, 3:30 PM",
      priority: "low",
      type: "Legal Advisor",
    },
  ];

  const quickAccessItems = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      label: "Document Analysis",
      path: "/document-analysis",
    },
    {
      icon: <Mic className="h-6 w-6 text-primary" />,
      label: "Voice Assistant",
      path: "/voice-assistant",
    },
    {
      icon: <Gavel className="h-6 w-6 text-primary" />,
      label: "Legal Advisor",
      path: "/legal-advisor",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      label: "Bail Recognizer",
      path: "/bail-recognizer",
    },
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
                Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary font-medium">Welcome back!</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Nyaya Saar
          </h1>
          <p className="text-gray-600">
            Your AI-powered legal document analysis platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Features */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={index}
                    to={feature.href}
                    className={`card hover:shadow-lg transition-all duration-300 group border-2 ${feature.borderColor} hover:border-opacity-60`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg ${feature.bgColor} ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {feature.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          {feature.stats}
                        </p>
                        <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                          Get Started
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Access */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Access
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickAccessItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="mb-2">{item.icon}</div>
                    <span className="text-xs font-medium text-gray-900 text-center">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`p-1 rounded-full ${
                        activity.status === "completed"
                          ? "bg-green-100"
                          : activity.status === "warning"
                          ? "bg-yellow-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {activity.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.status === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.document}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <span className="text-xs text-gray-400">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Tasks
              </h3>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{task.time}</p>
                    </div>
                    <span className="text-xs text-gray-400">{task.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance
              </h3>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Performance metrics</p>
                  <p className="text-xs text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
