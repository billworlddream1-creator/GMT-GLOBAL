
export type AccessLevel = 'FREE' | 'FIELD_AGENT' | 'INTEL_DIRECTOR' | 'NEXUS_ARCHITECT';

export interface UserActivityRecord {
  id: string;
  codename: string;
  activity: string;
  module: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  rankXp: number;
  photoUrl?: string;
  completedBounties: string[];
  notificationSettings: {
    enabled: boolean;
    categories: string[];
  };
  connections: {
    totalConnections: number;
    monthlyConnections: number;
    referralRewardEligible: boolean;
    tier2Eligible?: boolean;
  };
}

export interface VulnerabilityReport {
  target: string;
  score: number;
  threats: {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    remediation: string;
  }[];
  metadata: {
    server: string;
    ssl: string;
    latency: string;
  };
}

export interface DeepSpaceObject {
  id: string;
  name: string;
  distanceMiles: number;
  rangeKm: number;
  type: 'ASTEROID' | 'PROBE' | 'STATION' | 'ANOMALY';
  coordinates: { x: number; y: number; z: number };
  velocity: number;
}

export interface DecodedSignal {
  id: string;
  original: string;
  decrypted: string;
  confidence: number;
  origin: string;
}

export interface VerificationReport {
  truthScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  analysis: string;
  sources: { title: string; uri: string }[];
}

export interface CelebrityDossier {
  name: string;
  occupation: string;
  recentActivity: string;
  influenceScore: number;
  riskRating: 'STABLE' | 'ELEVATED' | 'CRITICAL';
  newsHighlights: { title: string; uri: string }[];
  biometricSummary: string;
  imageUrl?: string;
}

export interface SentimentData {
  region: string;
  lat: number;
  lng: number;
  sentiment: 'STABLE' | 'VOLATILE' | 'CRITICAL';
  score: number;
  color: string;
}

export interface IntelligenceReminder {
  id: string;
  intelTitle: string;
  triggerTimestamp: number;
  severity: 'CRITICAL' | 'ELEVATED' | 'STABLE';
  status: 'PENDING' | 'TRIGGERED' | 'DISMISSED';
  category: string;
}

export type ViewType = 
  | 'feed' 
  | 'saved-intel'
  | 'intelligence' 
  | 'deep-space' 
  | 'world-live' 
  | 'admin' 
  | 'subscription' 
  | 'nexus-link' 
  | 'investment' 
  | 'partnership' 
  | 'market' 
  | 'internet-stats'
  | 'security' 
  | 'vulnerability-scanner'
  | 'translator' 
  | 'chat' 
  | 'games'
  | 'briefing'
  | 'oracle'
  | 'sentiments'
  | 'spatial-lab'
  | 'blackbox'
  | 'camera-recon'
  | 'celebrity-spotlight'
  | 'satellite-uplink'
  | 'reminders'
  | 'profile'
  | 'live-pulse';

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  author?: string;
  timestamp: string;
  content: string;
  image?: string;
  sources: { uri: string; title: string }[];
  location?: string;
  sentiment?: 'CRITICAL' | 'STABLE' | 'VOLATILE';
}

export interface IntelligenceSignal {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  groundingUri?: string;
  isVanishing?: boolean;
}

export interface CyberThreat {
  id: string;
  ip: string;
  origin: string;
  type: string;
  severity: string;
  timestamp: string;
  status: string;
  payload?: string;
}

export interface IntelligenceReport {
  title: string;
  summary: string;
  keyInsights: string[];
  threatLevel: 'MINIMAL' | 'ELEVATED' | 'SEVERE';
  groundingSources: { uri: string; title: string }[];
  lastUpdated: string;
}

export type InvestmentSector = 'CYBER_DEFENSE' | 'ORBITAL_TECH' | 'DEEP_SPACE' | 'NEURAL_RESEARCH' | 'GLOBAL_LOGISTICS';

export interface Investment {
  id: string;
  userId: string;
  amount: number;
  durationMonths: number;
  expectedReturn: number;
  sector: InvestmentSector;
  riskLevel: 'LOW' | 'MODERATE' | 'SPECULATIVE';
  status: 'ACTIVE' | 'PAID' | 'REFUNDED';
  timestamp: string;
  volatilityIndex?: number;
}

export interface PaymentSettings {
  paypalEmail: string;
  bankAccount: string;
  cryptoWallet: string;
}

export type PartnerRole = 'COVERT_ASSET' | 'FIELD_OPERATIVE' | 'STRATEGIC_ASSET' | 'NEXUS_OVERLORD' | 'GLOBAL_HEGEMON';

export interface Partnership {
  id: string;
  userId: string;
  amount: number;
  durationMonths: number;
  roi: number;
  role: PartnerRole;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'PAID' | 'REFUNDED';
  trustScore: number;
}

export interface MarketData {
  bitcoinPrice: number;
  bitcoinHistory: { time: string; price: number }[];
  conversions: Record<string, number>;
}

export interface InternetStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Influencer {
  name: string;
  reach: string;
  platform: string;
  category: string;
}

export const LEVEL_REQUIREMENTS: Record<ViewType, AccessLevel> = {
  'feed': 'FREE',
  'saved-intel': 'FREE',
  'profile': 'FREE',
  'live-pulse': 'FREE',
  'celebrity-spotlight': 'FREE',
  'briefing': 'FREE',
  'sentiments': 'FREE',
  'subscription': 'FREE',
  'investment': 'FREE',
  'nexus-link': 'FREE',
  'world-live': 'FREE',
  'market': 'FREE',
  'internet-stats': 'FREE',
  'partnership': 'FREE',
  'translator': 'FREE',
  'chat': 'FREE',
  'games': 'FREE',
  'camera-recon': 'FREE',
  'reminders': 'FREE',
  'intelligence': 'FIELD_AGENT',
  'oracle': 'FIELD_AGENT',
  'spatial-lab': 'FIELD_AGENT',
  'security': 'INTEL_DIRECTOR',
  'admin': 'INTEL_DIRECTOR',
  'satellite-uplink': 'INTEL_DIRECTOR',
  'blackbox': 'INTEL_DIRECTOR',
  'vulnerability-scanner': 'INTEL_DIRECTOR',
  'deep-space': 'NEXUS_ARCHITECT'
};

export const LEVEL_WEIGHT: Record<AccessLevel, number> = {
  'FREE': 0,
  'FIELD_AGENT': 1,
  'INTEL_DIRECTOR': 2,
  'NEXUS_ARCHITECT': 3
};
