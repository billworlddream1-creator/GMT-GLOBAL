
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, NewsItem, AccessLevel, LEVEL_REQUIREMENTS, LEVEL_WEIGHT, UserActivityRecord, Partnership, Investment, PaymentSettings, UserProfile, IntelligenceReminder } from './types';
import { IntelligenceService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import SatelliteUplink from './components/SatelliteUplink';
import SnickRecon from './components/SnickRecon';
import IntelligenceTerminal from './components/IntelligenceTerminal';
import SecurityConsole from './components/SecurityConsole';
import DeepSpaceScanner from './components/DeepSpaceScanner';
import SubscriptionHub from './components/SubscriptionHub';
import PartnershipHub from './components/PartnershipHub';
import InvestmentHub from './components/InvestmentHub';
import MarketHub from './components/MarketHub';
import InternetStatsHub from './components/InternetStatsHub';
import AdminConsole from './components/AdminConsole';
import TranslatorHub from './components/TranslatorHub';
import ChatHub from './components/ChatHub';
import GamesHub from './components/GamesHub';
import DossierBriefing from './components/DossierBriefing';
import PredictorHub from './components/PredictorHub';
import SentimentMap from './components/SentimentMap';
import BlackBox from './components/BlackBox';
import WorldLive from './components/WorldLive';
import VulnerabilityScanner from './components/VulnerabilityScanner';
import VRViewer from './components/VRViewer';
import SpatialLab from './components/SpatialLab';
import AutoReader from './components/AutoReader';
import CameraCapture from './components/CameraCapture';
import CelebritySpotlight from './components/CelebritySpotlight';
import NexusLink from './components/NexusLink';
import ProcessMonitor from './components/ProcessMonitor';
import ReminderTerminal from './components/ReminderTerminal';
import ProfileHub from './components/ProfileHub';
import GlobalPulse from './components/GlobalPulse';
import AuthModal from './components/AuthModal';
import { playUISound } from './utils/audioUtils';

const IntelHUD = ({ xp, rank, signalStrength }: { xp: number, rank: string, signalStrength: number }) => (
  <div className="fixed top-6 right-12 z-[200] flex items-center gap-6 glass px-6 py-3 rounded-2xl border border-white/5 bg-slate-900/40 pointer-events-none">
    <div className="flex flex-col items-end">
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Signal_Uplink</span>
      <div className="flex gap-0.5 mt-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-1 h-3 rounded-sm ${i < signalStrength ? 'bg-accent' : 'bg-slate-800'}`}></div>
        ))}
      </div>
    </div>
    <div className="w-px h-8 bg-white/10"></div>
    <div className="flex flex-col">
      <span className="text-[10px] font-heading font-black text-white uppercase tracking-tighter">{rank}</span>
      <span className="text-[8px] font-mono text-accent uppercase tracking-widest">Neural_XP: {xp}</span>
    </div>
  </div>
);

const QuickActionsDock = ({ setView }: { setView: (v: ViewType) => void }) => {
  const actions: { id: ViewType; label: string; icon: string; color: string }[] = [
    { id: 'vulnerability-scanner', label: 'SCAN_NET', icon: '🔍', color: 'border-red-500/40' },
    { id: 'satellite-uplink', label: 'SAT_SYNC', icon: '🛰️', color: 'border-blue-500/40' },
    { id: 'live-pulse', label: 'PULSE_LIVE', icon: '🔥', color: 'border-emerald-500/40' },
    { id: 'oracle', label: 'PREDICT', icon: '🔮', color: 'border-purple-500/40' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 glass p-2 rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl animate-in slide-in-from-bottom-10 duration-1000">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => { playUISound('click'); setView(action.id); }}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border bg-black/40 hover:bg-white/5 transition-all group ${action.color}`}
        >
          <span className="text-sm group-hover:scale-125 transition-transform duration-300">{action.icon}</span>
          <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

const NewsFeedSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass h-[400px] rounded-[2.5rem] overflow-hidden bg-white/5 p-8 space-y-6 animate-pulse border border-white/5">
        <div className="w-full h-40 bg-white/10 rounded-2xl shimmer"></div>
        <div className="space-y-3">
          <div className="w-1/3 h-2 bg-white/10 rounded-full shimmer"></div>
          <div className="w-full h-6 bg-white/10 rounded-xl shimmer"></div>
          <div className="w-2/3 h-6 bg-white/10 rounded-xl shimmer"></div>
        </div>
      </div>
    ))}
  </div>
);

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('nexus_session'));
  const [view, setView] = useState<ViewType>('feed');
  const [vrData, setVrData] = useState<{ url: string; title: string } | null>(null);
  const [isAutoReaderActive, setIsAutoReaderActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(5);
  
  // Persistence States
  const [userLevel, setUserLevel] = useState<AccessLevel>(() => (localStorage.getItem('nexus_user_level') as AccessLevel) || 'FREE');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexus_profile');
    return saved ? JSON.parse(saved) : {
      id: 'AGENT-' + Math.floor(Math.random() * 99999),
      name: 'Field Operative',
      email: '',
      bio: '',
      rankXp: 0,
      completedBounties: [],
      notificationSettings: {
        enabled: false,
        categories: ['GEOPOLITICS', 'INTELLIGENCE', 'CYBERSECURITY']
      },
      connections: { totalConnections: 0, monthlyConnections: 0, referralRewardEligible: false }
    };
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ paypalEmail: '', bankAccount: '', cryptoWallet: '' });
  const [reminders, setReminders] = useState<IntelligenceReminder[]>([]);

  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [savedIntel, setSavedIntel] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activityFeed, setActivityFeed] = useState<UserActivityRecord[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const intelService = useRef(new IntelligenceService());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadSavedIntel = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem('gmt_saved_intel') || '[]');
    setSavedIntel(saved);
  }, []);

  useEffect(() => {
    loadSavedIntel();
    const handleUpdate = () => loadSavedIntel();
    window.addEventListener('saved_intel_updated', handleUpdate);
    return () => window.removeEventListener('saved_intel_updated', handleUpdate);
  }, [loadSavedIntel]);

  const addXp = useCallback((amount: number) => {
    setUserProfile(prev => {
      const next = { ...prev, rankXp: prev.rankXp + amount };
      localStorage.setItem('nexus_profile', JSON.stringify(next));
      return next;
    });
  }, []);

  const getRank = (xp: number) => {
    if (xp >= 5000) return 'Nexus Architect';
    if (xp >= 2000) return 'Intelligence Director';
    if (xp >= 1000) return 'Special Operative';
    if (xp >= 500) return 'Field Agent';
    return 'Cadet Operative';
  };

  const addActivity = useCallback((activity: string, module: string) => {
    const record: UserActivityRecord = {
      id: Date.now().toString(),
      codename: 'NODE_' + Math.floor(Math.random() * 9999),
      activity,
      module,
      timestamp: new Date().toLocaleTimeString()
    };
    setActivityFeed(prev => [record, ...prev].slice(0, 15));
  }, []);

  const triggerDesktopNotification = useCallback((title: string, body: string, category?: string) => {
    if (!userProfile.notificationSettings.enabled) return;
    
    // Check if category is enabled in settings
    if (category) {
      const normalizedCat = category.toUpperCase().replace(/\s/g, '_');
      const isCatEnabled = userProfile.notificationSettings.categories.some(c => 
        normalizedCat.includes(c) || c.includes(normalizedCat)
      );
      if (!isCatEnabled) return;
    }

    if (Notification.permission === 'granted') {
      new Notification(`[GMT] ${title}`, {
        body,
        icon: '/favicon.ico', // Placeholder icon
      });
    }
  }, [userProfile.notificationSettings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSignalStrength(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(3, Math.min(5, prev + delta));
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reminder Checker
  useEffect(() => {
    const checker = setInterval(() => {
      const now = Date.now();
      setReminders(prev => {
        let changed = false;
        const next = prev.map(r => {
          if (r.status === 'PENDING' && now >= r.triggerTimestamp) {
            playUISound('alert');
            addActivity(`Triggered Alert: ${r.intelTitle}`, 'Watch');
            triggerDesktopNotification('TEMPORAL ALERT', r.intelTitle);
            changed = true;
            return { ...r, status: 'TRIGGERED' as const };
          }
          return r;
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(checker);
  }, [addActivity, triggerDesktopNotification]);

  const fetchNews = useCallback(async (query = 'WORLD_INTELLIGENCE', isInitial = true) => {
    if (isInitial) {
      setLoading(true);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    try {
      const targetPage = isInitial ? 1 : page + 1;
      const news = await intelService.current.getLatestGlobalUpdates(query, targetPage);
      
      if (news.length === 0) {
        setHasMore(false);
      } else {
        setNewsFeed(prev => isInitial ? news : [...prev, ...news]);
        
        // Notify for critical items if settings allow
        if (news.length > 0) {
          const topItem = news[0];
          if (topItem.sentiment === 'CRITICAL' || isInitial === false) {
             triggerDesktopNotification('NEW INTEL INBOUND', topItem.title, topItem.category);
          }
        }

        if (!isInitial) setPage(targetPage);
      }
      if (isInitial) addActivity(`Injected Intel Stream: ${query}`, 'Intelligence');
    } catch (e: any) {
      setError(e?.message || "Tactical uplink synchronization failure.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [addActivity, page, triggerDesktopNotification]);

  useEffect(() => {
    if (isAuthenticated) fetchNews('WORLD_INTELLIGENCE', true);
  }, [isAuthenticated]);

  const lastNewsElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || view !== 'feed') return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNews(searchTerm || 'WORLD_INTELLIGENCE', false);
      }
    }, { threshold: 0.5 });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, fetchNews, searchTerm, view]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      playUISound('startup');
      fetchNews(searchTerm, true);
    }
  };

  const handleViewChange = (v: ViewType) => {
    const requirement = LEVEL_REQUIREMENTS[v];
    if (LEVEL_WEIGHT[userLevel] < LEVEL_WEIGHT[requirement]) {
      setView('subscription');
      playUISound('alert');
      addActivity(`Access Denied: ${v}`, 'Security');
      return;
    }
    setView(v);
    playUISound('click');
    addActivity(`Accessed Module: ${v}`, 'System');
    addXp(5);
  };

  const handleSetUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nexus_profile', JSON.stringify(profile));
    addActivity(`Profile credentials updated`, 'Profile');
  };

  if (!isAuthenticated) return <AuthModal onLogin={(u) => { setIsAuthenticated(true); localStorage.setItem('nexus_session', JSON.stringify(u)); }} />;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 overflow-hidden relative font-inter">
      <Sidebar 
        currentView={view} 
        onViewChange={handleViewChange} 
        userLevel={userLevel} 
        onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('nexus_session'); }} 
        rank={getRank(userProfile.rankXp)}
        user={userProfile}
      />

      <IntelHUD xp={userProfile.rankXp} rank={getRank(userProfile.rankXp)} signalStrength={signalStrength} />
      <ProcessMonitor />
      <QuickActionsDock setView={handleViewChange} />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="px-12 py-8 flex items-center justify-between border-b border-white/5 glass shrink-0 relative bg-slate-900/5">
          <div className="flex flex-col">
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">{view.replace(/-/g, ' ')}</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">Uplink_Authorized</span>
            </div>
          </div>

          {view === 'feed' && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-20 relative group">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Scan intelligence stream..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-[11px] font-mono text-white focus:border-accent transition-all outline-none"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            </form>
          )}

          <div className="text-right">
            <div className="text-sm font-heading font-black text-white tracking-widest">{currentTime.toLocaleTimeString([], { hour12: false })}</div>
            <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Grid_Ref: {Math.floor(Math.random() * 9999)}-{Math.floor(Math.random() * 9999)}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative">
          {view === 'feed' && (
            loading ? <NewsFeedSkeleton /> : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {newsFeed.map((news, index) => (
                    <div key={news.id} ref={newsFeed.length === index + 1 ? lastNewsElementRef : null}>
                      <NewsCard 
                        news={news} 
                        intelService={intelService.current} 
                        onVRView={(url, title) => setVrData({ url, title })} 
                        onSetReminder={(rem) => {
                          setReminders(prev => [...prev, rem]);
                          addActivity(`Alert Set: ${rem.intelTitle}`, 'Watch');
                        }}
                      />
                    </div>
                  ))}
                </div>
                {loadingMore && <div className="grid grid-cols-3 gap-8"><NewsFeedSkeleton /></div>}
              </div>
            )
          )}

          {view === 'saved-intel' && (
            <div className="space-y-12">
               {savedIntel.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {savedIntel.map((news) => (
                      <NewsCard 
                        key={news.id}
                        news={news} 
                        intelService={intelService.current} 
                        onVRView={(url, title) => setVrData({ url, title })} 
                        onSetReminder={(rem) => {
                          setReminders(prev => [...prev, rem]);
                        }}
                      />
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center gap-6">
                    <span className="text-8xl">🔖</span>
                    <p className="text-sm font-mono uppercase tracking-[0.5em]">No intelligence reports archived in memory</p>
                 </div>
               )}
            </div>
          )}
          
          {view === 'live-pulse' && <GlobalPulse intelService={intelService.current} />}
          {view === 'profile' && <ProfileHub user={userProfile} setUser={handleSetUserProfile} />}
          {view === 'reminders' && (
            <ReminderTerminal 
              reminders={reminders} 
              onDismiss={(id) => setReminders(prev => prev.filter(r => r.id !== id))} 
              onClearAll={() => setReminders([])} 
            />
          )}
          {view === 'celebrity-spotlight' && <CelebritySpotlight intelService={intelService.current} />}
          {view === 'camera-recon' && <CameraCapture onSave={() => addXp(50)} />}
          {view === 'world-live' && <WorldLive intelService={intelService.current} />}
          {view === 'spatial-lab' && <SpatialLab news={newsFeed} onSelect={(url, title) => setVrData({ url, title })} />}
          {view === 'briefing' && <DossierBriefing news={newsFeed} intelService={intelService.current} />}
          {view === 'sentiments' && <SentimentMap intelService={intelService.current} />}
          {view === 'oracle' && <PredictorHub intelService={intelService.current} />}
          {view === 'chat' && <ChatHub />}
          {view === 'games' && <GamesHub />}
          {view === 'blackbox' && <BlackBox />}
          {view === 'vulnerability-scanner' && <VulnerabilityScanner intelService={intelService.current} />}
          {view === 'satellite-uplink' && <SatelliteUplink intelService={intelService.current} />}
          {view === 'intelligence' && <IntelligenceTerminal intelService={intelService.current} />}
          {view === 'security' && <SecurityConsole intelService={intelService.current} />}
          {view === 'deep-space' && <DeepSpaceScanner intelService={intelService.current} />}
          {view === 'market' && <MarketHub intelService={intelService.current} />}
          {view === 'internet-stats' && <InternetStatsHub intelService={intelService.current} />}
          {view === 'nexus-link' && <NexusLink user={userProfile} setUser={handleSetUserProfile} />}
          {view === 'investment' && <InvestmentHub user={userProfile} activeInvestments={investments} onInvest={(i) => setInvestments([...investments, i])} />}
          {view === 'partnership' && <PartnershipHub user={userProfile} activePartnerships={partnerships} onPartner={(p) => setPartnerships([...partnerships, p])} />}
          {view === 'translator' && <TranslatorHub intelService={intelService.current} />}
          {view === 'admin' && <AdminConsole paymentSettings={paymentSettings} setPaymentSettings={setPaymentSettings} investments={investments} setInvestments={setInvestments} partnerships={partnerships} setPartnerships={setPartnerships} />}
          {view === 'subscription' && <SubscriptionHub currentLevel={userLevel} onUpgrade={(l) => { setUserLevel(l); localStorage.setItem('nexus_user_level', l); setView('feed'); }} />}

          {/* Persistent System Audit Logs */}
          <div className="fixed bottom-10 right-10 w-64 glass p-6 rounded-[2rem] border-white/5 bg-slate-900/40 z-[150] opacity-80 hover:opacity-100 transition-opacity">
            <h4 className="text-[9px] font-heading font-black text-white uppercase mb-4 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System_Audit
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {activityFeed.map(act => (
                <div key={act.id} className="text-[8px] font-mono border-l border-white/10 pl-3 py-1">
                  <span className="text-accent">{act.codename}</span>: {act.activity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {vrData && <VRViewer imageUrl={vrData.url} title={vrData.title} onClose={() => setVrData(null)} />}
      {isAutoReaderActive && <AutoReader news={newsFeed} intelService={intelService.current} onClose={() => setIsAutoReaderActive(false)} />}
      {error && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass border-red-500/40 bg-red-500/10 px-8 py-4 rounded-xl z-[2000] animate-bounce text-[10px] font-mono text-red-400 uppercase tracking-widest">⚠️ {error}</div>}
    </div>
  );
};

export default App;
