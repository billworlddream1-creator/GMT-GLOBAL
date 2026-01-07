
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { TacticalTarget } from '../types';
import { playUISound } from '../utils/audioUtils';

interface TacticalRangefinderProps {
  intelService: IntelligenceService;
}

const TacticalRangefinder: React.FC<TacticalRangefinderProps> = ({ intelService }) => {
  const [targets, setTargets] = useState<TacticalTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<TacticalTarget | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const requestRef = useRef<number>(null);

  const fetchTargets = async () => {
    setLoading(true);
    setIsScanning(true);
    playUISound('startup');
    try {
      const data = await intelService.getTacticalRangeSignals();
      setTargets(data);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setIsScanning(false), 1000);
    }
  };

  const animateSweep = (time: number) => {
    setSweepAngle((time / 15) % 360);
    requestRef.current = requestAnimationFrame(animateSweep);
  };

  useEffect(() => {
    fetchTargets();
    requestRef.current = requestAnimationFrame(animateSweep);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getThreatColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
      case 'MEDIUM': return 'text-amber-500 border-amber-500/20 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'LOW': return 'text-blue-500 border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      default: return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
  };

  const getClassificationIcon = (cls: string) => {
    switch(cls) {
      case 'MILITARY': return '⚔️';
      case 'CIVILIAN': return '🛡️';
      case 'ANOMALY': return '🌀';
      default: return '❓';
    }
  };

  const handleTargetSelect = (target: TacticalTarget) => {
    setSelectedTarget(target);
    setIsSidebarOpen(true);
    playUISound('click');
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header Panel */}
      <div className="glass p-10 rounded-[3.5rem] border border-red-500/20 bg-red-950/10 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none">
           <span className="text-8xl font-heading font-black text-red-400 uppercase tracking-widest">RANGE</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Tactical_Rangefinder</h2>
          <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em] mt-2">Precision Ranging & Threat Distance Acquisition</p>
        </div>
        <div className="flex gap-4 relative z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-4 glass border-white/10 rounded-2xl transition-all ${isSidebarOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
            title={isSidebarOpen ? "Collapse Intelligence Panel" : "Expand Intelligence Panel"}
          >
            {isSidebarOpen ? '➡️' : '⬅️'}
          </button>
          <button 
            onClick={fetchTargets} 
            disabled={loading}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'ACQUIRING...' : 'INIT_PING'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
        {/* Radar View (Left/Main) */}
        <div className={`transition-all duration-700 h-full ${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} glass rounded-[3.5rem] border border-white/5 bg-black/80 relative overflow-hidden flex items-center justify-center`}>
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative w-[500px] h-[500px] border border-red-500/20 rounded-full flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute border border-red-500/10 rounded-full" style={{ width: `${(i+1)*20}%`, height: `${(i+1)*20}%` }}>
                   <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-mono text-red-500/40">{(i+1)*1000}KM</span>
                </div>
              ))}
              
              <div className="absolute w-px h-full bg-red-500/10"></div>
              <div className="absolute h-px w-full bg-red-500/10"></div>

              {/* Sweep Line */}
              <div 
                className="absolute top-1/2 left-1/2 w-[250px] h-[250px] origin-top-left z-20 pointer-events-none"
                style={{ 
                  transform: `rotate(${sweepAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(239, 68, 68, 0.4) 0deg, transparent 45deg)'
                }}
              >
                 <div className="w-full h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444]"></div>
              </div>

              {/* Targets */}
              {!loading && targets.map(target => (
                <div 
                  key={target.id}
                  onClick={() => handleTargetSelect(target)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-pointer transition-all duration-300 z-30 hover:scale-150 ${selectedTarget?.id === target.id ? 'ring-2 ring-white scale-150 z-50 shadow-[0_0_20px_white]' : ''}`}
                  style={{ 
                    left: `${50 + target.coordinates.x}%`, 
                    top: `${50 + target.coordinates.y}%`,
                    backgroundColor: target.classification === 'MILITARY' ? '#ef4444' : target.classification === 'ANOMALY' ? '#a855f7' : '#3b82f6'
                  }}
                >
                   {(target.threatLevel === 'CRITICAL' || target.threatLevel === 'HIGH') && (
                     <div className={`absolute inset-[-4px] border border-current rounded-full animate-ping opacity-40`} style={{ color: target.classification === 'MILITARY' ? '#ef4444' : '#a855f7' }}></div>
                   )}
                   {selectedTarget?.id === target.id && (
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1 bg-black/90 backdrop-blur-md border border-white/40 rounded-xl text-[8px] font-mono text-white font-black whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-top-1 duration-300 shadow-2xl">
                       LOCKED_{target.designation}
                     </div>
                   )}
                </div>
              ))}
           </div>

           {/* Radar Metadata */}
           <div className="absolute bottom-10 left-10 text-[8px] font-mono text-red-600/60 uppercase tracking-widest bg-black/60 p-5 rounded-2xl border border-red-500/10 backdrop-blur-sm space-y-1">
             <div>Laser Ranging Active // Freq: 88.4GHz</div>
             <div>Mode: Precision_Range_Detect</div>
             <div className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Targets_Acquired: {targets.length}</span>
             </div>
           </div>

           {/* Radar Legends */}
           <div className="absolute top-10 right-10 flex flex-col gap-3">
             {[
               { label: 'MILITARY', color: 'bg-red-500' },
               { label: 'ANOMALY', color: 'bg-purple-500' },
               { label: 'CIVILIAN', color: 'bg-blue-500' },
             ].map(l => (
               <div key={l.label} className="flex items-center gap-3 glass px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md">
                 <div className={`w-2 h-2 rounded-sm ${l.color}`}></div>
                 <span className="text-[8px] font-mono text-slate-400 uppercase font-black">{l.label}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Collapsible Details Panel (Right) */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-w-0 overflow-hidden animate-in slide-in-from-right-6 duration-500">
            <div className="glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-950/40 shadow-2xl relative overflow-hidden flex-1 h-full min-h-0">
               {/* Decorative Background Text */}
               <div className="absolute -top-10 -right-10 opacity-[0.03] select-none pointer-events-none overflow-hidden">
                  <span className="text-[15rem] font-heading font-black text-white transform -rotate-12 block">DATA</span>
               </div>

               <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-5 relative z-10">
                  <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Target_Intel_Matrix
                  </h3>
                  <button onClick={() => setSelectedTarget(null)} className="text-slate-500 hover:text-white transition-colors">
                     <span className="text-xs uppercase font-mono">Reset</span>
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pr-2 space-y-8">
                  {selectedTarget ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-300">
                       {/* Identity Section */}
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-mono text-red-500 font-black">FIX_ACQUIRED</span>
                             <div className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent"></div>
                          </div>
                          <h4 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">{selectedTarget.designation}</h4>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Internal_Reference: {selectedTarget.id}</p>
                       </div>

                       {/* Status Badges */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 ${getThreatColor(selectedTarget.threatLevel)}`}>
                             <span className="text-[7px] font-black uppercase opacity-60">Threat_Level</span>
                             <span className="text-[10px] font-heading font-black uppercase">{selectedTarget.threatLevel}</span>
                          </div>
                          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center flex flex-col items-center justify-center gap-1">
                             <span className="text-[7px] font-black uppercase opacity-40">Class</span>
                             <span className="text-[10px] font-heading font-black uppercase text-white flex items-center gap-2">
                               {getClassificationIcon(selectedTarget.classification)}
                               {selectedTarget.classification}
                             </span>
                          </div>
                       </div>

                       {/* Range Metrics Grid */}
                       <div className="space-y-4">
                          <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-3">
                             <span className="w-1.5 h-px bg-slate-500"></span>
                             Precision_Metrics
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="glass p-5 rounded-3xl border border-white/5 bg-black/40 group hover:border-red-500/30 transition-all">
                                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Distance_Km</span>
                                <span className="text-2xl font-heading font-black text-white">{selectedTarget.distanceKm.toLocaleString()}</span>
                             </div>
                             <div className="glass p-5 rounded-3xl border border-white/5 bg-black/40 group hover:border-red-500/30 transition-all">
                                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Bearing_Azimuth</span>
                                <span className="text-2xl font-heading font-black text-red-500">{selectedTarget.bearing}°</span>
                             </div>
                             <div className="glass p-5 rounded-3xl border border-white/5 bg-black/40 group hover:border-red-500/30 transition-all">
                                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Velocity_Kmh</span>
                                <span className="text-2xl font-heading font-black text-white">{selectedTarget.velocity.toLocaleString()}</span>
                             </div>
                             <div className="glass p-5 rounded-3xl border border-white/5 bg-black/40 group hover:border-red-500/30 transition-all">
                                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Elevation_Msl</span>
                                <span className="text-2xl font-heading font-black text-white">{selectedTarget.elevation.toLocaleString()}</span>
                             </div>
                          </div>
                       </div>

                       {/* Detailed Coordinates */}
                       <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                             <span className="text-[9px] font-black text-white uppercase tracking-widest">Orbital_Coordinates</span>
                             <div className="flex gap-1">
                                <div className="w-1 h-1 bg-red-500"></div>
                                <div className="w-1 h-1 bg-red-500 opacity-50"></div>
                                <div className="w-1 h-1 bg-red-500 opacity-20"></div>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6 font-mono">
                             <div>
                                <span className="text-[8px] text-slate-500 uppercase block">Latitude_Offset</span>
                                <span className="text-xs text-slate-300">{selectedTarget.coordinates.y.toFixed(6)}°</span>
                             </div>
                             <div>
                                <span className="text-[8px] text-slate-500 uppercase block">Longitude_Offset</span>
                                <span className="text-xs text-slate-300">{selectedTarget.coordinates.x.toFixed(6)}°</span>
                             </div>
                          </div>
                          <div className="pt-2">
                             <span className="text-[7px] text-slate-600 uppercase block mb-2">Signal_Reliability_Index</span>
                             <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '94.8%' }}></div>
                             </div>
                          </div>
                       </div>

                       {/* Tactical Action */}
                       <div className="pt-4">
                          <button 
                            className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-[0.4em] rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
                            onClick={() => playUISound('success')}
                          >
                             <span>🛰️</span> Uplink_Satellite_Lock
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-10 opacity-30 py-20 px-6">
                       <div className="relative w-24 h-24">
                          <div className="absolute inset-0 border-2 border-dashed border-red-500/20 rounded-full animate-spin-slow"></div>
                          <div className="absolute inset-4 border border-red-500/10 rounded-full flex items-center justify-center text-5xl">🔭</div>
                       </div>
                       <div className="space-y-4">
                         <h4 className="text-xl font-heading font-black text-white uppercase tracking-[0.2em] leading-none">Awaiting_Target</h4>
                         <p className="text-[10px] font-mono uppercase tracking-[0.4em] leading-relaxed">Select a high-frequency node from the ranging radar to interrogate telemetry and verify threat classification.</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[7px] font-mono text-slate-600 shrink-0">
                  <span className="uppercase">GMT_RANGE_V1.1 // RSA-4096</span>
                  <div className="flex gap-1">
                     {[...Array(8)].map((_, i) => (
                       <div key={i} className={`w-1 h-2 rounded-sm ${i < 6 ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TacticalRangefinder;
