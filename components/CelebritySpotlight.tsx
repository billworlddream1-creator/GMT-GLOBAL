
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { CelebrityDossier } from '../types';
import { playUISound } from '../utils/audioUtils';

interface CelebritySpotlightProps {
  intelService: IntelligenceService;
}

const CelebrityImageGallery = ({ images, onSelect }: { images: string[], onSelect: (url: string) => void }) => {
  // Defensive check for images array
  if (!Array.isArray(images) || images.length === 0) return null;

  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">Captured_Imagery_Grid</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((url, i) => (
          <div 
            key={i} 
            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/40 cursor-pointer hover:border-accent/40 transition-all"
            onClick={() => { playUISound('click'); onSelect(url); }}
          >
            <img src={url} alt="VIP Asset" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[7px] font-mono text-white opacity-0 group-hover:opacity-100 transition-all">
              IMG_0{i+1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CelebritySpotlight: React.FC<CelebritySpotlightProps> = ({ intelService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dossier, setDossier] = useState<CelebrityDossier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    playUISound('startup');
    
    try {
      const data = await intelService.getCelebritySpotlight(searchTerm);
      setDossier(data);
      playUISound('success');
    } catch (err: any) {
      setError(err.message);
      playUISound('alert');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'ELEVATED': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      default: return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black text-white">VIP</span>
        </div>
        
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">VIP_Reconnaissance</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mt-2">Targeted Individual Intelligence Matrix</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Target Identification (e.g. 'Elon Musk')..."
              className="flex-1 bg-black/40 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white focus:border-accent outline-none transition-all font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="px-12 py-6 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-3xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  TARGETING...
                </>
              ) : 'Acquire Target'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-mono text-red-400 uppercase tracking-widest animate-pulse">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-pulse">
           <div className="lg:col-span-1 glass h-[500px] rounded-[3.5rem] bg-white/5 border border-white/5"></div>
           <div className="lg:col-span-2 glass h-[500px] rounded-[3.5rem] bg-white/5 border border-white/5"></div>
        </div>
      ) : dossier && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10 duration-700">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-8">
             <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-48 h-48 rounded-full border-4 border-accent/20 p-2 mb-8 relative">
                   <img src={dossier.imageUrl} alt={dossier.name} className="w-full h-full rounded-full object-cover grayscale brightness-75" />
                   <div className="absolute inset-0 border border-accent/40 rounded-full animate-ping opacity-20"></div>
                </div>
                
                <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-1">{dossier.name}</h3>
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-black">{dossier.occupation}</span>
                
                <div className="w-full h-px bg-white/5 my-8"></div>
                
                <div className="w-full space-y-6">
                   <div>
                      <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                        <span>Influence_Quotient</span>
                        <span>{dossier.influenceScore}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${dossier.influenceScore}%` }}></div>
                      </div>
                   </div>
                   
                   <div className={`p-4 rounded-2xl border text-center transition-all ${getRiskColor(dossier.riskRating)}`}>
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] block mb-1">STABILITY_RATING</span>
                      <span className="text-sm font-heading font-black uppercase">{dossier.riskRating}</span>
                   </div>
                </div>
             </div>

             {/* Image Gallery Section */}
             <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/20">
                <CelebrityImageGallery images={dossier.imageUrls || []} onSelect={setPreviewImage} />
             </div>
          </div>

          {/* Intelligence Matrix */}
          <div className="lg:col-span-2 space-y-8">
             <div className="glass p-10 rounded-[3.5rem] border border-white/10 space-y-8">
                <div>
                   <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-6">Tactical_Biometrics</h4>
                   <p className="text-sm font-mono text-slate-300 leading-relaxed italic bg-black/20 p-8 rounded-3xl border border-white/5">
                      "{dossier.biometricSummary}"
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Recent_Activity_Intercept</h4>
                      <p className="text-[11px] font-mono text-slate-400 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">
                        {dossier.recentActivity}
                      </p>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Neural_News_Nodes</h4>
                      <div className="space-y-3">
                        {Array.isArray(dossier.newsHighlights) && dossier.newsHighlights.map((news, i) => (
                          <a 
                            key={i} 
                            href={news.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-accent/40 hover:bg-white/10 transition-all group"
                          >
                             <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] font-mono text-slate-400 line-clamp-1 group-hover:text-white transition-colors">{news.title}</span>
                                <span className="text-accent text-[8px] font-black uppercase">LINK</span>
                             </div>
                          </a>
                        ))}
                        {(!Array.isArray(dossier.newsHighlights) || dossier.newsHighlights.length === 0) && (
                          <div className="text-[9px] font-mono text-slate-600 uppercase italic p-4 text-center">No recent highlights acquired.</div>
                        )}
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-xl">🛰️</div>
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase mb-1">Target_Lock_Established</h4>
                   <p className="text-[9px] font-mono text-slate-500 uppercase">GMT Deep-Search algorithms currently monitoring social frequency buffers for new fluctuations.</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[5000] glass flex items-center justify-center p-10 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full aspect-square md:aspect-video rounded-[3rem] overflow-hidden border-2 border-accent/20 shadow-[0_0_100px_var(--accent-glow)]">
             <img src={previewImage} alt="VIP High Res" className="w-full h-full object-cover" />
             <div className="absolute bottom-10 left-10 glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Enhanced_Imagery_Buffer</span>
             </div>
             <button 
               className="absolute top-10 right-10 w-12 h-12 glass rounded-2xl flex items-center justify-center text-white text-xl hover:bg-white/10 transition-all"
               onClick={() => setPreviewImage(null)}
             >✕</button>
          </div>
        </div>
      )}

      {!dossier && !isLoading && (
        <div className="text-center py-40 opacity-10 space-y-6">
           <span className="text-8xl block">🕵️</span>
           <p className="text-[11px] font-mono uppercase tracking-[0.5em]">Awaiting Target Identification for Acquisition</p>
        </div>
      )}
    </div>
  );
};

export default CelebritySpotlight;
