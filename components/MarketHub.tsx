
import React, { useEffect, useState, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { MarketData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { playUISound } from '../utils/audioUtils';

interface MarketHubProps {
  intelService: IntelligenceService;
}

const MarketHub: React.FC<MarketHubProps> = ({ intelService }) => {
  const [market, setMarket] = useState<(MarketData & { sources: any[], xrpPrice?: number, polkadotPrice?: number }) | null>(null);
  const [activeTab, setActiveTab] = useState<'CRYPTO' | 'FOREX' | 'STOCKS'>('CRYPTO');
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState(64); // Fear & Greed Index

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const m = await intelService.getMarketIntelligence();
        setMarket(m);
        setSentiment(40 + Math.random() * 40);
        playUISound('success');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [intelService]);

  const mockForexData = [
    { name: 'EUR/USD', rate: 1.0842, change: '+0.12%', color: 'text-emerald-400' },
    { name: 'GBP/USD', rate: 1.2645, change: '-0.04%', color: 'text-red-400' },
    { name: 'USD/JPY', rate: 151.34, change: '+0.54%', color: 'text-emerald-400' },
    { name: 'AUD/USD', rate: 0.6542, change: '-0.21%', color: 'text-red-400' }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-accent/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
       </div>
       <p className="font-mono text-xs text-accent animate-pulse tracking-widest uppercase">Calibrating_Market_Uplink...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-700 pb-32" role="region" aria-label="Global Market Intelligence">
      <div className="flex justify-center">
        <div className="glass p-1.5 rounded-2xl border border-white/10 flex gap-2">
          {(['CRYPTO', 'FOREX', 'STOCKS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); playUISound('click'); }}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              aria-current={activeTab === tab ? 'true' : 'false'}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/60 relative overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">
                       {activeTab === 'CRYPTO' ? '₿ Asset_Neural_Stream' : activeTab === 'FOREX' ? '💱 Forex_Matrix' : '📈 Global_Equities'}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Grounding: Search Enabled</p>
                 </div>
                 <div className="text-right">
                    <span className="text-3xl font-heading font-black text-white">
                       {activeTab === 'CRYPTO' ? `$${(market?.bitcoinPrice || 0).toLocaleString()}` : '$1.0842'}
                    </span>
                    <div className="text-[10px] font-mono text-emerald-400 font-black animate-pulse">+2.4%_SINC_LAST_TICK</div>
                 </div>
              </div>

              <div className="flex-1 w-full h-full pb-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={market?.bitcoinHistory}>
                       <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis domain={['auto', 'auto']} hide />
                       <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                       <Area type="monotone" dataKey="price" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              {activeTab === 'CRYPTO' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-white/5">
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-blue-500/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">BTC</span>
                      <span className="text-xs font-heading font-black text-white">${market?.bitcoinPrice?.toLocaleString() || '---'}</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-blue-500/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">ETH</span>
                      <span className="text-xs font-heading font-black text-white">${market?.ethereumPrice?.toLocaleString() || '---'}</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-purple-500/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">SOL</span>
                      <span className="text-xs font-heading font-black text-white">${market?.solanaPrice?.toLocaleString() || '---'}</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-blue-400/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">ADA</span>
                      <span className="text-xs font-heading font-black text-white">${market?.cardanoPrice?.toLocaleString() || '---'}</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-cyan-400/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">XRP</span>
                      <span className="text-xs font-heading font-black text-white">${market?.xrpPrice?.toLocaleString() || '---'}</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-pink-400/40 transition-all">
                      <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">DOT</span>
                      <span className="text-xs font-heading font-black text-white">${market?.polkadotPrice?.toLocaleString() || '---'}</span>
                   </div>
                </div>
              )}
           </div>

           {/* Data Sources Attribution */}
           {market?.sources && market.sources.length > 0 && (
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/20">
                <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-6">Grounding_Origin_Nodes</h4>
                <div className="flex flex-wrap gap-4">
                   {market.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-mono text-accent hover:text-white transition-all">
                         {s.title || 'Market Source'} ↗
                      </a>
                   ))}
                </div>
              </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-xl flex flex-col items-center text-center">
              <span className="text-[9px] font-heading font-black text-slate-500 uppercase tracking-widest mb-6">Market_Sentiment_Gauge</span>
              <div className="relative w-40 h-40 flex items-center justify-center">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="var(--accent-primary)" strokeWidth="8" 
                      strokeDasharray={`${sentiment * 2.82} 282`} 
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-heading font-black text-white">{Math.round(sentiment)}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Greed_Index</span>
                 </div>
              </div>
           </div>

           <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-xl flex flex-col">
              <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Tactical_Forex_Nodes</h4>
              <div className="space-y-4">
                 {mockForexData.map(pair => (
                   <div key={pair.name} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-accent/40 transition-all cursor-default">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white uppercase">{pair.name}</span>
                         <span className="text-[8px] font-mono text-slate-500">Live Relay</span>
                      </div>
                      <div className="text-right">
                         <div className="text-xs font-mono font-black text-slate-200">{pair.rate}</div>
                         <div className={`text-[8px] font-mono font-bold ${pair.color}`}>{pair.change}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHub;
