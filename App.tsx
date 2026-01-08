
import React, { useState, useEffect, useRef, lazy, Suspense, memo } from 'react';
import { ViewType, NewsItem, ModuleConfig, UserProfile, Investment, Partnership, ActivityLog, SystemConfig } from './types';
import { IntelligenceService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ProcessMonitor from './components/ProcessMonitor';
import AuthModal from './components/AuthModal';
import ModuleLoader from './components/ModuleLoader';
import TacticalErrorBoundary from './components/TacticalErrorBoundary';
import SidebarCustomizer from './components/SidebarCustomizer';
import GlobalBackground from './components/GlobalBackground';
import { playUISound } from './utils/audioUtils';

// Lazy load ALL components
const NewsFeed = lazy(() => import('./components/NewsFeed'));
const LiveBrief = lazy(() => import('./components/LiveBrief'));
const GlobalPulse = lazy(() => import('./components/GlobalPulse'));
const IntelligenceTerminal = lazy(() => import('./components/IntelligenceTerminal'));
const ProfileHub = lazy(() => import('./components/ProfileHub'));
const SecurityConsole = lazy(() => import('./components/SecurityConsole'));
const MarketHub = lazy(() => import('./components/MarketHub'));
const SatelliteUplink = lazy(() => import('./components/SatelliteUplink'));
const BenthicSonar = lazy(() => import('./components/BenthicSonar'));
const TradeBrain = lazy(() => import('./components/TradeBrain'));
const SnickRecon = lazy(() => import('./components/SnickRecon'));
const DeepSpaceScanner = lazy(() => import('./components/DeepSpaceScanner'));
const SubscriptionHub = lazy(() => import('./components/SubscriptionHub'));
const InvestmentHub = lazy(() => import('./components/InvestmentHub'));
const TranslatorHub = lazy(() => import('./components/TranslatorHub'));
const ChatHub = lazy(() => import('./components/ChatHub'));
const GamesHub = lazy(() => import('./components/GamesHub'));
const PredictorHub = lazy(() => import('./components/PredictorHub'));
const SentimentMap = lazy(() => import('./components/SentimentMap'));
const BlackBox = lazy(() => import('./components/BlackBox'));
const WorldLive = lazy(() => import('./components/WorldLive'));
const VulnerabilityScanner = lazy(() => import('./components/VulnerabilityScanner'));
const CelebritySpotlight = lazy(() => import('./components/CelebritySpotlight'));
const ReminderTerminal = lazy(() => import('./components/ReminderTerminal'));
const DirectBroadcast = lazy(() => import('./components/DirectBroadcast'));
const LocalSensorArray = lazy(() => import('./components/LocalSensorArray'));
const SpectralAnalyzer = lazy(() => import('./components/SpectralAnalyzer'));
const AiGuide = lazy(() => import('./components/AiGuide'));
const ChronoIntel = lazy(() => import('./components/ChronoIntel'));
const NetworkMassDetector = lazy(() => import('./components/NetworkMassDetector'));
const TacticalRangefinder = lazy(() => import('./components/TacticalRangefinder'));
const BrainJet = lazy(() => import('./components/BrainJet'));
const AtmosMonitor = lazy(() => import('./components/AtmosMonitor'));
const RoboticReconHub = lazy(() => import('./components/RoboticReconHub'));
const CloudHub = lazy(() => import('./components/CloudHub'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));
const NexusLink = lazy(() => import('./components/NexusLink'));
const PartnershipHub = lazy(() => import('./components/PartnershipHub'));
const DossierBriefing = lazy(() => import('./components/DossierBriefing'));
const CameraCapture = lazy(() => import('./components/CameraCapture'));
const NeuralAudioLink = lazy(() => import('./components/NeuralAudioLink'));
const InternetStatsHub = lazy(() => import('./components/InternetStatsHub'));
const VRViewer = lazy(() => import('./components/VRViewer'));

// Comprehensive Module List
const DEFAULT_MODULES: ModuleConfig[] = [
  { id: 'feed', label: 'Intel Feed', icon: '🌐', tooltip: 'Search-grounded global happenings', visible: true },
  { id: 'live-pulse', label: 'World Pulse', icon: '📡', tooltip: 'Global stability heatmap', visible: true },
  { id: 'live-brief', label: 'Live Brief', icon: '🚨', tooltip: 'High-urgency happenings', visible: true },
  { id: 'optics', label: 'Optical Recon', icon: '📷', tooltip: 'Visual Intelligence Capture', visible: true },
  { id: 'neural-link', label: 'Voice Link', icon: '🎙️', tooltip: 'Direct Audio Uplink', visible: true },
  { id: 'intelligence', label: 'Dossiers', icon: '🕵️', tooltip: 'Individual target archives', visible: true },
  { id: 'market', label: 'Market Node', icon: '💹', tooltip: 'Crypto & Forex Intercept', visible: true },
  { id: 'satellite', label: 'Sat Uplink', icon: '🛰️', tooltip: 'Orbital Signal Intercept', visible: true },
  { id: 'space', label: 'Deep Space', icon: '🌌', tooltip: 'Orbital Object Tracking', visible: true },
  { id: 'ocean', label: 'Benthic Sonar', icon: '🌊', tooltip: 'Deep Sea Telemetry', visible: true },
  { id: 'security', label: 'Net Defense', icon: '🛡️', tooltip: 'Active threat detection', visible: true },
  { id: 'cyber-audit', label: 'Vuln Scan', icon: '🔓', tooltip: 'Target Vulnerability Audit', visible: true },
  { id: 'recon', label: 'Snick Recon', icon: '🕶️', tooltip: 'Encrypted Signal Decoder', visible: true },
  { id: 'local-scan', label: 'Local Scan', icon: '📱', tooltip: 'Proximity Sensor Array', visible: true },
  { id: 'range', label: 'Rangefinder', icon: '🎯', tooltip: 'Tactical Distance Calc', visible: true },
  { id: 'robotics', label: 'Robotics', icon: '🦾', tooltip: 'Drone Command', visible: true },
  { id: 'atmos', label: 'Atmos', icon: '☁️', tooltip: 'Weather Intelligence', visible: true },
  { id: 'mass-detect', label: 'Mass Detect', icon: '⚖️', tooltip: 'Network Density Scan', visible: true },
  { id: 'vip-track', label: 'VIP Tracker', icon: '🌟', tooltip: 'Celebrity Intelligence', visible: true },
  { id: 'profile', label: 'Identity', icon: '👤', tooltip: 'Operative credentials', visible: true },
  { id: 'billing', label: 'Clearance', icon: '💳', tooltip: 'Subscription Management', visible: true },
  { id: 'invest', label: 'Capital', icon: '💰', tooltip: 'Strategic Investment Deck', visible: true },
  { id: 'partnerships', label: 'Alliances', icon: '🤝', tooltip: 'Diplomatic Handshakes', visible: true },
  { id: 'nexus', label: 'Nexus Link', icon: '🔗', tooltip: 'Network Expansion', visible: true },
  { id: 'trade-brain', label: 'Trade Matrix', icon: '🚢', tooltip: 'Supply Chain Neural Net', visible: true },
  { id: 'sentiment', label: 'Sentiment', icon: '🎭', tooltip: 'Global Mood Analysis', visible: true },
  { id: 'chrono', label: 'Chrono', icon: '⏳', tooltip: 'Future Timeline Forecast', visible: true },
  { id: 'oracle', label: 'The Oracle', icon: '🔮', tooltip: 'Predictive Engine', visible: true },
  { id: 'translate', label: 'Universal', icon: '🗣️', tooltip: 'Language Translation Core', visible: true },
  { id: 'comms', label: 'Secure Chat', icon: '💬', tooltip: 'Encrypted Comms Channel', visible: true },
  { id: 'broadcast', label: 'Broadcast', icon: '🎥', tooltip: 'Live Command Stream', visible: true },
  { id: 'games', label: 'Sim Deck', icon: '🎮', tooltip: 'Tactical Simulations', visible: true },
  { id: 'brain-jet', label: 'Brain Jet', icon: '🚀', tooltip: 'High-Velocity Feed', visible: true },
  { id: 'watch', label: 'Watchlist', icon: '⏰', tooltip: 'Scheduled Alerts', visible: true },
  { id: 'vault', label: 'Black Box', icon: '⬛', tooltip: 'Secure Data Destruction', visible: true },
  { id: 'cloud', label: 'Cloud Vault', icon: '☁️', tooltip: 'Neural Storage', visible: true },
  { id: 'geo-ops', label: 'Geo Ops', icon: '🌍', tooltip: 'Location-based Intel', visible: true },
  { id: 'spectral', label: 'Spectral', icon: '👻', tooltip: 'Paranormal Field Detect', visible: true },
  { id: 'guide', label: 'AEGIS Guide', icon: '🤖', tooltip: 'AI Technical Liaison', visible: true },
  { id: 'stats', label: 'Net Stats', icon: '📶', tooltip: 'Global Internet Metrics', visible: true },
  { id: 'admin', label: 'Admin', icon: '⚙️', tooltip: 'System Configuration', visible: true },
  { id: 'dossier-brief', label: 'Briefing', icon: '📝', tooltip: 'Daily Intelligence Summary', visible: true }
];

const BreakingNewsTicker = memo(({ news, globalAlert }: { news: NewsItem[], globalAlert: string | null }) => {
  if (news.length === 0 && !globalAlert) return null;
  return (
    <div className="fixed bottom-0 left-0 lg:left-24 right-0 h-8 bg-black/90 backdrop-blur-xl border-t border-accent/20 z-[200] flex items-center overflow-hidden transition-all duration-300">
       <div className={`px-4 h-full flex items-center whitespace-nowrap ${globalAlert ? 'bg-red-600' : 'bg-accent/20'}`}>
          <span className="text-[8px] font-heading font-black text-white uppercase tracking-[0.2em] animate-pulse">
            {globalAlert ? 'GLOBAL_ALERT' : 'LIVE_INTEL'}
          </span>
       </div>
       <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="flex gap-20 items-center animate-ticker whitespace-nowrap px-10">
             {globalAlert && (
               <div className="flex items-center gap-4 text-red-500 font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-[10px] font-mono uppercase tracking-widest">{globalAlert}</span>
               </div>
             )}
             {news.concat(news).map((n, i) => (
               <div key={`${n.id}-${i}`} className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${n.sentiment === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-accent'}`}></div>
                  <span className="text-[9px] font-mono text-white uppercase font-bold tracking-widest">{n.title}</span>
                  <span className="text-[8px] font-mono text-slate-500">[{n.location || 'GLOBAL'}]</span>
               </div>
             ))}
          </div>
       </div>
       <style>{`
          @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-ticker { animation: ticker 60s linear infinite; }
       `}</style>
    </div>
  );
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('nexus_session'));
  const [view, setView] = useState<ViewType>('feed'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [modules, setModules] = useState<ModuleConfig[]>(() => {
    const saved = localStorage.getItem('gmt_modules');
    return saved ? JSON.parse(saved) : DEFAULT_MODULES;
  });
  
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [reminders, setReminders] = useState<any[]>([]); 
  const [paymentSettings, setPaymentSettings] = useState({ paypalEmail: '', bankAccount: '', cryptoWallet: '' });
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    defconLevel: 5,
    lockedModules: [],
    globalAlert: null,
    maintenanceMode: false
  });

  const [vrData, setVrData] = useState<{url: string, title: string} | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexus_user_profile');
    return saved ? JSON.parse(saved) : {
        id: 'AGENT-99', name: 'Field Operative', email: '', rankXp: 420, photoUrl: '', 
        clearanceLevel: 'LEVEL_01', securityClearance: 'LEVEL_01', operationalStatus: 'ACTIVE', 
        completedBounties: [], 
        newsPreferences: { categories: [], blockedSources: [] },
        notificationSettings: { enabled: true, categories: [] },
        connections: { totalConnections: 12, monthlyConnections: 4, referralRewardEligible: false }
    };
  });

  const intelService = useRef(new IntelligenceService());

  const logActivity = (action: string, module: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      agentId: userProfile.name || 'UNKNOWN',
      action,
      module,
      severity: 'INFO'
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const updateSystemConfig = (config: Partial<SystemConfig>) => {
    setSystemConfig(prev => ({ ...prev, ...config }));
    logActivity(`SYSTEM_CONFIG_UPDATE: ${Object.keys(config).join(', ')}`, 'ADMIN');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const blockedSources = userProfile.newsPreferences?.blockedSources || [];
      const news = await intelService.current.getLatestGlobalUpdates('WORLD_HAPPENINGS');
      const filteredNews = news.filter(item => {
        const itemSource = item.sources?.[0]?.title || '';
        return !blockedSources.some(blocked => 
          itemSource.toLowerCase().includes(blocked.toLowerCase())
        );
      });
      setNewsFeed(filteredNews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Stagger initial load to avoid immediate quota crunch
      const timer = setTimeout(fetchData, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userProfile.newsPreferences]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchData, 600000); 
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('nexus_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleModulesSave = (newModules: ModuleConfig[]) => {
    setModules(newModules);
    localStorage.setItem('gmt_modules', JSON.stringify(newModules));
  };

  if (!isAuthenticated) return <AuthModal onLogin={(u) => { 
      setIsAuthenticated(true); 
      localStorage.setItem('nexus_session', JSON.stringify(u));
      if(u.photoUrl) setUserProfile(prev => ({ ...prev, photoUrl: u.photoUrl, email: u.email }));
      logActivity('LOGIN_AUTHORIZED', 'AUTH');
  }} />;

  if (systemConfig.maintenanceMode) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-red-500 font-mono space-y-4">
        <h1 className="text-4xl font-black tracking-widest animate-pulse">SYSTEM_LOCKDOWN_ACTIVE</h1>
        <p className="text-sm">Maintenance protocols engaged by administrator. Stand by.</p>
        <button 
          onClick={() => updateSystemConfig({ maintenanceMode: false })} 
          className="mt-8 px-6 py-2 border border-red-500/50 hover:bg-red-900/20 rounded"
        >
          Override (Admin)
        </button>
      </div>
    );
  }

  const renderView = () => {
    if (systemConfig.lockedModules.includes(view)) {
      return (
        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
          <span className="text-6xl">🔒</span>
          <h2 className="text-2xl font-heading font-black text-white uppercase tracking-widest">MODULE_LOCKED</h2>
          <p className="text-xs font-mono text-red-500 uppercase tracking-widest">Access Restricted by System Administrator</p>
        </div>
      );
    }

    switch (view) {
      case 'live-pulse': return <GlobalPulse intelService={intelService.current} />;
      case 'live-brief': return <LiveBrief intelService={intelService.current} />;
      case 'feed': return (
         <NewsFeed 
           news={newsFeed} situationData={null} weather={null} loading={loading}
           network={{ online: true, effectiveType: '4g', downlink: 10, rtt: 20, quality: 'OPTIMAL' }}
           isVoiceEnabled={true} 
           onVRView={(url, title) => setVrData({ url, title })}
           intelService={intelService.current}
         />
      );
      case 'optics': return <CameraCapture onSave={(img) => logActivity('CAPTURED_INTEL_IMAGE', 'OPTICS')} />;
      case 'neural-link': return <NeuralAudioLink news={newsFeed} logActivity={logActivity} />;
      case 'intelligence': return <IntelligenceTerminal intelService={intelService.current} />;
      case 'profile': return <ProfileHub user={userProfile} setUser={setUserProfile} />;
      case 'security': return <SecurityConsole intelService={intelService.current} />;
      case 'market': return <MarketHub intelService={intelService.current} />;
      case 'satellite': return <SatelliteUplink intelService={intelService.current} />;
      case 'ocean': return <BenthicSonar intelService={intelService.current} />;
      case 'trade-brain': return <TradeBrain intelService={intelService.current} />;
      case 'recon': return <SnickRecon intelService={intelService.current} />;
      case 'space': return <DeepSpaceScanner intelService={intelService.current} />;
      case 'billing': return <SubscriptionHub currentLevel={userProfile.clearanceLevel as any} onUpgrade={(lvl) => setUserProfile(p => ({...p, clearanceLevel: lvl}))} />;
      case 'invest': return <InvestmentHub user={userProfile} onInvest={(i) => { setInvestments(prev => [i, ...prev]); logActivity(`CAPITAL_DEPLOY: ${i.sector}`, 'INVEST'); }} activeInvestments={investments} />;
      case 'translate': return <TranslatorHub intelService={intelService.current} />;
      case 'comms': return <ChatHub />;
      case 'games': return <GamesHub />;
      case 'oracle': return <PredictorHub intelService={intelService.current} />;
      case 'sentiment': return <SentimentMap intelService={intelService.current} />;
      case 'vault': return <BlackBox />;
      case 'geo-ops': return <WorldLive intelService={intelService.current} />;
      case 'cyber-audit': return <VulnerabilityScanner intelService={intelService.current} />;
      case 'vip-track': return <CelebritySpotlight intelService={intelService.current} />;
      case 'watch': return <ReminderTerminal reminders={reminders} onDismiss={(id) => setReminders(p => p.filter(r => r.id !== id))} onClearAll={() => setReminders([])} />;
      case 'broadcast': return <DirectBroadcast logActivity={logActivity} />;
      case 'local-scan': return <LocalSensorArray intelService={intelService.current} />;
      case 'spectral': return <SpectralAnalyzer intelService={intelService.current} />;
      case 'guide': return <AiGuide intelService={intelService.current} />;
      case 'chrono': return <ChronoIntel intelService={intelService.current} />;
      case 'mass-detect': return <NetworkMassDetector intelService={intelService.current} />;
      case 'range': return <TacticalRangefinder intelService={intelService.current} />;
      case 'brain-jet': return <BrainJet intelService={intelService.current} />;
      case 'atmos': return <AtmosMonitor intelService={intelService.current} />;
      case 'robotics': return <RoboticReconHub intelService={intelService.current} />;
      case 'cloud': return <CloudHub intelService={intelService.current} />;
      case 'stats': return <InternetStatsHub intelService={intelService.current} />;
      case 'admin': return (
        <AdminConsole 
            paymentSettings={paymentSettings} 
            setPaymentSettings={setPaymentSettings}
            investments={investments} 
            setInvestments={setInvestments}
            partnerships={partnerships} 
            setPartnerships={setPartnerships}
            activityLogs={activityLogs}
            systemConfig={systemConfig}
            updateSystemConfig={updateSystemConfig}
        />
      );
      case 'nexus': return <NexusLink user={userProfile} setUser={setUserProfile} />;
      case 'partnerships': return <PartnershipHub user={userProfile} onPartner={(p) => setPartnerships(prev => [p, ...prev])} activePartnerships={partnerships} />;
      case 'dossier-brief': return <DossierBriefing news={newsFeed} intelService={intelService.current} />;
      default: return <GlobalPulse intelService={intelService.current} />;
    }
  };

  return (
    <div className={`flex h-screen bg-transparent text-text-main overflow-hidden relative font-inter ${systemConfig.defconLevel <= 2 ? 'border-4 border-red-600' : ''}`}>
      <GlobalBackground intelService={intelService.current} news={newsFeed} />
      
      <Sidebar 
        currentView={view} 
        onViewChange={(v) => { setView(v); logActivity(`NAVIGATED_TO_${v.toUpperCase()}`, 'NAVIGATION'); }} 
        userLevel={userProfile.clearanceLevel as any} 
        onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('nexus_session'); }} 
        user={userProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        modules={modules}
        onOpenCustomizer={() => setShowCustomizer(true)}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="px-12 py-8 flex items-center justify-between border-b border-white/5 glass bg-black/10 backdrop-blur-3xl relative z-50">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 glass border-white/10 rounded-xl lg:hidden">
              <span className="text-xl">☰</span>
            </button>
            <h2 className="text-3xl font-heading font-black uppercase tracking-tighter leading-none">{view.replace(/-/g, ' ')}</h2>
          </div>
          <div className="flex items-center gap-8">
            {systemConfig.defconLevel <= 3 && (
              <div className="px-4 py-2 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg animate-pulse">
                DEFCON {systemConfig.defconLevel}
              </div>
            )}
            <button 
              onClick={() => { playUISound('click'); fetchData(); }}
              disabled={loading}
              className={`flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all ${loading ? 'opacity-50' : ''}`}
            >
               <span className={`text-[10px] font-mono font-black tracking-widest ${loading ? 'text-accent animate-pulse' : 'text-slate-400'}`}>
                 {loading ? 'SYNCING_WORLD_DATA...' : 'FORCE_GLOBAL_SYNC'}
               </span>
               <span className="text-xs">{loading ? '⏳' : '🔄'}</span>
            </button>
            <div className="text-xs font-heading font-black tracking-widest tabular-nums opacity-60">
              {new Date().toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl border-emerald-500/20 bg-emerald-500/5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-mono text-emerald-500 font-black">NODE_ONLINE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative">
          <TacticalErrorBoundary moduleName={view.toUpperCase()}>
            <Suspense fallback={<ModuleLoader />}>
              {renderView()}
            </Suspense>
          </TacticalErrorBoundary>
        </div>
      </main>

      <BreakingNewsTicker news={newsFeed} globalAlert={systemConfig.globalAlert} />
      <ProcessMonitor />
      
      {showCustomizer && (
        <SidebarCustomizer 
            modules={modules} 
            onSave={handleModulesSave} 
            onClose={() => setShowCustomizer(false)} 
        />
      )}

      {vrData && (
        <Suspense fallback={null}>
          <VRViewer 
            imageUrl={vrData.url} 
            title={vrData.title} 
            onClose={() => setVrData(null)} 
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
