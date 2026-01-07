
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { NewsItem } from '../types';
import { playUISound } from '../utils/audioUtils';

interface BrainJetProps {
  intelService: IntelligenceService;
}

const BrainJet: React.FC<BrainJetProps> = ({ intelService }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [velocity, setVelocity] = useState(5); // 1-10 scale
  const [hudMessage, setHudMessage] = useState('AWAITING_INPUT');

  const timerRef = useRef<number | null>(null);

  const fetchJetFuel = async () => {
    setLoading(true);
    setHudMessage('RELOADING_FUEL_STREAMS...');
    try {
      const data = await intelService.getLatestGlobalUpdates('CRITICAL_GLOBAL_SITUATIONS');
      setNews(data);
      setHudMessage('FUEL_ACQUIRED_LOCKED');
      playUISound('success');
    } catch (e) {
      setHudMessage('FUEL_DEPLETED_RETRY');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJetFuel();
  }, []);

  const nextNode = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % (news.length || 1));
    playUISound('click');
  }, [news.length]);

  useEffect(() => {
    if (isActive && news.length > 0) {
      const interval = (11 - velocity) * 1000;
      timerRef.current = window.setInterval(nextNode, interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, velocity, nextNode, news.length]);

  const toggleJet = () => {
    setIsActive(!isActive);
    playUISound(isActive ? 'alert' : 'startup');
    setHudMessage(isActive ? 'JET_ENGINES_IDLE' : 'BRAIN_JET_ENGAGED');
  };

  const currentItem = news[currentIndex];

  if (loading && news.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full py-40 space-y-12 animate-in fade-in duration-700">
       <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-accent/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
          <div className="absolute inset-12 border border-accent/20 rounded-full animate-pulse flex flex-col items-center justify-center">
             <span className="text-xs font-mono text-accent font-black">IGNITING</span>
          </div>
       </div>
       <div className="text-center space-y-4">
         <h2 className="font-heading font-black text-3xl text-white uppercase tracking-[0.4em]">Neural Jet Initializing</h2>
         <p className="font-mono text-xs text-accent animate-pulse tracking-widest uppercase">Calibrating_High_Velocity_Cables...</p>
       </div>
    </div>
  );

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-1000 overflow-hidden">
      {/* Cockpit HUD */}
      <div className="absolute inset-0 pointer-events-none z-10 border-[30px] border-black/20 backdrop-blur-[1px]">
        <div className="absolute top-4 left-4 w-20 h-20 border-t-2 border-l-2 border-accent opacity-30"></div>
        <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-accent opacity-30"></div>
        <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-accent opacity-30"></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 border-b-2 border-r-2 border-accent opacity-30"></div>
        
        {/* Ticker HUD Overlay */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-10">
           <div className="glass px-6 py-2 rounded-xl border-accent/20 border">
              <span className="text-[10px] font-mono text-accent font-black uppercase tracking-widest">{hudMessage}</span>
           </div>
           <div className="glass px-6 py-2 rounded-xl border-white/10 border">
              <span className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-widest">VELOCITY_LVL: {velocity}</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full max-w-5xl aspect-video glass rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row bg-black/80">
        <div className="lg:w-2/3 h-full relative group">
           {currentItem?.image ? (
             <img 
               key={currentItem.id}
               src={currentItem.image} 
               alt={currentItem.title} 
               className={`w-full h-full object-cover grayscale brightness-50 transition-all duration-[2000ms] ${isActive ? 'scale-110 blur-[1px]' : 'scale-100'}`} 
             />
           ) : (
             <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                <span className="text-8xl opacity-10">🚀</span>
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
           
           {/* Center HUD Circle */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-64 h-64 border border-accent/20 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 opacity-60' : 'scale-100 opacity-20'}`}>
                 <div className="w-48 h-48 border-2 border-dashed border-accent/10 rounded-full animate-spin-slow"></div>
              </div>
           </div>
        </div>

        <div className="lg:w-1/3 p-10 flex flex-col justify-between bg-slate-900/60 backdrop-blur-md relative z-20">
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-lg text-[9px] font-black text-accent uppercase tracking-widest">Node_{currentIndex + 1}/{news.length}</span>
                 <span className="text-[8px] font-mono text-slate-500">{new Date(currentItem?.timestamp || '').toLocaleTimeString()}</span>
              </div>
              
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-tight animate-in slide-in-from-right-2 duration-700">
                {currentItem?.title}
              </h3>
              
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed uppercase tracking-wide h-40 overflow-y-auto no-scrollbar">
                {currentItem?.content}
              </p>
           </div>

           <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex justify-between items-end">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Jet_Thrust_Level</label>
                    <div className="flex gap-1">
                       {[...Array(10)].map((_, i) => (
                         <div 
                           key={i} 
                           className={`w-1 h-4 rounded-sm transition-all ${i < velocity ? 'bg-accent' : 'bg-white/5'}`}
                         ></div>
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setVelocity(v => Math.max(1, v - 1))} className="w-8 h-8 glass rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-xs">-</button>
                    <button onClick={() => setVelocity(v => Math.min(10, v + 1))} className="w-8 h-8 glass rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-xs">+</button>
                 </div>
              </div>

              <button 
                onClick={toggleJet}
                className={`w-full py-5 rounded-2xl font-heading font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 ${isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-accent hover:bg-accent/80'} text-white active:scale-95`}
              >
                {isActive ? 'ABORT_JET_MISSION' : 'ENGAGE_NEURAL_JET'}
              </button>
           </div>
        </div>
      </div>

      {/* Floating Speed Streaks Background */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
           {[...Array(15)].map((_, i) => (
             <div 
               key={i}
               className="absolute bg-gradient-to-r from-transparent via-white/40 to-transparent h-[1px] animate-speed-streak"
               style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 300 + 100}px`,
                 animationDuration: `${0.5 + Math.random()}s`,
                 animationDelay: `${Math.random() * 2}s`
               }}
             ></div>
           ))}
        </div>
      )}

      <div className="text-center space-y-4 max-w-xl">
         <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
           Brain Jet Mode utilizes the GMT High-Velocity synth engine to provide an automated, rhythmically synchronized tour of the world's most critical neural fluctuations.
         </p>
         <div className="flex justify-center gap-8 pt-4">
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-accent rounded-full animate-ping"></div>
               <span className="text-[8px] font-mono text-slate-600 uppercase">Engine_Temp: OPTIMAL</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
               <span className="text-[8px] font-mono text-slate-600 uppercase">G_Force: 4.2G</span>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes speed-streak {
          0% { transform: translateX(100vw); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-100vw); opacity: 0; }
        }
        .animate-speed-streak {
          animation: speed-streak linear infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BrainJet;
