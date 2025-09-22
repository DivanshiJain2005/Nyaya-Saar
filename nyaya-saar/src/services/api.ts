const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Health check
  async getHealth() {
    return this.request("/health");
  }

  // Document Analysis
  async analyzeDocument(file?: File, text?: string, language = "en") {
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }

    if (text) {
      formData.append("text", text);
    }

    formData.append("language", language);

    return this.request("/analyze-document", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Document Simplification
  async simplifyDocument(text: string, language = "en") {
    return this.request("/simplify", {
      method: "POST",
      body: JSON.stringify({ text, language }),
    });
  }

  // Red Flag Detection
  async detectRedFlags(text: string) {
    return this.request("/detect-red-flags", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Clause Tagging
  async tagClauses(text: string) {
    return this.request("/tag-clauses", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Statute Linking
  async linkStatutes(text: string) {
    return this.request("/link-statutes", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Multilingual Simplification
  async multilingualSimplify(
    text: string,
    languages = ["hindi", "tamil", "telugu", "bengali", "marathi"]
  ) {
    return this.request("/multilingual-simplify", {
      method: "POST",
      body: JSON.stringify({ text, languages }),
    });
  }

  // Translation
  async translateText(text: string, targetLanguage: string) {
    return this.request("/translate", {
      method: "POST",
      body: JSON.stringify({ text, targetLanguage }),
    });
  }

  // Bail Document Processing
  async processBailDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request("/process-bail-document", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Legal Advice
  async getLegalAdvice(question: string, context = "") {
    return this.request("/legal-advice", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    });
  }

  // Voice Assistant
  async processVoiceCommand(message: string, context = "") {
    return this.request("/voice-assistant", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.request("/dashboard-stats");
  }
}

export const apiService = new ApiService();
export default apiService;

