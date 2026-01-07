
import React, { useEffect, useState, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceSignal, DecodedSignal } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SatelliteUplinkProps {
  intelService: IntelligenceService;
}

type UrgencyFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ScanMode = 'SURFACE' | 'DEEP_EARTH' | 'ATMOSPHERIC';

const SCAN_MESSAGES = [
  "LOCKING_ORBITAL_PHASE...",
  "PARSING_TERRESTRIAL_BANDWIDTH...",
  "RESOLVING_GEO_COORDINATES...",
  "FILTERING_ATMOSPHERIC_NOISE...",
  "SIGNAL_ACQUIRED_STABILIZING..."
];

const SatelliteUplink: React.FC<SatelliteUplinkProps> = ({ intelService }) => {
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMsgIdx, setScanMsgIdx] = useState(0);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [matrixText, setMatrixText] = useState('');
  const [error, setError] = useState<{code: string, message: string} | null>(null);
  
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('ALL');
  const [scanMode, setScanMode] = useState<ScanMode>('SURFACE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSig, setSelectedSig] = useState<IntelligenceSignal | null>(null);

  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedSignal | null>(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setMatrixText(Math.random().toString(16).substr(2, 8).toUpperCase());
    }, 100);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserPos({ lat: latitude, lng: longitude });
          loadSignals(latitude, longitude);
        },
        () => loadSignals()
      );
    } else {
      loadSignals();
    }

    return () => clearInterval(timer);
  }, []);

  const loadSignals = async (lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await intelService.getSatelliteSignals(lat, lng);
      setSignals(data || []);
      playUISound('startup');
    } catch (e: any) {
      setError({
        code: e.code || "ORBITAL_SYNC_DENIED",
        message: e.message || "Could not stabilize uplink with satellite array."
      });
      playUISound('alert');
    } finally {
      setLoading(false);
    }
  };

  const executeDeepScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanMsgIdx(0);
    setError(null);
    playUISound('startup');

    const duration = 4000;
    const interval = 100;
    const steps = duration / interval;
    
    let currentStep = 0;
    const scanTimer = setInterval(async () => {
      currentStep++;
      const p = (currentStep / steps) * 100;
      setScanProgress(p);
      
      if (currentStep % Math.floor(steps / SCAN_MESSAGES.length) === 0) {
        setScanMsgIdx(prev => Math.min(prev + 1, SCAN_MESSAGES.length - 1));
      }

      if (p >= 100) {
        clearInterval(scanTimer);
        try {
          // Simulate different results based on scan mode
          await loadSignals(userPos?.lat, userPos?.lng);
          playUISound('success');
        } catch (e) {
          // Handled in loadSignals
        }
        setIsScanning(false);
      }
    }, interval);
  };

  const handleDecode = async () => {
    if (!selectedSig) return;
    setIsDecoding(true);
    setDecodedData(null);
    playUISound('startup');
    
    try {
      const cipher = `SIGNAL_ID:${selectedSig.id}_DESC:${selectedSig.description}`;
      const result = await intelService.decodeEncryptedSignal(cipher);
      setDecodedData(result);
      playUISound('success');
    } catch (err: any) {
      console.error("Decoding failure", err);
      playUISound('alert');
    } finally {
      setIsDecoding(false);
    }
  };

  const filteredSignals = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return (signals || []).filter(sig => {
      const sLoc = (sig.location || '').toLowerCase();
      const sDesc = (sig.description || '').toLowerCase();
      
      const matchUrgency = urgencyFilter === 'ALL' || sig.urgency === urgencyFilter;
      const matchSearch = sLoc.includes(q) || sDesc.includes(q);
      return matchUrgency && matchSearch;
    });
  }, [signals, urgencyFilter, searchQuery]);

  const mapLatToY = (lat: number) => 50 - (lat / 1.8);
  const mapLngToX = (lng: number) => 50 + (lng / 3.6);

  const resetFilters = () => {
    setUrgencyFilter('ALL');
    setSearchQuery('');
    playUISound('click');
  };

  const getScanModeStyle = () => {
    switch(scanMode) {
      case 'DEEP_EARTH': return 'bg-red-950/40 border-red-500/20';
      case 'ATMOSPHERIC': return 'bg-blue-950/40 border-blue-500/20';
      default: return 'bg-black/40 border-white/10';
    }
  };

  const getScanModeEffect = () => {
    switch(scanMode) {
      case 'DEEP_EARTH': return 'radial-gradient(circle, #ef4444 1px, transparent 1px)';
      case 'ATMOSPHERIC': return 'radial-gradient(circle, #3b82f6 1px, transparent 1px)';
      default: return 'radial-gradient(circle, #10b981 1px, transparent 1px)';
    }
  };

  if (loading && !isScanning) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-56 h-56 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-emerald-500/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-16 border border-emerald-500/20 rounded-full animate-pulse flex flex-col items-center justify-center">
             <span className="text-xs font-mono text-emerald-500 font-black">SYNCING</span>
          </div>
       </div>
       <div className="text-center space-y-4">
         <h2 className="font-heading font-black text-4xl text-white uppercase tracking-[0.4em]">Satellite Connection</h2>
         <p className="font-mono text-xs text-emerald-500 animate-pulse tracking-widest uppercase">Acquiring_Orbital_Vector...</p>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-20">
      {/* Deep Scan Overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-[200] glass rounded-[3rem] overflow-hidden bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className={`w-full h-1 shadow-[0_0_20px_currentColor] absolute animate-[sweep_2s_linear_infinite] ${scanMode === 'DEEP_EARTH' ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`}></div>
           </div>
           <div className="relative w-72 h-72 mb-12">
              <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-white/40 rounded-full animate-spin"></div>
              <div className="absolute inset-8 border border-white/20 rounded-full flex flex-col items-center justify-center text-center p-6">
                 <span className="text-2xl mb-2">📡</span>
                 <span className="text-[10px] font-heading font-black text-white uppercase tracking-tighter">{SCAN_MESSAGES[scanMsgIdx]}</span>
                 <span className="text-[8px] font-mono text-accent uppercase mt-2">{scanMode.replace('_', ' ')} PROTOCOL</span>
              </div>
           </div>
           <div className="w-96 space-y-4">
              <div className="flex justify-between text-[8px] font-mono text-emerald-500 uppercase font-black">
                 <span>Sector_Scan_Progress</span>
                 <span>{Math.round(scanProgress)}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-emerald-500 transition-all duration-100 shadow-[0_0_15px_#10b981]" style={{ width: `${scanProgress}%` }}></div>
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="glass p-10 rounded-[3rem] border-red-500/40 bg-red-500/5 text-center space-y-6">
           <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-3xl">📡</div>
           <div className="space-y-2">
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">Orbital_Scan_Failed</h3>
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">{error.code} // {error.message}</p>
           </div>
           <button 
             onClick={executeDeepScan}
             className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
           >
             Retry Orbital Lock
           </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 glass p-6 rounded-[2.5rem] border border-white/5 bg-slate-900/20">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
             {(['SURFACE', 'DEEP_EARTH', 'ATMOSPHERIC'] as const).map(mode => (
               <button 
                 key={mode}
                 onClick={() => { setScanMode(mode); playUISound('click'); }}
                 className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                   scanMode === mode 
                     ? mode === 'DEEP_EARTH' ? 'bg-red-600 text-white' : mode === 'ATMOSPHERIC' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white' 
                     : 'text-slate-500 hover:text-white'
                 }`}
               >
                 {mode.replace('_', ' ')}
               </button>
             ))}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          <select 
            value={urgencyFilter}
            onChange={(e) => { setUrgencyFilter(e.target.value as any); playUISound('click'); }}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[9px] text-white outline-none focus:border-accent uppercase font-black"
          >
            <option value="ALL">All Urgencies</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
          <button 
            onClick={resetFilters}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
          >
            Reset
          </button>
        </div>
        
        <div className="w-full lg:w-80 relative flex gap-2">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Signals..."
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-2.5 text-[10px] font-mono text-white focus:border-accent outline-none"
          />
          <button 
            onClick={executeDeepScan} 
            className={`px-4 rounded-2xl border transition-all ${scanMode === 'DEEP_EARTH' ? 'bg-red-600 border-red-500 hover:bg-red-500' : 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500'}`}
          >
            🛰️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
        <div className={`lg:col-span-8 glass rounded-[3.5rem] border border-white/10 relative overflow-hidden flex items-center justify-center min-h-[450px] transition-all duration-1000 ${getScanModeStyle()}`}>
           <div className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000" style={{ backgroundImage: getScanModeEffect(), backgroundSize: '50px 50px' }}></div>
           
           {scanMode === 'DEEP_EARTH' && (
             <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-transparent pointer-events-none"></div>
           )}
           {scanMode === 'ATMOSPHERIC' && (
             <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
           )}

           <div className="relative w-full h-full p-10">
              {filteredSignals.map(sig => (
                <div 
                  key={sig.id}
                  onClick={() => { setSelectedSig(sig); playUISound('click'); }}
                  className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 hover:scale-150 ${selectedSig?.id === sig.id ? 'ring-2 ring-white scale-125 z-50 shadow-[0_0_15px_white]' : 'z-30'}`}
                  style={{ 
                    left: `${mapLngToX(sig.lng)}%`, 
                    top: `${mapLatToY(sig.lat)}%`,
                    backgroundColor: sig.urgency === 'HIGH' ? '#ef4444' : sig.urgency === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                  }}
                >
                   {sig.urgency === 'HIGH' && <div className="absolute inset-[-4px] border border-red-500 rounded-full animate-ping opacity-40"></div>}
                </div>
              ))}
           </div>
           
           <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[8px] font-mono text-slate-300 uppercase tracking-widest">
              Mode: {scanMode} // Active Nodes: {filteredSignals.length}
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 flex-1 flex flex-col overflow-hidden relative">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Signal_Interrogation</h3>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                {selectedSig ? (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded uppercase">Locked</span>
                      <h4 className="text-xl font-heading font-black text-white uppercase">{selectedSig.location}</h4>
                    </div>
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                       <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Raw_Intercept</span>
                       <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic">"{selectedSig.description}"</p>
                    </div>
                    
                    <button 
                      onClick={handleDecode}
                      disabled={isDecoding}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
                    >
                      {isDecoding ? 'Decrypting...' : 'Initiate Decryption'}
                    </button>

                    {decodedData && (
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] font-black text-emerald-500 uppercase">Cleartext_Output</span>
                           <span className="text-[8px] font-mono text-slate-500">Confidence: {decodedData.confidence}%</span>
                        </div>
                        <p className="text-[11px] font-mono text-white leading-relaxed">{decodedData.decrypted}</p>
                        <div className="text-[7px] font-mono text-slate-600 uppercase pt-2 border-t border-white/5">Origin: {decodedData.origin}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 space-y-6">
                     <span className="text-5xl">🛰️</span>
                     <p className="text-[10px] font-mono uppercase tracking-[0.4em]">Select an orbital signal node to interrogation</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes sweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SatelliteUplink;
