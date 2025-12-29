
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { IntelligenceSignal } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SatelliteUplinkProps {
  intelService: IntelligenceService;
}

type UrgencyFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type TypeFilter = 'ALL' | 'COMM_INTERCEPT' | 'SATELLITE_FIX' | 'GEOPOLITICAL_ALERT';

const SatelliteUplink: React.FC<SatelliteUplinkProps> = ({ intelService }) => {
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [matrixText, setMatrixText] = useState('');
  
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  
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
    try {
      const data = await intelService.getSatelliteSignals(lat, lng);
      setSignals(data);
    } finally {
      setLoading(false);
      playUISound('startup');
    }
  };

  const filteredSignals = useMemo(() => {
    return signals.filter(sig => {
      const matchUrgency = urgencyFilter === 'ALL' || sig.urgency === urgencyFilter;
      const matchType = typeFilter === 'ALL' || sig.type === typeFilter;
      return matchUrgency && matchType;
    });
  }, [signals, urgencyFilter, typeFilter]);

  const mapLatToY = (lat: number) => 50 - (lat / 1.8);
  const mapLngToX = (lng: number) => 50 + (lng / 3.6);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-56 h-56 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-emerald-500/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-16 border border-emerald-500/20 rounded-full animate-pulse flex flex-col items-center justify-center">
             <span className="text-xs font-mono text-emerald-500 font-black">SCANNING</span>
          </div>
       </div>
       <div className="text-center space-y-4">
         <h2 className="font-heading font-black text-4xl text-white uppercase tracking-[0.4em]">Uplink Decryption</h2>
         <p className="font-mono text-xs text-emerald-500 animate-pulse tracking-widest uppercase">Initializing_Orbital_Array...</p>
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-6 rounded-3xl border border-white/5 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Signal_Urgency</span>
            <div className="flex gap-2">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setUrgencyFilter(lvl as any); playUISound('click'); }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    urgencyFilter === lvl ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Signal_Type</span>
            <div className="flex gap-2">
              {['ALL', 'COMM_INTERCEPT', 'SATELLITE_FIX', 'GEOPOLITICAL_ALERT'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t as any); playUISound('click'); }}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    typeFilter === t ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => { playUISound('click'); loadSignals(userPos?.lat, userPos?.lng); }}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
        >
          RE_SCAN_BAND
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 overflow-hidden">
        <div className="xl:col-span-2 glass rounded-[3rem] border border-white/10 relative overflow-hidden flex flex-col shadow-2xl group">
          <div className="absolute top-10 left-10 z-30">
            <h3 className="text-2xl font-heading font-black text-white flex items-center gap-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              ORBITAL_RADAR_FEED
            </h3>
            <div className="mt-4 flex gap-4">
              <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-xl font-mono text-[10px] text-emerald-400">STATUS: ACTIVE_LINK</div>
              <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-xl font-mono text-[10px] text-blue-400">FIXED_NODES: {filteredSignals.length}</div>
            </div>
          </div>

          <div className="flex-1 relative bg-slate-950 rounded-[2rem] m-6 overflow-hidden shadow-inner border border-white/5">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* CSS-Only Radar Scan - High Performance */}
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-30 animate-[radar_4s_linear_infinite]"
                 style={{ background: 'conic-gradient(from 0deg, transparent, rgba(16, 185, 129, 0.4) 1deg, transparent 90deg)' }}></div>

            <div className="absolute inset-0 z-10">
              {userPos && (
                <div className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 z-30" style={{ top: `${mapLatToY(userPos.lat)}%`, left: `${mapLngToX(userPos.lng)}%` }}>
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-1.5 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-mono font-black text-blue-400 bg-black/80 px-3 py-1.5 rounded-xl border border-blue-500/30 whitespace-nowrap">PRIMARY_NODE [YOU]</div>
                </div>
              )}

              {filteredSignals.map((sig) => (
                <div 
                  key={sig.id}
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-150 group/sig z-20"
                  style={{ top: `${mapLatToY(sig.lat)}%`, left: `${mapLngToX(sig.lng)}%` }}
                  onClick={() => sig.groundingUri && window.open(sig.groundingUri, '_blank')}
                >
                  <div className={`absolute inset-0 rounded-full animate-pulse ${sig.urgency === 'HIGH' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'}`}></div>
                  <div className={`absolute inset-1 rounded-full ${sig.urgency === 'HIGH' ? 'bg-red-300' : 'bg-emerald-300'}`}></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/sig:opacity-100 transition-opacity bg-black/90 p-3 rounded-2xl border border-white/20 z-50 shadow-2xl min-w-[150px]">
                    <div className="text-[10px] font-black text-white uppercase mb-1">{sig.location}</div>
                    <div className="text-[8px] font-mono text-slate-400">{sig.type}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-10 right-10 text-right font-mono text-slate-600 text-[10px] space-y-2 z-30 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
              <div>GEO_FIX_ID: {matrixText}</div>
              <div>SIGNAL_LAT: {userPos?.lat.toFixed(4) || 'SCANNING'}</div>
              <div>SIGNAL_LNG: {userPos?.lng.toFixed(4) || 'SCANNING'}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[3rem] border border-white/10 flex flex-col shadow-2xl p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">INTELLIGENCE_LOGS</h3>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono text-slate-500 font-bold">{filteredSignals.length} FIXED</span>
          </div>
          
          <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar flex-1">
             {filteredSignals.map(sig => (
                <div key={sig.id} className="group p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-blue-500/30 transition-all relative overflow-hidden">
                   <div className="flex justify-between items-start mb-4">
                     <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                       sig.urgency === 'HIGH' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 
                       sig.urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-blue-500/20 text-blue-500 border border-blue-500/20'
                     }`}>{sig.urgency}_URGENCY</span>
                   </div>
                   <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase mb-2">{sig.location}</h4>
                   <p className="text-[11px] text-slate-400 font-mono mb-4 leading-relaxed">{sig.description}</p>
                   <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="text-[9px] font-mono text-slate-500 font-bold">{sig.type.replace('_', ' ')}</span>
                      {sig.groundingUri && <a href={sig.groundingUri} target="_blank" className="text-[10px] font-black text-emerald-500 hover:text-white uppercase underline">SOURCE</a>}
                   </div>
                </div>
              ))}
              {filteredSignals.length === 0 && (
                <div className="py-20 text-center opacity-30 space-y-4">
                  <div className="text-5xl">🔭</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.4em]">No matching signals detected</div>
                </div>
              )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes radar {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SatelliteUplink;
