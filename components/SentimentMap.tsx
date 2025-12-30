
import React, { useState, useEffect, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { SentimentData } from '../types';
import { playUISound } from '../utils/audioUtils';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface SentimentMapProps {
  intelService: IntelligenceService;
}

const WORLD_LANDMASSES = [
  "M-168,70 L-55,70 L-60,15 L-100,10 L-110,30 L-168,70", // N. America
  "M-80,10 L-35,10 L-40,-55 L-70,-55 L-80,10", // S. America
  "M-10,75 L170,75 L160,10 L100,10 L80,30 L40,10 L20,10 L-10,75", // Eurasia
  "M-20,35 L40,30 L50,-35 L10,-35 L-20,35", // Africa
  "M110,-10 L150,-10 L150,-40 L110,-40 L110,-10", // Australia
  "M-180,-80 L180,-80 L180,-90 L-180,-90 Z" // Antarctica
];

const RegionSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/5 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-1/3 h-2 bg-white/10 rounded-full shimmer"></div>
          <div className="w-16 h-4 bg-white/10 rounded shimmer"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="w-1/2 h-10 bg-white/10 rounded-xl shimmer"></div>
          <div className="w-1/4 h-2 bg-white/5 rounded-full shimmer"></div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full shimmer"></div>
      </div>
    ))}
  </div>
);

// Defined outside to ensure component stability
const RenderSentimentNode = (props: any) => {
  const { cx, cy, fill, payload, selectedRegion } = props;
  if (!cx || !cy) return null;
  
  const isSelected = selectedRegion?.region === payload.region;
  const size = (payload.score / 100) * 40 + 10;

  return (
    <g className="cursor-pointer group">
      <circle
        cx={cx}
        cy={cy}
        r={size + 15}
        fill={fill}
        opacity={0.1}
        className="animate-pulse"
      />
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={fill}
        opacity={0.3}
      />
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 8 : 4}
        fill={isSelected ? '#fff' : fill}
        stroke="#fff"
        strokeWidth={isSelected ? 2 : 0}
        className="transition-all duration-300"
      />
    </g>
  );
};

export default function SentimentMap({ intelService }: SentimentMapProps) {
  const [data, setData] = useState<SentimentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'cards' | 'trends'>('map');
  const [selectedRegion, setSelectedRegion] = useState<SentimentData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [trendSummary, setTrendSummary] = useState('');
  const [trendsLoading, setTrendsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const res = await intelService.getGlobalSentiment();
    setData(res);
    setIsLoading(false);
    playUISound('success');
  };

  const loadTrends = async () => {
    setTrendsLoading(true);
    playUISound('startup');
    const { history, summary } = await intelService.getHistoricalSentimentAnalysis();
    setHistoricalData(history);
    setTrendSummary(summary);
    setTrendsLoading(false);
    playUISound('success');
  };

  useEffect(() => {
    loadData();
  }, [intelService]);

  useEffect(() => {
    if (viewMode === 'trends' && historicalData.length === 0) {
      loadTrends();
    }
  }, [viewMode]);

  const mapData = useMemo(() => {
    return data.map(region => ({
      x: region.lng,
      y: region.lat,
      z: region.score,
      ...region
    }));
  }, [data]);

  const handlePointClick = (node: any) => {
    if (node && node.payload) {
      setSelectedRegion(node.payload);
      playUISound('click');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/20 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 mb-12">
          <div className="space-y-3">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">Global Sentiment</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Terrestrial stability and neural frequency analysis</p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => { setViewMode('map'); playUISound('click'); }}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Map
              </button>
              <button 
                onClick={() => { setViewMode('cards'); playUISound('click'); }}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'cards' ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Cards
              </button>
              <button 
                onClick={() => { setViewMode('trends'); playUISound('click'); }}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'trends' ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Trends
              </button>
            </div>
            <button 
              onClick={() => { playUISound('click'); loadData(); if(viewMode==='trends') loadTrends(); }}
              className="px-6 py-3 glass rounded-2xl text-[10px] font-mono text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all uppercase font-black"
            >
              Sync Pulse
            </button>
          </div>
        </div>

        {isLoading || (trendsLoading && viewMode === 'trends') ? (
          <RegionSkeleton />
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 h-[500px] glass rounded-[3rem] border border-white/5 relative overflow-hidden bg-black/40">
              <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                <svg width="100%" height="100%" viewBox="-180 -90 360 180" preserveAspectRatio="xMidYMid slice">
                  {WORLD_LANDMASSES.map((path, i) => (
                    <path key={i} d={path} fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.4" strokeDasharray="3,3"/>
                  ))}
                </svg>
              </div>

              <div className="w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                    <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="glass p-4 rounded-2xl border border-white/20 bg-slate-950/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                              <p className="text-[10px] font-heading font-black text-white uppercase mb-1">{item.region}</p>
                              <p className="text-[9px] font-mono text-accent uppercase">{item.sentiment} // SCORE: {item.score}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Sentiments" 
                      data={mapData} 
                      onClick={handlePointClick}
                      shape={<RenderSentimentNode selectedRegion={selectedRegion} />}
                    >
                      {mapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/20 flex flex-col justify-center">
              {selectedRegion ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                   <div className="space-y-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Focus Region</span>
                      <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">{selectedRegion.region}</h4>
                   </div>
                   
                   <div className="p-6 rounded-[2.5rem] border bg-black/40 border-white/5 text-center space-y-4">
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">Index_Score</span>
                         <div className="text-5xl font-heading font-black text-white">{selectedRegion.score}</div>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                         selectedRegion.sentiment === 'VOLATILE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         selectedRegion.sentiment === 'STABLE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                         {selectedRegion.sentiment}
                      </div>
                   </div>

                   <button 
                     onClick={() => setSelectedRegion(null)}
                     className="w-full py-4 text-[9px] font-mono text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                   >
                     Clear_Fix
                   </button>
                </div>
              ) : (
                <div className="text-center space-y-6 opacity-30">
                   <span className="text-5xl">🧭</span>
                   <p className="text-[10px] font-mono uppercase tracking-widest leading-relaxed">Select a zone for deep analysis</p>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((region, i) => (
              <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/5 hover:border-accent/20 transition-all group">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{region.region}</span>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border ${
                      region.sentiment === 'VOLATILE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      region.sentiment === 'STABLE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {region.sentiment}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl font-heading font-black text-white">{region.score}</div>
                    <div className="text-[10px] font-mono text-slate-600">INTEL_IDX</div>
                 </div>

                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      style={{ width: `${region.score}%`, backgroundColor: region.color }}
                    ></div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 h-[450px] glass rounded-[3rem] border border-white/10 p-8 bg-black/40">
                   <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Regional Stability Vectors (24H)</h3>
                   <div className="w-full h-full pb-10">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="hour" 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={9} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={9} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                               itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="Eurasia" 
                              stroke="#3b82f6" 
                              strokeWidth={3} 
                              dot={{ fill: '#3b82f6', r: 4 }} 
                              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                              animationDuration={2000}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="Africa" 
                              stroke="#f59e0b" 
                              strokeWidth={3} 
                              dot={{ fill: '#f59e0b', r: 4 }} 
                              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                              animationDuration={2000}
                            />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                   <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 h-full flex flex-col">
                      <h4 className="text-[10px] font-heading font-black text-accent uppercase tracking-widest mb-4">Tactical_Briefing</h4>
                      <div className="flex-1 space-y-4">
                         <div className="p-5 bg-black/40 rounded-2xl border border-white/5 italic">
                            <p className="text-[11px] font-mono text-slate-300 leading-relaxed italic">
                               "{trendSummary || 'Processing historical sentiment logs...'}"
                            </p>
                         </div>
                         <div className="space-y-2 pt-4">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                               <span className="text-slate-500 uppercase">Neural Correlation</span>
                               <span className="text-emerald-400 font-black">HIGH</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono">
                               <span className="text-slate-500 uppercase">Cross-Sync Latency</span>
                               <span className="text-blue-400 font-black">0.2ms</span>
                            </div>
                         </div>
                      </div>
                      <div className="pt-6 mt-auto border-t border-white/5">
                         <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">GMT_ANALYTICS_BETA</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-accent/5 flex items-center gap-6 group hover:bg-accent/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">📊</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Regional Convergence</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Eurasian markers showing signs of stability</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-amber-500/5 flex items-center gap-6 group hover:bg-amber-500/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">📉</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">African Volatility</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Market signals in flux across 4 sectors</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-red-500/5 flex items-center gap-6 group hover:bg-red-500/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">🧨</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Critical Thresholds</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Sentiment disparity exceeded 30% margin</p>
            </div>
      </div>
    </div>
  );
}

