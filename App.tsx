
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ViewType, NewsItem, AccessLevel, NewsCategory, LEVEL_REQUIREMENTS, LEVEL_WEIGHT, UserActivityRecord } from './types';
import { IntelligenceService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import SatelliteUplink from './components/SatelliteUplink';
import SnickRecon from './components/SnickRecon';
import IntelligenceTerminal from './components/IntelligenceTerminal';
import SecurityConsole from './components/SecurityConsole';
import DeepSpaceScanner from './components/DeepSpaceScanner';
import { playUISound } from './utils/audioUtils';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('nexus_session'));
  const [view, setView] = useState<ViewType>('feed');
  const [userLevel, setUserLevel] = useState<AccessLevel>('NEXUS_ARCHITECT');
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [activityFeed, setActivityFeed] = useState<UserActivityRecord[]>([]);

  const intelService = useRef(new IntelligenceService());

  const addActivity = useCallback((activity: string, module: string) => {
    const record: UserActivityRecord = {
      id: Date.now().toString(),
      codename: 'OPERATIVE_' + Math.floor(Math.random() * 9999),
      activity,
      module,
      timestamp: new Date().toLocaleTimeString()
    };
    setActivityFeed(prev => [record, ...prev].slice(0, 10));
    setAlerts(prev => [...prev, `NEW_ACTIVITY: ${activity} in ${module}`].slice(-3));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const news = await intelService.current.getLatestGlobalUpdates('BREAKING');
      setNewsFeed(news);
      addActivity('Synchronized Global Feed', 'NEWS_CORE');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [addActivity]);

  const handleViewChange = (v: ViewType) => {
    setView(v);
    playUISound('click');
    addActivity(`Accessed Module: ${v}`, 'NAV_SYSTEM');
  };

  if (!isAuthenticated) return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <button 
        onClick={() => { setIsAuthenticated(true); localStorage.setItem('nexus_session', '1'); }}
        className="glass px-10 py-5 rounded-3xl font-heading font-black tracking-widest hover:scale-105 transition-all"
      >
        INITIATE_HANDSHAKE
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-300 overflow-hidden relative">
      <div className="scanline"></div>
      
      <Sidebar 
        currentView={view} 
        onViewChange={handleViewChange} 
        userLevel={userLevel} 
        onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('nexus_session'); }} 
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Update Alerts */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
          {alerts.map((alert, i) => (
            <div key={i} className="glass px-6 py-2 rounded-full text-[9px] font-mono text-accent animate-in fade-in slide-in-from-top-4 uppercase tracking-[0.2em] shadow-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block mr-2 animate-pulse"></span>
              {alert}
            </div>
          ))}
        </div>

        {/* Global Activity Panel */}
        <div className="absolute bottom-6 right-6 w-64 glass p-4 rounded-2xl z-[150] window-entry">
          <h4 className="text-[10px] font-heading font-black text-white uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Global_Activity_Record
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
            {activityFeed.map(act => (
              <div key={act.id} className="text-[8px] font-mono border-l border-white/10 pl-3">
                <span className="text-slate-500 block">[{act.timestamp}]</span>
                <span className="text-accent font-bold">{act.codename}</span>: {act.activity}
              </div>
            ))}
          </div>
        </div>

        <header className="px-10 py-6 flex items-center justify-between border-b border-white/5 glass shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">{view.replace('-', ' ')}</h2>
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] mt-2">Uplink Status: Optimized</span>
          </div>
          <div className="text-right">
             <div className="text-xs font-mono font-bold text-accent">{currentTime.toLocaleTimeString()} GMT</div>
             <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Deep Space Protocols Active</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="window-entry h-full">
            {view === 'feed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsFeed.map(news => <NewsCard key={news.id} news={news} intelService={intelService.current} />)}
              </div>
            )}
            {view === 'deep-space' && <DeepSpaceScanner intelService={intelService.current} />}
            {view === 'intelligence' && <IntelligenceTerminal intelService={intelService.current} />}
            {view === 'snicking' && <SnickRecon intelService={intelService.current} />}
            {view === 'space-sat' && <SatelliteUplink intelService={intelService.current} />}
            {view === 'security' && <SecurityConsole intelService={intelService.current} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
