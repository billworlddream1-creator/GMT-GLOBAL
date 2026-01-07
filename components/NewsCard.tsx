
import React, { useState, useRef, memo, useEffect } from 'react';
import { NewsItem } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData, getSharedAudioContext } from '../utils/audioUtils';

interface NewsCardProps {
  news: NewsItem;
  intelService: IntelligenceService;
  onVRView?: (url: string, title: string) => void;
  isVoiceEnabled?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, intelService, onVRView, isVoiceEnabled = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuditActive, setIsAuditActive] = useState(false);
  const [auditResult, setAuditResult] = useState<{ synthScore: number, artifacts: string[] } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
    };
  }, []);

  const handleRealityAudit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAuditActive(true);
    playUISound('startup');
    try {
      const result = await intelService.performRealityAudit(news.content);
      setAuditResult(result);
      playUISound('success');
    } catch (err) {
      playUISound('alert');
    } finally {
      setIsAuditActive(false);
    }
  };

  const toggleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVoiceEnabled) {
      alert("SIGNAL_MUTED: Enable Neural Audio in HUD to listen.");
      return;
    }

    if (isReading) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsReading(false);
      return;
    }

    setIsReading(true);
    playUISound('click');
    
    try {
      const audioData = await intelService.generateBroadcastAudio(
        `Briefing: ${news.title}. ${news.content.substring(0, 300)}... End of intercept.`
      );
      
      if (audioData) {
        const ctx = getSharedAudioContext();
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setIsReading(false);
          sourceRef.current = null;
        };
        source.start(0);
        sourceRef.current = source;
      }
    } catch (err) {
      setIsReading(false);
    }
  };

  const getSentimentStyle = () => {
    switch(news.sentiment) {
      case 'CRITICAL': return 'border-red-500/40 bg-red-500/5';
      case 'VOLATILE': return 'border-amber-500/40 bg-amber-500/5';
      default: return 'border-white/5 bg-white/5';
    }
  };

  return (
    <div className={`glass rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 border ${getSentimentStyle()} hover:border-accent/40 group ${isExpanded ? 'md:col-span-2' : ''}`}>
      <div className="relative h-48 overflow-hidden bg-black/20">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 shimmer opacity-20 z-0"></div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 opacity-40">
             <span className="text-3xl mb-2">📡</span>
             <span className="text-[8px] font-mono uppercase tracking-widest text-accent">SIGNAL_LOST</span>
          </div>
        ) : (
          <img 
            src={news.image} 
            alt={news.title} 
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover opacity-80 transition-all duration-[1200ms] ease-out ${
              imageLoaded ? 'opacity-80 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'
            } ${isAuditActive ? 'scale-110 blur-[2px] grayscale' : ''}`} 
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          <button 
            onClick={toggleRead} 
            aria-label={isReading ? "Stop Read" : "Listen Intel"} 
            className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${isReading ? 'bg-accent border-accent animate-pulse' : 'hover:bg-accent/20'}`}
          >
            {isReading ? '⏹' : '🔊'}
          </button>
          <button onClick={handleRealityAudit} aria-label="Neural Audit" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${auditResult ? 'bg-purple-600 border-purple-400' : 'hover:bg-accent/20'}`}>🔍</button>
          <button onClick={() => onVRView?.(news.image || '', news.title)} aria-label="Spatial View" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-purple-500/20">🥽</button>
        </div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <div className="flex gap-2">
             <span className="px-2 py-1 bg-black/60 rounded-md text-[8px] font-black text-accent uppercase tracking-widest border border-accent/20">{news.category}</span>
             {news.sentiment === 'CRITICAL' && <span className="px-2 py-1 bg-red-600 rounded-md text-[8px] font-black text-white uppercase animate-pulse">Critical</span>}
           </div>
           
           <div className={`px-2 py-1 rounded-md text-[7px] font-black uppercase flex items-center gap-1.5 backdrop-blur-md border ${news.verified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
              <span className="text-[10px]">{news.verified ? '✅' : '⚠️'}</span>
              <span>{news.verified ? 'VERIFIED_NODE' : 'UNVERIFIED_INTERCEPT'}</span>
           </div>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-heading font-black text-white uppercase leading-tight tracking-tighter mb-4 group-hover:text-accent transition-colors">{news.title}</h3>
        <p className={`text-[11px] font-mono text-slate-400 leading-relaxed mb-6 ${isExpanded ? '' : 'line-clamp-3'}`}>{news.content}</p>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 py-4 glass border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
            {isExpanded ? 'Collapse_Buffer' : 'Interrogate_Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewsCard);
