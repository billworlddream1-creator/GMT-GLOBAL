
import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceReport, IntelligenceSignal, DecodedSignal, VulnerabilityReport } from '../types';
import { playUISound } from '../utils/audioUtils';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface IntelligenceTerminalProps {
  intelService: IntelligenceService;
}

const SYNC_INTERVAL_SECONDS = 300; // Increased from 30s to 5m to prevent 429 quota exhaustion

type DisplayItem = 
  | (IntelligenceSignal & { kind: 'SIGNAL' }) 
  | (IntelligenceReport & { kind: 'REPORT' });

const RenderSignalNode = memo((props: any) => {
  const { cx, cy, fill, payload, selectedId } = props;
  if (!cx || !cy) return null;
  
  const isHigh = payload?.urgency === 'HIGH';
  const isReport = payload?.kind === 'REPORT';
  const isActive = selectedId && selectedId === payload?.id;

  return (
    <g className="signal-node-group cursor-pointer">
      {isReport ? (
        // Diamond Shape for Reports
        <rect 
          x={cx - (isActive ? 12 : 8)} 
          y={cy - (isActive ? 12 : 8)} 
          width={isActive ? 24 : 16} 
          height={isActive ? 24 : 16} 
          fill={isActive ? '#fff' : '#f59e0b'} 
          transform={`rotate(45, ${cx}, ${cy})`}
          opacity={0.9}
          className="transition-all duration-300"
        />
      ) : (
        // Circle Shape for Signals
        <>
          <circle
            cx={cx}
            cy={cy}
            r={isHigh ? 20 : 14}
            fill="none"
            stroke={fill}
            strokeWidth={1}
            className="animate-signal-pulse-outer"
            opacity={0.6}
          />
          <circle
            cx={cx}
            cy={cy}
            r={isHigh ? 6 : 4}
            fill={isActive ? '#fff' : fill}
            opacity={1}
          />
        </>
      )}
      {isActive && (
        <circle cx={cx} cy={cy} r={isHigh || isReport ? 30 : 22} fill="none" stroke="white" strokeWidth={1} strokeDasharray="2 6" className="animate-spin-slow" />
      )}
    </g>
  );
});

export default function IntelligenceTerminal({ intelService }: IntelligenceTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [reports, setReports] = useState<IntelligenceReport[]>([]);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const fetchSignals = useCallback(async () => {
    // Only auto-sync signals if user is not actively searching static reports
    if (activeSearch) return; 
    try {
      const data = await intelService.getSatelliteSignals();
      setSignals(Array.isArray(data) ? data : []);
      setSyncProgress(0);
    } catch (err) {
      console.error("Signal intercept failure", err);
    }
  }, [intelService, activeSearch]);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(() => fetchSignals(), SYNC_INTERVAL_SECONDS * 1000);
    const pInterval = setInterval(() => setSyncProgress(prev => Math.min(100, prev + 1)), SYNC_INTERVAL_SECONDS * 10);
    return () => { clearInterval(interval); clearInterval(pInterval); };
  }, [fetchSignals]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      clearSearch();
      return;
    }
    
    setLoading(true);
    setActiveSearch(searchTerm);
    playUISound('startup');
    
    try {
      // 1. Fetch new dossiers based on search
      const generatedReports = await intelService.generateIntelligenceDossiers(searchTerm);
      setReports(generatedReports);
      
      // 2. Play success sound if anything found
      if (generatedReports.length > 0) {
        playUISound('success');
      } else {
        playUISound('alert'); // No results
      }
    } catch (e) {
      playUISound('alert');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setReports([]);
    setSelectedItem(null);
    playUISound('click');
    fetchSignals(); // Resume normal feed
  };

  const mapData = useMemo(() => {
    // 1. Filter existing signals based on search term
    const filteredSignals = activeSearch 
      ? signals.filter(s => 
          s.location.toLowerCase().includes(activeSearch.toLowerCase()) || 
          s.description.toLowerCase().includes(activeSearch.toLowerCase())
        )
      : signals;

    // 2. Map Signals
    const mappedSignals: DisplayItem[] = filteredSignals.map(sig => ({
      ...sig,
      kind: 'SIGNAL',
      x: Number(sig.lng) || 0,
      y: Number(sig.lat) || 0,
      z: sig.urgency === 'HIGH' ? 100 : 30,
      fill: sig.urgency === 'HIGH' ? '#ef4444' : sig.urgency === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
    }));

    // 3. Map Reports
    const mappedReports: DisplayItem[] = reports.map(rep => ({
      ...rep,
      kind: 'REPORT',
      x: Number(rep.lng) || (Math.random() * 360 - 180), // Fallback if AI fails to geolocate
      y: Number(rep.lat) || (Math.random() * 180 - 90),
      z: 200, // Higher priority Z-index visually
      fill: '#f59e0b', // Amber for dossiers
      urgency: 'HIGH' // Reports are implicitly interesting
    }));

    return [...mappedSignals, ...mappedReports];
  }, [signals, reports, activeSearch]);

  const handlePointClick = useCallback((e: any) => {
    if (e && e.payload) {
      setSelectedItem(e.payload);
      playUISound('click');
    }
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Header & Search */}
      <div className="glass p-10 rounded-[3.5rem] border border-white/20 bg-white/5 space-y-8 relative overflow-hidden backdrop-blur-md">
        <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">Intelligence Terminal</h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search tactical dossiers & signals..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-sm font-mono text-white outline-none focus:border-accent pl-12"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            {activeSearch && (
              <button 
                onClick={clearSearch} 
                className="absolute right-5 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white font-mono uppercase transition-all"
              >
                Clear
              </button>
            )}
          </div>
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            className="px-12 py-6 bg-accent hover:bg-accent/80 transition-all text-white font-heading font-black uppercase rounded-3xl disabled:opacity-50 shadow-xl"
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Map View */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/20 p-8 h-[550px] relative overflow-hidden bg-black/40 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
             <div className="h-full bg-accent transition-all duration-300 shadow-[0_0_15px_var(--accent-primary)]" style={{ width: `${activeSearch ? 100 : syncProgress}%` }}></div>
          </div>
          
          <div className="absolute top-6 left-8 z-20 text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
             Mode: {activeSearch ? 'ACTIVE_SEARCH_INTERCEPT' : 'PASSIVE_SATELLITE_MONITOR'} // Targets: {mapData.length}
          </div>

          <div className="w-full h-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const isReport = item.kind === 'REPORT';
                      return (
                        <div className={`glass p-4 rounded-2xl border ${isReport ? 'border-amber-500/30' : 'border-white/20'} bg-slate-950/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                          <p className={`text-[10px] font-heading font-black uppercase mb-1 ${isReport ? 'text-amber-400' : 'text-white'}`}>
                            {isReport ? 'DOSSIER_FILE' : 'SIGNAL_INTERCEPT'}
                          </p>
                          <p className="text-[9px] font-mono text-slate-300 uppercase max-w-[200px] truncate">
                            {isReport ? item.title : item.location}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={mapData} 
                  onClick={handlePointClick} 
                  shape={<RenderSignalNode selectedId={selectedItem?.id} />} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 flex-1 flex flex-col shadow-xl">
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6 flex justify-between items-center">
              <span>{selectedItem?.kind === 'REPORT' ? 'Dossier_Details' : 'Signal_Details'}</span>
              {selectedItem && (
                <span className={`px-2 py-0.5 rounded text-[7px] font-black ${selectedItem.kind === 'REPORT' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {selectedItem.kind}
                </span>
              )}
            </h3>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {selectedItem ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  {selectedItem.kind === 'SIGNAL' ? (
                    // Signal View
                    <>
                      <div className={`px-3 py-1.5 rounded-xl border w-fit text-[9px] font-mono font-black ${selectedItem.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {selectedItem.urgency} PRIORITY
                      </div>
                      <h4 className="text-xl font-heading font-black text-white uppercase tracking-tight">{selectedItem.location}</h4>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 italic">
                        <p className="text-[11px] font-mono text-slate-400">"{selectedItem.description}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-500 uppercase">
                         <div>LAT: {selectedItem.lat.toFixed(4)}</div>
                         <div>LNG: {selectedItem.lng.toFixed(4)}</div>
                      </div>
                    </>
                  ) : (
                    // Report View
                    <>
                      <h4 className="text-xl font-heading font-black text-amber-400 uppercase tracking-tight leading-tight">{selectedItem.title}</h4>
                      <div className="p-4 bg-amber-950/10 border border-amber-500/10 rounded-2xl">
                        <span className="text-[7px] font-black text-amber-600 uppercase tracking-widest block mb-2">Executive_Summary</span>
                        <p className="text-[10px] font-mono text-slate-300 leading-relaxed">{selectedItem.summary}</p>
                      </div>
                      
                      <div className="space-y-2">
                         <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Details</span>
                         <p className="text-[9px] font-mono text-slate-400 leading-relaxed">{selectedItem.details}</p>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Tactical_Recommendation</span>
                         <p className="text-[9px] font-mono text-white leading-relaxed">{selectedItem.recommendation}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                  <span className="text-4xl">📡</span>
                  <p className="text-[10px] font-mono uppercase tracking-widest">Select a node to interrogate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes signal-pulse-outer {
          0% { transform: scale(1); opacity: 0.6; stroke-width: 2; }
          100% { transform: scale(3.5); opacity: 0; stroke-width: 0.5; }
        }
        .animate-signal-pulse-outer {
          animation: signal-pulse-outer 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          transform-origin: center;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
