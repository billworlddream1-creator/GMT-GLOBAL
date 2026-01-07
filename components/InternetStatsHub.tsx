
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { InternetStats, Influencer, NetworkStatus } from '../types';
import { playUISound } from '../utils/audioUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

interface InternetStatsHubProps {
  intelService: IntelligenceService;
}

const InternetStatsHub: React.FC<InternetStatsHubProps> = ({ intelService }) => {
  const [data, setData] = useState<{stats: InternetStats, influencers: Influencer[], sources: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [network, setNetwork] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    quality: 'STABLE'
  });

  const updateNetworkStatus = useCallback(() => {
    const conn = (navigator as any).connection;
    const isOnline = navigator.onLine;
    
    let quality: NetworkStatus['quality'] = 'STABLE';
    if (!isOnline) quality = 'OFFLINE';
    else if (conn) {
      if (conn.rtt > 500 || conn.downlink < 1) quality = 'WEAK';
      else if (conn.rtt > 200 || conn.downlink < 5) quality = 'STABLE';
      else quality = 'OPTIMAL';
    }

    setNetwork({
      online: isOnline,
      effectiveType: conn?.effectiveType || 'unknown',
      downlink: conn?.downlink || 0,
      rtt: conn?.rtt || 0,
      quality
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      playUISound('startup');
      try {
        const result = await intelService.getInternetStats();
        setData(result);
        
        const fakeLatency = Array.from({ length: 24 }).map((_, i) => ({
          time: `${i}:00`,
          latency: 15 + Math.random() * 20,
          packets: 95 + Math.random() * 5
        }));
        setLatencyData(fakeLatency);
        
        playUISound('success');
      } catch (e) {
        console.error("Net stats uplink failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener('change', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (conn) conn.removeEventListener('change', updateNetworkStatus);
    };
  }, [intelService, updateNetworkStatus]);

  const platformAnalysis = useMemo(() => {
    if (!data || !data.influencers) return [];
    const platforms = data.influencers.reduce((acc, inf) => {
      acc[inf.platform] = (acc[inf.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(platforms).map(([name, count]) => ({
      name,
      percentage: ((count as number) / data.influencers.length) * 100,
      color: name.toLowerCase().includes('twitter') || name.toLowerCase().includes('x') ? 'bg-blue-500' : name.toLowerCase().includes('youtube') ? 'bg-red-500' : 'bg-pink-500'
    }));
  }, [data]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-accent/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
       </div>
       <p className="font-mono text-xs text-accent animate-pulse tracking-widest uppercase">Deciphering_Internet_Matrix...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-32" role="region" aria-label="Internet Statistics Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/60 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full animate-pulse ${network.online ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                Net_Global_Metrics
              </h3>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Grounding Active: Verified Stats</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-heading font-black text-white">GMT_ACTIVE_SYNC</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
             {[
               { label: 'Daily_Reach', val: `${data?.stats.daily || 0}B`, color: 'text-blue-400' },
               { label: 'Weekly_Peak', val: `${data?.stats.weekly || 0}B`, color: 'text-amber-400' },
               { label: 'Monthly_Load', val: `${data?.stats.monthly || 0}B`, color: 'text-emerald-400' },
               { label: 'Yearly_Trajectory', val: `${data?.stats.yearly || 0}B`, color: 'text-purple-400' },
             ].map((stat, i) => (
               <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-[2rem] text-center">
                  <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">{stat.label}</span>
                  <div className={`text-2xl font-black uppercase ${stat.color}`}>{stat.val}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-xl flex flex-col">
          <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Influencer_Intercepts</h4>
          <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[300px]">
             {data?.influencers.map((inf, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-accent/40 transition-all">
                   <div>
                      <div className="text-[10px] font-black text-white uppercase">{inf.name}</div>
                      <div className="text-[8px] font-mono text-slate-500 uppercase">{inf.platform} // {inf.category}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-accent uppercase">{inf.reach}</div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Attribution Sources */}
      {data?.sources && data.sources.length > 0 && (
         <div className="glass p-8 rounded-[3rem] border border-white/5 bg-black/20">
            <h4 className="text-[9px] font-heading font-black text-slate-500 uppercase tracking-widest mb-6">Uplink_Source_Attribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {data.sources.map((source, i) => (
                 <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-accent/40 transition-all">
                    <span className="text-[10px] font-mono text-slate-300 truncate max-w-[80%] uppercase">{source.title || 'Web Intelligence Node'}</span>
                    <span className="text-accent text-[9px] font-black group-hover:translate-x-1 transition-transform">↗</span>
                 </a>
               ))}
            </div>
         </div>
      )}

      <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/20">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-heading font-black text-white uppercase tracking-widest">Global_Bandwidth_Wave</h3>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural_Path_Stability_24H</div>
         </div>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={latencyData}>
                  <defs>
                     <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="latency" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorLatency)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default InternetStatsHub;
