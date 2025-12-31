
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsItem, IntelligenceReport, IntelligenceSignal, CyberThreat, DeepSpaceObject, DecodedSignal, MarketData, InternetStats, Influencer, VulnerabilityReport, VerificationReport, CelebrityDossier, SentimentData } from '../types';

const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 1000 * 60 * 10; // 10 minutes cache

export class IntelligenceService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  constructor() {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
      return entry.data;
    }
    return null;
  }

  private setCached(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async analyzeNewsContent(content: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Perform a high-level strategic intelligence analysis of the following report. Identify geopolitical risks, socio-economic impact, and provide a "Tactical Outlook". Keep it structured as a professional briefing. DATA: "${content}"`,
        config: {
          systemInstruction: "You are the GMT Global Strategic AI. Provide deep-logic analysis that goes beyond the surface headlines. Be professional, slightly ominous, and highly tactical."
        }
      });
      return response.text || "Strategic analysis inconclusive. Neural patterns scattered.";
    } catch (e) {
      console.error("News analysis failed:", e);
      return "Strategic analysis offline. Signal integrity compromised.";
    }
  }

  async getSummarizedTacticalOutlook(content: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate an extremely concise (max 2 sentences) "Tactical Outlook" for this intel: "${content}". Focus on immediate strategic implications and recommended agent posture.`,
        config: {
          systemInstruction: "You are the GMT Global Strategic AI. Provide high-impact, actionable tactical summaries for field agents."
        }
      });
      return response.text || "Outlook inconclusive.";
    } catch (e) {
      console.error("Tactical summary failed:", e);
      return "Uplink failure.";
    }
  }

  async getHistoricalSentimentAnalysis(): Promise<{ history: any[], summary: string }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Generate a simulated 24-hour historical sentiment log (hourly points) for 'Eurasia' and 'Africa' based on current real-world trends. Return ONLY valid JSON: { \"history\": [{ \"hour\": \"00:00\", \"Eurasia\": 75, \"Africa\": 60 }, ...], \"summary\": \"string\" }",
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Historical sentiment fetch failed:", e);
      return { history: [], summary: "Trend engine offline. Temporal sync failed." };
    }
  }

  async getGlobalCyberIntelligence(): Promise<NewsItem[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Find the 5 most critical global cybersecurity incidents from the last 48 hours. Focus on high-impact infrastructure exploits.",
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      const mockItems: NewsItem[] = [
        {
          id: `CYBER-INTEL-${Date.now()}-0`,
          title: "Systemic Infrastructure Vulnerability Identified",
          content: response.text || "Analysis of recent digital flows indicate a potential bypass of secondary firewall layers in major logistical nodes.",
          sentiment: "CRITICAL",
          location: "Global",
          category: "CYBERSECURITY",
          timestamp: new Date().toISOString(),
          sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[])?.filter(c => c.web).map(c => ({
            uri: c.web.uri,
            title: c.web.title
          })) || []
        }
      ];
      return mockItems;
    } catch (e) {
      console.error("Cyber intel fetch failed:", e);
      return [];
    }
  }

  async performVulnerabilityScan(targetUrl: string): Promise<VulnerabilityReport> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Perform a simulated high-clearance security audit on the external architecture of ${targetUrl}. Identify potential vulnerabilities based on OWASP standards. Return JSON: { \"target\": \"string\", \"score\": number, \"threats\": [{ \"type\": \"string\", \"severity\": \"CRITICAL\" | \"HIGH\" | \"MEDIUM\" | \"LOW\", \"description\": \"string\", \"remediation\": \"string\" }], \"metadata\": { \"server\": \"string\", \"ssl\": \"string\", \"latency\": \"string\" } }`,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 16000 }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Vulnerability scan failed:", e);
      return {
        target: targetUrl,
        score: 0,
        threats: [],
        metadata: { server: 'N/A', ssl: 'N/A', latency: '0ms' }
      };
    }
  }

  async getStrategicInvestmentAdvice(marketData: MarketData): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Based on current market state: BTC at $${marketData.bitcoinPrice}, provide a 1-sentence tactical investment tip for a global operative.`,
      });
      return response.text || "Market trajectory stable. Proceed with standard capital deployment.";
    } catch (e) {
      return "Unable to resolve market trajectory. Neural link timeout.";
    }
  }

  async getCelebritySpotlight(name: string): Promise<CelebrityDossier> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate a tactical intelligence dossier for: \"${name}\". Return JSON: { \"name\": \"string\", \"occupation\": \"string\", \"recentActivity\": \"string\", \"influenceScore\": number, \"riskRating\": \"STABLE\" | \"ELEVATED\" | \"CRITICAL\", \"newsHighlights\": [{ \"title\": \"string\", \"uri\": \"string\" }], \"biometricSummary\": \"string\" }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const dossier: CelebrityDossier = JSON.parse(response.text || "{}");
      dossier.imageUrl = `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800`;
      dossier.imageUrls = [
        dossier.imageUrl,
        `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800`,
        `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800`,
        `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800`,
        `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800`
      ];
      return dossier;
    } catch (e) {
      console.error("Celebrity spotlight uplink failed:", e);
      throw new Error("Unable to fix satellite target on specified individual.");
    }
  }

  async generateIntelligenceDossiers(query: string): Promise<IntelligenceReport[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Generate 4 detailed intelligence dossiers for the topic: ${query}. Return JSON array: [{ \"title\": \"string\", \"summary\": \"string\", \"keyInsights\": [\"string\"], \"threatLevel\": \"MINIMAL\" | \"ELEVATED\" | \"SEVERE\", \"groundingSources\": [{ \"uri\": \"string\", \"title\": \"string\" }] }]`,
        config: {
          responseMimeType: "application/json"
        }
      });
      const data = JSON.parse(response.text || "[]");
      return data.map((r: any) => ({ ...r, lastUpdated: new Date().toISOString() }));
    } catch (e) {
      console.error("Dossier generation failed:", e);
      return [];
    }
  }

  async getLocalizedNews(location: string): Promise<NewsItem[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Find breaking world intelligence in ${location}.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      
      const newsItem: NewsItem = {
        id: `LOC-${location}-${Date.now()}-0`,
        title: `Regional Intelligence: ${location}`,
        category: "GEOPOLITICS",
        author: "GMT_ORACLE",
        content: response.text || "Synchronizing terrestrial signals. Stability optimal.",
        sentiment: "STABLE",
        location,
        timestamp: new Date().toISOString(),
        image: `https://images.unsplash.com/photo-1517732359359-51f709b1fec5?auto=format&fit=crop&q=80&w=800`,
        sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[])?.filter(c => c.web).map(c => ({
          uri: c.web.uri,
          title: c.web.title
        })) || []
      };
      return [newsItem];
    } catch (e) {
      console.error("Localized news fetch failed:", e);
      return [];
    }
  }

  async getMarketIntelligence(): Promise<MarketData> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Provide current Bitcoin price and history. Return JSON: { \"bitcoinPrice\": number, \"bitcoinHistory\": [{ \"time\": \"string\", \"price\": number }], \"conversions\": { \"USD\": number, \"EUR\": number, \"GBP\": number, \"JPY\": number } }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Market intelligence fetch failed:", e);
      return { bitcoinPrice: 0, bitcoinHistory: [], conversions: {} };
    }
  }

  async getInternetStats(): Promise<{stats: InternetStats, influencers: Influencer[]}> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate global internet reach stats (billions) and 5 trending influencers. Return JSON: { \"stats\": { \"daily\": number, \"weekly\": number, \"monthly\": number, \"yearly\": number }, \"influencers\": [{ \"name\": \"string\", \"reach\": \"string\", \"platform\": \"string\", \"category\": \"string\" }] }`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Internet stats fetch failed:", e);
      return { stats: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, influencers: [] };
    }
  }

  async getGlobalSentiment(): Promise<SentimentData[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Analyze current emotional sentiment for 6 major world regions. Return JSON array: [{ \"region\": \"string\", \"lat\": number, \"lng\": number, \"sentiment\": \"STABLE\" | \"VOLATILE\" | \"CRITICAL\", \"score\": number, \"color\": \"string (hex)\" }]`,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Global sentiment fetch failed:", e);
      return [];
    }
  }

  async verifyNewsStory(title: string, content: string): Promise<VerificationReport> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Analyze story for accuracy: \"${title}\" CONTENT: \"${content}\". Return JSON: { \"truthScore\": number, \"confidence\": \"HIGH\" | \"MEDIUM\" | \"LOW\", \"analysis\": \"string\", \"sources\": [{ \"title\": \"string\", \"uri\": \"string\" }] }`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (e: any) {
      console.error("Verification uplink failed:", e);
      return {
        truthScore: 50,
        confidence: 'LOW',
        analysis: "Verification engine offline. Signal interference detected.",
        sources: []
      };
    }
  }

  async getLatestGlobalUpdates(category: string, page: number = 1): Promise<NewsItem[]> {
    const cacheKey = `news_${category}_p${page}`;
    const cached = this.getCached<NewsItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Identify 6 distinct and diverse breaking news updates or geopolitical insights for the category: ${category}. Provide a summary for each.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[];
      const commonSources = grounding?.filter(c => c.web).map(c => ({
        uri: c.web.uri,
        title: c.web.title
      })) || [];

      // Generate 6 distinct items per page to support pagination effectively
      const newsItems: NewsItem[] = Array.from({ length: 6 }).map((_, i) => ({
        id: `INTEL-${category.replace(/\s/g, '_')}-${page}-${i}-${Date.now()}`,
        title: i === 0 ? `Core Intel: ${category} Analysis` : `Secondary Update ${i}: ${category} Trajectory`,
        category: category,
        author: i % 2 === 0 ? "GMT_ORACLE" : "NEXUS_RECON",
        content: i === 0 ? (response.text || "Orbital sync stable. Terrestrial noise within limits.") : `Extended neural data stream for ${category} at node ${page}.${i}. Geographic markers indicate stability shift.`,
        sentiment: i % 3 === 0 ? "VOLATILE" : "STABLE",
        timestamp: new Date(Date.now() - (i * 3600000) - (page * 86400000)).toISOString(),
        image: `https://images.unsplash.com/photo-${1451187580459 + (i * 100) + (page * 50)}-43490279c0fa?auto=format&fit=crop&q=80&w=1200`,
        sources: commonSources.slice(i, i + 2)
      }));
      
      this.setCached(cacheKey, newsItems);
      return newsItems;
    } catch (e) {
      console.error("Global intelligence sync failure:", e);
      return [];
    }
  }

  async generateBroadcastAudio(text: string, voiceName: string = 'Kore'): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text: `Broadcast text in tactical tone: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch (e) {
      console.error("Neural voice synthesis failed:", e);
      return "";
    }
  }

  async decodeEncryptedSignal(cipher: string): Promise<DecodedSignal> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Decrypt this tactical cipher: \"${cipher}\". Return JSON: {id, original, decrypted, confidence, origin}`,
        config: { 
          responseMimeType: "application/json"
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      throw new Error("Cipher analysis protocol timed out.");
    }
  }

  async scanForCyberIntruders(): Promise<CyberThreat[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Simulate network battlefield scan. Detect 6 active network infiltrators. Return JSON array.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }

  async analyzeThreatDetails(threat: CyberThreat): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Perform a deep forensic analysis on the following cyber threat:
          Type: ${threat.type}
          IP: ${threat.ip}
          Origin: ${threat.origin}
          Severity: ${threat.severity}
          Payload: ${threat.payload || 'N/A'}

          Provide a detailed report covering:
          1. Likely Origin/Actor profile.
          2. Propagation Methods.
          3. Potential Infrastructure Impact.
          4. Strategic Countermeasures.
          
          Keep the tone professional, technical, and slightly tactical (GMT Global style).`,
        config: {
          thinkingConfig: { thinkingBudget: 16000 }
        }
      });
      return response.text || "Forensic analysis failed to resolve threat vectors.";
    } catch (e) {
      console.error("Threat analysis failed:", e);
      return "Neural link to forensic engine failed. Threat origin obscured.";
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Professional tactical translation to ${targetLanguage}: \"${text}\". Return direct translation only.`
      });
      return response.text || "";
    } catch (e) {
      return "Translation protocol failure.";
    }
  }

  async getGeopoliticalPrediction(query: string): Promise<any> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: `Forecast geopolitical outcomes for: ${query}. Return JSON: {prediction, riskLevel, factors: []}`,
        config: { 
          thinkingConfig: { thinkingBudget: 16000 },
          responseMimeType: "application/json" 
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { prediction: "Future trajectory obscured by orbital noise.", riskLevel: 0, factors: [] };
    }
  }

  async getSatelliteSignals(lat?: number, lng?: number): Promise<IntelligenceSignal[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Simulate 10 orbital intelligence signals near Lat: ${lat}, Lng: ${lng}. JSON array.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }

  async scanDeepSpace(): Promise<DeepSpaceObject[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Scan deep space. Identify 5 objects. Return JSON array.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }
}
