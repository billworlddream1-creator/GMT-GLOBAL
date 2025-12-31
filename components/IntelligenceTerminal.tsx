
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceReport, IntelligenceSignal, DecodedSignal, VulnerabilityReport } from '../types';
import { playUISound } from '../utils/audioUtils';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

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
    <g className={`signal-node-group ${isVanishing ? 'opacity-0' : 'opacity-100'} transition-all duration-1000`}>
      {!isVanishing && (
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
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isHigh ? 12 : 8}
        fill={fill}
        opacity={isVanishing ? 0.2 : 0.3}
      />
      {isSelected && (
        <g>
           <circle cx={cx} cy={cy} r={isHigh ? 30 : 22} fill="none" stroke="white" strokeWidth={1} strokeDasharray="2 6" className="animate-spin-slow" />
        </g>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={isHigh ? 6 : 4}
        fill={isSelected ? '#fff' : fill}
        opacity={isVanishing ? 0.4 : 1}
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
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeSector, setActiveSector] = useState<string>('SEC-CORE');

  // Security Scan States
  const [scanUrl, setScanUrl] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanReport, setScanReport] = useState<VulnerabilityReport | null>(null);

  // Decryption States
  const [cipherInput, setCipherInput] = useState('');
  const [decryptionLoading, setDecryptionLoading] = useState(false);
  const [customDecoded, setCustomDecoded] = useState<DecodedSignal | null>(null);

  // Historical Sentiment Trends
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const seenSignalIds = useRef<Set<string>>(new Set());

  const fetchSignals = useCallback(async (silent = false) => {
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
      setSyncProgress(0);
    } catch (err) {
      console.error(err);
    }
  }, [intelService]);

  const loadTrends = async () => {
    setTrendsLoading(true);
    try {
      const { history } = await intelService.getHistoricalSentimentAnalysis();
      setHistoricalData(history);
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    loadTrends();
    const interval = setInterval(() => fetchSignals(true), SYNC_INTERVAL_SECONDS * 1000);
    const pInterval = setInterval(() => setSyncProgress(prev => Math.min(100, prev + (100 / (SYNC_INTERVAL_SECONDS * 10)))), 100);
    return () => { clearInterval(interval); clearInterval(pInterval); };
  }, [fetchSignals]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    playUISound('startup');
    try {
      const dossiers = await intelService.generateIntelligenceDossiers(searchTerm);
      setReports(dossiers);
    } finally {
      setLoading(false);
      playUISound('success');
    }
  };

  const executeSecurityScan = async () => {
    if (!scanUrl.trim()) return;
    setScanLoading(true);
    playUISound('startup');
    try {
      const report = await intelService.performVulnerabilityScan(scanUrl);
      setScanReport(report);
      playUISound('success');
    } finally {
      setScanLoading(false);
    }
  };

  const handleManualDecryption = async () => {
    if (!cipherInput.trim()) return;
    setDecryptionLoading(true);
    playUISound('startup');
    try {
      const result = await intelService.decodeEncryptedSignal(cipherInput);
      setCustomDecoded(result);
      playUISound('success');
    } finally {
      setDecryptionLoading(false);
    }
  };

  const mapData = useMemo(() => {
    const activeData = signals.map(sig => ({ x: sig.lng, y: sig.lat, z: sig.urgency === 'HIGH' ? 100 : 30, ...sig }));
    const ghostData = vanishingSignals.map(sig => ({ x: sig.lng, y: sig.lat, z: 20, isVanishing: true, ...sig }));
    return [...activeData, ...ghostData];
  }, [signals, vanishingSignals]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Header & Search */}
      <div className="glass p-10 rounded-[3.5rem] border border-white/20 bg-white/5 space-y-8 relative overflow-hidden backdrop-blur-md">
        <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">Intelligence Terminal</h2>
        <div className="flex gap-4">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search tactical dossiers..."
            className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-sm font-mono text-white outline-none focus:border-accent"
          />
          <button onClick={handleSearch} disabled={loading} className="px-12 py-6 bg-accent text-white font-heading font-black uppercase rounded-3xl">Scan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Radar Map Section */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/20 p-8 h-[550px] relative overflow-hidden bg-black/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
             <div className="h-full bg-accent transition-all duration-300 shadow-[0_0_15px_var(--accent-primary)]" style={{ width: `${syncProgress}%` }}></div>
          </div>
          <div className="w-full h-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" domain={[-180, 180]} hide />
                <YAxis type="number" dataKey="y" domain={[-90, 90]} hide />
                <ZAxis type="number" dataKey="z" range={[150, 600]} />
                <Scatter data={mapData} onClick={(e) => setSelectedSignal(e.payload)} shape={<RenderSignalNode isSelected={selectedSignal?.id} />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-6 left-6 text-[8px] font-mono text-slate-500 uppercase">Status: Orbital Uplink Active // Ref: {Math.random().toString(16).substr(2,6).toUpperCase()}</div>
        </div>

        {/* Info & Decrypter Section */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 flex-1 flex flex-col">
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6">Signal Details</h3>
            <div className="flex-1">
              {selectedSignal ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className={`px-3 py-1.5 rounded-xl border w-fit text-[9px] font-mono font-black ${selectedSignal.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                    {selectedSignal.urgency} PRIORITY
                  </div>
                  <h4 className="text-xl font-heading font-black text-white uppercase">{selectedSignal.location}</h4>
                  <p className="text-[11px] font-mono text-slate-400 italic">"{selectedSignal.description}"</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                  <span className="text-4xl">🛰️</span>
                  <p className="text-[10px] font-mono uppercase">Select a node to interrogate</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40">
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-4">Manual Decrypter</h3>
            <div className="space-y-4">
              <textarea 
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
                placeholder="Paste encrypted string..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-mono text-white h-24 outline-none resize-none"
              />
              <button 
                onClick={handleManualDecryption} 
                disabled={decryptionLoading} 
                className="w-full py-3 bg-accent text-white font-heading font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"
              >
                {decryptionLoading ? 'Decoding...' : 'Unlock Protocol'}
              </button>
              {customDecoded && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in">
                  <p className="text-[10px] font-mono text-emerald-400 italic">"{customDecoded.decrypted}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Probe & Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-10 rounded-[3.5rem] border border-red-500/20 bg-red-500/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-heading font-black text-white uppercase">Tactical Security Probe</h3>
            <span className="text-[8px] font-mono text-red-500 font-black animate-pulse">RECON_MODE</span>
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              placeholder="Target URL (e.g. security.net)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-red-500 outline-none transition-all font-mono"
            />
            <button 
              onClick={executeSecurityScan}
              disabled={scanLoading}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-2xl transition-all"
            >
              {scanLoading ? 'Probing...' : 'Probe Target'}
            </button>
          </div>
          {scanReport && (
            <div className="space-y-6 animate-in slide-in-from-top-4">
               <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">Security Index:</span>
                  <span className={scanReport.score < 50 ? 'text-red-500 font-black' : 'text-emerald-500 font-black'}>{scanReport.score}/100</span>
               </div>
               <div className="space-y-3">
                  {scanReport.threats.slice(0, 3).map((t, i) => (
                    <div key={i} className="p-4 bg-black/20 border border-white/5 rounded-2xl">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-white">{t.type}</span>
                          <span className="text-[8px] text-red-400 font-mono">{t.severity}</span>
                       </div>
                       <p className="text-[9px] font-mono text-slate-500 italic">{t.description}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-blue-500/20 bg-blue-500/5 space-y-8">
           <h3 className="text-xl font-heading font-black text-white uppercase">Geopolitical Trends</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={9} hide />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={9} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#fff' }} />
                  <Line type="monotone" dataKey="Eurasia" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="Africa" stroke="#f59e0b" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">Stability Projections // 24H Forecast Nodes</p>
        </div>
      </div>

      {/* Dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {reports.map((report, idx) => (
          <div key={idx} className="glass p-12 rounded-[3.5rem] border border-white/20 bg-white/5 relative overflow-hidden flex flex-col space-y-6">
            <h3 className="text-2xl font-heading font-black text-white uppercase leading-tight">{report.title}</h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed bg-black/20 p-6 rounded-3xl">{report.summary}</p>
            <div className="space-y-3">
              {report.keyInsights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex gap-4 text-[10px] font-mono text-slate-300">
                  <span className="text-accent font-black">{i+1}.</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
          animation: spin-slow 12s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
