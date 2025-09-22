import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import cron from "node-cron";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationServiceClient } from "@google-cloud/translate";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { LanguageServiceClient } from "@google-cloud/language";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize services
let geminiAI, translationClient, documentAI, languageClient;

try {
  // Initialize Gemini AI
  if (process.env.GOOGLE_API_KEY) {
    geminiAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  // Initialize other services if credentials are available
  if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    translationClient = new TranslationServiceClient({ projectId });
    documentAI = new DocumentProcessorServiceClient({ projectId });
    languageClient = new LanguageServiceClient({ projectId });
  }
} catch (error) {
  console.error("Error initializing Google Cloud services:", error);
}

// Grok API integration
class GrokAPI {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.baseURL = process.env.GROK_API_URL || "https://api.x.ai/v1";
  }

  async generateResponse(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("Grok API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "grok-beta",
          messages: [
            {
              role: "system",
              content:
                "You are a legal AI assistant specialized in Indian law. Provide accurate, helpful legal guidance.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
          ...options,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Grok API error:", error.response?.data || error.message);
      throw new Error("Failed to get response from Grok API");
    }
  }
}

const grokAPI = new GrokAPI();

// Document processing utilities
const extractTextFromFile = async (file) => {
  const { originalname, buffer, mimetype } = file;

  try {
    if (mimetype === "application/pdf") {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimetype === "text/html") {
      const html = buffer.toString("utf-8");
      const $ = cheerio.load(html);
      return $.text();
    } else {
      return buffer.toString("utf-8");
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Failed to extract text from file");
  }
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!geminiAI,
      grok: !!process.env.GROK_API_KEY,
      translation: !!translationClient,
      documentAI: !!documentAI,
      language: !!languageClient,
    },
  });
});

// Document analysis endpoint with all features
app.post("/api/analyze-document", upload.single("file"), async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    let documentText = text;

    // Extract text from file if uploaded
    if (req.file) {
      documentText = await extractTextFromFile(req.file);
    }

    if (!documentText) {
      return res
        .status(400)
        .json({ error: "Document text or file is required" });
    }

    // Use Grok API for comprehensive analysis
    const analysisPrompt = `
    Analyze this legal document comprehensively and provide a structured JSON response with the following:

    1. **Red Flags Detection**: Identify high-risk clauses, unfair terms, excessive penalties, binding arbitration, etc.
    2. **Clause Tagging**: Categorize clauses into types (Termination, Payment, Liability, Data Privacy, etc.)
    3. **Statute Linking**: Link relevant clauses to Indian legal statutes and precedents
    4. **Risk Assessment**: Overall risk level and specific concerns
    5. **Simplified Summary**: Plain language explanation of key terms
    6. **Multilingual Summary**: Provide summary in Hindi and English
    7. **Recommendations**: Actionable next steps for the user

    Document: ${documentText}

    Return JSON with this structure:
    {
      "redFlags": [
        {
          "type": "penalty_clause",
          "severity": "high|medium|low",
          "description": "Description of the issue",
          "location": "Where it appears",
          "recommendation": "What to do"
        }
      ],
      "clauseTags": [
        {
          "category": "Termination",
          "clauses": ["clause text"],
          "riskLevel": "high|medium|low"
        }
      ],
      "statuteLinks": [
        {
          "clause": "relevant clause text",
          "statute": "Indian Contract Act 1872, Section 73",
          "precedent": "Relevant case law",
          "explanation": "How it applies"
        }
      ],
      "riskAssessment": {
        "overallRisk": "high|medium|low",
        "score": 85,
        "concerns": ["list of main concerns"]
      },
      "simplifiedSummary": "Plain language summary",
      "multilingualSummary": {
        "hindi": "Hindi summary",
        "english": "English summary",
        "tamil": "Tamil summary",
        "telugu": "Telugu summary"
      },
      "recommendations": [
        "Actionable recommendation 1",
        "Actionable recommendation 2"
      ]
    }
    `;

    const analysis = await grokAPI.generateResponse(analysisPrompt, {
      maxTokens: 4000,
    });

    try {
      const parsedAnalysis = JSON.parse(analysis);
      res.json(parsedAnalysis);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      res.json({
        redFlags: [],
        clauseTags: [],
        statuteLinks: [],
        riskAssessment: { overallRisk: "medium", score: 50, concerns: [] },
        simplifiedSummary: analysis,
        multilingualSummary: {
          english: analysis,
          hindi: "Analysis not available in Hindi",
        },
        recommendations: ["Please review the document manually"],
      });
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    res.status(500).json({ error: "Failed to analyze document" });
  }
});

// Document simplification endpoint
app.post("/api/simplify", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
    Simplify this legal text into plain, easy-to-understand language for ${language} speakers.
    Break down complex legal concepts and jargon into simple terms.
    Keep the meaning accurate but make it accessible.
    
    Legal text: ${text}
    
    Provide:
    1. A clear summary of what this means
    2. Key points in bullet format
    3. Any important warnings or red flags
    4. Plain language explanation of complex terms
    `;

    const simplifiedText = await grokAPI.generateResponse(prompt);
    res.json({ simplifiedText });
  } catch (error) {
    console.error("Error simplifying text:", error);
    res.status(500).json({ error: "Failed to simplify text" });
  }
});

// Red flag detection endpoint
app.post("/api/detect-red-flags", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

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
    - Unfair contract terms under Indian law
    
    Legal text: ${text}
    
    Return a JSON array of red flags with this structure:
    [
      {
        "type": "penalty_clause",
        "severity": "high|medium|low",
        "description": "Clear description of the issue",
        "location": "Where in the text this appears",
        "recommendation": "What the user should do",
        "indianLawReference": "Relevant Indian law section"
      }
    ]
    `;

    const response = await grokAPI.generateResponse(prompt);

    try {
      const redFlags = JSON.parse(response);
      res.json({ redFlags });
    } catch {
      res.json({
        redFlags: [
          {
            type: "analysis_error",
            severity: "low",
            description: "Could not parse red flag analysis",
            location: "N/A",
            recommendation: "Please review the document manually",
            indianLawReference: "N/A",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error detecting red flags:", error);
    res.status(500).json({ error: "Failed to detect red flags" });
  }
});

// Clause tagging and categorization endpoint
app.post("/api/tag-clauses", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
    Analyze this legal document and categorize all clauses into meaningful categories.
    Use Indian legal terminology and categories.
    
    Categories to use:
    - Termination & Renewal
    - Payment Terms & Pricing
    - Liability & Indemnification
    - Data Privacy & Security
    - Intellectual Property
    - Dispute Resolution
    - Force Majeure
    - Confidentiality
    - Compliance & Regulatory
    - Performance & Delivery
    - Default & Remedies
    - Governing Law & Jurisdiction
    
    Document: ${text}
    
    Return JSON with this structure:
    {
      "clauseTags": [
        {
          "category": "Termination & Renewal",
          "clauses": [
            {
              "text": "exact clause text",
              "riskLevel": "high|medium|low",
              "description": "what this clause means",
              "recommendation": "what to watch out for"
            }
          ]
        }
      ],
      "summary": {
        "totalClauses": 15,
        "highRiskClauses": 3,
        "categories": ["list of categories found"]
      }
    }
    `;

    const response = await grokAPI.generateResponse(prompt);

    try {
      const clauseTags = JSON.parse(response);
      res.json(clauseTags);
    } catch {
      res.json({
        clauseTags: [],
        summary: { totalClauses: 0, highRiskClauses: 0, categories: [] },
      });
    }
  } catch (error) {
    console.error("Error tagging clauses:", error);
    res.status(500).json({ error: "Failed to tag clauses" });
  }
});

// Statute and precedent linking endpoint
app.post("/api/link-statutes", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
    Analyze this legal document and link relevant clauses to Indian legal statutes and precedents.
    Focus on:
    - Indian Contract Act 1872
    - Consumer Protection Act 2019
    - Information Technology Act 2000
    - Specific Relief Act 1963
    - Limitation Act 1963
    - Evidence Act 1872
    - Relevant case law from Supreme Court and High Courts
    
    Document: ${text}
    
    Return JSON with this structure:
    {
      "statuteLinks": [
        {
          "clause": "relevant clause text",
          "statute": "Indian Contract Act 1872, Section 73",
          "precedent": "State of Maharashtra vs. Indian Hotel and Restaurants Association (2013)",
          "explanation": "How this statute applies to the clause",
          "implications": "What this means for the parties",
          "riskLevel": "high|medium|low"
        }
      ],
      "summary": {
        "totalLinks": 8,
        "highRiskLinks": 2,
        "statutes": ["list of statutes referenced"]
      }
    }
    `;

    const response = await grokAPI.generateResponse(prompt);

    try {
      const statuteLinks = JSON.parse(response);
      res.json(statuteLinks);
    } catch {
      res.json({
        statuteLinks: [],
        summary: { totalLinks: 0, highRiskLinks: 0, statutes: [] },
      });
    }
  } catch (error) {
    console.error("Error linking statutes:", error);
    res.status(500).json({ error: "Failed to link statutes" });
  }
});

// Multilingual simplification endpoint
app.post("/api/multilingual-simplify", async (req, res) => {
  try {
    const {
      text,
      languages = ["hindi", "tamil", "telugu", "bengali", "marathi"],
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
    Provide clear, simplified summaries of this legal document in multiple Indian languages.
    Make the content accessible to regular people, not just legal professionals.
    
    Document: ${text}
    
    Provide summaries in: ${languages.join(", ")}
    
    Return JSON with this structure:
    {
      "summaries": {
        "hindi": "Hindi summary in Devanagari script",
        "tamil": "Tamil summary in Tamil script",
        "telugu": "Telugu summary in Telugu script",
        "bengali": "Bengali summary in Bengali script",
        "marathi": "Marathi summary in Devanagari script"
      },
      "keyPoints": {
        "hindi": ["key point 1", "key point 2"],
        "tamil": ["key point 1", "key point 2"],
        "telugu": ["key point 1", "key point 2"],
        "bengali": ["key point 1", "key point 2"],
        "marathi": ["key point 1", "key point 2"]
      },
      "warnings": {
        "hindi": "Important warnings in Hindi",
        "tamil": "Important warnings in Tamil",
        "telugu": "Important warnings in Telugu",
        "bengali": "Important warnings in Bengali",
        "marathi": "Important warnings in Marathi"
      }
    }
    `;

    const response = await grokAPI.generateResponse(prompt, {
      maxTokens: 3000,
    });

    try {
      const multilingualSummary = JSON.parse(response);
      res.json(multilingualSummary);
    } catch {
      res.json({
        summaries: { english: text },
        keyPoints: { english: ["Please review manually"] },
        warnings: { english: ["Manual review recommended"] },
      });
    }
  } catch (error) {
    console.error("Error creating multilingual summary:", error);
    res.status(500).json({ error: "Failed to create multilingual summary" });
  }
});

// Translation endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res
        .status(400)
        .json({ error: "Text and target language are required" });
    }

    // Use Grok for translation with legal context
    const prompt = `
    Translate this legal text to ${targetLanguage} while maintaining legal accuracy and context.
    Ensure legal terms are properly translated and culturally appropriate.
    
    Text: ${text}
    Target Language: ${targetLanguage}
    
    Provide:
    1. Accurate translation
    2. Any cultural or legal context notes
    3. Important terms that need special attention
    `;

    const translatedText = await grokAPI.generateResponse(prompt);
    res.json({ translatedText });
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

// Bail document processing endpoint
app.post(
  "/api/process-bail-document",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const text = await extractTextFromFile(req.file);

      const prompt = `
    Analyze this bail-related legal document and extract structured information.
    Focus on Indian bail laws and procedures.
    
    Document: ${text}
    
    Extract and structure:
    1. Document Type (Bail Bond, Surety Bond, Personal Bond, etc.)
    2. Defendant Information (Name, Age, Address, etc.)
    3. Bail Amount and Conditions
    4. Surety Information (if applicable)
    5. Court Information (Name, Location, Case Number)
    6. Important Dates (Hearing dates, Bond execution date)
    7. Special Conditions or Restrictions
    8. Risk Assessment based on Indian law
    9. Compliance Requirements
    10. Next Steps for the defendant
    
    Return structured JSON with all relevant information.
    `;

      const bailData = await grokAPI.generateResponse(prompt, {
        maxTokens: 2000,
      });

      try {
        const parsedBailData = JSON.parse(bailData);
        res.json(parsedBailData);
      } catch {
        res.json({
          documentType: "Bail Document",
          extractedText: text,
          analysis: bailData,
        });
      }
    } catch (error) {
      console.error("Error processing bail document:", error);
      res.status(500).json({ error: "Failed to process bail document" });
    }
  }
);

// Legal advice endpoint
app.post("/api/legal-advice", async (req, res) => {
  try {
    const { question, context = "" } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `
    You are a legal advisor specializing in Indian law. Provide helpful, accurate legal guidance.
    
    Question: ${question}
    Context: ${context}
    
    Provide:
    1. A clear answer to the question
    2. Relevant Indian legal principles and statutes
    3. Practical next steps
    4. Important warnings or disclaimers
    5. When to consult a lawyer
    6. Relevant case law if applicable
    7. Estimated timeline for resolution
    8. Cost considerations
    
    Keep the response professional but accessible to non-lawyers.
    `;

    const advice = await grokAPI.generateResponse(prompt, { maxTokens: 2000 });
    res.json({ advice });
  } catch (error) {
    console.error("Error providing legal advice:", error);
    res.status(500).json({ error: "Failed to provide legal advice" });
  }
});

// Voice assistant endpoint
app.post("/api/voice-assistant", async (req, res) => {
  try {
    const { message, context = "" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
    You are a voice assistant for a legal AI platform. Respond to this voice command in a conversational manner.
    Keep responses concise but helpful for voice interaction.
    
    Voice Command: ${message}
    Context: ${context}
    
    Provide a helpful response that can be easily read aloud.
    `;

    const response = await grokAPI.generateResponse(prompt, {
      maxTokens: 1000,
    });
    res.json({ response });
  } catch (error) {
    console.error("Error processing voice command:", error);
    res.status(500).json({ error: "Failed to process voice command" });
  }
});

// Dashboard statistics endpoint
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    // In a real application, this would fetch from a database
    const stats = {
      documentsProcessed: 1247,
      redFlagsDetected: 89,
      languagesSupported: 10,
      successRate: 98.5,
      recentActivity: [
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
      ],
      upcomingTasks: [
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
      ],
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nyaya Saar Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🤖 Grok API: ${process.env.GROK_API_KEY ? "Configured" : "Not configured"}`
  );
  console.log(`🔧 Google AI: ${geminiAI ? "Configured" : "Not configured"}`);
});

export default app;
