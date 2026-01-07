import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { DeepSpaceObject } from '../types';
import { playUISound } from '../utils/audioUtils';

interface DeepSpaceScannerProps {
  intelService: IntelligenceService;
}

const DeepSpaceScanner: React.FC<DeepSpaceScannerProps> = ({ intelService }) => {
  const [objects, setObjects] = useState<DeepSpaceObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<DeepSpaceObject | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);

  const performScan = useCallback(async () => {
    setScanning(true);
    playUISound('startup');
    try {
      const data = await intelService.scanDeepSpace();
      setObjects(data || []);
      playUISound('success');
    } catch (e) {
      console.error("Space scan failure", e);
      playUISound('alert');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  }, [intelService]);

  useEffect(() => {
    performScan();
  }, [performScan]);

  // Radar Sweep Animation
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setSweepAngle((prev) => (prev + 1.5) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const getObjectTypeColor = (type: string | undefined) => {
    const t = (type || 'UNKNOWN').toUpperCase();
    if (t.includes('ANOMALY')) return 'text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
    if (t.includes('PROBE')) return 'text-cyan-400';
    if (t.includes('STATION')) return 'text-blue-400';
    return 'text-emerald-400';
  };

  const mapPos = (val: number) => 50 + (val || 0);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header HUD */}
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
          <span className="text-[10rem] font-heading font-black">SPACE</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_#8b5cf6]"></div>
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-[0.5em] font-black">Deep_Orbit_Intercept</span>
            </div>
            <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Space_Scanner</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">GMT orbital array monitoring high-velocity anomalies and satellites.</p>
          </div>

          <div className="flex gap-4 shrink-0">
             <button 
               onClick={performScan} 
               disabled={scanning}
               className="px-10 py-5 bg-accent hover:bg-accent/80 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
             >
                {scanning ? 'SCANNING_HORIZON...' : 'TRIGGER_PULSE_SCAN'}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
        {/* Orbital Radar View */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black/80 relative overflow-hidden flex items-center justify-center min-h-[500px] shadow-inner">
           {/* Radar Grid */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
           
           <div className="relative w-[450px] h-[450px] border border-violet-500/20 rounded-full flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="absolute border border-violet-500/10 rounded-full" style={{ width: `${(i+1)*25}%`, height: `${(i+1)*25}%` }}></div>
              ))}
              <div className="absolute w-px h-full bg-violet-500/10"></div>
              <div className="absolute h-px w-full bg-violet-500/10"></div>

              {/* Sweep Line */}
              <div 
                className="absolute top-1/2 left-1/2 w-[225px] h-[225px] origin-top-left z-20 pointer-events-none"
                style={{ 
                  transform: `rotate(${sweepAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(139, 92, 246, 0.4) 0deg, transparent 45deg)'
                }}
              >
                 <div className="w-full h-1 bg-violet-500 shadow-[0_0_15px_#8b5cf6]"></div>
              </div>

              {/* Objects */}
              {!loading && objects.map((obj) => (
                <div 
                  key={obj.id}
                  onClick={() => { setSelected(obj); playUISound('click'); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-150 z-30 group ${selected?.id === obj.id ? 'scale-150' : ''}`}
                  style={{ 
                    left: `${mapPos(obj.coordinates?.x)}%`, 
                    top: `${mapPos(obj.coordinates?.y)}%`,
                  }}
                >
                   <div className={`w-3 h-3 rounded-full animate-pulse ${(obj.type || '').toUpperCase().includes('ANOMALY') ? 'bg-purple-500 shadow-[0_0_15px_purple]' : 'bg-cyan-500 shadow-[0_0_15px_cyan]'}`}></div>
                   {selected?.id === obj.id && (
                     <div className="absolute inset-[-8px] border border-white/40 rounded-full animate-ping"></div>
                   )}
                   {/* Label on Hover/Select */}
                   <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 px-3 py-1 bg-black/80 border border-white/20 rounded-lg text-[7px] font-mono text-white whitespace-nowrap pointer-events-none transition-opacity ${selected?.id === obj.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {obj.name || 'UNKNOWN_OBJECT'}
                   </div>
                </div>
              ))}
           </div>

           <div className="absolute bottom-10 left-10 text-[8px] font-mono text-violet-600/60 uppercase tracking-widest bg-black/40 p-4 rounded-xl border border-violet-500/10">
             Sub-Space Intercept // Tracking: {objects.length} NODES // Status: SECURE
           </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="lg:col-span-4 glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-950/40 shadow-2xl relative overflow-hidden">
           <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex justify-between">
              <span>Target_Matrix</span>
              <span className="opacity-40">ORBITAL_ID: {Math.random().toString(16).substr(2, 6).toUpperCase()}</span>
           </h3>
           
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
              {selected ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                   <div className="space-y-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${getObjectTypeColor(selected.type)}`}>
                        {(selected.type || 'UNKNOWN').replace(/_/g, ' ')} ACQUIRED
                      </span>
                      <h4 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">{selected.name || 'UNKNOWN_OBJECT'}</h4>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Velocity</span>
                         <span className="text-xl font-heading font-black text-white">{(selected.velocity || 0).toLocaleString()} <span className="text-[8px]">MPH</span></span>
                      </div>
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Range_Fix</span>
                         <span className="text-xl font-heading font-black text-violet-400">{selected.distanceMiles || 0}M <span className="text-[8px]">MI</span></span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Orbital_Dynamics</h5>
                      <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-3">
                         <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">Longitude_Fix</span>
                            <span className="text-white">{(selected.coordinates?.x || 0).toFixed(4)}°</span>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">Latitude_Fix</span>
                            <span className="text-white">{(selected.coordinates?.y || 0).toFixed(4)}°</span>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">Orbital_Stability</span>
                            <span className="text-emerald-500">98.4% [OPTIMAL]</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl border border-violet-500/20 bg-violet-500/5">
                      <span className="text-[8px] font-black text-violet-500 uppercase tracking-widest block mb-2">Neural_Synthesis:</span>
                      <p className="text-[10px] font-mono text-slate-300 leading-relaxed uppercase">
                        Object identified as {(selected.type || 'unknown').toLowerCase()}. Trajectory analysis suggests stable geostationary positioning. No immediate debris hazard detected.
                      </p>
                   </div>

                   <button 
                     onClick={() => setSelected(null)} 
                     className="w-full py-4 glass border-white/10 text-slate-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                   >
                     Release_Target_Lock
                   </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20">
                   <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-5xl">🌌</div>
                   <div className="space-y-2">
                     <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest leading-none">Awaiting_Fix</h4>
                     <p className="text-[10px] font-mono uppercase tracking-[0.4em] max-w-[180px] mx-auto">Select a node on the orbital radar to interrogate deep space telemetry.</p>
                   </div>
                </div>
              )}
           </div>
           
           <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest animate-pulse">GMT_ORBITAL_SCAN_V1.4 // SIGNAL_STABLE</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSpaceScanner;