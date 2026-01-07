
import React, { useState, useEffect, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { SpectralAnomaly } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SpectralAnalyzerProps {
  intelService: IntelligenceService;
}

const SpectralAnalyzer: React.FC<SpectralAnalyzerProps> = ({ intelService }) => {
  const [anomalies, setAnomalies] = useState<SpectralAnomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [emfLevel, setEmfLevel] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  // Particle System for "Aura" Visualization
  const animateParticles = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simulate "Spectral Mist"
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(time * 0.0015 + i * 0.5) * 0.5 + 0.5) * canvas.height;
      const radius = Math.random() * 20 + 5;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${Math.random() * 0.1})`; // Violet mist
      ctx.fill();
    }

    if (isScanning) {
        setEmfLevel(Math.random() * 100);
    } else {
        setEmfLevel(prev => Math.max(0, prev - 1));
    }

    requestRef.current = requestAnimationFrame(animateParticles);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning]);

  const performScan = async () => {
    setLoading(true);
    setIsScanning(true);
    playUISound('startup');
    
    try {
      const data = await intelService.scanSpectralField();
      setAnomalies(data);
      
      // Update EVP Log
      const newEvps = data.filter(a => a.evpContent).map(a => `[EVP] ${a.evpContent}`);
      setHistory(prev => [...newEvps, ...prev].slice(0, 10));
      
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setIsScanning(false), 2000); // Keep visual scan active briefly
    }
  };

  const getAnomalyColor = (type: string) => {
    switch(type) {
      case 'DEMONIC': return 'text-red-500 border-red-500/20 bg-red-500/10 shadow-[0_0_15px_#ef4444]';
      case 'POLTERGEIST': return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'INTELLIGENT': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      default: return 'text-violet-400 border-violet-500/20 bg-violet-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[3.5rem] border border-violet-500/20 bg-violet-950/10 flex justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none">
           <span className="text-8xl font-heading font-black text-violet-400 uppercase tracking-widest">GHOST</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Spectral_Analyzer_V4</h2>
          <p className="text-[10px] font-mono text-violet-500 uppercase tracking-[0.4em] mt-2">Ethereal Motion Detect & EMF Resonance</p>
        </div>
        <button 
          onClick={performScan} 
          disabled={loading || isScanning}
          className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 relative z-20"
        >
          {loading ? 'CALIBRATING...' : 'INITIATE_SESSION'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0 overflow-hidden">
        {/* Visualizer */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black/90 relative overflow-hidden flex items-center justify-center min-h-[500px] shadow-inner group">
           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" width={800} height={600} />
           
           <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="relative w-64 h-64">
                 <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-pulse"></div>
                 <div className="absolute inset-4 rounded-full border-2 border-dashed border-violet-500/10 animate-spin-slow"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                       <span className="text-4xl font-heading font-black text-white tabular-nums">{Math.round(emfLevel)}</span>
                       <span className="text-[8px] font-mono text-violet-500 block uppercase tracking-widest">MicroTesla (µT)</span>
                    </div>
                 </div>
              </div>
              
              {isScanning && <div className="text-[10px] font-mono text-violet-400 uppercase tracking-[0.3em] animate-pulse">Scanning Ethereal Plane...</div>}
           </div>

           {/* Detected Entities Overlay */}
           <div className="absolute inset-0 pointer-events-none">
              {anomalies.map((entity, i) => (
                 <div 
                   key={entity.id}
                   className="absolute p-4 glass rounded-2xl border border-violet-500/30 bg-violet-900/40 backdrop-blur-md animate-in zoom-in duration-500"
                   style={{ 
                     top: `${20 + (i * 15)}%`, 
                     left: `${20 + (i * 20)}%` 
                   }}
                 >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></div>
                       <span className="text-[8px] font-black text-white uppercase tracking-widest">{entity.type}</span>
                    </div>
                    <div className="text-[7px] font-mono text-violet-200 uppercase">LOC: {entity.location}</div>
                 </div>
              ))}
           </div>
        </div>

        {/* Data Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full min-w-0">
           {/* EVP Recorder */}
           <div className="glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 flex-1 flex flex-col overflow-hidden relative">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                 EVP_Audio_Stream
              </h3>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 font-mono text-[9px]">
                 {history.length > 0 ? history.map((log, i) => (
                   <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                      <span className="text-violet-400 font-bold mr-2">{new Date().toLocaleTimeString()}</span>
                      {log}
                   </div>
                 )) : (
                   <div className="text-center opacity-20 py-10">Listening for spectral voices...</div>
                 )}
              </div>
           </div>

           {/* Entity Manifest */}
           <div className="glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 flex-1 flex flex-col overflow-hidden">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                 Manifested_Entities
              </h3>
              <div className="space-y-3 overflow-y-auto no-scrollbar pr-2">
                 {anomalies.map(a => (
                   <div key={a.id} className={`p-4 rounded-2xl border ${getAnomalyColor(a.type)} transition-all`}>
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[9px] font-black uppercase">{a.type}</span>
                         <span className="text-[8px] opacity-70">{a.intensity}% INT</span>
                      </div>
                      <p className="text-[8px] uppercase tracking-wide opacity-80">ID: {a.id} // {a.timestamp}</p>
                   </div>
                 ))}
                 {anomalies.length === 0 && (
                   <div className="text-center opacity-20 py-10 text-[9px] font-mono uppercase tracking-widest">No active manifestations</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SpectralAnalyzer;
