
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { SentimentData, IntelligenceSignal } from '../types';
import { playUISound } from '../utils/audioUtils';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WORLD_MAP_PATHS = [
  "M-168,70 L-55,70 L-60,15 L-100,10 L-110,30 L-168,70", // N. America
  "M-80,10 L-35,10 L-40,-55 L-70,-55 L-80,10", // S. America
  "M-10,75 L170,75 L160,10 L100,10 L80,30 L40,10 L20,10 L-10,75", // Eurasia
  "M-20,35 L40,30 L50,-35 L10,-35 L-20,35", // Africa
  "M110,-10 L150,-10 L150,-40 L110,-40 L110,-10", // Australia
];

const GlobalPulse: React.FC<{ intelService: IntelligenceService }> = ({ intelService }) => {
  const [sentiments, setSentiments] = useState<SentimentData[]>([]);
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<SentimentData | null>(null);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const [sData, sigData] = await Promise.all([
        intelService.getGlobalSentiment(),
        intelService.getSatelliteSignals()
      ]);
      setSentiments(sData);
      setSignals(sigData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPulse(); }, []);

  const mapLatToY = (lat: number) => 50 - (lat / 1.8);
  const mapLngToX = (lng: number) => 50 + (lng / 3.6);

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="glass p-6 rounded-[2rem] border border-white/10 flex justify-between items-end shrink-0">
        <div>
          <span className="text-[8px] font-mono text-accent uppercase tracking-[0.4em] font-black">Tactical_Geospatial_Intercept</span>
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Global_Live_Pulse</h2>
        </div>
        <button onClick={fetchPulse} className="px-6 py-2 glass border-accent/20 text-accent font-black text-[9px] uppercase tracking-widest hover:bg-accent/10 transition-all">Manual_Sync</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Map Section */}
        <div className="lg:col-span-2 glass rounded-[3rem] border border-white/5 bg-black/60 relative overflow-hidden shadow-2xl flex flex-col">
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="-180 -90 360 180" preserveAspectRatio="xMidYMid slice">
            {WORLD_MAP_PATHS.map((path, i) => (
              <path key={i} d={path} fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" strokeDasharray="2,2" />
            ))}
          </svg>

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="absolute inset-0">
              {sentiments.map((s, i) => (
                <div 
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ top: `${mapLatToY(s.lat)}%`, left: `${mapLngToX(s.lng)}%` }}
                  onClick={() => { setSelectedHotspot(s); playUISound('click'); }}
                >
                  <div className="absolute inset-0 rounded-full opacity-20 animate-pulse blur-xl" style={{ backgroundColor: s.color, width: '60px', height: '60px', margin: '-30px' }}></div>
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:scale-150" style={{ backgroundColor: s.color }}>
                     <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  {selectedHotspot?.region === s.region && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 glass p-4 rounded-2xl border-white/20 bg-slate-900/90 z-50 w-48 shadow-2xl animate-in zoom-in-95">
                      <h4 className="text-[10px] font-heading font-black text-white uppercase mb-1">{s.region}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono text-slate-400 uppercase">Stability</span>
                        <span className="text-[10px] font-black" style={{ color: s.color }}>{s.score}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {signals.map((sig, i) => (
                <div 
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${mapLatToY(sig.lat)}%`, left: `${mapLngToX(sig.lng)}%` }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full animate-ping ${sig.urgency === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <div className={`w-1 h-1 rounded-full absolute inset-0 ${sig.urgency === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                </div>
              ))}
            </div>
          )}

          <div className="absolute bottom-8 left-8 glass p-4 rounded-2xl border-white/10 bg-black/40 text-[7px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
             Neural_Mapping_Mode: ACTIVE // LATENCY: 0.2ms // ENCRYPTION: RSA-4096
          </div>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-1 glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 flex flex-col min-h-[300px]">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">Regional_Sentiment_Index</h3>
           </div>
           
           <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={sentiments} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="region" 
                      type="category" 
                      width={80} 
                      tick={{fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{fill: 'white', opacity: 0.05}} 
                      contentStyle={{backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12} animationDuration={1500}>
                       {sentiments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase">
                 <span>Avg_Stability</span>
                 <span className="text-white font-black">{Math.round(sentiments.reduce((acc, curr) => acc + curr.score, 0) / (sentiments.length || 1))}%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPulse;
