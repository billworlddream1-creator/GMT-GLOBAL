
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';

interface SentimentMapProps {
  intelService: IntelligenceService;
}

const SentimentMap: React.FC<SentimentMapProps> = ({ intelService }) => {
  const [data, setData] = useState<{ region: string, sentiment: string, score: number, color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const res = await intelService.getGlobalSentiment();
      setData(res);
      setIsLoading(false);
      playUISound('success');
    };
    load();
  }, [intelService]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="glass p-12 rounded-[3.5rem] border border-white/10 bg-slate-900/20">
        <div className="flex justify-between items-center mb-12">
           <div>
             <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">World Sentiment Heatmap</h2>
             <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">Emotional pulse of global intelligence streams</p>
           </div>
           <button 
             onClick={() => { playUISound('click'); setIsLoading(true); intelService.getGlobalSentiment().then(d => { setData(d); setIsLoading(false); }); }}
             className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-mono text-slate-500 hover:text-white transition-all uppercase"
           >
             Refresh Pulse
           </button>
        </div>

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
             <p className="text-[10px] font-mono text-accent animate-pulse uppercase tracking-[0.5em]">Analyzing global emotional vectors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((region, i) => (
              <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/5 hover:border-accent/20 transition-all group">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{region.region}</span>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border ${
                      region.sentiment === 'VOLATILE' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      region.sentiment === 'STABLE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {region.sentiment}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl font-heading font-black text-white">{region.score}</div>
                    <div className="text-[10px] font-mono text-slate-600">SENTIMENT_IDX</div>
                 </div>

                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      style={{ width: `${region.score}%`, backgroundColor: region.color }}
                    ></div>
                 </div>
                 
                 <div className="mt-6 flex gap-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className={`h-1 flex-1 rounded-sm ${j < (region.score / 20) ? 'bg-white/10' : 'bg-transparent'}`}></div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-accent/5 flex items-center gap-6">
            <span className="text-4xl">Cyan</span>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Stability Mode</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Growth indicators rising in 14 regions</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-amber-500/5 flex items-center gap-6">
            <span className="text-4xl">Amber</span>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Uncertainty Vector</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Market signals showing divergent paths</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-red-500/5 flex items-center gap-6">
            <span className="text-4xl">Red</span>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Volatility Alert</h4>
               <p className="text-[9px] font-mono text-slate-500 uppercase">Conflict probability spiked in Pacific Rim</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SentimentMap;
