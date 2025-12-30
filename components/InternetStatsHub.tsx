
import React, { useEffect, useState, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { InternetStats, Influencer } from '../types';
import { playUISound } from '../utils/audioUtils';

interface InternetStatsHubProps {
  intelService: IntelligenceService;
}

const InternetStatsHub: React.FC<InternetStatsHubProps> = ({ intelService }) => {
  const [data, setData] = useState<{stats: InternetStats, influencers: Influencer[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulseLevel, setPulseLevel] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      playUISound('startup');
      try {
        const result = await intelService.getInternetStats();
        setData(result);
        playUISound('success');
      } catch (e) {
        console.error("Net stats uplink failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(() => {
      setPulseLevel(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [intelService]);

  const platformAnalysis = useMemo(() => {
    if (!data) return [];
    const platforms = data.influencers.reduce((acc, inf) => {
      acc[inf.platform] = (acc[inf.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Fix: Explicitly cast count to number to resolve arithmetic operation type errors
    return Object.entries(platforms).map(([name, count]) => ({
      name,
      percentage: ((count as number) / data.influencers.length) * 100,
      color: name === 'Twitter' || name === 'X' ? 'bg-blue-500' : name === 'YouTube' ? 'bg-red-500' : 'bg-pink-500'
    }));
  }, [data]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-accent/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
          <div className="absolute inset-12 border border-accent/20 rounded-full animate-pulse flex flex-col items-center justify-center">
             <span className="text-xs font-mono text-accent font-black">UPLINKING</span>
          </div>
       </div>
       <div className="text-center space-y-4">
         <h2 className="font-heading font-black text-3xl text-white uppercase tracking-[0.4em]">Digital Flow Pulse</h2>
         <p className="font-mono text-xs text-accent animate-pulse tracking-widest uppercase">Capturing_Global_Reach_Data...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-32">
      {/* Reach Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Daily_Reach', value: data?.stats.daily, icon: '⚡', color: 'text-blue-400' },
          { label: 'Weekly_Reach', value: data?.stats.weekly, icon: '🌊', color: 'text-emerald-400' },
          { label: 'Monthly_Reach', value: data?.stats.monthly, icon: '🛰️', color: 'text-purple-400' },
          { label: 'Yearly_Reach', value: data?.stats.yearly, icon: '🌎', color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-accent/40 transition-all">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-6xl">{stat.icon}</span>
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
             <div className="flex items-end gap-2">
                <span className={`text-4xl font-heading font-black ${stat.color}`}>{stat.value}<span className="text-xs ml-1 opacity-60 uppercase">B</span></span>
             </div>
             <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                {/* Fix: Explicitly cast stat.value to number to ensure arithmetic operations are valid */}
                <div className={`h-full transition-all duration-1000 ${stat.color.replace('text', 'bg')}`} style={{ width: `${((stat.value as number) || 0) * 10}%` }}></div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Influencer Matrix */}
        <div className="lg:col-span-8 glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col bg-slate-900/20 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter flex items-center gap-3">
                 <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                 Impact_Node_Analysis
              </h3>
              <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-xl font-mono text-[9px] text-accent uppercase tracking-widest">Global Ranking Active</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {data?.influencers.map((inf, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-accent/40 transition-all group relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                         {inf.platform === 'Twitter' || inf.platform === 'X' ? '𝕏' : inf.platform === 'YouTube' ? '🎬' : '📱'}
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-heading font-black text-white uppercase">{inf.reach}</span>
                         <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Impact Factor</p>
                      </div>
                   </div>
                   <h4 className="text-lg font-black text-white uppercase mb-1 tracking-tighter truncate group-hover:text-accent transition-colors">{inf.name}</h4>
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{inf.platform}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                      <span className="text-[9px] font-mono text-accent uppercase px-2 py-0.5 bg-accent/10 rounded">{inf.category}</span>
                   </div>
                   <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase">
                         <span>Trend Momentum</span>
                         <span className="text-emerald-500">Positive</span>
                      </div>
                      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-accent" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Decorative Background Elements */}
           <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.03] select-none pointer-events-none">
              <span className="text-[20rem] font-heading font-black text-white">NODES</span>
           </div>
        </div>

        {/* Platform Breakdown & Live Feed */}
        <div className="lg:col-span-4 space-y-10">
           <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-xl">
              <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Platform Dominance</h4>
              <div className="space-y-6">
                 {platformAnalysis.map((plat, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                         <span className="text-slate-400">{plat.name}</span>
                         <span className="text-white font-black">{plat.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${plat.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${plat.percentage}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-10 glass rounded-[3.5rem] border border-blue-500/20 bg-blue-500/5 relative overflow-hidden flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 flex items-center justify-center relative">
                 <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                 <span className="text-3xl">📡</span>
              </div>
              <div>
                 <h5 className="text-[10px] font-heading font-black text-white uppercase tracking-[0.2em] mb-2">Live Neural Sync</h5>
                 <p className="text-[9px] font-mono text-slate-500 uppercase leading-relaxed max-w-xs">Monitoring high-bandwidth social nodes across 400 global terrestrial regions. Data updated in real-time.</p>
              </div>
              <div className="flex gap-1 h-4 items-end">
                 {[...Array(12)].map((_, i) => (
                   <div 
                     key={i} 
                     className="w-1 bg-blue-500/40 rounded-t-full transition-all duration-300"
                     style={{ height: `${Math.sin(pulseLevel/10 + i) * 50 + 50}%` }}
                   ></div>
                 ))}
              </div>
           </div>

           <div className="p-8 glass rounded-[2.5rem] border border-white/5 bg-slate-900/60">
              <span className="text-[8px] font-mono text-slate-600 uppercase block mb-3">Operational Note</span>
              <p className="text-[9px] font-mono text-slate-400 leading-relaxed uppercase">The net stats module parses aggregate reach data from the GMT central index. Discrepancies in influencer category may occur due to multi-platform cross-posting algorithms.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InternetStatsHub;
