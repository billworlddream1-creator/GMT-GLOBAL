
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsItem, IntelligenceReport, IntelligenceSignal, DecodedSignal, VulnerabilityReport, VerificationReport, CelebrityDossier, SentimentData, TradeIntelligence, CloudFile, FutureEvent, BenthicSignal, CyberThreat, ForensicReport, NetworkMass, DeepSpaceObject, TacticalTarget, IntelligenceMetric, GlobalTrendData, WeatherReport, MarketData, InternetStats, Influencer, LocalSensor, WaveTelemetry, SpectralAnomaly } from '../types';

const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 1000 * 60 * 5; // Reduced to 5 mins for high-frequency updates

export class IntelligenceError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'IntelligenceError';
  }
}

export class IntelligenceService {
  private cache: Map<string, CacheEntry<any>> = new Map();

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

  public clearCache() {
    this.cache.clear();
  }

  private safeParse<T>(text: string | undefined, fallback: T): T {
    if (!text) return fallback;
    try {
      const clean = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(clean);
    } catch (e) {
      console.error("Neural Parse Error:", e, text);
      return fallback;
    }
  }

  private async callGemini<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await operation();
    } catch (err: any) {
      let errorMsg = 'Unknown neural fault';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'object' && err !== null) {
        try {
          errorMsg = JSON.stringify(err);
        } catch {
          errorMsg = String(err);
        }
      } else {
        errorMsg = String(err);
      }
      
      if (retries > 0) {
        console.warn(`RETRYING_UPLINK: ${retries} attempts left. Reason: ${errorMsg}`);
        await new Promise(res => setTimeout(res, delay));
        return this.callGemini(operation, retries - 1, delay * 2);
      }

      if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
        throw new IntelligenceError("RATE_LIMIT_EXCEEDED", "Neural bandwidth exhausted. Standby for sync.");
      }
      if (errorMsg.includes("403") || errorMsg.includes("401")) {
        throw new IntelligenceError("SECURITY_DENIAL", "Credential handshake rejected by GMT Core.");
      }
      if (errorMsg.includes("500") || errorMsg.includes("503")) {
        throw new IntelligenceError("CORE_SYNC_FAILURE", "Server-side neural collapse detected.");
      }
      if (errorMsg.includes("SAFETY")) {
        throw new IntelligenceError("INTEL_REDACTED", "Content flagged by automated integrity filters.");
      }

      throw new IntelligenceError("UNKNOWN_UPLINK_FAULT", errorMsg);
    }
  }

  async getAtmosIntelligence(location: string): Promise<WeatherReport> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Fetch current real-time atmospheric state for ${location}. Provide JSON including: location, temperature (C), condition, humidity (%), windSpeed (km/h), pressure (hPa), visibility (km), impactAssessment (MUST FLAG any alerts like "STORM_WARNING", "EXTREME_HEAT", or "HAZARDOUS_CONDITIONS" if relevant), and a 3-day detailed forecast.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              temperature: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              humidity: { type: Type.NUMBER },
              windSpeed: { type: Type.NUMBER },
              pressure: { type: Type.NUMBER },
              visibility: { type: Type.NUMBER },
              impactAssessment: { type: Type.STRING },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    temp: { type: Type.NUMBER },
                    condition: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = grounding.map((g: any) => ({ uri: g.web?.uri, title: g.web?.title })).filter((s: any) => s.uri);
      const data = this.safeParse(response.text, {
        location: location,
        temperature: 0,
        condition: 'Syncing...',
        humidity: 0,
        windSpeed: 0,
        pressure: 0,
        visibility: 0,
        impactAssessment: 'Calibration in progress.',
        forecast: []
      });

      return { ...data, sources };
    });
  }

  async getLatestGlobalUpdates(query: string, page: number = 1): Promise<NewsItem[]> {
    const cacheKey = `news_${query}_${page}`;
    const cached = this.getCached<NewsItem[]>(cacheKey);
    if (cached) return cached;

    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Find the 10 most recent and critical global events related to: ${query}. Focus on BREAKING headlines from the last 6 hours. Output as JSON array of objects with: id, title, category, content (detailed summary), location, sentiment (STABLE, VOLATILE, CRITICAL).`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                content: { type: Type.STRING },
                location: { type: Type.STRING },
                sentiment: { type: Type.STRING }
              },
              required: ["id", "title", "category", "content"]
            }
          }
        },
      });

      const raw = this.safeParse(response.text, []);
      const grounding = response.candidates?.[0]?.groundingMetadata;
      
      const news: NewsItem[] = raw.map((item: any, i: number) => ({
        ...item,
        timestamp: new Date().toISOString(),
        verified: !!grounding?.groundingChunks?.length,
        sources: grounding?.groundingChunks?.map((chunk: any) => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || 'Intelligence Source'
        })) || [],
        image: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234)}?auto=format&fit=crop&q=80&w=800`
      }));

      this.setCached(cacheKey, news);
      return news;
    });
  }

  async getMarketIntelligence(): Promise<MarketData & { sources: any[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Generate real-time global market intelligence. Provide current prices for BTC, ETH, SOL in USD. Provide 12-point price history for BTC spanning the last 24 hours. Provide JSON.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bitcoinPrice: { type: Type.NUMBER },
              ethereumPrice: { type: Type.NUMBER },
              solanaPrice: { type: Type.NUMBER },
              bitcoinHistory: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    price: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = grounding.map((g: any) => ({ uri: g.web?.uri, title: g.web?.title })).filter((s: any) => s.uri);
      const data = this.safeParse(response.text, { 
        bitcoinPrice: 0, bitcoinHistory: [], ethereumPrice: 0, solanaPrice: 0, cardanoPrice: 0, xrpPrice: 0, polkadotPrice: 0 
      });
      return { ...data, sources };
    });
  }

  async getGlobalIntelligenceSummary(): Promise<{ metrics: IntelligenceMetric[], trends: GlobalTrendData[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Synthesize current global intelligence state. Provide metrics for 5 categories (GEOPOLITICS, MARKETS, CYBER, CLIMATE, TECH) with intensity (1-100) and delta (+/-), and provide a 7-point trend array of news volume/sentiment. Return JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    intensity: { type: Type.NUMBER },
                    delta: { type: Type.NUMBER },
                    risk: { type: Type.STRING }
                  }
                }
              },
              trends: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING },
                    volume: { type: Type.NUMBER },
                    sentiment: { type: Type.NUMBER },
                    activeNodes: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, { metrics: [], trends: [] });
    });
  }

  async getGlobalSentiment(): Promise<SentimentData[]> {
     return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Analyze current global geopolitical sentiment for major regions. Provide lat/lng, score (1-100), sentiment status, and hex color. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                sentiment: { type: Type.STRING },
                score: { type: Type.NUMBER },
                color: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async generateBroadcastAudio(text: string, voiceName: string = 'Zephyr'): Promise<string> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text: `Read this intelligence briefing with authority: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("AUDIO_SYNTH_EMPTY");
      return base64Audio;
    });
  }

  async getAegisResponse(userQuery: string, history: any[]): Promise<string> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: userQuery }] }
        ],
        config: {
          systemInstruction: `You are AEGIS, the GMT Technical Liaison. Tone: Military-tech, efficient.`
        }
      });
      return response.text || "PROTOCOL_ERROR";
    });
  }

  async getTrendingIntel(): Promise<{ events: NewsItem[], alertLevel: string }> {
    const events = await this.getLatestGlobalUpdates('BREAKING_GLOBAL_EVENTS');
    return { events, alertLevel: events.some(e => e.sentiment === 'CRITICAL') ? 'CRITICAL' : 'STABLE' };
  }

  async performRealityAudit(content: string): Promise<{ synthScore: number, artifacts: string[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Analyze for AI synthesis markers in: "${content}". Return a synth score (0-100) and specific artifacts found as JSON.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              synthScore: { type: Type.NUMBER },
              artifacts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["synthScore", "artifacts"]
          }
        }
      });
      return this.safeParse(response.text, { synthScore: 0, artifacts: [] });
    });
  }

  async getBenthicSignals(): Promise<{ signals: BenthicSignal[], wave: WaveTelemetry }> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate deep-sea signals (CABLE_NODE, SUBMERSIBLE) and surface wave telemetry (Height, Period, Sea State). Return JSON with 'signals' array and 'wave' object.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              signals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    depth: { type: Type.NUMBER },
                    location: { type: Type.STRING },
                    status: { type: Type.STRING },
                    coordinates: { type: Type.OBJECT, properties: { angle: { type: Type.NUMBER }, distance: { type: Type.NUMBER } } }
                  }
                }
              },
              wave: {
                type: Type.OBJECT,
                properties: {
                  heightMeters: { type: Type.NUMBER },
                  periodSeconds: { type: Type.NUMBER },
                  direction: { type: Type.STRING },
                  seaState: { type: Type.STRING },
                  temperature: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, { signals: [], wave: { heightMeters: 0, periodSeconds: 0, direction: 'N', seaState: 'CALM', temperature: 10 } });
    });
  }

  async scanSpectralField(): Promise<SpectralAnomaly[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate a paranormal investigation scan. Detect 3-5 spectral anomalies. Types: RESIDUAL, INTELLIGENT, POLTERGEIST, SHADOW, DEMONIC. Generate EVP content if applicable. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                intensity: { type: Type.NUMBER },
                evpContent: { type: Type.STRING },
                location: { type: Type.STRING },
                timestamp: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getTemporalForecast(): Promise<FutureEvent[]> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Project 6 critical global events between 2030 and 2055. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.NUMBER },
                title: { type: Type.STRING },
                brief: { type: Type.STRING },
                probability: { type: Type.NUMBER },
                impactLevel: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getNetworkMassSignals(): Promise<NetworkMass[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate 8 global network mass signals. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                magnitude: { type: Type.NUMBER },
                velocity: { type: Type.NUMBER },
                type: { type: Type.STRING },
                risk: { type: Type.STRING },
                origin: { type: Type.STRING },
                coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getTacticalRangeSignals(): Promise<TacticalTarget[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Generate 8 simulated tactical targets. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                designation: { type: Type.STRING },
                distanceKm: { type: Type.NUMBER },
                bearing: { type: Type.NUMBER },
                elevation: { type: Type.NUMBER },
                velocity: { type: Type.NUMBER },
                classification: { type: Type.STRING },
                threatLevel: { type: Type.STRING },
                coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getCloudAnalytics(): Promise<any> { 
    return { usage: 412, limit: 1000, files: [] }; 
  }

  async getTradeIntelligence(): Promise<TradeIntelligence> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Generate trade matrix metadata. Return JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, position: { type: Type.ARRAY, items: { type: Type.NUMBER } }, sentiment: { type: Type.NUMBER }, status: { type: Type.STRING }, description: { type: Type.STRING } } } },
              connections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, intensity: { type: Type.NUMBER }, health: { type: Type.NUMBER } } } },
              globalSummary: { type: Type.STRING }
            }
          }
        }
      });
      return this.safeParse(response.text, { nodes: [], connections: [], globalSummary: "Sync failed." });
    });
  }

  async getHistoricalSentimentAnalysis(): Promise<{ history: any[], summary: string }> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Provide 24-hour stability scores for Eurasia and Africa. Return JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              history: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hour: { type: Type.STRING }, Eurasia: { type: Type.NUMBER }, Africa: { type: Type.NUMBER } } } },
              summary: { type: Type.STRING }
            }
          }
        }
      });
      return this.safeParse(response.text, { history: [], summary: "" });
    });
  }

  async getGlobalCyberIntelligence(): Promise<NewsItem[]> { 
    return this.getLatestGlobalUpdates('GLOBAL_CYBER_THREATS'); 
  }

  async performVulnerabilityScan(targetUrl: string): Promise<VulnerabilityReport> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Audit target infrastructure: "${targetUrl}". Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              target: { type: Type.STRING },
              score: { type: Type.NUMBER },
              threats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, severity: { type: Type.STRING }, description: { type: Type.STRING }, remediation: { type: Type.STRING } } } },
              metadata: { type: Type.OBJECT, properties: { server: { type: Type.STRING }, ssl: { type: Type.STRING }, latency: { type: Type.STRING } } }
            }
          }
        }
      });
      return this.safeParse(response.text, { target: targetUrl, score: 0, threats: [], metadata: { server: "OFFLINE", ssl: "NONE", latency: "N/A" } });
    });
  }

  async getStrategicInvestmentAdvice(marketData: any): Promise<string> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Tactical investment directive for market: ${JSON.stringify(marketData)}. 1 sentence.`,
      });
      return response.text || "HEDGE_POSITIONS_IN_STABLE_ASSETS";
    });
  }

  async getCelebritySpotlight(name: string): Promise<CelebrityDossier | null> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Individual dossier for: "${name}". Return JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              occupation: { type: Type.STRING },
              recentActivity: { type: Type.STRING },
              influenceScore: { type: Type.NUMBER },
              riskRating: { type: Type.STRING },
              newsHighlights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } } } },
              biometricSummary: { type: Type.STRING }
            }
          }
        }
      });
      return this.safeParse(response.text, null);
    });
  }

  async generateIntelligenceDossiers(query: string): Promise<IntelligenceReport[]> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Tactical dossiers for: "${query}". Return JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
                threatLevel: { type: Type.STRING },
                lastUpdated: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getLocalizedNews(location: string): Promise<NewsItem[]> { 
    return this.getLatestGlobalUpdates(`breaking news in ${location}`); 
  }

  async getSatelliteSignals(lat?: number, lng?: number): Promise<IntelligenceSignal[]> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Satellite signals near [${lat ?? 0}, ${lng ?? 0}]. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                location: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                description: { type: Type.STRING },
                urgency: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async scanDeepSpace(): Promise<DeepSpaceObject[]> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: "Deep-space anomalies tracked. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                distanceMiles: { type: Type.NUMBER },
                rangeKm: { type: Type.NUMBER },
                type: { type: Type.STRING },
                coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, z: { type: Type.NUMBER } } },
                velocity: { type: Type.NUMBER }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async getBotMissionIntel(botClass: string, zone: string): Promise<string> { 
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Sensor log for a ${botClass} unit in zone ${zone}.`,
      });
      return response.text || "LOG_SYNC_ERROR";
    });
  }

  async decodeEncryptedSignal(cipher: string): Promise<DecodedSignal> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Decrypt and analyze this signal cipher: "${cipher}". Return JSON with: id, original (the input), decrypted (cleartext output), confidence (0-100), origin (likely source node).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              original: { type: Type.STRING },
              decrypted: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              origin: { type: Type.STRING }
            }
          }
        }
      });
      return this.safeParse(response.text, { id: 'ERR', original: cipher, decrypted: 'DECRYPTION_FAILED', confidence: 0, origin: 'UNKNOWN' });
    });
  }

  async getInternetStats(): Promise<{stats: InternetStats, influencers: Influencer[], sources: any[]}> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Generate real-time global internet reach and influencer statistics. Return JSON.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stats: { type: Type.OBJECT, properties: { daily: { type: Type.NUMBER }, weekly: { type: Type.NUMBER }, monthly: { type: Type.NUMBER }, yearly: { type: Type.NUMBER } } },
              influencers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING }, category: { type: Type.STRING }, reach: { type: Type.STRING } } } }
            }
          }
        }
      });
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = grounding.map((g: any) => ({ uri: g.web?.uri, title: g.web?.title })).filter((s: any) => s.uri);
      const data = this.safeParse(response.text, { stats: { daily: 0, weekly: 0, monthly: 0, yearly: 0 }, influencers: [] });
      return { ...data, sources };
    });
  }

  async getGeopoliticalPrediction(query: string): Promise<{ prediction: string, riskLevel: number, factors: string[] }> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Provide a detailed geopolitical forecast for: "${query}". Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prediction: { type: Type.STRING },
              riskLevel: { type: Type.NUMBER },
              factors: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return this.safeParse(response.text, { prediction: "Unable to synthesize forecast.", riskLevel: 50, factors: [] });
    });
  }

  async scanForCyberIntruders(): Promise<CyberThreat[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate 5 active global cyber threats. Return JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                ip: { type: Type.STRING },
                origin: { type: Type.STRING },
                type: { type: Type.STRING },
                severity: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                status: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }

  async analyzeThreatDetails(threat: CyberThreat): Promise<ForensicReport> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Forensic analysis for threat: ${JSON.stringify(threat)}. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actorProfile: { type: Type.STRING },
              propagationMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
              infrastructureImpact: { type: Type.STRING },
              countermeasures: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return this.safeParse(response.text, { actorProfile: "Unknown", propagationMethods: [], infrastructureImpact: "Unknown", countermeasures: [] });
    });
  }

  async translateText(text: string, targetLang: string): Promise<string> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: `Translate to ${targetLang}: "${text}". Return only the translation.`,
      });
      return response.text || text;
    });
  }

  async scanLocalEnvironment(): Promise<LocalSensor[]> {
    return this.callGemini(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: "Simulate a local area scan (0-100 meters). Detect 5-8 electronic devices like smartphones, drones, hidden cameras, or microphones. Return JSON array with id, name, type (PHONE, CAMERA, DRONE, LISTENING_DEVICE), distanceMeters, azimuth, signalStrength (-dBm), status, manufacturer.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                distanceMeters: { type: Type.NUMBER },
                azimuth: { type: Type.NUMBER },
                signalStrength: { type: Type.NUMBER },
                status: { type: Type.STRING },
                manufacturer: { type: Type.STRING }
              }
            }
          }
        }
      });
      return this.safeParse(response.text, []);
    });
  }
}
