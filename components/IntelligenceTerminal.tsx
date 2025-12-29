
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceReport, IntelligenceSignal } from '../types';
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

const RenderSignalNode = (props: any) => {
  const { cx, cy, fill, payload, isSelected } = props;
  if (!cx || !cy) return null;
  const isHigh = payload?.urgency === 'HIGH';

  return (
    <g className="signal-node-group">
      <circle
        cx={cx}
        cy={cy}
        r={isHigh ? 16 : 10}
        fill="none"
        stroke={fill}
        strokeWidth={isSelected ? 3 : 1.5}
        className="animate-signal-ping"
      />
      {isSelected && (
        <g className="animate-in zoom-in duration-500">
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
        fill={isSelected ? '#fff' : fill}
        className="cursor-pointer transition-all duration-300 hover:scale-[1.75] filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      />
    </g>
  );
};

const IntelligenceTerminal: React.FC<IntelligenceTerminalProps> = ({ intelService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [signalLog, setSignalLog] = useState<{timestamp: string, location: string, urgency: string, id: string}[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncProgress, setSyncProgress] = useState(0);
  
  // History State
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('gmt_intel_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const isRefreshingRef = useRef(false);

  const fetchSignals = useCallback(async (silent = false) => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await intelService.getSatelliteSignals();
      setSignals(data);
      setLastSync(new Date());
      setSyncProgress(0);
      
      const newLogs = data.map(s => ({
        id: s.id + '-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        location: s.location,
        urgency: s.urgency
      }));
      
      setSignalLog(prev => [...newLogs, ...prev].slice(0, 30));
      
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setIsDeepScanning(true);
    setShowHistory(false);
    playUISound('startup');

    // Update History
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

  const handleManualRefresh = () => {
    playUISound('click');
    fetchSignals(true);
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

    // Close history on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(syncInterval);
      clearInterval(progressInterval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchSignals]);

  const mapData = useMemo(() => {
    return signals.map(sig => ({
      x: sig.lng,
      y: sig.lat,
      z: sig.urgency === 'HIGH' ? 100 : sig.urgency === 'MEDIUM' ? 60 : 30,
      ...sig
    }));
  }, [signals]);

  const handleSignalClick = (data: any) => {
    if (data && data.payload) {
      setSelectedSignal(data.payload);
      playUISound('click');
    }
  };

  const getThreatVisuals = (level: string) => {
    switch (level) {
      case 'SEVERE': 
        return { text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10', solid: 'bg-red-600', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]', icon: '💀', status: 'CRITICAL', intensity: 100 };
      case 'ELEVATED': 
        return { text: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10', solid: 'bg-amber-500', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]', icon: '⚡', status: 'UNSTABLE', intensity: 65 };
      default: 
        return { text: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', solid: 'bg-emerald-500', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]', icon: '🛡️', status: 'SECURE', intensity: 25 };
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('gmt_intel_history');
    playUISound('alert');
  };

  return (
    <div className="flex flex-col h-full space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-end relative z-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none glitch-text" data-text="GMT_INTEL: GRID_CONTROL">GMT_INTEL: GRID_CONTROL</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">REALTIME_SATELLITE_ORBITAL_STREAM // v5.0.0-PRO</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
               <span className="text-[10px] font-mono text-accent font-black uppercase tracking-widest block">
                 {isDeepScanning ? 'SCANNING_NEURAL_NODES...' : 'ENCRYPTED_UPLINK_STABLE'}
               </span>
            </div>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">
              Last_Sync: {lastSync.toLocaleTimeString()} | Next Auto-Sync: {Math.max(0, Math.ceil(SYNC_INTERVAL_SECONDS * (1 - syncProgress / 100)))}s
            </span>
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
              placeholder="SEARCH_GLOBAL_INTELLIGENCE_DATABASE..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl pl-20 pr-16 py-6 text-sm font-mono text-white placeholder:text-slate-600 focus:border-accent transition-all outline-none shadow-inner"
            />
            
            {/* History Toggle Button */}
            <button 
              onClick={() => { setShowHistory(!showHistory); playUISound('click'); }}
              className={`absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showHistory ? 'bg-accent text-white shadow-accent' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
              title="View Neural Query History"
            >
              <span className="text-lg">🕒</span>
            </button>

            {/* History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div 
                ref={historyRef}
                className="absolute top-full left-0 right-0 mt-4 z-[100] glass rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500"
              >
                <div className="bg-black/60 px-8 py-4 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">NEURAL_QUERY_ARCHIVE</span>
                  <button 
                    onClick={clearHistory}
                    className="text-[9px] font-mono text-red-500 hover:text-red-400 uppercase tracking-widest font-black"
                  >
                    PURGE_ARCHIVE
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                  {searchHistory.map((query, i) => (
                    <button 
                      key={i}
                      onClick={() => { setSearchTerm(query); handleSearch(query); }}
                      className="w-full text-left px-10 py-4 text-xs font-mono text-slate-300 hover:text-white hover:bg-accent/10 transition-all flex items-center justify-between group border-l-4 border-transparent hover:border-accent"
                    >
                      <span className="truncate">{query}</span>
                      <span className="text-[8px] text-accent font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Execute_Scan</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => handleSearch(searchTerm)}
            disabled={loading}
            className="px-14 py-6 bg-accent hover:opacity-80 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ANALYZING...
              </>
            ) : 'DEEP_SCAN'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 glass rounded-[3.5rem] border border-white/5 p-10 h-[650px] relative overflow-hidden group bg-[#020617] shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 z-20">
             <div 
               className="h-full bg-accent transition-all duration-300 ease-linear shadow-[0_0_25px_var(--accent-primary)]" 
               style={{ width: `${syncProgress}%` }}
             ></div>
          </div>
          <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
             <svg width="100%" height="100%" viewBox="-180 -90 360 180" preserveAspectRatio="xMidYMid meet">
               <defs>
                 <pattern id="grid-dots-tactical-v2" width="20" height="20" patternUnits="userSpaceOnUse">
                   <circle cx="1" cy="1" r="0.6" fill="var(--accent-primary)" opacity="0.4"/>
                 </pattern>
               </defs>
               <rect x="-180" y="-90" width="360" height="180" fill="url(#grid-dots-tactical-v2)" />
               {WORLD_LANDMASSES.map((path, i) => (
                 <path key={i} d={path} fill="none" stroke="var(--accent-primary)" strokeWidth="0.6" opacity="0.2" strokeDasharray="3,3"/>
               ))}
               <line x1="-180" y1="0" x2="180" y2="0" stroke="var(--accent-primary)" strokeWidth="0.4" opacity="0.15" />
             </svg>
          </div>
          <div className="absolute top-10 left-10 z-10 flex flex-col gap-3">
            <div className="flex items-center gap-5">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-accent animate-pulse"></span>
                TACTICAL_GEOSPATIAL_GRID
              </h3>
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-mono font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl ${isRefreshing ? 'animate-pulse opacity-50' : ''}`}
              >
                <span>{isRefreshing ? '🔄' : '↻'}</span>
                <span>FORCED_SYNC</span>
              </button>
            </div>
            <div className="flex gap-6">
               <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Grid_Resolution: 0.05°</span>
               <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Live_Nodes: {signals.length}</span>
               <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black animate-pulse">Bandwidth: 1.2GBPS</span>
            </div>
          </div>
          <div className="w-full h-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
                <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                <ZAxis type="number" dataKey="z" range={[150, 600]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '4 4', stroke: 'var(--accent-primary)', strokeWidth: 1 }}
                  content={() => null} 
                />
                <Scatter 
                  name="Intelligence Signals" 
                  data={mapData} 
                  onClick={handleSignalClick}
                  shape={(props: any) => (
                    <RenderSignalNode 
                      {...props} 
                      isSelected={selectedSignal?.id === props.payload.id} 
                    />
                  )}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {mapData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.urgency === 'HIGH' ? '#ef4444' : 'var(--accent-primary)'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-10 left-10 z-10 font-mono text-[9px] text-slate-600 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 uppercase tracking-widest flex gap-4">
             <div>X_LNG: {selectedSignal ? selectedSignal.lng.toFixed(4) : '--.----'}</div>
             <div>Y_LAT: {selectedSignal ? selectedSignal.lat.toFixed(4) : '--.----'}</div>
          </div>
        </div>

        <div className="glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-900/20 h-[650px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
          <div className="flex-1 space-y-8 overflow-hidden flex flex-col relative z-10">
            <div className="border-b border-white/5 pb-6">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex justify-between items-center">
                SIGNAL_INSPECTOR
                <span className="flex items-center gap-2 text-emerald-500 animate-pulse text-[9px] font-mono font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  SCANNING
                </span>
              </h3>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
               {selectedSignal ? (
                 <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-right-6 duration-700">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${selectedSignal.urgency === 'HIGH' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-blue-500/20 text-blue-500 border border-blue-500/20'}`}>
                          {selectedSignal.urgency}_PRIORITY
                        </span>
                        <span className="text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest">ID: {selectedSignal.id.split('-').pop()}</span>
                      </div>
                      <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-tight mt-4 drop-shadow-lg">
                        {selectedSignal.location.toUpperCase()}
                      </h4>
                      <p className="text-[10px] font-mono text-accent uppercase font-black tracking-widest">{selectedSignal.type.replace('_', ' ')}</p>
                    </div>
                    <div className="glass p-6 rounded-3xl border border-white/10 bg-black/60 shadow-inner">
                       <span className="text-[9px] font-mono text-slate-500 uppercase block mb-4 tracking-widest font-black">PRECISE_TELEMETRY</span>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                            <span className="text-[8px] font-mono text-slate-600 uppercase block font-black mb-1">LATITUDE</span>
                            <span className="text-xs font-mono text-white font-black tabular-nums">{selectedSignal.lat.toFixed(6)}°</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-slate-600 uppercase block font-black mb-1">LONGITUDE</span>
                            <span className="text-xs font-mono text-white font-black tabular-nums">{selectedSignal.lng.toFixed(6)}°</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                       <span className="text-[9px] font-mono text-slate-500 uppercase block mb-4 tracking-widest font-black">INTEL_BRIEFING</span>
                       <p className="text-xs font-mono text-slate-300 leading-relaxed bg-white/5 p-6 rounded-[2rem] border border-white/5 italic shadow-inner">
                         "{selectedSignal.description}"
                       </p>
                    </div>
                    {selectedSignal.groundingUri && (
                      <div className="pt-6 border-t border-white/5">
                        <a 
                          href={selectedSignal.groundingUri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full flex items-center justify-center gap-3 py-5 bg-accent hover:bg-white hover:text-accent text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(59,130,246,0.2)] group"
                        >
                          <span>VERIFY_VIA_UPLINK</span>
                          <span className="group-hover:translate-x-2 transition-transform">→</span>
                        </a>
                      </div>
                    )}
                    <button 
                      onClick={() => { setSelectedSignal(null); playUISound('click'); }}
                      className="text-[9px] font-mono text-slate-600 hover:text-white uppercase tracking-widest font-black transition-colors text-center w-full py-3 hover:bg-white/5 rounded-xl"
                    >
                      TERMINATE_SELECTION
                    </button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                    <div className="w-24 h-24 border-2 border-white/10 rounded-full flex items-center justify-center relative shadow-2xl">
                       <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin-slow"></div>
                       <span className="text-4xl">🛰️</span>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm font-heading font-black text-white uppercase tracking-widest">Awaiting_Target</p>
                       <p className="text-[10px] font-mono text-slate-400 max-w-[200px] mx-auto uppercase tracking-widest leading-relaxed">Select an active node on the tactical grid to inspect signal telemetry and intel briefs.</p>
                    </div>
                 </div>
               )}
            </div>
            <div className="pt-6 border-t border-white/5 h-28 overflow-y-auto no-scrollbar space-y-2">
               {signalLog.slice(0, 6).map(log => (
                 <div key={log.id} className="text-[9px] font-mono flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5 opacity-60 hover:opacity-100 transition-opacity cursor-default group">
                    <span className="text-slate-500 font-bold">[{log.timestamp.split(':').slice(0, 2).join(':')}]</span>
                    <span className="text-white truncate mx-4 font-black group-hover:text-accent transition-colors">{log.location.toUpperCase()}</span>
                    <span className={log.urgency === 'HIGH' ? 'text-red-500' : 'text-blue-400'}>{log.urgency[0]}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass h-[400px] rounded-[3.5rem] border border-white/5 skeleton"></div>
          ))
        ) : reports.length > 0 ? (
          reports.map((report, idx) => {
            const visuals = getThreatVisuals(report.threatLevel);
            return (
              <div key={idx} className={`group glass p-12 pl-20 rounded-[3.5rem] border border-white/5 ${visuals.glow} transition-all duration-700 flex flex-col space-y-8 relative overflow-hidden bg-slate-900/10`}>
                <div className={`absolute top-0 left-0 w-3.5 h-full ${visuals.solid} opacity-70 shadow-2xl`}>
                  <div className="absolute top-0 left-0 w-full h-1/4 bg-white/50 animate-[scanning_4s_linear_infinite]"></div>
                </div>
                <div className="absolute top-0 right-0 p-10 flex items-center gap-4">
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${visuals.text} ${visuals.border} ${visuals.bg} flex items-center gap-3 shadow-xl`}>
                    <span className={`w-2 h-2 rounded-full ${visuals.solid} animate-pulse`}></span>
                    {visuals.status}
                  </span>
                </div>
                <div className="space-y-6">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center justify-between font-black">
                    <span>DOSSIER_REF: GMT-{idx + 7000}</span>
                    <span className={`${visuals.text} uppercase`}>{report.threatLevel} PRIORITY</span>
                  </div>
                  <div className="flex items-start gap-6">
                    <span className="text-4xl mt-1 drop-shadow-2xl">{visuals.icon}</span>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-3xl font-heading font-black text-white group-hover:text-accent transition-colors uppercase leading-[1.05] tracking-tighter">{report.title}</h3>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 mt-4">
                        <div 
                          className={`h-full ${visuals.solid} transition-all duration-[3s] ease-out shadow-[0_0_20px_${visuals.solid}]`} 
                          style={{ width: `${visuals.intensity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed bg-black/40 p-6 rounded-[2rem] border border-white/5 italic shadow-inner">
                    {report.summary}
                  </p>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-4 ${visuals.solid}`}></div>
                    <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">NEURAL_INSIGHTS</h4>
                  </div>
                  <ul className="space-y-4">
                    {report.keyInsights.map((insight, i) => (
                      <li key={i} className="flex gap-5 text-[11px] font-mono text-slate-300 items-start group/li">
                        <span className={`${visuals.text} font-black bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center border border-white/5`}>{i + 1}</span>
                        <span className="leading-relaxed group-hover/li:text-white transition-colors">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="flex gap-4">
                    {report.groundingSources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition-all underline decoration-accent/40 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-accent/10">SOURCE_{i+1}</a>
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-widest font-black">TIMESTAMP</span>
                    <span className="text-xs font-mono text-white font-black tracking-tighter">{new Date(report.lastUpdated).toLocaleTimeString()} GMT</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-52 text-center space-y-8 opacity-25">
            <div className="text-8xl text-slate-700 animate-pulse">📂</div>
            <p className="text-xs font-mono uppercase tracking-[0.6em] font-black">Neural Archives Awaiting Command</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanning {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(600%); opacity: 0; }
        }
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
        .glitch-text {
          position: relative;
        }
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          left: 2px;
          text-shadow: -1px 0 #ff00c1;
          top: 0;
          color: white;
          background: transparent;
          overflow: hidden;
          clip: rect(0, 900px, 0, 0);
          animation: noise-anim 2s infinite linear alternate-reverse;
        }
        @keyframes noise-anim {
          0% { clip: rect(10px, 9999px, 50px, 0); }
          50% { clip: rect(80px, 9999px, 10px, 0); }
          100% { clip: rect(30px, 9999px, 90px, 0); }
        }
      `}</style>
    </div>
  );
};

export default IntelligenceTerminal;
