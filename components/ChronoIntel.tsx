
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { FutureEvent } from '../types';
import { playUISound } from '../utils/audioUtils';

interface ChronoIntelProps {
  intelService: IntelligenceService;
}

const ChronoIntel: React.FC<ChronoIntelProps> = ({ intelService }) => {
  const [events, setEvents] = useState<FutureEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await intelService.getTemporalForecast();
      setEvents(data);
      setLoading(false);
      playUISound('startup');
    };
    fetch();
  }, [intelService]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="glass p-12 rounded-[4rem] border border-purple-500/20 bg-purple-950/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <span className="text-[12rem] font-heading font-black text-purple-400 uppercase tracking-widest">TIME</span>
        </div>
        <div className="relative z-10">
          <span className="text-[9px] font-mono text-purple-400 uppercase tracking-[0.6em] font-black block mb-2">Neural Trajectory Simulator</span>
          <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter">Chrono-Intelligence</h2>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em] mt-4">Predictive dossiers from the Temporal Horizon (2030-2055)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
           [...Array(6)].map((_, i) => (
             <div key={i} className="glass h-64 rounded-[3rem] animate-pulse bg-white/5"></div>
           ))
        ) : events.map((ev, i) => (
          <div key={i} className="glass p-8 rounded-[3rem] border border-white/5 bg-white/5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black">{ev.year}</span>
             </div>
             <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-xl text-[9px] font-black text-purple-400 uppercase tracking-widest">{ev.year}_FORECAST</span>
                <span className={`px-2 py-1 rounded text-[7px] font-black uppercase border ${
                  ev.impactLevel === 'EXISTENTIAL' ? 'text-red-500 border-red-500/20' : 'text-blue-500 border-blue-500/20'
                }`}>{ev.impactLevel}</span>
             </div>
             <h3 className="text-xl font-heading font-black text-white uppercase mb-4 leading-tight group-hover:text-purple-400 transition-colors">{ev.title}</h3>
             <p className="text-[11px] font-mono text-slate-400 leading-relaxed italic mb-8">"{ev.brief}"</p>
             <div className="flex justify-between items-end mt-auto pt-6 border-t border-white/5">
                <div className="space-y-1">
                   <span className="text-[8px] font-mono text-slate-600 uppercase">Probability</span>
                   <div className="text-lg font-heading font-black text-white">{ev.probability}%</div>
                </div>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500" style={{ width: `${ev.probability}%` }}></div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChronoIntel;
