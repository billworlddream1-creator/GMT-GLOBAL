
export type AccessLevel = 'FREE' | 'FIELD_AGENT' | 'INTEL_DIRECTOR' | 'NEXUS_ARCHITECT';

export const LEVEL_WEIGHT: Record<AccessLevel, number> = {
  'FREE': 1,
  'FIELD_AGENT': 2,
  'INTEL_DIRECTOR': 3,
  'NEXUS_ARCHITECT': 4
};

export const CLEARANCE_LEVELS = [
  'LEVEL_01',
  'LEVEL_02',
  'LEVEL_03',
  'LEVEL_04',
  'LEVEL_05_TOP_SECRET'
];

export interface NetworkStatus {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number;
  rtt: number;
  quality: 'OPTIMAL' | 'STABLE' | 'WEAK' | 'CRITICAL' | 'OFFLINE';
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  agentId: string;
  action: string;
  module: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export interface SystemConfig {
  defconLevel: 1 | 2 | 3 | 4 | 5;
  lockedModules: string[];
  globalAlert: string | null;
  maintenanceMode: boolean;
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

export interface NewsPreferences {
  categories: string[];
  blockedSources: string[]; // Can be domain names or keywords
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
  newsPreferences: NewsPreferences;
  notificationSettings: {
    enabled: boolean;
    categories: string[];
  };
  connections: {
    totalConnections: number;
    monthlyConnections: number;
    referralRewardEligible: boolean;
  };
}

export interface SentimentData {
  region: string;
  lat: number;
  lng: number;
  sentiment: 'STABLE' | 'VOLATILE' | 'CRITICAL';
  score: number;
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
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
}

export type ViewType = 
  | 'feed' 
  | 'live-pulse'
  | 'live-brief'
  | 'intelligence' 
  | 'profile'
  | 'security'
  | 'admin'
  | 'market'
  | 'satellite'
  | 'space'
  | 'ocean'
  | 'recon'
  | 'invest'
  | 'partnerships'
  | 'translate'
  | 'comms'
  | 'games'
  | 'oracle'
  | 'sentiment'
  | 'vault'
  | 'geo-ops'
  | 'cyber-audit'
  | 'vip-track'
  | 'watch'
  | 'broadcast'
  | 'local-scan'
  | 'spectral'
  | 'guide'
  | 'chrono'
  | 'mass-detect'
  | 'range'
  | 'brain-jet'
  | 'atmos'
  | 'robotics'
  | 'cloud'
  | 'billing'
  | 'nexus'
  | 'trade-brain'
  | 'optics'
  | 'neural-link'
  | 'stats'
  | 'dossier-brief';

export interface ModuleConfig {
  id: ViewType;
  visible: boolean;
  label: string;
  icon: string;
  tooltip: string;
}

export interface MarketData {
  bitcoinPrice: number;
  ethereumPrice: number;
  solanaPrice: number;
  cardanoPrice: number;
  xrpPrice?: number;
  polkadotPrice?: number;
  bitcoinHistory: { time: string; price: number }[];
  sources: { uri: string; title: string }[];
}

export interface IntelligenceReport {
  id: string;
  title: string;
  summary: string;
  details: string;
  recommendation: string;
  lat?: number;
  lng?: number;
  location?: string;
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
  metadata?: {
    server: string;
    ssl: string;
    latency: string;
  };
}

export interface CyberThreat {
  id: string;
  ip: string;
  origin: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  status: 'ACTIVE' | 'NEUTRALIZED';
}

export interface ForensicReport {
  actorProfile: string;
  countermeasures: string[];
}

export interface WeatherReport {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
  impactAssessment: string;
  forecast?: { day: string; temp: number; condition: string; description?: string }[];
  sources?: { uri: string; title: string }[];
}

export interface DecodedSignal {
  decrypted: string;
  confidence: number;
  origin: string;
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
  volatilityIndex: number;
}

export interface PaymentSettings {
  paypalEmail: string;
  bankAccount: string;
  cryptoWallet: string;
}

export type PartnerRole = 'SYSTEM_OVERLORD' | 'GLOBAL_ARCHITECT' | 'BOARD_MEMBER' | 'STRATEGIC_ALLY' | 'SHADOW_BACKER';

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

export interface DeepSpaceObject {
  id: string;
  name: string;
  type: string;
  velocity: number;
  distanceMiles: number;
  coordinates: { x: number; y: number };
}

export interface CelebrityDossier {
  name: string;
  imageUrl: string;
  occupation: string;
  influenceScore: number;
  riskRating: 'STABLE' | 'ELEVATED' | 'CRITICAL';
  biometricSummary: string;
  recentActivity: string;
  newsHighlights: { title: string; uri: string }[];
  imageUrls: string[];
}

export interface IntelligenceReminder {
  id: string;
  intelTitle: string;
  category: string;
  severity: 'LOW' | 'ELEVATED' | 'CRITICAL';
  triggerTimestamp: number;
}

export interface InternetStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Influencer {
  name: string;
  platform: string;
  category: string;
  reach: string;
}

export interface TradeNode {
  id: string;
  name: string;
  sentiment: number;
  status: 'STABLE' | 'VOLATILE' | 'CRITICAL';
  description: string;
  position: [number, number, number];
}

export interface TradeConnection {
  from: string;
  to: string;
  health: number;
}

export interface TradeIntelligence {
  nodes: TradeNode[];
  connections: TradeConnection[];
  globalSummary: string;
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'DOC';
  size: string;
  timestamp: string;
  status: 'SYNCED' | 'ENCRYPTING' | 'PENDING';
}

export interface ReconBot {
  id: string;
  name: string;
  class: 'DRONE' | 'SPIDER' | 'SENTINEL' | 'CRAWLER';
  status: 'IDLE' | 'RECON' | 'DAMAGED' | 'RECORDING' | 'ACTIVE';
  battery: number;
  targetZone: string;
  signalStrength: number;
}

export interface BenthicSignal {
  id: string;
  type: 'SUBMERSIBLE' | 'CABLE_NODE' | 'BUOY';
  depth: number;
  location: string;
  status: 'STABLE' | 'CRITICAL';
  coordinates: { angle: number; distance: number };
}

export interface WaveTelemetry {
  heightMeters: number;
  periodSeconds: number;
  temperature: number;
  seaState: 'CALM' | 'CHOPPY' | 'ROUGH' | 'STORM' | 'PHENOMENAL';
}

export interface FutureEvent {
  year: number;
  title: string;
  brief: string;
  probability: number;
  impactLevel: 'EXISTENTIAL' | 'CRITICAL' | 'MODERATE';
}

export interface NetworkMass {
  id: string;
  label: string;
  magnitude: number;
  velocity: number;
  type: 'BOTNET_CLUSTER' | 'DATA_STORM' | 'PEERING_SPIKE' | 'ANOMALY';
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  origin: string;
  coordinates: { x: number; y: number };
}

export interface TacticalTarget {
  id: string;
  designation: string;
  classification: 'MILITARY' | 'CIVILIAN' | 'ANOMALY';
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'STABLE';
  distanceKm: number;
  bearing: number;
  velocity: number;
  elevation: number;
  coordinates: { x: number; y: number };
}

export interface LocalSensor {
  id: string;
  name: string;
  type: 'PHONE' | 'CAMERA' | 'DRONE' | 'LISTENING_DEVICE';
  distanceMeters: number;
  azimuth: number;
  signalStrength: number;
  status: 'ACTIVE' | 'IDLE' | 'RECORDING';
  manufacturer: string;
}

export interface SpectralAnomaly {
  id: string;
  type: 'DEMONIC' | 'POLTERGEIST' | 'INTELLIGENT' | 'LINGERING';
  intensity: number;
  location: string;
  timestamp: string;
  evpContent?: string;
}