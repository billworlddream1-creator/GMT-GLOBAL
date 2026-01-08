
import { GoogleGenAI, Modality } from "@google/genai";
import { NewsItem, SentimentData, IntelligenceSignal, MarketData, WeatherReport, IntelligenceReport, VulnerabilityReport, CyberThreat, ForensicReport, DecodedSignal, DeepSpaceObject, CelebrityDossier, InternetStats, Influencer, TradeIntelligence, CloudFile, BenthicSignal, WaveTelemetry, FutureEvent, NetworkMass, TacticalTarget, LocalSensor, SpectralAnomaly } from './types';

const FLASH_MODEL = 'gemini-3-flash-preview';

export class IntelligenceService {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private inFlight = new Map<string, Promise<any>>();
  private CACHE_TTL = 300000;
  
  private requestQueue: Promise<any> = Promise.resolve();
  private LAST_REQUEST_TIME = 0;
  private MIN_DELAY = 4500; 

  private async callGemini<T>(operation: () => Promise<T>, retries = 8, backoff = 6000): Promise<T> {
    if (!process.env.API_KEY) throw new Error("CRITICAL_FAULT: Neural API Key not found.");

    try {
      return await operation();
    } catch (err: any) {
      const errorStr = err?.message || JSON.stringify(err);
      const isQuotaError = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || err?.status === 429;

      if (isQuotaError && retries > 0) {
        const sleepTime = backoff + (Math.random() * 3000);
        console.warn(`QUOTA_LIMIT: Retrying in ${Math.round(sleepTime)}ms...`);
        await new Promise(r => setTimeout(r, sleepTime));
        return this.callGemini(operation, retries - 1, backoff * 1.8);
      }
      
      throw new Error(isQuotaError ? "NEURAL_OVERLOAD: API Quota exhausted. Stabilization required." : (err?.message || "Logical collapse."));
    }
  }

  private async throttledCall<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.requestQueue.then(async () => {
      const timeSinceLast = Date.now() - this.LAST_REQUEST_TIME;
      if (timeSinceLast < this.MIN_DELAY) await new Promise(r => setTimeout(r, this.MIN_DELAY - timeSinceLast));
      this.LAST_REQUEST_TIME = Date.now();
      return operation();
    });
    this.requestQueue = next.catch(() => {});
    return next;
  }

  private safeParse<T>(text: string | undefined, fallback: T): T {
    if (!text) return fallback;
    try {
      return JSON.parse(text.replace(/```json\n?|```/g, "").trim()) ?? fallback;
    } catch { return fallback; }
  }

  private async cachedCall<T>(key: string, operation: () => Promise<T>, ttl = this.CACHE_TTL): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) return cached.data;
    if (this.inFlight.has(key)) return this.inFlight.get(key);

    const promise = this.throttledCall(() => this.callGemini(operation));
    this.inFlight.set(key, promise);
    try {
      const res = await promise;
      this.cache.set(key, { data: res, timestamp: Date.now() });
      return res;
    } finally { this.inFlight.delete(key); }
  }

  async getLatestGlobalUpdates(query: string): Promise<NewsItem[]> {
    return this.cachedCall(`news_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Latest news for: ${query}. JSON array: id, title, category, content, location, sentiment.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const items = this.safeParse<any[]>(response.text, []);
      return items.map((it, i) => ({
        id: it.id || `NEWS-${i}-${Date.now()}`,
        title: it.title || 'CLASSIFIED',
        category: (it.category || 'GENERAL').toUpperCase(),
        content: it.content || 'Encrypted.',
        location: it.location || 'GLOBAL',
        sentiment: it.sentiment || 'STABLE',
        timestamp: new Date().toISOString(),
        verified: true,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ uri: c.web?.uri || '', title: c.web?.title || 'Node' })) || [],
        image: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&q=80&w=800`
      }));
    });
  }

  async getMarketIntelligence(): Promise<MarketData> {
    return this.cachedCall('market_intel', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Market prices. JSON.", config: { tools: [{ googleSearch: {} }] } });
      const data = this.safeParse(response.text, {} as any);
      return { bitcoinPrice: Number(data.bitcoinPrice) || 65000, ethereumPrice: Number(data.ethereumPrice) || 3500, solanaPrice: Number(data.solanaPrice) || 145, cardanoPrice: Number(data.cardanoPrice) || 0.45, bitcoinHistory: Array.from({length: 10}).map((_, i) => ({ time: `${i}:00`, price: 64000 + Math.random() * 2000 })), sources: data.sources || [] };
    }, 600000);
  }

  async getAtmosIntelligence(location: string): Promise<WeatherReport> {
    return this.cachedCall(`atmos_${location}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Weather for ${location}. JSON.`, config: { tools: [{ googleSearch: {} }] } });
      const data = this.safeParse(response.text, {} as any);
      return { location: data.location || location, temperature: Number(data.temperature) || 22, condition: data.condition || 'Clear', humidity: Number(data.humidity) || 45, pressure: Number(data.pressure) || 1012, windSpeed: Number(data.windSpeed) || 12, visibility: Number(data.visibility) || 10, impactAssessment: data.impactAssessment || 'Optimal.' };
    });
  }

  async getGlobalSentiment(): Promise<SentimentData[]> {
    return this.cachedCall('global_sentiment', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Global sentiment. JSON." });
      return this.safeParse<any[]>(response.text, []).map(i => ({ ...i, lat: Number(i.lat) || 0, lng: Number(i.lng) || 0, score: Number(i.score) || 50 }));
    }, 900000);
  }

  async getSatelliteSignals(lat?: number, lng?: number): Promise<IntelligenceSignal[]> {
    return this.cachedCall(`sat_${lat}_${lng}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Orbital signals. JSON." });
      return this.safeParse<any[]>(response.text, []).map(s => ({ ...s, lat: Number(s.lat) || 0, lng: Number(s.lng) || 0 }));
    });
  }

  async performVulnerabilityScan(url: string): Promise<VulnerabilityReport> {
    return this.cachedCall(`vuln_${url}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Audit ${url}. JSON.` });
      return this.safeParse(response.text, { target: url, score: 0, threats: [] });
    });
  }

  async decodeEncryptedSignal(cipher: string): Promise<DecodedSignal> {
    return this.cachedCall(`decode_${cipher.slice(0, 20)}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Decrypt: "${cipher}". JSON.` });
      return this.safeParse(response.text, { decrypted: 'ERROR', confidence: 0, origin: 'UNKNOWN' });
    });
  }

  async generateBroadcastAudio(text: string, voice: string = 'Zephyr'): Promise<string> {
    return this.cachedCall(`tts_${text.slice(0, 30)}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Synth: ${text}` }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    }, 3600000);
  }

  async performRealityAudit(content: string): Promise<{ synthScore: number, artifacts: string[] }> {
    return this.cachedCall(`reality_${content.slice(0, 30)}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Audit content: "${content}". JSON.` });
      return this.safeParse(response.text, { synthScore: 0, artifacts: [] });
    });
  }

  async generateIntelligenceDossiers(query: string): Promise<IntelligenceReport[]> {
    return this.cachedCall(`dossier_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Dossiers for: ${query}. JSON.`, config: { tools: [{ googleSearch: {} }] } });
      return this.safeParse(response.text, []);
    });
  }

  async getGeopoliticalPrediction(query: string): Promise<any> {
    return this.cachedCall(`predict_${query}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Prediction for ${query}. JSON.` });
      return this.safeParse(response.text, { prediction: 'N/A', riskLevel: 50, factors: [] });
    });
  }

  async scanForCyberIntruders(): Promise<CyberThreat[]> {
    return this.cachedCall('cyber_threats', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Cyber threat data. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async analyzeThreatDetails(threat: CyberThreat): Promise<ForensicReport> {
    return this.cachedCall(`forensic_${threat.id}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Analysis of ${threat.type}. JSON.` });
      return this.safeParse(response.text, { actorProfile: 'N/A', countermeasures: [] });
    });
  }

  async getHistoricalSentimentAnalysis(): Promise<{ history: any[], summary: string }> {
    return this.cachedCall('hist_sent', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Historical sentiment. JSON." });
      return this.safeParse(response.text, { history: [], summary: "N/A" });
    });
  }

  async getStrategicInvestmentAdvice(data: MarketData | null): Promise<string> {
    return this.cachedCall('invest_advice', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Investment advice for: ${JSON.stringify(data)}` });
      return response.text || "Hold.";
    });
  }

  async scanDeepSpace(): Promise<DeepSpaceObject[]> {
    return this.cachedCall('space_recon', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Deep space objects. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async getCelebritySpotlight(name: string): Promise<CelebrityDossier> {
    return this.cachedCall(`celeb_${name}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Dossier on ${name}. JSON.` });
      return this.safeParse(response.text, {} as any);
    });
  }

  async getInternetStats(): Promise<{stats: InternetStats, influencers: Influencer[], sources: any[]}> {
    return this.cachedCall('net_stats', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Internet statistics. JSON.", config: { tools: [{ googleSearch: {} }] } });
      return this.safeParse(response.text, { stats: { daily: 5, weekly: 35, monthly: 150, yearly: 1800 }, influencers: [], sources: [] });
    });
  }

  async getTradeIntelligence(): Promise<TradeIntelligence> {
    return this.cachedCall('trade_intel', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Global trade nodes. JSON." });
      return this.safeParse(response.text, { nodes: [], connections: [], globalSummary: "" });
    });
  }

  async getCloudAnalytics(): Promise<{ usage: number, limit: number, files: CloudFile[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Cloud storage usage. JSON." });
      return this.safeParse(response.text, { usage: 45, limit: 100, files: [] });
    });
  }

  async getBotMissionIntel(botClass: string, zone: string): Promise<string> {
    return this.cachedCall(`bot_${botClass}_${zone}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Mission report for ${botClass} in ${zone}.` });
      return response.text || "No data.";
    });
  }

  async getBenthicSignals(): Promise<{signals: BenthicSignal[], wave: WaveTelemetry}> {
    return this.cachedCall('benthic_intel', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Benthic sensor signals. JSON.", config: { tools: [{ googleSearch: {} }] } });
      return this.safeParse(response.text, { signals: [], wave: { heightMeters: 1, periodSeconds: 5, temperature: 15, seaState: 'CALM' } });
    });
  }

  async getTemporalForecast(): Promise<FutureEvent[]> {
    return this.cachedCall('chrono_forecast', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Future events forecast. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async getNetworkMassSignals(): Promise<NetworkMass[]> {
    return this.cachedCall('net_mass_signals', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Network mass signals. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async getTacticalRangeSignals(): Promise<TacticalTarget[]> {
    return this.cachedCall('range_signals', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Rangefinder targets. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async scanLocalEnvironment(): Promise<LocalSensor[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Local device scan. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async scanSpectralField(): Promise<SpectralAnomaly[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Spectral anomalies. JSON." });
      return this.safeParse(response.text, []);
    });
  }

  async getAegisResponse(query: string, history: any[]): Promise<string> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `AEGIS help for ${query}.` });
      return response.text || "Uplink error.";
    });
  }

  async getLocalizedNews(location: string): Promise<NewsItem[]> {
    return this.cachedCall(`loc_news_${location}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Local news for ${location}. JSON.`, config: { tools: [{ googleSearch: {} }] } });
      return this.safeParse<any[]>(response.text, []).map(it => ({ ...it, timestamp: new Date().toISOString(), verified: true, sources: [] }));
    });
  }

  async getGlobalCyberIntelligence(): Promise<NewsItem[]> {
    return this.cachedCall('cyber_intelligence', async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Cyber intelligence data. JSON.", config: { tools: [{ googleSearch: {} }] } });
      return this.safeParse<any[]>(response.text, []).map(it => ({ ...it, timestamp: new Date().toISOString(), verified: true, category: 'CYBER' }));
    });
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    return this.cachedCall(`translation_${text.slice(0, 20)}_${targetLang}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: `Translate to ${targetLang}: ${text}` });
      return response.text || "";
    });
  }

  async analyzeSentimentForEnvironment(news: NewsItem[]): Promise<{ primaryColor: string, secondaryColor: string, tertiaryColor: string, volatility: number } | null> {
    if (!news.length) return null;
    return this.cachedCall(`bg_sent_${news[0].id}`, async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: FLASH_MODEL, contents: "Environmental colors JSON." });
      return this.safeParse(response.text, { primaryColor: '#020617', secondaryColor: '#1e293b', tertiaryColor: '#3b82f6', volatility: 0.2 });
    }, 900000);
  }
}
