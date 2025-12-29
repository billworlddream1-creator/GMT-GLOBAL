
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceReport, IntelligenceSignal, DecodedSignal } from '../types';
import { playUISound } from '../utils/audioUtils';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IntelligenceTerminalProps {
  intelService: IntelligenceService;
}

const SYNC_INTERVAL_SECONDS = 30;

const WORLD_LANDMASSES = [
  "M-168,70 L-55,70 L-60,15 L-100,10 L-110,30 L-168,70", // N. America
  "M-80,10 L-35,10 L-40,-55 L-70,-55 L-80,10", // S. America
  "M-10,75 L170,75 L160,10 L100,10 L80,30 L40,10 L20,10 L-10,75", // Eurasia
  "M-20,35 L40,30 L50,-35 L10,-35 L-20,35", // Africa
  "M110,-10 L150,-10 L150,-40 L110,-40 L110,-10", // Australia
  "M-180,-80 L180,-80 L180,-90 L-180,-90 Z" // Antarctica
];

const GALAXY_SECTORS = [
  { id: 'SEC-ALPHA', name: 'Alpha Sector', x: -120, y: 40, size: 50 },
  { id: 'SEC-OMEGA', name: 'Omega Rift', x: 80, y: -20, size: 70 },
  { id: 'SEC-NEBULA', name: 'Cloud Cluster', x: -20, y: -60, size: 60 },
  { id: 'SEC-CORE', name: 'Galactic Core', x: 0, y: 0, size: 90 },
];

const RenderSignalNode = (props: any) => {
  const { cx, cy, fill, payload, isSelected } = props;
  if (!cx || !cy) return null;
  
  const isHigh = payload?.urgency === 'HIGH';
  const isVanishing = payload?.isVanishing;

  return (
    <g className={`signal-node-group ${isVanishing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
      <circle
        cx={cx}
        cy={cy}
        r={isHigh ? 16 : 10}
        fill="none"
        stroke={isVanishing ? '#94a3b8' : fill}
        strokeWidth={isSelected ? 3 : 1.5}
        className={isVanishing ? '' : 'animate-signal-ping'}
        opacity={isVanishing ? 0.3 : 1}
      />
      
      {isSelected && !isVanishing && (
        <g>
           <circle
            cx={cx}
            cy={cy}
            r={isHigh ? 24 : 18}
            fill="none"
            stroke="white"
            strokeWidth={1}
            strokeDasharray="4 4"
            className="animate-spin-slow opacity-60"
          />
          <path 
            d={`M${cx-30} ${cy} L${cx-15} ${cy} M${cx+30} ${cy} L${cx+15} ${cy} M${cx} ${cy-30} L${cx} ${cy-15} M${cx} ${cy+30} L${cx} ${cy+15}`} 
            stroke="white" 
            strokeWidth="1" 
            opacity="0.5" 
          />
        </g>
      )}
      
      <circle
        cx={cx}
        cy={cy}
        r={isHigh ? 7 : 5}
        fill={isSelected ? '#fff' : (isVanishing ? '#475569' : fill)}
        opacity={isVanishing ? 0.2 : 1}
        className={`${isVanishing ? '' : 'cursor-pointer transition-all duration-300 hover:scale-[1.75]'}`}
      />
    </g>
  );
};

export default function IntelligenceTerminal({ intelService }: IntelligenceTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [vanishingSignals, setVanishingSignals] = useState<(IntelligenceSignal & { vanishingAt: number })[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncProgress, setSyncProgress] = useState(0);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [activeSector, setActiveSector] = useState<string>('SEC-CORE');
  
  const [isDecoding, setIsDecoding] = useState(false);
  const [decryptedData, setDecryptedData] = useState<DecodedSignal | null>(null);
  const [showDecodeModal, setShowDecodeModal] = useState(false);

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('gmt_intel_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const isRefreshingRef = useRef(false);

  const fetchSignals = useCallback(async (silent = false) => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await intelService.getSatelliteSignals();
      
      setSignals(prevSignals => {
        const removed = prevSignals.filter(oldSig => !data.find(newSig => newSig.id === oldSig.id));
        if (removed.length > 0) {
          setVanishingSignals(v => [
            ...v, 
            ...removed.map(r => ({ ...r, vanishingAt: Date.now() }))
          ]);
        }
        return data;
      });

      setLastSync(new Date());
      setSyncProgress(0);
      
      if (silent && data.length > 0) {
        playUISound('success');
      }
    } catch (err) {
      console.error("Satellite uplink failure", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isRefreshingRef.current = false;
    }
  }, [intelService]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setVanishingSignals(prev => prev.filter(s => now - s.vanishingAt < 2500));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setIsDeepScanning(true);
    setShowHistory(false);
    playUISound('startup');

    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== query.toLowerCase());
      const next = [query, ...filtered].slice(0, 10);
      localStorage.setItem('gmt_intel_history', JSON.stringify(next));
      return next;
    });

    try {
      const dossiers = await intelService.generateIntelligenceDossiers(query);
      setReports(dossiers);
      await fetchSignals(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsDeepScanning(false);
    }
  };

  const handleDecryptSignal = async () => {
    if (!selectedSignal) return;
    
    setIsDecoding(true);
    setShowDecodeModal(true);
    playUISound('startup');
    
    try {
      const cipher = `[SGNL_ID:${selectedSignal.id}] [LOC:${selectedSignal.location}] [DESC:${selectedSignal.description}]`;
      const result = await intelService.decodeEncryptedSignal(cipher);
      setDecryptedData(result);
      playUISound('success');
    } catch (err) {
      console.error("Neural decryption failed", err);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 360 - 180;
      const y = (1 - (e.clientY - rect.top) / rect.height) * 180 - 90;
      setMouseCoords({ x: Math.round(x), y: Math.round(y) });
    }
  };

  useEffect(() => {
    handleSearch("Global Security");
    fetchSignals();

    const syncInterval = setInterval(() => {
      fetchSignals(true);
    }, SYNC_INTERVAL_SECONDS * 1000);

    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        const next = prev + (100 / (SYNC_INTERVAL_SECONDS * 10));
        return next >= 100 ? 100 : next;
      });
    }, 100);

    return () => {
      clearInterval(syncInterval);
      clearInterval(progressInterval);
    };
  }, [fetchSignals]);

  const mapData = useMemo(() => {
    const activeData = signals.map(sig => ({
      x: sig.lng,
      y: sig.lat,
      z: sig.urgency === 'HIGH' ? 100 : sig.urgency === 'MEDIUM' ? 60 : 30,
      isVanishing: false,
      ...sig
    }));

    const ghostData = vanishingSignals.map(sig => ({
      x: sig.lng,
      y: sig.lat,
      z: sig.urgency === 'HIGH' ? 80 : sig.urgency === 'MEDIUM' ? 40 : 20,
      isVanishing: true,
      ...sig
    }));

    return [...activeData, ...ghostData];
  }, [signals, vanishingSignals]);

  const handleSignalClick = (data: any) => {
    if (data && data.payload && !data.payload.isVanishing) {
      setSelectedSignal(data.payload);
      setDecryptedData(null);
      playUISound('click');
    }
  };

  const threatVisuals = useMemo(() => (level: string) => {
    switch (level) {
      case 'SEVERE': 
        return { text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10', solid: 'bg-red-600', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]', icon: '💀', status: 'CRITICAL' };
      case 'ELEVATED': 
        return { text: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10', solid: 'bg-amber-500', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]', icon: '⚡', status: 'UNSTABLE' };
      default: 
        return { text: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', solid: 'bg-emerald-500', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]', icon: '🛡️', status: 'SECURE' };
    }
  }, []);

  return (
    <div className="flex flex-col h-full space-y-10 animate-in fade-in duration-700 pb-32">
      {showDecodeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => !isDecoding && setShowDecodeModal(false)}></div>
           <div className="relative w-full max-w-2xl glass p-10 rounded-[3rem] border border-white/20 shadow-[0_0_100px_rgba(59,130,246,0.2)] bg-slate-900/40 backdrop-blur-2xl animate-in zoom-in-95 duration-500 flex flex-col space-y-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                 <div className={`h-full bg-accent transition-all duration-300 ${isDecoding ? 'animate-ticker' : 'w-full'}`} style={{ width: isDecoding ? '40%' : '100%' }}></div>
              </div>
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">Decoding Message</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                       {isDecoding ? 'Unlocking data packets...' : 'Unlock complete'}
                    </p>
                 </div>
                 {!isDecoding && (
                   <button onClick={() => setShowDecodeModal(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
                 )}
              </div>
              <div className="flex-1 space-y-8 min-h-[300px]">
                 {isDecoding ? (
                   <div className="flex flex-col items-center justify-center h-full space-y-6">
                      <div className="relative w-24 h-24">
                         <div className="absolute inset-0 border-2 border-accent/20 rounded-full"></div>
                         <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                         <div className="absolute inset-4 border border-accent/40 rounded-full animate-pulse flex items-center justify-center">
                            <span className="text-[10px] font-mono text-accent">90%</span>
                         </div>
                      </div>
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">Running protocols...</p>
                   </div>
                 ) : decryptedData && (
                   <div className="space-y-8 animate-in fade-in duration-700">
                      <div className="glass p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] block mb-4">Decoded Content</span>
                         <p className="text-sm font-mono text-white leading-relaxed italic">"{decryptedData.decrypted}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="glass p-5 rounded-2xl border border-white/10 bg-white/5">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Source</span>
                            <span className="text-[10px] font-mono text-accent font-black">{decryptedData.origin}</span>
                         </div>
                         <div className="glass p-5 rounded-2xl border border-white/10 bg-white/5">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Message ID</span>
                            <span className="text-[10px] font-mono text-accent font-black">{decryptedData.id}</span>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
              {!isDecoding && (
                <button onClick={() => setShowDecodeModal(false)} className="w-full py-5 bg-accent text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(59,130,246,0.3)]">Close Report</button>
              )}
           </div>
        </div>
      )}

      <div className="glass p-10 rounded-[3.5rem] border border-white/20 shadow-2xl space-y-10 bg-white/5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-end relative z-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">World Intel</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">Real-time world news and map</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
               <span className="text-[10px] font-mono text-accent font-black uppercase tracking-widest">{isDeepScanning ? 'Searching...' : 'Connected'}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">Sync: {lastSync.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="relative flex-1 group">
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-accent text-xl">📡</div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              placeholder="Search world intelligence..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl pl-20 pr-16 py-6 text-sm font-mono text-white placeholder:text-slate-600 focus:border-accent transition-all outline-none shadow-inner backdrop-blur-sm"
            />
          </div>
          <button onClick={() => handleSearch(searchTerm)} disabled={loading} className="px-14 py-6 bg-accent/80 hover:bg-accent text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all">Scan Now</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 glass rounded-[3.5rem] border border-white/20 p-10 h-[650px] relative overflow-hidden group bg-black/40 shadow-2xl backdrop-blur-md" ref={mapRef} onMouseMove={handleMouseMove}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 z-20">
             <div className="h-full bg-accent transition-all duration-300 ease-linear shadow-[0_0_25px_var(--accent-primary)]" style={{ width: `${syncProgress}%` }}></div>
          </div>
          
          <div className="absolute inset-0 opacity-40 pointer-events-none z-0 overflow-hidden">
             <svg width="100%" height="100%" viewBox="-180 -90 360 180" preserveAspectRatio="xMidYMid slice">
               <defs>
                 <filter id="nebula-glow">
                   <feGaussianBlur stdDeviation="5" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
                 <radialGradient id="nebula-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                 </radialGradient>
               </defs>
               
               {[...Array(50)].map((_, i) => (
                 <circle key={i} cx={Math.random() * 360 - 180} cy={Math.random() * 180 - 90} r={Math.random() * 0.5} fill="#fff" opacity={Math.random()} />
               ))}

               {GALAXY_SECTORS.map((sec) => (
                 <g key={sec.id} opacity={activeSector === sec.id ? 0.6 : 0.2} className="transition-opacity duration-1000">
                    <circle cx={sec.x} cy={sec.y} r={sec.size} fill="url(#nebula-grad)" filter="url(#nebula-glow)" />
                    <text x={sec.x} y={sec.y + sec.size + 5} fill="white" fontSize="4" fontStyle="italic" textAnchor="middle" opacity="0.5">{sec.name}</text>
                 </g>
               ))}

               {WORLD_LANDMASSES.map((path, i) => (
                 <path key={i} d={path} fill="none" stroke="var(--accent-primary)" strokeWidth="0.4" opacity="0.15" strokeDasharray="2,2"/>
               ))}
             </svg>
          </div>

          <div className="absolute top-10 left-10 z-10 flex flex-col gap-3">
            <div className="flex items-center gap-5">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-accent animate-pulse"></span>
                Galaxy Navigation
              </h3>
              <button onClick={() => fetchSignals(true)} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-[9px] font-mono font-black uppercase tracking-widest hover:bg-accent transition-all">Refresh</button>
            </div>
            <div className="flex gap-4">
              {GALAXY_SECTORS.map(sec => (
                <button 
                  key={sec.id}
                  onClick={() => { setActiveSector(sec.id); playUISound('click'); }}
                  className={`text-[8px] font-mono px-3 py-1 rounded border transition-all ${activeSector === sec.id ? 'bg-accent/40 border-accent text-white' : 'border-white/10 text-slate-500'}`}
                >
                  {sec.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 left-10 z-30 font-mono text-[9px] text-accent/60 bg-black/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div>CURSOR_POS: X[{mouseCoords.x}] Y[{mouseCoords.y}]</div>
            <div>SECTOR_STATUS: {activeSector.replace('SEC-', '')}_OPERATIONAL</div>
          </div>

          <div className="w-full h-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
                <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                <ZAxis type="number" dataKey="z" range={[150, 600]} />
                <Tooltip cursor={{ strokeDasharray: '4 4' }} content={() => null} />
                <Scatter 
                    name="Signals" 
                    data={mapData} 
                    onClick={handleSignalClick} 
                    shape={<RenderSignalNode isSelected={selectedSignal?.id} />}
                >
                  {mapData.map((entry) => (
                    <Cell 
                        key={`cell-${entry.id}`} 
                        fill={entry.urgency === 'HIGH' ? '#ef4444' : 'var(--accent-primary)'}
                        {...{isSelected: selectedSignal?.id === entry.id}}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[3.5rem] border border-white/20 p-10 flex flex-col bg-slate-900/40 h-[650px] shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex-1 space-y-8 overflow-hidden flex flex-col relative z-10">
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/10 pb-6">Item Details</h3>
            <div className="flex-1 flex flex-col min-h-0">
               {selectedSignal ? (
                 <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                    <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border w-fit ${selectedSignal.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                      {selectedSignal.urgency} Priority
                    </span>
                    <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-tight">{selectedSignal.location}</h4>
                    <div className="flex-1 overflow-y-auto no-scrollbar glass p-6 rounded-[2rem] border border-white/20 italic bg-white/5">
                       <p className="text-xs font-mono text-slate-300 leading-relaxed">"{selectedSignal.description || 'No information available.'}"</p>
                    </div>
                    <button onClick={handleDecryptSignal} className="w-full py-5 bg-white/5 hover:bg-accent border border-white/20 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Decode Message</button>
                    <button onClick={() => setSelectedSignal(null)} className="text-[9px] font-mono text-slate-600 hover:text-white uppercase font-black text-center py-2">Clear</button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <p className="text-sm font-heading font-black text-white uppercase tracking-widest">Select an item</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">Click a dot on the galaxy map to view detailed intel reports.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="glass h-[400px] rounded-[3.5rem] border border-white/20 animate-pulse bg-white/5"></div>)
        ) : reports.map((report, idx) => {
            const visuals = threatVisuals(report.threatLevel);
            return (
              <div key={idx} className={`group glass p-12 pl-20 rounded-[3.5rem] border border-white/20 ${visuals.glow} transition-all duration-700 flex flex-col space-y-8 relative overflow-hidden bg-white/5 backdrop-blur-md`}>
                <div className={`absolute top-0 left-0 w-3.5 h-full ${visuals.solid} opacity-60`}></div>
                <span className={`absolute top-10 right-10 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${visuals.text} ${visuals.border} ${visuals.bg}`}>{visuals.status}</span>
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <span className="text-4xl mt-1">{visuals.icon}</span>
                    <h3 className="text-3xl font-heading font-black text-white uppercase leading-[1.05] tracking-tighter">{report.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed glass p-6 rounded-[2rem] border border-white/20 bg-white/5">{report.summary}</p>
                </div>
                <div className="flex-1 space-y-6">
                  <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">Key Points</h4>
                  <ul className="space-y-4">
                    {report.keyInsights.map((insight, i) => (
                      <li key={i} className="flex gap-5 text-[11px] font-mono text-slate-300 items-start">
                        <span className={`${visuals.text} font-black`}>{i + 1}.</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
      </div>

      <style>{`
        @keyframes signal-ping {
          0% { transform: scale(1); opacity: 0.9; stroke-width: 2.5; }
          100% { transform: scale(4.5); opacity: 0; stroke-width: 0.5; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-signal-ping {
          animation: signal-ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          transform-origin: center;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
