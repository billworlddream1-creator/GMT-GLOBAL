
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, NewsItem, AccessLevel, LEVEL_REQUIREMENTS, LEVEL_WEIGHT, UserActivityRecord, Partnership, Investment, PaymentSettings, UserProfile } from './types';
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
import AdminConsole from './components/AdminConsole';
import TranslatorHub from './components/TranslatorHub';
import ChatHub from './components/ChatHub';
import GamesHub from './components/GamesHub';
import DossierBriefing from './components/DossierBriefing';
import PredictorHub from './components/PredictorHub';
import SentimentMap from './components/SentimentMap';
import BlackBox from './components/BlackBox';
import WorldLive from './components/WorldLive';
import AuthModal from './components/AuthModal';
import { playUISound } from './utils/audioUtils';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('nexus_session'));
  const [view, setView] = useState<ViewType>('feed');
  const [userLevel, setUserLevel] = useState<AccessLevel>(() => {
    const saved = localStorage.getItem('nexus_user_level');
    return (saved as AccessLevel) || 'FREE';
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexus_profile');
    return saved ? JSON.parse(saved) : {
      id: 'AGENT-' + Math.floor(Math.random() * 99999),
      name: 'Agent',
      email: '',
      rankXp: 0,
      completedBounties: [],
      connections: { totalConnections: 0, monthlyConnections: 0, referralRewardEligible: false }
    };
  });

  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [activityFeed, setActivityFeed] = useState<UserActivityRecord[]>([]);

  // Partnerships and Investments State
  const [partnerships, setPartnerships] = useState<Partnership[]>(() => {
    const saved = localStorage.getItem('nexus_partnerships');
    return saved ? JSON.parse(saved) : [];
  });
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('nexus_investments');
    return saved ? JSON.parse(saved) : [];
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    paypalEmail: 'finance@gmt-global.net',
    bankAccount: 'NEXUS-7788-9900',
    cryptoWallet: '0x3b82...f6a1'
  });

  const intelService = useRef(new IntelligenceService());

  const addXp = useCallback((amount: number) => {
    setUserProfile(prev => {
      const next = { ...prev, rankXp: prev.rankXp + amount };
      localStorage.setItem('nexus_profile', JSON.stringify(next));
      return next;
    });
  }, []);

  const getRank = (xp: number) => {
    if (xp >= 5000) return 'Nexus Architect';
    if (xp >= 2000) return 'Intel Director';
    if (xp >= 1000) return 'Special Operative';
    if (xp >= 500) return 'Field Agent';
    return 'Cadet';
  };

  const addActivity = useCallback((activity: string, module: string) => {
    const record: UserActivityRecord = {
      id: Date.now().toString(),
      codename: 'AGENT_' + Math.floor(Math.random() * 9999),
      activity,
      module,
      timestamp: new Date().toLocaleTimeString()
    };
    setActivityFeed(prev => [record, ...prev].slice(0, 10));
    setAlerts(prev => [...prev, `Update: ${activity}`].slice(-3));
    
    setTimeout(() => {
        setAlerts(prev => prev.slice(1));
    }, 5000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    localStorage.setItem('nexus_partnerships', JSON.stringify(partnerships));
    localStorage.setItem('nexus_investments', JSON.stringify(investments));
    return () => clearInterval(timer);
  }, [partnerships, investments]);

  const fetchDataMain = useCallback(async () => {
    setLoading(true);
    try {
      const news = await intelService.current.getLatestGlobalUpdates('BREAKING');
      setNewsFeed(news);
      addActivity('Got latest news', 'News');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [addActivity]);

  useEffect(() => {
    if (isAuthenticated) fetchDataMain();
  }, [isAuthenticated, fetchDataMain]);

  const handleViewChange = (v: ViewType) => {
    const requirement = LEVEL_REQUIREMENTS[v];
    if (LEVEL_WEIGHT[userLevel] < LEVEL_WEIGHT[requirement]) {
      setView('subscription');
      playUISound('alert');
      addActivity(`Need higher access for ${v}`, 'Security');
      return;
    }
    setView(v);
    playUISound('click');
    addActivity(`Opened ${v}`, 'Nav');
    addXp(5); // Browsing XP
  };

  const handleLevelUpgrade = (newLevel: AccessLevel) => {
    setUserLevel(newLevel);
    localStorage.setItem('nexus_user_level', newLevel);
    addActivity(`Access Level Up: ${newLevel}`, 'Account');
    setView('feed');
    addXp(100);
  };

  const handleNewPartnership = (p: Partnership) => {
    setPartnerships(prev => [p, ...prev]);
    addActivity(`Joined a partnership`, 'Partners');
    addXp(250);
  };

  const handleNewInvestment = (i: Investment) => {
    setInvestments(prev => [i, ...prev]);
    addActivity(`Funds Allocated to ${i.sector}`, 'Investments');
    addXp(200);
  };

  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    localStorage.setItem('nexus_session', JSON.stringify(user));
    playUISound('startup');
    addActivity('Logged in', 'Auth');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nexus_session');
    playUISound('alert');
  };

  if (!isAuthenticated) return <AuthModal onLogin={handleLogin} />;

  // Map view to simple labels
  const getSimpleViewLabel = (v: string) => {
    const labels: any = {
      'feed': 'News Feed',
      'chat': 'Encrypted Chat',
      'games': 'Game Hub',
      'translator': 'Translator',
      'deep-space': 'Space Scanner',
      'security': 'Security',
      'snicking': 'Private Search',
      'space-sat': 'Satellite View',
      'market': 'Money Market',
      'investment': 'Investments',
      'partnership': 'Partners',
      'intelligence': 'Reports',
      'admin': 'Settings',
      'subscription': 'Upgrade',
      'briefing': 'Dossier Briefing',
      'oracle': 'The Oracle',
      'sentiments': 'Sentiment Heatmap',
      'blackbox': 'Black Box Vault',
      'world-live': 'Geo Navigator'
    };
    return labels[v] || v;
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 overflow-hidden relative font-inter">
      <Sidebar 
        currentView={view} 
        onViewChange={handleViewChange} 
        userLevel={userLevel} 
        onLogout={handleLogout} 
        rank={getRank(userProfile.rankXp)}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none">
          {alerts.map((alert, i) => (
            <div key={i} className="glass px-6 py-3 rounded-2xl text-[10px] font-mono text-accent animate-in fade-in slide-in-from-top-4 uppercase tracking-[0.2em] shadow-2xl bg-blue-500/5 border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block mr-3 animate-pulse"></span>
              {alert}
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 right-10 w-72 glass p-6 rounded-[2.5rem] z-[150] window-entry border-white/5 bg-slate-900/10">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-[10px] font-heading font-black text-white uppercase flex items-center gap-2 tracking-widest">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               System Log
             </h4>
             <span className="text-[9px] font-mono text-accent">XP: {userProfile.rankXp}</span>
          </div>
          <div className="space-y-4 max-h-56 overflow-y-auto no-scrollbar">
            {activityFeed.map(act => (
              <div key={act.id} className="text-[9px] font-mono border-l-2 border-accent/20 pl-4 py-1 hover:border-accent transition-colors">
                <span className="text-slate-500 block text-[8px] mb-1">[{act.timestamp}]</span>
                <span className="text-accent font-black">{act.codename}</span>: {act.activity}
              </div>
            ))}
            {activityFeed.length === 0 && <div className="text-[9px] font-mono text-slate-600 italic">No updates yet.</div>}
          </div>
        </div>

        <header className="px-12 py-8 flex items-center justify-between border-b border-white/5 glass shrink-0 relative bg-slate-900/5">
          <div className="flex flex-col">
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">{getSimpleViewLabel(view)}</h2>
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Connected: Online
            </span>
          </div>
          <div className="text-right">
             <div className="text-sm font-heading font-black text-white tracking-widest">{currentTime.toLocaleTimeString()}</div>
             <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Satellite Link OK</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
          <div className="window-entry h-full">
            {view === 'feed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="glass h-[400px] rounded-[3rem] animate-pulse bg-white/5"></div>
                    ))
                ) : (
                    newsFeed.map(news => <NewsCard key={news.id} news={news} intelService={intelService.current} />)
                )}
              </div>
            )}
            {view === 'world-live' && <WorldLive intelService={intelService.current} />}
            {view === 'briefing' && <DossierBriefing news={newsFeed} intelService={intelService.current} />}
            {view === 'oracle' && <PredictorHub intelService={intelService.current} />}
            {view === 'sentiments' && <SentimentMap intelService={intelService.current} />}
            {view === 'blackbox' && <BlackBox />}
            {view === 'translator' && <TranslatorHub intelService={intelService.current} />}
            {view === 'chat' && <ChatHub />}
            {view === 'games' && <GamesHub />}
            {view === 'deep-space' && <DeepSpaceScanner intelService={intelService.current} />}
            {view === 'intelligence' && <IntelligenceTerminal intelService={intelService.current} />}
            {view === 'snicking' && <SnickRecon intelService={intelService.current} />}
            {view === 'space-sat' && <SatelliteUplink intelService={intelService.current} />}
            {view === 'security' && <SecurityConsole intelService={intelService.current} />}
            {view === 'market' && <MarketHub intelService={intelService.current} />}
            {view === 'partnership' && (
              <PartnershipHub 
                user={userProfile} 
                onPartner={handleNewPartnership} 
                activePartnerships={partnerships}
              />
            )}
            {view === 'investment' && (
              <InvestmentHub 
                user={userProfile} 
                onInvest={handleNewInvestment} 
                activeInvestments={investments}
              />
            )}
            {view === 'subscription' && <SubscriptionHub currentLevel={userLevel} onUpgrade={handleLevelUpgrade} />}
            {view === 'admin' && (
              <AdminConsole 
                paymentSettings={paymentSettings}
                setPaymentSettings={setPaymentSettings}
                investments={investments}
                setInvestments={setInvestments}
                partnerships={partnerships}
                setPartnerships={setPartnerships}
              />
            )}
            
            {!['feed', 'world-live', 'briefing', 'oracle', 'sentiments', 'blackbox', 'translator', 'chat', 'games', 'deep-space', 'intelligence', 'snicking', 'space-sat', 'security', 'subscription', 'partnership', 'investment', 'market', 'admin'].includes(view) && (
              <div className="flex flex-col items-center justify-center h-full opacity-25 space-y-8">
                <div className="text-8xl">🛰️</div>
                <h3 className="text-2xl font-heading font-black uppercase">Coming Soon</h3>
                <button onClick={() => setView('feed')} className="px-8 py-3 bg-accent text-white rounded-xl text-xs font-black">Go Back Home</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
