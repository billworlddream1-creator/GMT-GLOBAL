
import React, { useState, useEffect, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { BenthicSignal, WaveTelemetry } from '../types';
import { playUISound } from '../utils/audioUtils';

interface BenthicSonarProps {
  intelService: IntelligenceService;
}

const BenthicSonar: React.FC<BenthicSonarProps> = ({ intelService }) => {
  const [signals, setSignals] = useState<BenthicSignal[]>([]);
  const [waveData, setWaveData] = useState<WaveTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<BenthicSignal | null>(null);
  
  const sweepRef = useRef<number>(0);
  const requestRef = useRef<number>(null);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const data = await intelService.getBenthicSignals();
      setSignals(data.signals);
      setWaveData(data.wave);
      playUISound('startup');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const animateSweep = (time: number) => {
    sweepRef.current = (time / 16.6) % 360;
    setSweepAngle(sweepRef.current);
    requestRef.current = requestAnimationFrame(animateSweep);
  };

  useEffect(() => {
    fetchSignals();
    requestRef.current = requestAnimationFrame(animateSweep);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [intelService]);

  const getSignalIntensity = (sigAngle: number) => {
    let diff = (sweepAngle - sigAngle + 360) % 360;
    if (diff > 180) diff = 360 - diff;
    const normalizedDiff = (sweepAngle - sigAngle + 360) % 360;
    if (normalizedDiff < 60) {
      return 1 - (normalizedDiff / 60);
    }
    return 0;
  };

  const getSeaStateColor = (state: string | undefined) => {
    switch(state) {
      case 'PHENOMENAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'STORM': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'ROUGH': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CHOPPY': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="glass p-8 rounded-[3.5rem] border border-cyan-500/20 bg-cyan-950/10 flex justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none">
           <span className="text-8xl font-heading font-black text-cyan-400 uppercase tracking-widest">OCEAN</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Benthic & Oceanic Array</h2>
          <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.4em] mt-2">Deep-Sea Backbone & Surface Wave Telemetry</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchSignals} 
             disabled={loading}
             className="px-8 py-3 glass border-cyan-500/20 text-cyan-400 font-black text-[9px] uppercase tracking-widest hover:bg-cyan-500/10 transition-all disabled:opacity-50"
           >
             {loading ? 'SYNCING...' : 'MANUAL_PING'}
           </button>
        </div>
      </div>

      {/* Surface Telemetry Panel */}
      {waveData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
           <div className="glass p-5 rounded-3xl border border-cyan-500/10 bg-cyan-900/20">
              <span className="text-[8px] font-mono text-cyan-300 uppercase tracking-widest">Wave_Height</span>
              <div className="text-2xl font-heading font-black text-white mt-1">{waveData.heightMeters}M</div>
              <div className="w-full h-1 bg-cyan-500/10 mt-2 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-400 animate-pulse" style={{ width: `${Math.min(100, (waveData.heightMeters / 10) * 100)}%` }}></div>
              </div>
           </div>
           <div className="glass p-5 rounded-3xl border border-cyan-500/10 bg-cyan-900/20">
              <span className="text-[8px] font-mono text-cyan-300 uppercase tracking-widest">Swell_Period</span>
              <div className="text-2xl font-heading font-black text-white mt-1">{waveData.periodSeconds}s</div>
              <span className="text-[8px] font-mono text-cyan-500 uppercase">Interval</span>
           </div>
           <div className="glass p-5 rounded-3xl border border-cyan-500/10 bg-cyan-900/20">
              <span className="text-[8px] font-mono text-cyan-300 uppercase tracking-widest">Water_Temp</span>
              <div className="text-2xl font-heading font-black text-white mt-1">{waveData.temperature}°C</div>
              <span className="text-[8px] font-mono text-cyan-500 uppercase">Surface</span>
           </div>
           <div className={`p-5 rounded-3xl border ${getSeaStateColor(waveData.seaState)} flex flex-col justify-center items-center text-center`}>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Sea_State</span>
              <div className="text-lg font-heading font-black uppercase mt-1">{waveData.seaState}</div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
        {/* Sonar Display */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black/80 relative overflow-hidden flex items-center justify-center min-h-[500px] shadow-inner">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
          
          {/* Wave Simulation Overlay */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none">
             <div className="w-full h-full bg-gradient-to-t from-cyan-500/20 to-transparent"></div>
             {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bottom-0 w-full h-px bg-cyan-400/30 animate-pulse" 
                  style={{ bottom: `${i * 15}%`, animationDelay: `${i * 0.2}s` }} 
                />
             ))}
          </div>

          <div className="relative w-[500px] h-[500px] border border-cyan-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.05)]">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="absolute border border-cyan-500/10 rounded-full" style={{ width: `${(i+1)*25}%`, height: `${(i+1)*25}%` }}></div>
             ))}
             <div className="absolute w-px h-full bg-cyan-500/10"></div>
             <div className="absolute h-px w-full bg-cyan-500/10"></div>

             <div 
               className="absolute top-1/2 left-1/2 w-[250px] h-[250px] origin-top-left z-20 pointer-events-none transition-transform duration-75 ease-linear"
               style={{ 
                 transform: `rotate(${sweepAngle}deg)`,
                 background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.6) 0deg, rgba(6, 182, 212, 0.2) 20deg, transparent 90deg)'
               }}
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-transparent opacity-40"></div>
             </div>

             {!loading && signals.map(sig => {
                const intensity = getSignalIntensity(sig.coordinates.angle);
                const x = Math.cos((sig.coordinates.angle - 90) * Math.PI / 180) * (sig.coordinates.distance * 2.5);
                const y = Math.sin((sig.coordinates.angle - 90) * Math.PI / 180) * (sig.coordinates.distance * 2.5);
                
                return (
                  <div 
                    key={sig.id}
                    onClick={() => { setSelectedSignal(sig); playUISound('click'); }}
                    className={`absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-300 z-30 group ${
                      selectedSignal?.id === sig.id ? 'ring-2 ring-white scale-125' : ''
                    }`}
                    style={{ 
                      left: `calc(50% + ${x}px)`, 
                      top: `calc(50% + ${y}px)`,
                      backgroundColor: sig.type === 'SUBMERSIBLE' ? '#ef4444' : sig.type === 'CABLE_NODE' ? '#22d3ee' : '#f59e0b',
                      opacity: Math.max(0.1, intensity),
                      boxShadow: intensity > 0.5 ? `0 0 ${intensity * 20}px currentColor` : 'none'
                    }}
                  >
                    {intensity > 0.8 && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-40"></div>
                    )}
                    {selectedSignal?.id === sig.id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 bg-black/80 border border-white/10 rounded text-[6px] font-mono text-white whitespace-nowrap z-50">
                           {sig.id}
                        </div>
                    )}
                  </div>
                );
             })}
          </div>
          
          <div className="absolute bottom-10 left-10 text-[8px] font-mono text-cyan-600/60 uppercase tracking-widest bg-black/40 p-4 rounded-xl border border-cyan-500/10 backdrop-blur-sm">
            Hydrophone Array Active // Freq: 12Hz // Depth: Multi-Layer
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="lg:col-span-4 glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-950/40 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20">
              <div className="h-full bg-cyan-500 animate-pulse shadow-[0_0_15px_#06b6d4]" style={{ width: '100%' }}></div>
           </div>

           <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex justify-between">
              <span>Deep_Scan_Logs</span>
              <span className="opacity-40">NODES: {signals.length}</span>
           </h3>
           
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
              {selectedSignal ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Target_Fix: {selectedSignal.id}</span>
                        <h4 className="text-2xl font-heading font-black text-white uppercase mt-1 leading-tight">{selectedSignal.type.replace('_', ' ')}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded text-[7px] font-black uppercase border transition-colors ${
                        selectedSignal.status === 'STABLE' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'
                      }`}>{selectedSignal.status}</span>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Depth_Level</span>
                         <span className="text-xl font-heading font-black text-white">-{selectedSignal.depth}M</span>
                      </div>
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Conf_Rating</span>
                         <span className="text-xl font-heading font-black text-emerald-400">98.1%</span>
                      </div>
                   </div>

                   <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] font-mono text-slate-500 uppercase">Sector_Location</span>
                         <span className="text-[10px] font-mono text-white font-black uppercase tracking-wider">{selectedSignal.location}</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => setSelectedSignal(null)} 
                     className="w-full py-4 glass border-cyan-500/20 text-cyan-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/10 transition-all active:scale-95"
                   >
                     Dismiss_Analysis
                   </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20">
                   <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-5xl">⚓</div>
                   <p className="text-[10px] font-mono uppercase tracking-[0.4em] max-w-[180px] mx-auto leading-relaxed">Select a sonar contact to analyze deep-sea telemetry.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BenthicSonar;
