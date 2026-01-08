
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsItem, IntelligenceMetric, GlobalTrendData, SentimentData, IntelligenceSignal, MarketData, WeatherReport, IntelligenceReport, VulnerabilityReport, CyberThreat, ForensicReport, DecodedSignal, DeepSpaceObject, CelebrityDossier, InternetStats, Influencer, TradeIntelligence, TradeNode, TradeConnection, CloudFile, ReconBot, BenthicSignal, WaveTelemetry, FutureEvent, NetworkMass, TacticalTarget, LocalSensor, SpectralAnomaly } from '../types';

const FLASH_MODEL = 'gemini-3-flash-preview';

export class IntelligenceService {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private inFlight = new Map<string, Promise<any>>();
  private CACHE_TTL = 300000; // 5 minutes standard cache
  
  // Throttle state to respect Gemini free-tier RPM (Requests Per Minute)
  private requestQueue: Promise<any> = Promise.resolve();
  private LAST_REQUEST_TIME = 0;
  private MIN_DELAY = 4500; // ~4.5 seconds between any two requests to Gemini (Safe floor for ~13 RPM)

  private async callGemini<T>(operation: () => Promise<T>, retries = 8, backoff = 6000): Promise<T> {
    if (!process.env.API_KEY) {
      throw new Error("CRITICAL_FAULT: Neural API Key not found in environment.");
    }

    try {
      return await operation();
    } catch (err: any) {
      const errorStr = err?.message || JSON.stringify(err);
      const isQuotaError = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        err?.status === 429 ||
        (err?.response?.status === 429);

      if (isQuotaError && retries > 0) {
        // Add significant jitter to avoid synchronized retries across modules
        const jitter = Math.random() * 3000;
        const sleepTime = backoff + jitter;
        
        console.warn(`QUOTA_LIMIT: API capacity reached. Stabilization in progress... Retrying in ${Math.round(sleepTime)}ms (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        
        // Increase backoff multiplier for subsequent retries to allow quota reset
        return this.callGemini(operation, retries - 1, backoff * 1.8);
      }

      console.error("Neural Sync Fault:", err);
      
      let msg = "Logical collapse during neural intercept.";
      if (isQuotaError) {
        msg = "NEURAL_OVERLOAD: API Quota exhausted. Stabilization required. Auto-recalibration in 60s.";
      } else if (err?.message) {
        msg = err.message;
      }
      
      throw new Error(msg);
    }
  }

  // Throttled and serialized queue to prevent concurrent bursts
  private async throttledCall<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.requestQueue.then(async () => {
      const now = Date.now();
      const timeSinceLast = now - this.LAST_REQUEST_TIME;
      
      if (timeSinceLast < this.MIN_DELAY) {
        const waitTime = this.MIN_DELAY - timeSinceLast;
        await new Promise(r => setTimeout(r, waitTime));
      }
      
      this.LAST_REQUEST_TIME = Date.now();
      return operation();
    });

    this.requestQueue = next.catch(() => {}); 
    return next;
  }

  private safeParse<T>(text: string | undefined, fallback: T): T {
    if (!text) return fallback;
    try {
      const clean = text.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return parsed ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  private async cachedCall<T>(key: string, operation: () => Promise<T>, ttl = this.CACHE_TTL): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }
    
    // De-duplicate active requests for the same resource
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = this.throttledCall(() => this.callGemini(operation));
    this.inFlight.set(key, promise);
    
    try {
      const result = await promise;
      this.cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      this.inFlight.delete(key);
    }
  }

  async getLatestGlobalUpdates(query: string): Promise<NewsItem[]> {
    return this.cachedCall(`news_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Find 10 real-time global news items for: ${query}. Last 12 hours. JSON array: id, title, category, content, location, sentiment (STABLE/VOLATILE/CRITICAL).`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const items = this.safeParse<any[]>(response.text, []);
      if (!Array.isArray(items)) return [];

      return items.map((it, i) => ({
        id: it.id || `NEWS-${i}-${Date.now()}`,
        title: it.title || 'CLASSIFIED_HEADER',
        category: (it.category || 'GENERAL').toUpperCase(),
        content: it.content || 'Dossier content encrypted or unavailable.',
        location: it.location || 'GLOBAL',
        sentiment: it.sentiment || 'STABLE',
        timestamp: new Date().toISOString(),
        verified: true,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ 
          uri: c.web?.uri || '', 
          title: c.web?.title || 'Intel Node' 
        })) || [],
        image: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&q=80&w=800`
      }));
    }, 600000); 
  }

  async getMarketIntelligence(): Promise<MarketData> {
    return this.cachedCall('market_intel', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Return current BTC, ETH, SOL, ADA prices in USD. JSON format.",
        config: { tools: [{ googleSearch: {} }] }
      });
      const data = this.safeParse(response.text, {} as any);
      return {
        bitcoinPrice: Number(data.bitcoinPrice) || 65000,
        ethereumPrice: Number(data.ethereumPrice) || 3500,
        solanaPrice: Number(data.solanaPrice) || 145,
        cardanoPrice: Number(data.cardanoPrice) || 0.45,
        bitcoinHistory: Array.from({length: 10}).map((_, i) => ({ time: `${i}:00`, price: 64000 + Math.random() * 2000 })),
        sources: Array.isArray(data.sources) ? data.sources : []
      };
    }, 300000);
  }

  async getAtmosIntelligence(location: string): Promise<WeatherReport> {
    return this.cachedCall(`atmos_${location}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Atmospheric status for ${location}. JSON: temperature, condition, humidity, pressure, windSpeed, visibility, impactAssessment.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const data = this.safeParse(response.text, {} as any);
      return {
        location: data.location || location,
        temperature: Number(data.temperature) || 22,
        condition: data.condition || 'Clear',
        humidity: Number(data.humidity) || 45,
        pressure: Number(data.pressure) || 1012,
        windSpeed: Number(data.windSpeed) || 12,
        visibility: Number(data.visibility) || 10,
        impactAssessment: data.impactAssessment || 'Optimal.'
      };
    }, 600000);
  }

  async getGlobalSentiment(): Promise<SentimentData[]> {
    return this.cachedCall('global_sentiment', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Current geopolitical sentiment for Eurasia, Africa, Americas, Pacific. JSON array: region, lat, lng, sentiment, score, color.",
      });
      const data = this.safeParse<any[]>(response.text, []);
      return data.map(item => ({
        ...item,
        lat: Number(item.lat) || 0,
        lng: Number(item.lng) || 0,
        score: Number(item.score) || 50
      }));
    }, 900000);
  }

  async getSatelliteSignals(lat?: number, lng?: number): Promise<IntelligenceSignal[]> {
    const key = `sat_signals_${lat}_${lng}`;
    return this.cachedCall(key, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate 8 active global intelligence signals${lat !== undefined ? ` near ${lat}, ${lng}` : ""}. JSON: id, type, location, lat, lng, description, urgency.`,
      });
      const data = this.safeParse<any[]>(response.text, []);
      return data.map((sig, i) => ({
        ...sig,
        id: sig.id || `SIG-${i}-${Date.now()}`,
        lat: Number(sig.lat) || 0,
        lng: Number(sig.lng) || 0
      }));
    }, 300000);
  }

  async performVulnerabilityScan(url: string): Promise<VulnerabilityReport> {
    return this.cachedCall(`audit_${url}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Simulate vulnerability scan for ${url}. JSON: target, score, threats (type, severity, description, remediation).`,
      });
      return this.safeParse(response.text, { target: url, score: 0, threats: [] });
    }, 60000);
  }

  async decodeEncryptedSignal(cipher: string): Promise<DecodedSignal> {
    return this.cachedCall(`decode_${cipher.slice(0, 20)}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Decrypt tactical cipher: "${cipher}". JSON: decrypted, confidence, origin.`,
      });
      return this.safeParse(response.text, { decrypted: 'SIGNAL_ERROR', confidence: 0, origin: 'UNKNOWN' });
    }, 60000);
  }

  async generateBroadcastAudio(text: string, voice: string = 'Zephyr'): Promise<string> {
    const textHash = text.slice(0, 60);
    return this.cachedCall(`tts_${textHash}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with tactical authority: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    }, 3600000);
  }

  async performRealityAudit(content: string): Promise<{ synthScore: number, artifacts: string[] }> {
    return this.cachedCall(`reality_${content.slice(0, 40)}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Analyze for AI artifacts: "${content}". JSON: synthScore, artifacts.`,
      });
      return this.safeParse(response.text, { synthScore: 0, artifacts: [] });
    }, 86400000);
  }

  async generateIntelligenceDossiers(query: string): Promise<IntelligenceReport[]> {
    return this.cachedCall(`dossier_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate tactical reports for query: ${query}. Include estimates for coordinates. JSON array: id, title, summary, details, recommendation, location, lat, lng.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      return this.safeParse(response.text, []);
    }, 600000);
  }

  async getGeopoliticalPrediction(query: string): Promise<any> {
    return this.cachedCall(`predict_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Predict outcome for: ${query}. JSON: prediction, riskLevel, factors.`,
      });
      return this.safeParse(response.text, { prediction: 'Data insufficient.', riskLevel: 50, factors: [] });
    }, 1800000);
  }

  async scanForCyberIntruders(): Promise<CyberThreat[]> {
    return this.cachedCall('cyber_intruders', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "List 5 active global cyber threat patterns. JSON: id, ip, origin, type, severity, timestamp, status.",
      });
      return this.safeParse(response.text, []);
    }, 300000);
  }

  async analyzeThreatDetails(threat: CyberThreat): Promise<ForensicReport> {
    return this.cachedCall(`forensic_${threat.id}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Deep forensic analysis on: ${threat.type} from ${threat.origin}. JSON: actorProfile, countermeasures.`,
      });
      return this.safeParse(response.text, { actorProfile: 'Inconclusive', countermeasures: [] });
    }, 600000);
  }

  async getHistoricalSentimentAnalysis(): Promise<{ history: any[], summary: string }> {
    return this.cachedCall('hist_sentiment', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Historical stability vectors for Eurasia and Africa (24h). JSON: history (array with hour, Eurasia, Africa scores), summary.",
      });
      return this.safeParse(response.text, { history: [], summary: "Historical sync pending." });
    }, 1200000);
  }

  async getStrategicInvestmentAdvice(data: MarketData | null): Promise<string> {
    return this.cachedCall('invest_advice', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Provide one sentence of tactical investment advice based on current market state: ${JSON.stringify(data)}`,
      });
      return response.text || "Maintain capital buffer.";
    }, 3600000);
  }

  async scanDeepSpace(): Promise<DeepSpaceObject[]> {
    return this.cachedCall('deep_space', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "List 10 deep space objects or satellites. JSON array: id, name, type, velocity, distanceMiles, coordinates (x, y).",
      });
      return this.safeParse(response.text, []);
    }, 600000);
  }

  async getCelebritySpotlight(name: string): Promise<CelebrityDossier> {
    return this.cachedCall(`vip_${name}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Generate a tactical dossier for VIP ${name}. JSON: name, imageUrl, occupation, influenceScore, riskRating, biometricSummary, recentActivity, newsHighlights, imageUrls.`,
      });
      return this.safeParse(response.text, {} as any);
    }, 3600000);
  }

  async getInternetStats(): Promise<{stats: InternetStats, influencers: Influencer[], sources: any[]}> {
    return this.cachedCall('internet_stats', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Current global internet stats. JSON: stats, influencers, sources.",
        config: { tools: [{ googleSearch: {} }] }
      });
      return this.safeParse(response.text, { stats: { daily: 5, weekly: 35, monthly: 150, yearly: 1800 }, influencers: [], sources: [] });
    }, 3600000);
  }

  async getTradeIntelligence(): Promise<TradeIntelligence> {
    return this.cachedCall('trade_intel', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Global trade node mapping. JSON: nodes, connections, globalSummary.",
      });
      const data = this.safeParse(response.text, { nodes: [], connections: [], globalSummary: "" });
      return {
        ...data,
        nodes: (data.nodes || []).map((n: any) => ({
          ...n,
          position: Array.isArray(n.position) ? n.position.map(Number) : [0,0,0],
          sentiment: Number(n.sentiment) || 50
        }))
      };
    }, 1800000);
  }

  async getCloudAnalytics(): Promise<{ usage: number, limit: number, files: CloudFile[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulated cloud memory load. JSON: usage, limit, files (id, name, type, size, timestamp, status).",
      });
      return this.safeParse(response.text, { usage: 45, limit: 100, files: [] });
    });
  }

  async getBotMissionIntel(botClass: string, zone: string): Promise<string> {
    return this.cachedCall(`bot_${botClass}_${zone}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Tactical report for ${botClass} unit operating in ${zone}. Detailed reconnaissance log.`,
      });
      return response.text || "No intel gathered.";
    }, 300000);
  }

  async getBenthicSignals(): Promise<{signals: BenthicSignal[], wave: WaveTelemetry}> {
    return this.cachedCall('benthic_signals', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Benthic and wave sensors. JSON: signals, wave.",
        config: { tools: [{ googleSearch: {} }] }
      });
      return this.safeParse(response.text, { signals: [], wave: { heightMeters: 1.5, periodSeconds: 9, temperature: 19, seaState: 'CALM' } });
    }, 600000);
  }

  async getTemporalForecast(): Promise<FutureEvent[]> {
    return this.cachedCall('chrono_forecast', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Temporal horizon trajectory (2030-2055). JSON array: year, title, brief, probability, impactLevel.",
      });
      return this.safeParse(response.text, []);
    }, 86400000);
  }

  async getNetworkMassSignals(): Promise<NetworkMass[]> {
    return this.cachedCall('net_mass', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Acquire network mass signals. JSON array: id, label, magnitude, velocity, type, risk, origin, coordinates.",
      });
      return this.safeParse(response.text, []);
    }, 300000);
  }

  async getTacticalRangeSignals(): Promise<TacticalTarget[]> {
    return this.cachedCall('tactical_range', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Acquire tactical range targets. JSON array: id, designation, classification, threatLevel, distanceKm, bearing, velocity, elevation, coordinates.",
      });
      return this.safeParse(response.text, []);
    }, 300000);
  }

  async scanLocalEnvironment(): Promise<LocalSensor[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate local proximity scan. JSON array: id, name, type, distanceMeters, azimuth, signalStrength, status, manufacturer.",
      });
      return this.safeParse(response.text, []);
    });
  }

  async scanSpectralField(): Promise<SpectralAnomaly[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Spectral field analyzer logs. JSON array: id, type, intensity, location, timestamp, evpContent.",
      });
      return this.safeParse(response.text, []);
    });
  }

  async getAegisResponse(query: string, history: any[]): Promise<string> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `You are the AEGIS technical assistant. Context: ${JSON.stringify(history)}. User: ${query}`,
      });
      return response.text || "Uplink failure.";
    });
  }

  async getLocalizedNews(location: string): Promise<NewsItem[]> {
    return this.cachedCall(`local_news_${location}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Current news events in ${location}. JSON array: id, title, content, image, category, sentiment.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const data = this.safeParse<any[]>(response.text, []);
      return data.map((it, i) => ({
        id: it.id || `LOCAL-${i}-${Date.now()}`,
        title: it.title || 'LOCAL_SIGNAL',
        content: it.content || '',
        image: it.image || `https://images.unsplash.com/photo-${1600000000000 + i}`,
        category: it.category || 'REGIONAL',
        sentiment: it.sentiment || 'STABLE',
        timestamp: new Date().toISOString(),
        verified: true,
        sources: []
      }));
    }, 600000);
  }

  async getGlobalCyberIntelligence(): Promise<NewsItem[]> {
    return this.cachedCall('global_cyber', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Latest 5 global cyber attacks. JSON array: id, title, content, location, sources.",
        config: { tools: [{ googleSearch: {} }] }
      });
      const data = this.safeParse<any[]>(response.text, []);
      return data.map((it, i) => ({
        id: it.id || `CYBER-${i}`,
        title: it.title || 'CYBER_ATTACK_DETECTED',
        content: it.content || '',
        location: it.location || 'NET_SPACE',
        timestamp: new Date().toISOString(),
        verified: true,
        category: 'CYBER_SECURITY',
        sources: Array.isArray(it.sources) ? it.sources : []
      }));
    }, 600000);
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    return this.cachedCall(`translate_${text.slice(0, 30)}_${targetLang}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Translate to ${targetLang}: "${text}". Return only the translation.`,
      });
      return response.text || "";
    }, 86400000);
  }

  async analyzeSentimentForEnvironment(news: NewsItem[]): Promise<{ primaryColor: string, secondaryColor: string, tertiaryColor: string, volatility: number } | null> {
    if (!news || news.length === 0) return null;
    
    const newsHash = news.map(n => n.id).join(',');
    return this.cachedCall(`bg_sentiment_${newsHash}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const headlines = news.slice(0, 5).map(n => n.title).join(" | ");
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Analyze sentiment of headlines: "${headlines}". Return JSON: primaryColor (dark hex), secondaryColor (dark hex), tertiaryColor (accent hex), volatility (0.1-1.0 number).`,
      });
      return this.safeParse(response.text, {
        primaryColor: '#020617',
        secondaryColor: '#1e293b',
        tertiaryColor: '#3b82f6',
        volatility: 0.2
      });
    }, 900000); 
  }
}
