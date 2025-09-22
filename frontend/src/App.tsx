import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleCloudProvider } from "./contexts/GoogleCloudContext";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import DocumentSimplifier from "./pages/DocumentSimplifier";
import BailRecognizer from "./pages/BailRecognizer";
import LegalAdvisor from "./pages/LegalAdvisor";
import DocumentAnalysis from "./pages/DocumentAnalysis";
import VoiceAssistant from "./pages/VoiceAssistant";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import "./index.css";

function App() {
  return (
    <GoogleCloudProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen legal-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/simplify" element={<DocumentSimplifier />} />
              <Route path="/bail-recognizer" element={<BailRecognizer />} />
              <Route path="/legal-advisor" element={<LegalAdvisor />} />
              <Route path="/document-analysis" element={<DocumentAnalysis />} />
              <Route path="/voice-assistant" element={<VoiceAssistant />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleCloudProvider>
  );
}

export default App;
