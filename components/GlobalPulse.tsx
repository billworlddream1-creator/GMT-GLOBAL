
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { SentimentData, NewsItem, IntelligenceSignal } from '../types';
import { playUISound } from '../utils/audioUtils';

interface GlobalPulseProps {
  intelService: IntelligenceService;
}

const WORLD_MAP_PATHS = [
  "M-168,70 L-55,70 L-60,15 L-100,10 L-110,30 L-168,70", // N. America
  "M-80,10 L-35,10 L-40,-55 L-70,-55 L-80,10", // S. America
  "M-10,75 L170,75 L160,10 L100,10 L80,30 L40,10 L20,10 L-10,75", // Eurasia
  "M-20,35 L40,30 L50,-35 L10,-35 L-20,35", // Africa
  "M110,-10 L150,-10 L150,-40 L110,-40 L110,-10", // Australia
  "M-180,-80 L180,-80 L180,-90 L-180,-90 Z" // Antarctica
];

const GlobalPulse: React.FC<GlobalPulseProps> = ({ intelService }) => {
  const [sentiments, setSentiments] = useState<SentimentData[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<SentimentData | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);
  const [regionalNews, setRegionalNews] = useState<NewsItem[]>([]);
  const [loadingRegionalNews, setLoadingRegionalNews] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<SentimentData | null>(null);
  const [hoveredSignal, setHoveredSignal] = useState<IntelligenceSignal | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const fetchPulseData = async () => {
    try {
      const [sentimentData, newsData, signalData] = await Promise.all([
        intelService.getGlobalSentiment(),
        intelService.getLatestGlobalUpdates('BREAKING_WORLD_NEWS', 1),
        intelService.getSatelliteSignals()
      ]);
      setSentiments(sentimentData);
      setLatestNews(newsData);
      setSignals(signalData);
      playUISound('success');
    } catch (e) {
      console.error("Pulse sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulseData();
    const interval = setInterval(fetchPulseData, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleHotspotClick = async (s: SentimentData) => {
    setSelectedHotspot(s);
    setSelectedSignal(null);
    setRegionalNews([]);
    setLoadingRegionalNews(true);
    playUISound('click');
    
    try {
      const news = await intelService.getLocalizedNews(s.region);
      setRegionalNews(news.slice(0, 3));
      playUISound('success');
    } catch (err) {
      console.error("Failed to fetch regional news", err);
    } finally {
      setLoadingRegionalNews(false);
    }
  };

  const handleSignalClick = (sig: IntelligenceSignal) => {
    setSelectedSignal(sig);
    setSelectedHotspot(null);
    playUISound('click');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const mapLatToY = (lat: number) => 50 - (lat / 1.8);
  const mapLngToX = (lng: number) => 50 + (lng / 3.6);

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
         <h2 className="font-heading font-black text-3xl text-white uppercase tracking-[0.4em]">Global Pulse Synchronizing</h2>
         <p className="font-mono text-xs text-accent animate-pulse tracking-widest uppercase">Capturing_World_Neural_State...</p>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500 pb-20" onMouseMove={handleMouseMove}>
      <div className="glass p-8 rounded-[3.5rem] border border-white/10 bg-slate-900/40 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <span className="text-9xl font-heading font-black">PULSE</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] font-black block mb-2">Real-Time Geospatial Intelligence</span>
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Live_World_Heatmap</h2>
          </div>
          <div className="flex gap-4">
             <div className="glass px-6 py-3 rounded-2xl border border-white/5 bg-black/20 flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-[8px] font-mono text-slate-500 uppercase">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                   <span className="text-[8px] font-mono text-slate-500 uppercase">Volatile</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[8px] font-mono text-slate-500 uppercase">Stable</span>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                   <span className="text-[8px] font-mono text-slate-500 uppercase">Satellite Signal</span>
                </div>
             </div>
             <button onClick={() => { setLoading(true); fetchPulseData(); }} className="px-8 py-3 bg-accent/80 hover:bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Manual_Sync</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 flex-1 overflow-hidden">
        {/* Heatmap Overlay */}
        <div className="lg:col-span-3 glass rounded-[3.5rem] border border-white/10 relative overflow-hidden bg-black/60 shadow-2xl group">
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="-180 -90 360 180" preserveAspectRatio="xMidYMid slice">
            <defs>
               <filter id="heat-glow">
                  <feGaussianBlur stdDeviation="15" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
               </filter>
            </defs>
            {WORLD_MAP_PATHS.map((path, i) => (
              <path key={i} d={path} fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" strokeDasharray="2,2" />
            ))}
          </svg>

          {/* Heat Zones & Flags */}
          <div className="absolute inset-0">
             {sentiments.map((s, i) => (
               <div 
                 key={i}
                 className="absolute -translate-x-1/2 -translate-y-1/2 group/spot cursor-pointer"
                 style={{ 
                   top: `${mapLatToY(s.lat)}%`, 
                   left: `${mapLngToX(s.lng)}%`,
                   zIndex: hoveredHotspot?.region === s.region || selectedHotspot?.region === s.region ? 50 : 10
                 }}
                 onClick={(e) => { e.stopPropagation(); handleHotspotClick(s); }}
                 onMouseEnter={() => { setHoveredHotspot(s); playUISound('hover'); }}
                 onMouseLeave={() => setHoveredHotspot(null)}
               >
                 {/* Heat Aura */}
                 <div 
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[40px] animate-pulse transition-all duration-700"
                   style={{ 
                     backgroundColor: s.color,
                     width: `${(s.score / 100) * 200 + 40}px`,
                     height: `${(s.score / 100) * 200 + 40}px`
                   }}
                 ></div>
                 
                 {/* Center Node */}
                 <div 
                   className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center group-hover/spot:scale-150 transition-all relative ${
                     selectedHotspot?.region === s.region ? 'scale-150 ring-4 ring-white shadow-[0_0_20px_white]' : ''
                   }`}
                   style={{ backgroundColor: s.color }}
                 >
                   <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                 </div>

                 {/* Sentiment Flag Badge */}
                 <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-in slide-in-from-bottom-2 duration-500">
                    <div className={`px-2 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-tighter whitespace-nowrap shadow-xl transition-all ${
                      s.sentiment === 'CRITICAL' ? 'bg-red-500 border-red-400 text-white' : 
                      s.sentiment === 'VOLATILE' ? 'bg-amber-500 border-amber-400 text-white' : 'bg-emerald-500 border-emerald-400 text-white'
                    }`}>
                      {s.sentiment}
                    </div>
                    {/* Flagpole */}
                    <div className="w-px h-2 bg-white/40"></div>
                 </div>
               </div>
             ))}

             {/* Satellite Signals Layer */}
             {signals.map((sig) => (
               <div 
                 key={sig.id}
                 className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-40 group/sig"
                 style={{ 
                   top: `${mapLatToY(sig.lat)}%`, 
                   left: `${mapLngToX(sig.lng)}%` 
                 }}
                 onClick={(e) => { e.stopPropagation(); handleSignalClick(sig); }}
                 onMouseEnter={() => { setHoveredSignal(sig); playUISound('hover'); }}
                 onMouseLeave={() => setHoveredSignal(null)}
               >
                 <div className={`w-1.5 h-1.5 rounded-full animate-ping absolute inset-0 ${sig.urgency === 'HIGH' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                 <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] border border-white/40 ${sig.urgency === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                 
                 {/* Signal Label shown on hover */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded border border-white/10 text-[6px] font-mono text-white opacity-0 group-hover/sig:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    SIG_{(sig.id || '').split('-').pop()}
                 </div>
               </div>
             ))}
          </div>

          <div className="absolute bottom-10 left-10 p-6 glass rounded-3xl border border-white/10 backdrop-blur-md max-w-sm pointer-events-none animate-in slide-in-from-left-4 duration-1000">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-mono text-emerald-400 font-black uppercase">Satellite_Telemetry_Lock</span>
             </div>
             <p className="text-[9px] font-mono text-slate-500 uppercase leading-relaxed">Geospatial heat zones calculated based on aggregate sentiment scores. Small blue/red pings indicate discrete satellite signal intercepts.</p>
          </div>

          {/* Hotspot Detailed Panel */}
          {selectedHotspot && (
            <div className="absolute top-10 right-10 p-8 glass rounded-[2.5rem] border border-white/20 bg-slate-950/80 backdrop-blur-xl w-96 animate-in zoom-in-95 duration-300 shadow-2xl z-50 flex flex-col max-h-[85%] overflow-hidden">
               <div className="flex justify-between items-start mb-6 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className={`w-3 h-10 rounded-full ${
                       selectedHotspot.sentiment === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                       selectedHotspot.sentiment === 'VOLATILE' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_15_rgba(16,185,129,0.5)]'
                     }`}></div>
                     <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">{selectedHotspot.region}</h3>
                  </div>
                  <button onClick={() => setSelectedHotspot(null)} className="text-slate-500 hover:text-white">✕</button>
               </div>
               <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-mono text-slate-400 uppercase">Sentiment Index</span>
                     <span className="text-2xl font-heading font-black text-white">{selectedHotspot.score}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full transition-all duration-1000" style={{ width: `${selectedHotspot.score}%`, backgroundColor: selectedHotspot.color }}></div>
                  </div>
                  <div className={`p-4 rounded-xl border text-center text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 ${
                    selectedHotspot.sentiment === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    selectedHotspot.sentiment === 'VOLATILE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    STATUS: {selectedHotspot.sentiment}
                  </div>

                  <div className="pt-4 space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[9px] font-heading font-black text-white uppercase tracking-widest">Latest_Regional_Intel</span>
                     </div>
                     
                     {loadingRegionalNews ? (
                        <div className="space-y-3">
                           {[1,2,3].map(i => (
                             <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5 animate-pulse"></div>
                           ))}
                        </div>
                     ) : regionalNews.length > 0 ? (
                        <div className="space-y-3">
                           {regionalNews.map(news => (
                             <div key={news.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-accent/40 transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                   <span className="text-[7px] font-mono text-accent uppercase font-black tracking-widest">Signal_Detect</span>
                                   <span className="text-[7px] font-mono text-slate-600">{new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase leading-tight group-hover:text-accent transition-colors line-clamp-2">{news.title}</h4>
                             </div>
                           ))}
                        </div>
                     ) : (
                        <div className="p-6 text-center opacity-30 italic text-[10px] font-mono border border-dashed border-white/10 rounded-2xl">
                           Searching local bands for signals...
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* Signal Detailed Panel */}
          {selectedSignal && (
            <div className="absolute top-10 right-10 p-8 glass rounded-[2.5rem] border border-blue-500/30 bg-slate-950/90 backdrop-blur-xl w-80 animate-in zoom-in-95 duration-300 shadow-2xl z-50 flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]">📡</div>
                     <h3 className="text-lg font-heading font-black text-white uppercase tracking-tighter">Signal_Fix</h3>
                  </div>
                  <button onClick={() => setSelectedSignal(null)} className="text-slate-500 hover:text-white">✕</button>
               </div>
               <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                     <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">ID_DESCRIPTOR</span>
                     <span className="text-[10px] font-mono text-blue-400 font-black">{selectedSignal.id}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                     <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">LOCALIZED_ORIGIN</span>
                     <span className="text-[10px] font-mono text-white font-black uppercase">{selectedSignal.location}</span>
                  </div>
                  <div className={`p-4 rounded-xl border text-center text-[8px] font-black uppercase tracking-widest ${
                    selectedSignal.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    URGENCY: {selectedSignal.urgency}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 italic leading-relaxed border-l-2 border-blue-500/20 pl-4">
                    "{selectedSignal.description}"
                  </p>
               </div>
               <button onClick={() => setSelectedSignal(null)} className="mt-8 w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all">Dismiss Fix</button>
            </div>
          )}

          {/* Hover Tooltip (Signal or Hotspot) */}
          {(hoveredHotspot || hoveredSignal) && !selectedHotspot && !selectedSignal && (
            <div 
              className="fixed pointer-events-none z-[100] animate-in fade-in zoom-in-95 duration-200"
              style={{ top: mousePos.y - 120, left: mousePos.x + 20 }}
            >
              <div className="glass p-5 rounded-2xl border-white/20 bg-slate-900/90 shadow-2xl backdrop-blur-xl min-w-[200px]">
                {hoveredHotspot ? (
                   <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[10px] font-heading font-black text-white uppercase">{hoveredHotspot.region}</span>
                      <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase text-white ${
                        hoveredHotspot.sentiment === 'CRITICAL' ? 'bg-red-500' : 
                        hoveredHotspot.sentiment === 'VOLATILE' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        {hoveredHotspot.sentiment}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-slate-400 uppercase tracking-widest">Stability</span>
                      <span className="text-white font-bold" style={{ color: hoveredHotspot.color }}>{hoveredHotspot.score}%</span>
                    </div>
                  </div>
                ) : hoveredSignal ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[10px] font-heading font-black text-blue-400 uppercase">SAT_SIGNAL</span>
                      <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase text-white ${
                        hoveredSignal.urgency === 'HIGH' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {hoveredSignal.urgency}
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-slate-300 uppercase leading-tight line-clamp-1">{hoveredSignal.location}</div>
                    <div className="text-[8px] font-mono text-slate-500 italic leading-tight truncate">{hoveredSignal.description}</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Live Ticker Sidebar */}
        <div className="lg:col-span-1 glass rounded-[3.5rem] border border-white/10 p-8 flex flex-col bg-slate-900/40 shadow-2xl relative overflow-hidden">
          <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Live_Intel_Ticker</h3>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
             {latestNews.map((news, i) => (
               <div key={news.id} className="group p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-accent/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                     <span className="text-[8px] font-mono text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">FLASH</span>
                     <span className="text-[8px] font-mono text-slate-600">{new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>
                  <h4 className="text-xs font-black text-white group-hover:text-accent transition-colors uppercase leading-tight">{news.title}</h4>
                  {news.sentiment && (
                     <div className={`mt-2 w-fit px-2 py-0.5 rounded-[4px] text-[7px] font-black border uppercase ${
                       news.sentiment === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                       news.sentiment === 'VOLATILE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                     }`}>
                       FLAG: {news.sentiment}
                     </div>
                  )}
               </div>
             ))}
             {latestNews.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6 py-20">
                  <span className="text-5xl animate-pulse">📡</span>
                  <p className="text-[10px] font-mono uppercase tracking-widest">Scanning bands for new signals...</p>
                </div>
             )}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest animate-pulse">Incoming: {latestNews.length} Active Feeds</span>
          </div>
        </div>
      </div>

      {/* Global Scrolling Ticker */}
      <div className="fixed bottom-0 left-64 right-0 h-14 bg-black/80 backdrop-blur-md border-t border-white/5 z-50 overflow-hidden flex items-center">
         <div className="px-6 border-r border-white/10 h-full flex items-center bg-accent/10">
            <span className="text-[10px] font-heading font-black text-accent uppercase tracking-widest">BREAKING</span>
         </div>
         <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-20 animate-ticker-infinite whitespace-nowrap px-10">
               {latestNews.map(news => (
                 <div key={news.id} className="flex items-center gap-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      news.sentiment === 'CRITICAL' ? 'bg-red-500' : news.sentiment === 'VOLATILE' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></span>
                    <span className="text-[10px] font-mono text-white uppercase font-bold">{news.title}</span>
                    <span className="text-[9px] font-mono text-slate-500">[{news.location || 'GLOBAL'}]</span>
                 </div>
               ))}
               {/* Duplicate for seamless scrolling */}
               {latestNews.map(news => (
                 <div key={`${news.id}-dup`} className="flex items-center gap-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      news.sentiment === 'CRITICAL' ? 'bg-red-500' : news.sentiment === 'VOLATILE' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></span>
                    <span className="text-[10px] font-mono text-white uppercase font-bold">{news.title}</span>
                    <span className="text-[9px] font-mono text-slate-500">[{news.location || 'GLOBAL'}]</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <style>{`
        @keyframes ticker-infinite {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-ticker-infinite {
          animation: ticker-infinite 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GlobalPulse;
