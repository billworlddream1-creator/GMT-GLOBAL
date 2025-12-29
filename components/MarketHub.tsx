import React, { useEffect, useState, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { MarketData, InternetStats, Influencer } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { playUISound } from '../utils/audioUtils';

interface MarketHubProps {
  intelService: IntelligenceService;
}

const MarketHub: React.FC<MarketHubProps> = ({ intelService }) => {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [internet, setInternet] = useState<{stats: InternetStats, influencers: Influencer[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthSim, setGrowthSim] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const m = await intelService.getMarketIntelligence();
      const i = await intelService.getInternetStats();
      setMarket(m);
      setInternet(i);
      setLoading(false);
      playUISound('success');
    };
    load();

    const interval = setInterval(() => {
      setGrowthSim(prev => (prev + Math.random() * 0.05) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [intelService]);

  const statsList = useMemo(() => {
    if (!internet?.stats) return [];
    return [
      { label: 'DAILY_REACH', value: internet.stats.daily, color: 'text-blue-400' },
      { label: 'WEEKLY_BRIDGE', value: internet.stats.weekly, color: 'text-emerald-400' },
      { label: 'MONTHLY_UPLINK', value: internet.stats.monthly, color: 'text-purple-400' },
      { label: 'YEARLY_EXPANSION', value: internet.stats.yearly, color: 'text-amber-400' },
    ];
  }, [internet]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-20 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-blue-500/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-8 border-2 border-blue-500/20 rounded-full animate-pulse flex flex-col items-center justify-center">
             <span className="text-[10px] font-mono text-blue-400 font-black">SYNC</span>
             <div className="h-[1px] w-8 bg-blue-500/30 my-1"></div>
             <span className="text-[8px] font-mono text-blue-500/60 uppercase">Market</span>
          </div>
          <div className="absolute -inset-12 border border-blue-500/5 rounded-full ring-anim opacity-10"></div>
       </div>
       <div className="text-center space-y-4">
         <h2 className="font-heading font-black text-2xl text-white uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Synchronizing Global Markets</h2>
         <div className="flex flex-col items-center gap-2">
           <p className="font-mono text-[10px] text-blue-500 animate-pulse tracking-widest uppercase">DECRYPTING_FINANCIAL_STREAMS...</p>
           <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 animate-[ticker_2s_linear_infinite]" style={{ width: '30%' }}></div>
           </div>
         </div>
       </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Crypto & Conversion Section */}
      <div className="glass p-8 rounded-3xl border border-white/10 space-y-8 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-heading font-black text-white flex items-center gap-3">
            <span className="text-blue-500 animate-pulse">●</span> BTC_MARKET_INTELLIGENCE
          </h3>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded font-mono text-[9px] text-blue-400">
            STRATEGIC_ASSET
          </div>
        </div>
        
        <div className="p-8 bg-black/40 rounded-2xl border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl font-black font-heading">₿</span>
          </div>
          
          <div className="text-center mb-6 relative z-10">
            <span className="text-[10px] font-mono text-blue-400 block mb-2 tracking-widest uppercase">Live_Valuation_Index</span>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-heading font-black text-white">${market?.bitcoinPrice?.toLocaleString()}</span>
              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                +2.41%_24H
              </div>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={market?.bitcoinHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={3}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    borderColor: 'rgba(14, 165, 233, 0.3)',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
             <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Neural_Signal_Stability: 98.4%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(market?.conversions || {}).map(([curr, rate]) => (
            <div key={curr} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                 <span className="font-heading font-black text-[10px] text-slate-500">{curr}</span>
              </div>
              <span className="font-mono text-white text-sm font-bold">{(rate as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Internet Stats & Influencers Section */}
      <div className="glass p-8 rounded-3xl border border-white/10 space-y-10 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Digital_Traffic_Hub</h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-emerald-500 animate-pulse uppercase">Live_Node_Growth</span>
            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{ width: `${growthSim}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tactical Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          {statsList.map((stat) => (
            <div key={stat.label} className="p-5 bg-white/5 border border-white/5 rounded-2xl relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors"></div>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">{stat.label}</span>
              <div className={`text-2xl font-heading font-black ${stat.color}`}>
                {((stat.value as number) / 1000000000).toFixed(2)}<span className="text-xs ml-1 opacity-60">B</span>
              </div>
              <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full opacity-40 group-hover:opacity-100 transition-all duration-1000 ${stat.color.replace('text', 'bg')}`} style={{ width: `${Math.random() * 40 + 60}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Influencer Recon Table */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Trending_Agents_Impact</h4>
            <span className="text-[8px] font-mono text-slate-500">SORT: REACH_INTENSITY</span>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {internet?.influencers.map((inf, i) => (
              <div key={i} className="group relative p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg shadow-inner">
                   {inf.platform === 'Twitter' || inf.platform === 'X' ? '𝕏' : inf.platform === 'YouTube' ? '📺' : '📱'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase">{inf.name}</div>
                    <div className="text-[10px] font-heading font-black text-blue-500">{inf.reach}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">{inf.platform}</span>
                    <span className="text-[8px] text-slate-700 font-mono">//</span>
                    <span className="text-[8px] font-mono text-slate-400 px-1.5 py-0.5 bg-white/5 rounded uppercase">{inf.category}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-14 right-4 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Ticker Mock */}
        <div className="pt-6 border-t border-white/5">
           <div className="bg-blue-600/5 border border-blue-500/10 p-3 rounded-lg overflow-hidden relative">
              <div className="flex items-center gap-4 animate-[ticker_15s_linear_infinite] whitespace-nowrap">
                 <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">● ESTIMATED_NEW_NODES: +{(growthSim * 12).toFixed(0)}/SEC</span>
                 <span className="text-slate-700">//</span>
                 <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">● PACKET_LOSS_GLOBAL: 0.002%</span>
                 <span className="text-slate-700">//</span>
                 <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">● NEURAL_BANDWIDTH_LATENCY: 14MS</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHub;