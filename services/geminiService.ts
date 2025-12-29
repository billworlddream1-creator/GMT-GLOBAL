
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NewsItem, IntelligenceReport, IntelligenceSignal, CyberThreat, DeepSpaceObject, DecodedSignal, MarketData, InternetStats, Influencer } from '../types';

const TEXT_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';

export interface SocialIntercept {
  id: string;
  user: string;
  content: string;
  platform: string;
  timestamp: string;
}

export class IntelligenceService {
  constructor() {}

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text, no other comments: "${text}"`;
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt
      });
      return response.text || "Translation failed.";
    } catch (e) {
      console.error("Translation error:", e);
      return "Translation failed.";
    }
  }

  async getGeopoliticalPrediction(query: string): Promise<{ prediction: string, riskLevel: number, factors: string[] }> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Act as a Geopolitical Oracle. Analyze the future implications of: ${query}. 
      Provide a detailed reasoning-based prediction, a risk level (0-100), and key driving factors.
      Return JSON: { "prediction": string, "riskLevel": number, "factors": string[] }`;

      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 15000 },
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
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { prediction: "Unable to calculate future trajectories.", riskLevel: 50, factors: ["Incomplete data"] };
    }
  }

  async getGlobalSentiment(): Promise<{ region: string, sentiment: string, score: number, color: string }[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Analyze current global news sentiment. Provide scores for 6 major world regions.
      Return JSON array: [{ "region": string, "sentiment": "VOLATILE" | "STABLE" | "OPTIMISTIC", "score": number, "color": string }]`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                sentiment: { type: Type.STRING },
                score: { type: Type.NUMBER },
                color: { type: Type.STRING }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }

  async getLocalizedNews(location: string): Promise<NewsItem[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Provide the most recent, breaking news and intelligence specific to the city or country: ${location}. 
      Include critical events, political shifts, or major local updates from the last 24-48 hours.
      Return JSON array: [{title, content, sentiment, location}]`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                sentiment: { type: Type.STRING },
                location: { type: Type.STRING }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || "[]").map((item: any, i: number) => ({
        id: `LOC-${Date.now()}-${i}`,
        ...item,
        timestamp: new Date().toISOString(),
        sources: [{ uri: 'https://news.google.com', title: `Local Intel: ${location}` }]
      }));
    } catch (e) {
      console.error("Localized news error:", e);
      return [];
    }
  }

  async scanDeepSpace(): Promise<DeepSpaceObject[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Act as a Deep Space Monitoring AI. Detect 5 objects millions of miles from Earth.
      Include: name, distanceMiles (millions), rangeKm, type (ASTEROID, PROBE, STATION, ANOMALY), velocity (mph), 3D coordinates (x,y,z).
      Return JSON: [{id, name, distanceMiles, rangeKm, type, velocity, coordinates: {x,y,z}}]`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
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
                velocity: { type: Type.NUMBER },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        },
      });

      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Deep space scan error:", e);
      return [];
    }
  }

  async decodeEncryptedSignal(cipher: string): Promise<DecodedSignal> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Decode and decrypt the following tactical signal cipher: "${cipher}".
      Provide the decrypted message, a confidence score (0-100), and a simulated origin.
      Return JSON: {id, original: "${cipher}", decrypted, confidence, origin}`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
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
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { id: 'ERR', original: cipher, decrypted: 'DECRYPTION_FAILED', confidence: 0, origin: 'UNKNOWN' };
    }
  }

  async getLatestGlobalUpdates(category: string): Promise<NewsItem[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Global Intel: ${category}. Return 6 news items in JSON: [{title, content, sentiment, location}]`;
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }], 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                sentiment: { type: Type.STRING },
                location: { type: Type.STRING }
              }
            }
          }
        },
      });
      return JSON.parse(response.text || "[]").map((item: any, i: number) => ({
        id: `NXS-${Date.now()}-${i}`,
        ...item,
        timestamp: new Date().toISOString(),
        sources: [{ uri: 'https://news.google.com', title: 'Global News' }]
      }));
    } catch (e) { return []; }
  }

  async getSatelliteSignals(lat?: number, lng?: number): Promise<IntelligenceSignal[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `Scan satellites near ${lat}, ${lng}. Return 5 signals.`,
        config: { 
          tools: [{ googleSearch: {} }], 
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
        },
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [
        { id: 'S1', type: 'SATELLITE_FIX', location: 'LEO Orbit', lat: lat || 0, lng: lng || 0, description: 'Broadband satellite stable.', urgency: 'LOW' }
      ];
    }
  }

  async scanForCyberIntruders(): Promise<CyberThreat[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: "Detect simulated cyber threats.",
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
              status: { type: Type.STRING },
              payload: { type: Type.STRING }
            }
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  }

  async generateIntelligenceDossiers(query: string): Promise<IntelligenceReport[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Generate intel dossiers for: ${query}`,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyInsights: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              threatLevel: { type: Type.STRING },
              groundingSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    uri: { type: Type.STRING },
                    title: { type: Type.STRING }
                  }
                }
              },
              lastUpdated: { type: Type.STRING }
            }
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  }

  async getMarketIntelligence(): Promise<MarketData> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: "Return current Bitcoin market intelligence and top currency conversions in JSON format.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bitcoinPrice: { type: Type.NUMBER },
            bitcoinHistory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                }
              }
            },
            conversions: {
              type: Type.OBJECT,
              properties: {
                EUR: { type: Type.NUMBER },
                GBP: { type: Type.NUMBER },
                JPY: { type: Type.NUMBER },
                CNY: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async getInternetStats(): Promise<{stats: InternetStats, influencers: Influencer[]}> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: "Return global internet reach stats and top influencers for the week in JSON format.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stats: {
              type: Type.OBJECT,
              properties: {
                daily: { type: Type.NUMBER },
                weekly: { type: Type.NUMBER },
                monthly: { type: Type.NUMBER },
                yearly: { type: Type.NUMBER }
              }
            },
            influencers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reach: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  category: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async generateBroadcastAudio(text: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with authority and professional clarity: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (err) {
      console.error("Audio generation failed:", err);
      return undefined;
    }
  }
}
