
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';
import { ViewType, NewsItem, AccessLevel, LEVEL_REQUIREMENTS, LEVEL_WEIGHT, UserProfile, NetworkStatus, IntelligenceMetric, GlobalTrendData, WeatherReport, ModuleConfig } from './types';
import { IntelligenceService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ProcessMonitor from './components/ProcessMonitor';
import AuthModal from './components/AuthModal';
import ModuleLoader from './components/ModuleLoader';
import TacticalErrorBoundary from './components/TacticalErrorBoundary';
import OnboardingTutorial from './components/OnboardingTutorial';
import SidebarCustomizer from './components/SidebarCustomizer';
import { playUISound } from './utils/audioUtils';

// Lazy loaded components
const NewsFeed = lazy(() => import('./components/NewsFeed'));
const SatelliteUplink = lazy(() => import('./components/SatelliteUplink'));
const IntelligenceTerminal = lazy(() => import('./components/IntelligenceTerminal'));
const SecurityConsole = lazy(() => import('./components/SecurityConsole'));
const DeepSpaceScanner = lazy(() => import('./components/DeepSpaceScanner'));
const SubscriptionHub = lazy(() => import('./components/SubscriptionHub'));
const PartnershipHub = lazy(() => import('./components/PartnershipHub'));
const InvestmentHub = lazy(() => import('./components/InvestmentHub'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));
const TranslatorHub = lazy(() => import('./components/TranslatorHub'));
const ChatHub = lazy(() => import('./components/ChatHub'));
const GamesHub = lazy(() => import('./components/GamesHub'));
const DossierBriefing = lazy(() => import('./components/DossierBriefing'));
const PredictorHub = lazy(() => import('./components/PredictorHub'));
const SentimentMap = lazy(() => import('./components/SentimentMap'));
const BlackBox = lazy(() => import('./components/BlackBox'));
const WorldLive = lazy(() => import('./components/WorldLive'));
const VulnerabilityScanner = lazy(() => import('./components/VulnerabilityScanner'));
const VRViewer = lazy(() => import('./components/VRViewer'));
const SpatialLab = lazy(() => import('./components/SpatialLab'));
const AutoReader = lazy(() => import('./components/AutoReader'));
const CameraCapture = lazy(() => import('./components/CameraCapture'));
const CelebritySpotlight = lazy(() => import('./components/CelebritySpotlight'));
const ProfileHub = lazy(() => import('./components/ProfileHub'));
const GlobalPulse = lazy(() => import('./components/GlobalPulse'));
const TradeBrain = lazy(() => import('./components/TradeBrain'));
const LiveBrief = lazy(() => import('./components/LiveBrief'));
const NeuralAudioLink = lazy(() => import('./components/NeuralAudioLink'));
const CloudHub = lazy(() => import('./components/CloudHub'));
const AiGuide = lazy(() => import('./components/AiGuide'));
const BenthicSonar = lazy(() => import('./components/BenthicSonar'));
const ChronoIntel = lazy(() => import('./components/ChronoIntel'));
const NetworkMassDetector = lazy(() => import('./components/NetworkMassDetector'));
const TacticalRangefinder = lazy(() => import('./components/TacticalRangefinder'));
const BrainJet = lazy(() => import('./components/BrainJet'));
const AtmosMonitor = lazy(() => import('./components/AtmosMonitor'));
const MarketHub = lazy(() => import('./components/MarketHub'));
const InternetStatsHub = lazy(() => import('./components/InternetStatsHub'));
const DirectBroadcast = lazy(() => import('./components/DirectBroadcast'));
const RoboticReconHub = lazy(() => import('./components/RoboticReconHub'));
const LocalSensorArray = lazy(() => import('./components/LocalSensorArray'));
const SpectralAnalyzer = lazy(() => import('./components/SpectralAnalyzer'));

const INITIAL_MODULES: ModuleConfig[] = [
  { id: 'feed', label: 'News Feed', icon: '🌐', tooltip: 'Global breaking intelligence', visible: true },
  { id: 'live-brief', label: 'Live Brief', icon: '🚨', tooltip: 'High-urgency world events', visible: true },
  { id: 'security', label: 'Net Defense', icon: '🛡️', tooltip: 'Active threat detection & neutralization', visible: true },
  { id: 'local-sensors', label: 'Local Scan', icon: '📡', tooltip: 'Close-range device detection', visible: true },
  { id: 'benthic-sonar', label: 'Oceanic Array', icon: '🌊', tooltip: 'Deep sea & wave telemetry', visible: true },
  { id: 'spectral-analyzer', label: 'Spectral Scan', icon: '👻', tooltip: 'Paranormal & EMF detection', visible: true },
  { id: 'broadcast', label: 'Broadcast', icon: '📽️', tooltip: 'Direct neural command stream', visible: true },
  { id: 'brain-jet', label: 'Brain Jet', icon: '🚀', tooltip: 'High-speed neural news fly-over', visible: true },
  { id: 'market', label: 'Markets', icon: '📊', tooltip: 'Global financial reconnaissance', visible: true },
  { id: 'atmos-monitor', label: 'Atmos Monitor', icon: '🌤️', tooltip: 'Meteorological tracking', visible: true },
  { id: 'satellite-uplink', label: 'Sat Radar', icon: '🛰️', tooltip: 'Orbital intelligence signals', visible: true },
  { id: 'intelligence', label: 'Dossiers', icon: '🕵️', tooltip: 'Deep-dive intelligence reports', visible: true },
  { id: 'profile', label: 'Identity Matrix', icon: '👤', tooltip: 'Agent profile & biometrics', visible: true },
  { id: 'admin', label: 'Settings', icon: '⚙️', tooltip: 'Core OS protocols', visible: true },
];

const BreakingNewsTicker = memo(({ news }: { news: NewsItem[] }) => {
  if (news.length === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 lg:left-24 right-0 h-12 bg-black/80 backdrop-blur-xl border-t border-accent/20 z-[200] flex items-center overflow-hidden">
       <div className="px-6 bg-accent/20 border-r border-accent/30 h-full flex items-center whitespace-nowrap">
          <span className="text-[10px] font-heading font-black text-accent uppercase tracking-[0.2em] animate-pulse">BREAKING_INTEL</span>
       </div>
       <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="flex gap-20 items-center animate-ticker whitespace-nowrap px-10">
             {news.map(n => (
               <div key={n.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${n.sentiment === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-accent'}`}></div>
                  <span className="text-[10px] font-mono text-white uppercase font-bold tracking-widest">{n.title}</span>
                  <span className="text-[9px] font-mono text-slate-500">[{n.location || 'GLOBAL'}]</span>
               </div>
             ))}
             {/* Duplicate for infinite loop */}
             {news.map(n => (
               <div key={`${n.id}-dup`} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${n.sentiment === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-accent'}`}></div>
                  <span className="text-[10px] font-mono text-white uppercase font-bold tracking-widest">{n.title}</span>
                  <span className="text-[9px] font-mono text-slate-500">[{n.location || 'GLOBAL'}]</span>
               </div>
             ))}
          </div>
       </div>
       <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker { animation: ticker 40s linear infinite; }
       `}</style>
    </div>
  );
});

const IntelHUD = ({ 
  xp, 
  network, 
  isAutoReadActive, 
  setIsAutoReadActive,
  isVoiceEnabled,
  setIsVoiceEnabled,
  weather,
  onForceSync
}: { 
  xp: number, 
  network: NetworkStatus,
  isAutoReadActive: boolean,
  setIsAutoReadActive: (active: boolean) => void,
  isVoiceEnabled: boolean,
  setIsVoiceEnabled: (enabled: boolean) => void,
  weather: WeatherReport | null,
  onForceSync: () => void
}) => {
  return (
    <div id="intel-hud-bar" className="fixed top-6 right-12 z-[200] hidden md:flex items-center gap-6 glass px-6 py-3 rounded-2xl border border-white/5 transition-all duration-500">
      <div className="flex items-center gap-3">
        <button 
          onClick={onForceSync}
          className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all"
          data-tooltip="Force Terrestrial Re-Sync"
        >
          <span className="text-sm">🔄</span>
        </button>
        {weather && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl group cursor-default" data-tooltip={`${weather.location}: ${weather.condition}`}>
            <span className="text-xs group-hover:animate-bounce">🌡️</span>
            <span className="text-[10px] font-heading font-black text-blue-400 tabular-nums">{weather.temperature}°C</span>
          </div>
        )}
        <button 
          onClick={() => { setIsVoiceEnabled(!isVoiceEnabled); playUISound('click'); }}
          className={`p-2 rounded-xl border transition-all ${isVoiceEnabled ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-500'}`}
          data-tooltip={isVoiceEnabled ? "Audio: Active" : "Audio: Muted"}
        >
          <span className="text-sm">{isVoiceEnabled ? '🔊' : '🔇'}</span>
        </button>
        <button 
          onClick={() => { setIsAutoReadActive(!isAutoReadActive); playUISound('click'); }}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all pointer-events-auto ${isAutoReadActive ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_var(--accent-glow)]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
        >
          <span className="text-[8px] font-black uppercase tracking-widest">{isAutoReadActive ? 'AUTO_READ: ON' : 'AUTO_READ: OFF'}</span>
        </button>
      </div>

      <div className="w-px h-8 bg-white/5"></div>

      <div className="flex flex-col items-end pointer-events-none">
        <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest">Uplink_{network.quality}</span>
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-3 rounded-sm transition-all duration-700 ${i < (network.online ? 4 : 0) ? 'bg-accent' : 'bg-slate-800/30'}`}
            ></div>
          ))}
        </div>
      </div>
      <div className="w-px h-8 bg-current opacity-10"></div>
      <div className="flex flex-col pointer-events-none">
        <span className="text-[10px] font-heading font-black uppercase tracking-tighter">AGENT_STAKE</span>
        <span className="text-[8px] font-mono text-accent uppercase tracking-widest">XP: {xp}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('nexus_session'));
  const [view, setView] = useState<ViewType>('feed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('gmt_sidebar_collapsed') === 'true');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [moduleSettings, setModuleSettings] = useState<ModuleConfig[]>(() => {
    const saved = localStorage.getItem('gmt_module_settings');
    if (saved) return JSON.parse(saved);
    return INITIAL_MODULES;
  });
  
  const [vrData, setVrData] = useState<{ url: string; title: string } | null>(null);
  const [isAutoReadActive, setIsAutoReadActive] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [globalError, setGlobalError] = useState<{code: string, message: string} | null>(null);
  const [situationData, setSituationData] = useState<{ metrics: IntelligenceMetric[], trends: GlobalTrendData[] } | null>(null);
  const [localWeather, setLocalWeather] = useState<WeatherReport | null>(null);
  const [themeId, setThemeId] = useState(() => parseInt(localStorage.getItem('gmt_theme_id') || '0'));
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('gmt_onboarding_complete'));
  
  const [network, setNetwork] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    quality: 'STABLE'
  });
  
  const [userLevel, setUserLevel] = useState<AccessLevel>(() => (localStorage.getItem('nexus_user_level') as AccessLevel) || 'FREE');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nexus_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'AGENT-' + Math.floor(Math.random() * 99999),
      name: 'Field Operative',
      email: '',
      rankXp: 0,
      clearanceLevel: 'LEVEL_01',
      securityClearance: 'LEVEL_01',
      operationalStatus: 'STANDBY',
      completedBounties: [],
      notificationSettings: { enabled: false, categories: [] },
      connections: { totalConnections: 0, monthlyConnections: 0, referralRewardEligible: false }
    };
  });
  
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const intelService = useRef(new IntelligenceService());

  const fetchInitialData = useCallback(async (force = false) => {
    if (force) {
      intelService.current.clearCache();
      playUISound('startup');
    }
    setLoading(true);
    setGlobalError(null);
    try {
      const [news, summary] = await Promise.all([
        intelService.current.getLatestGlobalUpdates('WORLD_INTELLIGENCE'),
        intelService.current.getGlobalIntelligenceSummary()
      ]);
      setNewsFeed(news);
      setSituationData(summary);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const w = await intelService.current.getAtmosIntelligence(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
              setLocalWeather(w);
            } catch (e) {}
          }
        );
      }
    } catch (e: any) {
      setGlobalError({
        code: e.code || "NEURAL_SYNC_FAULT",
        message: e.message || "Uplink stability critical. Sector data inaccessible."
      });
      playUISound('alert');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchInitialData();
  }, [isAuthenticated, fetchInitialData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleStatus = () => {
      const conn = (navigator as any).connection;
      setNetwork({
        online: navigator.onLine,
        effectiveType: conn?.effectiveType || 'unknown',
        downlink: conn?.downlink || 0,
        rtt: conn?.rtt || 0,
        quality: navigator.onLine ? 'STABLE' : 'OFFLINE'
      });
    };
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    handleStatus();
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  if (!isAuthenticated) return <AuthModal onLogin={(u) => { setIsAuthenticated(true); localStorage.setItem('nexus_session', JSON.stringify(u)); }} />;

  return (
    <div className="flex h-screen bg-bg-main text-text-main overflow-hidden relative font-inter transition-all duration-700">
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        userLevel={userLevel} 
        onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('nexus_session'); }} 
        user={userProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        modules={moduleSettings}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      <IntelHUD 
        xp={userProfile.rankXp} 
        network={network} 
        isAutoReadActive={isAutoReadActive}
        setIsAutoReadActive={setIsAutoReadActive}
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled}
        weather={localWeather}
        onForceSync={() => fetchInitialData(true)}
      />
      
      <ProcessMonitor />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="px-6 lg:px-12 py-6 lg:py-8 flex items-center justify-between border-b border-white/5 glass bg-black/10 backdrop-blur-3xl relative z-50">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 glass border-white/10 rounded-xl lg:hidden">
              <span className="text-xl">☰</span>
            </button>
            <h2 className="text-xl lg:text-3xl font-heading font-black uppercase tracking-tighter leading-none">{view.replace(/-/g, ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-xs lg:text-sm font-heading font-black tracking-widest tabular-nums opacity-60">
              {currentTime.toLocaleTimeString([], { hour12: false })}
            </div>
          </div>
        </header>

        <div id="main-content-area" className="flex-1 overflow-y-auto p-6 lg:p-12 no-scrollbar relative">
          <TacticalErrorBoundary moduleName={view.toUpperCase()}>
            <Suspense fallback={<ModuleLoader />}>
              {view === 'feed' && (
                 <NewsFeed 
                   news={newsFeed}
                   situationData={situationData}
                   weather={localWeather}
                   loading={loading}
                   network={network}
                   isVoiceEnabled={isVoiceEnabled}
                   onVRView={(url, title) => setVrData({ url, title })}
                   intelService={intelService.current}
                 />
              )}
              {view === 'live-brief' && <LiveBrief intelService={intelService.current} />}
              {view === 'security' && <SecurityConsole intelService={intelService.current} />}
              {view === 'local-sensors' && <LocalSensorArray intelService={intelService.current} />}
              {view === 'benthic-sonar' && <BenthicSonar intelService={intelService.current} />}
              {view === 'spectral-analyzer' && <SpectralAnalyzer intelService={intelService.current} />}
              {view === 'market' && <MarketHub intelService={intelService.current} />}
              {view === 'atmos-monitor' && <AtmosMonitor intelService={intelService.current} />}
              {view === 'intelligence' && <IntelligenceTerminal intelService={intelService.current} />}
              {view === 'profile' && <ProfileHub user={userProfile} setUser={setUserProfile} />}
              {view === 'admin' && <AdminConsole paymentSettings={{paypalEmail:'', bankAccount:'', cryptoWallet:''}} setPaymentSettings={()=>{}} investments={[]} setInvestments={()=>{}} partnerships={[]} setPartnerships={()=>{}} />}
              
              {isAutoReadActive && newsFeed.length > 0 && (
                <AutoReader news={newsFeed} intelService={intelService.current} onClose={() => setIsAutoReadActive(false)} />
              )}
            </Suspense>
          </TacticalErrorBoundary>
        </div>
      </main>

      <BreakingNewsTicker news={newsFeed} />
      
      {vrData && <VRViewer imageUrl={vrData.url} title={vrData.title} onClose={() => setVrData(null)} />}
      {showOnboarding && <OnboardingTutorial onComplete={() => { setShowOnboarding(false); localStorage.setItem('gmt_onboarding_complete', 'true'); }} />}
      {isCustomizerOpen && <SidebarCustomizer modules={moduleSettings} onSave={setModuleSettings} onClose={() => setIsCustomizerOpen(false)} />}
    </div>
  );
};

export default App;
