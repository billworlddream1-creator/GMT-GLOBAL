
export type AccessLevel = 'FREE' | 'FIELD_AGENT' | 'INTEL_DIRECTOR' | 'NEXUS_ARCHITECT';

export const CLEARANCE_LEVELS = [
  'LEVEL_01',
  'LEVEL_02',
  'LEVEL_03',
  'LEVEL_04',
  'LEVEL_05_TOP_SECRET'
];

export interface MarketData {
  bitcoinPrice: number;
  bitcoinHistory: { time: string; price: number }[];
  ethereumPrice: number;
  solanaPrice: number;
  cardanoPrice: number;
  xrpPrice: number;
  polkadotPrice: number;
  sources: { title: string; uri: string }[];
}

export interface Influencer {
  name: string;
  platform: string;
  category: string;
  reach: string;
}

export interface InternetStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface WeatherReport {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  impactAssessment: string;
  sources: { title: string; uri: string }[];
  forecast: {
    day: string;
    temp: number;
    condition: string;
    description?: string;
    wind?: string;
    precip?: string;
  }[];
}

export interface NetworkStatus {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number;
  rtt: number;
  quality: 'OPTIMAL' | 'STABLE' | 'WEAK' | 'CRITICAL' | 'OFFLINE';
}

export interface IntelligenceMetric {
  category: string;
  intensity: number;
  delta: number;
  risk: 'STABLE' | 'VOLATILE' | 'CRITICAL';
}

export interface GlobalTrendData {
  timestamp: string;
  volume: number;
  sentiment: number;
  activeNodes: number;
}

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
  clearanceLevel: string;
  securityClearance: string;
  operationalStatus: string;
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

export interface WaveTelemetry {
  heightMeters: number;
  periodSeconds: number;
  direction: string;
  seaState: 'CALM' | 'CHOPPY' | 'ROUGH' | 'STORM' | 'PHENOMENAL';
  temperature: number;
}

export interface BenthicSignal {
  id: string;
  type: 'CABLE_NODE' | 'SUBMERSIBLE' | 'THERMAL_ANOMALY';
  depth: number;
  location: string;
  status: 'STABLE' | 'DEGRADED' | 'INTERCEPTED';
  coordinates: { angle: number; distance: number };
}

export interface SpectralAnomaly {
  id: string;
  type: 'RESIDUAL' | 'INTELLIGENT' | 'POLTERGEIST' | 'SHADOW' | 'DEMONIC';
  intensity: number; // 1-100 (EMF strength)
  evpContent?: string;
  location: string; // e.g. "North Quadrant"
  timestamp: string;
}

export interface FutureEvent {
  year: number;
  title: string;
  brief: string;
  probability: number;
  impactLevel: 'GLOBAL' | 'REGIONAL' | 'EXISTENTIAL';
}

export interface NetworkMass {
  id: string;
  label: string;
  magnitude: number; 
  velocity: number; 
  type: 'BOTNET_CLUSTER' | 'DATA_STORM' | 'PEERING_SPIKE' | 'ANOMALY';
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  origin: string;
  coordinates: { x: number; y: number };
}

export interface TacticalTarget {
  id: string;
  designation: string;
  distanceKm: number;
  bearing: number;
  elevation: number;
  velocity: number;
  classification: 'CIVILIAN' | 'MILITARY' | 'UNKNOWN' | 'ANOMALY';
  threatLevel: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  coordinates: { x: number; y: number };
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
  imageUrls?: string[];
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

export interface CloudFile {
  id: string;
  name: string;
  size: string;
  type: string;
  timestamp: string;
  status: 'SYNCED' | 'ENCRYPTING' | 'STALE';
}

export interface ReconBot {
  id: string;
  name: string;
  class: 'DRONE' | 'SPIDER' | 'SENTINEL' | 'CRAWLER';
  status: 'IDLE' | 'RECON' | 'DAMAGED';
  battery: number;
  targetZone: string;
  signalStrength: number;
}

export interface LocalSensor {
  id: string;
  name: string;
  type: 'PHONE' | 'CAMERA' | 'DRONE' | 'LISTENING_DEVICE' | 'UNKNOWN';
  distanceMeters: number;
  azimuth: number;
  signalStrength: number;
  status: 'ACTIVE' | 'PASSIVE' | 'RECORDING';
  manufacturer?: string;
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
  | 'live-pulse'
  | 'trade-brain'
  | 'live-brief'
  | 'neural-voice'
  | 'nexus-cloud'
  | 'ai-guide'
  | 'robotic-recon'
  | 'benthic-sonar'
  | 'chrono-intel'
  | 'network-mass'
  | 'brain-jet'
  | 'tactical-rangefinder'
  | 'atmos-monitor'
  | 'market'
  | 'internet-stats'
  | 'local-sensors'
  | 'broadcast'
  | 'spectral-analyzer';

export interface TradeNode {
  id: string;
  name: string;
  position: [number, number, number];
  sentiment: number; 
  status: 'STABLE' | 'VOLATILE' | 'CRITICAL';
  description: string;
}

export interface TradeConnection {
  from: string;
  to: string;
  intensity: number; 
  health: number; 
}

export interface TradeIntelligence {
  nodes: TradeNode[];
  connections: TradeConnection[];
  globalSummary: string;
}

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
  verified?: boolean;
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
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  status: 'ACTIVE' | 'NEUTRALIZED' | 'INVESTIGATING';
  payload?: string;
}

export interface ForensicReport {
  actorProfile: string;
  propagationMethods: string[];
  infrastructureImpact: string;
  countermeasures: string[];
}

export interface IntelligenceReport {
  title: string;
  summary: string;
  keyInsights: string[];
  threatLevel: 'MINIMAL' | 'ELEVATED' | 'SEVERE';
  groundingSources: { uri: string; title: string }[];
  lastUpdated: string;
}

export type InvestmentSector = 'QUANTUM_COMPUTING' | 'FUSION_ENERGY' | 'OFF_WORLD_MINING' | 'NEURAL_NETWORKS' | 'BIO_SYNTHESIS';

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

export type PartnerRole = 'SHADOW_BACKER' | 'STRATEGIC_ALLY' | 'BOARD_MEMBER' | 'GLOBAL_ARCHITECT' | 'SYSTEM_OVERLORD';

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

export const LEVEL_REQUIREMENTS: Record<ViewType, AccessLevel> = {
  'live-brief': 'FREE',
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
  'partnership': 'FREE',
  'translator': 'FREE',
  'chat': 'FREE',
  'games': 'FREE',
  'camera-recon': 'FREE',
  'reminders': 'FREE',
  'nexus-cloud': 'FREE',
  'ai-guide': 'FREE',
  'atmos-monitor': 'FREE',
  'market': 'FREE',
  'internet-stats': 'FREE',
  'brain-jet': 'FIELD_AGENT',
  'neural-voice': 'FIELD_AGENT',
  'intelligence': 'FIELD_AGENT',
  'oracle': 'FIELD_AGENT',
  'spatial-lab': 'FIELD_AGENT',
  'robotic-recon': 'FIELD_AGENT',
  'network-mass': 'FIELD_AGENT',
  'tactical-rangefinder': 'FIELD_AGENT',
  'local-sensors': 'FIELD_AGENT',
  'broadcast': 'FIELD_AGENT',
  'spectral-analyzer': 'FIELD_AGENT',
  'security': 'FREE',
  'trade-brain': 'INTEL_DIRECTOR',
  'admin': 'INTEL_DIRECTOR',
  'satellite-uplink': 'INTEL_DIRECTOR',
  'blackbox': 'INTEL_DIRECTOR',
  'vulnerability-scanner': 'INTEL_DIRECTOR',
  'benthic-sonar': 'INTEL_DIRECTOR',
  'chrono-intel': 'NEXUS_ARCHITECT',
  'deep-space': 'NEXUS_ARCHITECT'
};

export const LEVEL_WEIGHT: Record<AccessLevel, number> = {
  'FREE': 0,
  'FIELD_AGENT': 1,
  'INTEL_DIRECTOR': 2,
  'NEXUS_ARCHITECT': 3
};

export interface ModuleConfig {
  id: ViewType;
  visible: boolean;
  label: string;
  icon: string;
  tooltip: string;
}

export interface SidebarSettings {
  isCollapsed: boolean;
  moduleOrder: ModuleConfig[];
}
