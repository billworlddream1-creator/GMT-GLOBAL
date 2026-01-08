
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { NewsItem } from '../types';
import { playUISound } from '../utils/audioUtils';
import NewsCard from './NewsCard';

const LiveBrief: React.FC<{ intelService: IntelligenceService }> = ({ intelService }) => {
  const [events, setEvents] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const data = await intelService.getLatestGlobalUpdates('BREAKING_GLOBAL_SITUATION');
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrending(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[3rem] border border-red-500/20 bg-red-950/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <span className="text-9xl font-heading font-black text-red-500">FLASH</span>
        </div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.5em] font-black">High_Urgency_Intercept</span>
           </div>
           <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Breaking_Intel_Feed</h2>
           <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Direct search grounding link to the world's most recent neural fluctuations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
           [...Array(6)].map((_, i) => (
             <div key={i} className="glass h-64 rounded-[3rem] animate-pulse bg-white/5" />
           ))
        ) : events.map(news => (
          <NewsCard key={news.id} news={news} intelService={intelService} />
        ))}
      </div>
    </div>
  );
};

export default LiveBrief;
