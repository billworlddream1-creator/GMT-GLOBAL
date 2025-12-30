import React, { useState } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';

interface PredictorHubProps {
  intelService: IntelligenceService;
}

const PredictionSkeleton = () => (
  <div className="relative z-10 pt-10 border-t border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-10 animate-pulse">
    <div className="lg:col-span-2 space-y-6">
      <div className="w-1/4 h-3 bg-white/10 rounded-full shimmer"></div>
      <div className="glass p-8 rounded-[2.5rem] border border-white/10 bg-white/5 h-48 shimmer"></div>
    </div>
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="w-1/3 h-2 bg-white/10 rounded-full shimmer"></div>
          <div className="w-1/4 h-8 bg-white/10 rounded-xl shimmer"></div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full shimmer"></div>
      </div>
      <div className="space-y-4">
        <div className="w-1/2 h-2 bg-white/10 rounded-full shimmer"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-xl border border-white/5 shimmer"></div>
        ))}
      </div>
    </div>
  </div>
);

const PredictorHub: React.FC<PredictorHubProps> = ({ intelService }) => {
  const [query, setQuery] = useState('');
  const [prediction, setPrediction] = useState<{ prediction: string, riskLevel: number, factors: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    playUISound('startup');
    
    try {
      const result = await intelService.getGeopoliticalPrediction(query);
      setPrediction(result);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="glass p-12 rounded-[3.5rem] border border-white/10 bg-slate-900/20 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">ORACLE</span>
        </div>
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">The Oracle</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">Strategic AI Forecasting & Geopolitical Logic Engine</p>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about future trajectories (e.g. 'Future of AI chip manufacturing')..."
            className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white focus:border-accent transition-all outline-none"
          />
          <button 
            onClick={handlePredict}
            disabled={isLoading}
            className="px-12 py-6 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-3xl shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Calculate Outlook'}
          </button>
        </div>

        {isLoading ? (
          <PredictionSkeleton />
        ) : prediction && (
          <div className="relative z-10 pt-10 border-t border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-6 duration-500">
             <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black text-accent uppercase tracking-widest">Neural Forecast</h3>
                <div className="glass p-8 rounded-[2.5rem] border border-accent/20 bg-accent/5 italic text-slate-300 leading-relaxed font-mono text-sm">
                   "{prediction.prediction}"
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Risk</span>
                      <span className={`text-2xl font-heading font-black ${prediction.riskLevel > 70 ? 'text-red-500' : prediction.riskLevel > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {prediction.riskLevel}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full transition-all duration-1000 ${prediction.riskLevel > 70 ? 'bg-red-500' : prediction.riskLevel > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${prediction.riskLevel}%` }}
                      ></div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Factors</h4>
                   <div className="space-y-2">
                      {prediction.factors.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-slate-400">
                           <span className="text-accent">0{i+1}</span>
                           <span>{f}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {!prediction && !isLoading && (
        <div className="text-center py-20 opacity-20">
           <span className="text-8xl mb-6 block">🔮</span>
           <p className="text-[10px] font-mono uppercase tracking-widest">Enter a query to begin neural simulation</p>
        </div>
      )}
    </div>
  );
};

export default PredictorHub;