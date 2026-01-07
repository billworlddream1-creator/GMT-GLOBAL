
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { NewsItem } from '../types';
import { playUISound } from '../utils/audioUtils';
import NewsCard from './NewsCard';

interface LiveBriefProps {
  intelService: IntelligenceService;
}

const LiveBrief: React.FC<LiveBriefProps> = ({ intelService }) => {
  const [events, setEvents] = useState<NewsItem[]>([]);
  const [alertLevel, setAlertLevel] = useState('STABLE');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchTrending = async () => {
    setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.getTrendingIntel();
      setEvents(data.events);
      setAlertLevel(data.alertLevel);
      setLastUpdated(new Date().toLocaleTimeString());
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
    const interval = setInterval(fetchTrending, 120000); // 2 min auto refresh for latest happenings
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = () => {
    switch(alertLevel.toUpperCase()) {
      case 'CRITICAL': return 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
      case 'ELEVATED': return 'text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">LIVE</span>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center lg:text-left flex-1">
             <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.5em] font-black">Live_Event_Tracker</span>
             </div>
             <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Global_Mission_Control</h2>
             <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Real-time synchronization with orbital search clusters.</p>
          </div>

          <div className="flex gap-6 shrink-0">
             <div className="glass p-8 rounded-3xl border border-white/10 bg-black/40 text-center space-y-3 min-w-[200px]">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Global_Alert_Level</span>
                <div className={`text-4xl font-heading font-black uppercase ${getAlertColor()}`}>{alertLevel}</div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className={`h-full animate-pulse ${alertLevel === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '100%' }}></div>
                </div>
             </div>
             <div className="glass p-8 rounded-3xl border border-white/10 bg-black/40 text-center space-y-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Sync_Status</span>
                <div className="text-2xl font-heading font-black text-white">{lastUpdated || '--:--'}</div>
                <button onClick={fetchTrending} disabled={loading} className="text-[8px] font-mono text-accent uppercase font-black hover:underline disabled:opacity-50">Force_Update</button>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="glass h-64 rounded-[3rem] animate-pulse bg-white/5 border border-white/5"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {events.map(event => (
             <NewsCard key={event.id} news={event} intelService={intelService} />
           ))}
        </div>
      )}

      <div className="glass p-12 rounded-[4rem] border border-white/5 bg-slate-900/20">
         <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping"></span>
            Operational_Directives
         </h3>
         <div className="grid md:grid-cols-2 gap-10">
            <div className="p-8 rounded-[2.5rem] bg-black/20 border border-white/5">
               <h4 className="text-[10px] font-black text-white uppercase mb-3 tracking-widest">Temporal Intelligence</h4>
               <p className="text-[11px] font-mono text-slate-500 leading-relaxed uppercase">This module is locked to the GMT-ORACLE high-urgency stream. It parses multi-lingual social and search patterns to identify events before standard civilian media cycles.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-black/20 border border-white/5">
               <h4 className="text-[10px] font-black text-white uppercase mb-3 tracking-widest">Search Grounding</h4>
               <p className="text-[11px] font-mono text-slate-500 leading-relaxed uppercase">All nodes in this feed are verified via active web grounding. Sources are appended to expanded dossiers for agent verification and tactical confirmation.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveBrief;
