
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
  
  // Audio State
  const [isReading, setIsReading] = useState(false); // Playing state
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [readingMode, setReadingMode] = useState<'SUMMARY' | 'FULL' | null>(null);
  
  // Advanced Playback State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [pausedAt, setPausedAt] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  // Image State
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
        sourceRef.current = null;
      }
    };
  }, []);

  const handleRealityAudit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (auditResult) {
      setAuditResult(null);
      playUISound('click');
      return;
    }

    setIsAuditActive(true);
    playUISound('startup');
    try {
      const result = await intelService.performRealityAudit(news.content);
      setAuditResult(result);
      playUISound('success');
      setIsExpanded(true);
    } catch (err) {
      playUISound('alert');
    } finally {
      setIsAuditActive(false);
    }
  };

  const stopPlayback = () => {
    if (sourceRef.current) {
      isPausedRef.current = false; // Ensure onended doesn't think it's a pause
      try { sourceRef.current.stop(); } catch(e) {}
      sourceRef.current = null;
    }
    setIsReading(false);
    setReadingMode(null);
    setAudioBuffer(null);
    setPausedAt(0);
    setStartedAt(0);
    setIsAudioLoading(false);
  };

  const playBuffer = (buffer: AudioBuffer, offset: number) => {
    const ctx = getSharedAudioContext();
    if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      if (isPausedRef.current) {
        // Paused manually, do not reset state
        return;
      }
      // Finished naturally
      setIsReading(false);
      setReadingMode(null);
      setAudioBuffer(null);
      setPausedAt(0);
      setStartedAt(0);
    };

    source.start(0, offset);
    sourceRef.current = source;
    setStartedAt(ctx.currentTime - offset);
    setIsReading(true);
    isPausedRef.current = false;
  };

  const handlePlayPause = async (e: React.MouseEvent, mode: 'SUMMARY' | 'FULL') => {
    e.stopPropagation();
    if (!isVoiceEnabled) {
      alert("SIGNAL_MUTED: Enable Neural Audio in HUD to listen.");
      return;
    }

    const ctx = getSharedAudioContext();

    // Toggle logic
    if (readingMode === mode) {
      if (isReading) {
        // PAUSE
        if (sourceRef.current) {
          isPausedRef.current = true;
          sourceRef.current.stop();
          sourceRef.current = null;
        }
        setPausedAt(ctx.currentTime - startedAt);
        setIsReading(false);
        return;
      } else if (audioBuffer) {
        // RESUME
        playBuffer(audioBuffer, pausedAt);
        return;
      }
    }

    // NEW PLAY / CHANGE MODE
    stopPlayback();
    setReadingMode(mode);
    setIsAudioLoading(true);
    playUISound('click');

    try {
      const textToRead = mode === 'FULL' 
        ? `Detailed Report: ${news.title}. ${news.content}` 
        : `Briefing: ${news.title}. ${news.content.substring(0, 300)}... End of intercept.`;

      const audioData = await intelService.generateBroadcastAudio(textToRead);
      setIsAudioLoading(false);

      if (audioData) {
        const decoded = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        setAudioBuffer(decoded);
        playBuffer(decoded, 0);
      } else {
        stopPlayback();
      }
    } catch (err) {
      stopPlayback();
      playUISound('alert');
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
          {/* Quick Summary Button */}
          <button 
            onClick={(e) => handlePlayPause(e, 'SUMMARY')} 
            aria-label="Listen Briefing" 
            className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${
              readingMode === 'SUMMARY' && isReading ? 'bg-accent border-accent animate-pulse' : 'hover:bg-accent/20'
            }`}
          >
            {isAudioLoading && readingMode === 'SUMMARY' ? (
               <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : readingMode === 'SUMMARY' && isReading ? '⏸' : '🔊'}
          </button>
          
          {/* AI Audit Button */}
          <button 
            onClick={handleRealityAudit} 
            aria-label="Neural Audit" 
            className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${auditResult || isAuditActive ? 'bg-purple-600 border-purple-400 text-white' : 'hover:bg-accent/20'}`}
          >
            {isAuditActive ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : '🔍'}
          </button>
          
          {/* VR View Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onVRView?.(news.image || '', news.title); }} 
            aria-label="Spatial View" 
            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all hover:bg-purple-500/20 hover:text-purple-300"
            title="Enter VR Mode"
          >
            🥽
          </button>
        </div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <div className="flex gap-2">
             <span className="px-2 py-1 bg-black/60 rounded-md text-[8px] font-black text-accent uppercase tracking-widest border border-accent/20">{news.category}</span>
             {news.sentiment === 'CRITICAL' && <span className="px-2 py-1 bg-red-600 rounded-md text-[8px] font-black text-white uppercase animate-pulse">Critical</span>}
           </div>
           
           <div className={`px-2 py-1 rounded-md text-[7px] font-black uppercase flex items-center gap-1.5 backdrop-blur-md border ${news.verified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
              <span className="text-[10px]">{news.verified ? '✅' : '⚠️'}</span>
              <span>{news.verified ? 'VERIFIED' : 'UNVERIFIED'}</span>
           </div>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-heading font-black text-white uppercase leading-tight tracking-tighter mb-4 group-hover:text-accent transition-colors">{news.title}</h3>
        
        {/* Audit Results Panel */}
        {auditResult && (
          <div className="mb-6 p-4 rounded-xl border border-purple-500/30 bg-purple-900/20 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-3 border-b border-purple-500/20 pb-2">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Reality Audit
              </span>
              <span className={`text-[10px] font-mono font-bold ${auditResult.synthScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {auditResult.synthScore}% SYNTHETIC
              </span>
            </div>
            {auditResult.artifacts.length > 0 ? (
               <ul className="space-y-1">
                 {auditResult.artifacts.map((a, i) => (
                   <li key={i} className="text-[9px] font-mono text-slate-300 flex items-start gap-2">
                     <span className="text-purple-500">»</span> {a}
                   </li>
                 ))}
               </ul>
            ) : (
              <p className="text-[9px] font-mono text-slate-400 italic">No significant AI artifacts detected in this datastream.</p>
            )}
          </div>
        )}

        <p className={`text-[11px] font-mono text-slate-400 leading-relaxed mb-6 ${isExpanded ? '' : 'line-clamp-3'}`}>{news.content}</p>
        
        {isExpanded && news.sources && news.sources.length > 0 && (
          <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-2">Sources</span>
            <div className="flex flex-wrap gap-2">
              {news.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-mono text-accent hover:text-white transition-colors"
                >
                  {source.title || 'Source'} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          {isExpanded && (
            <div className="flex gap-4">
              <button 
                onClick={(e) => handlePlayPause(e, 'FULL')}
                className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border ${
                  readingMode === 'FULL' && isReading 
                    ? 'bg-accent/20 border-accent/40 text-accent shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.2)]' 
                    : isAudioLoading && readingMode === 'FULL'
                    ? 'bg-white/5 border-white/10 text-slate-400 cursor-wait'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-accent/10 hover:text-white'
                }`}
              >
                {isAudioLoading && readingMode === 'FULL' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-accent/50 border-t-accent rounded-full animate-spin"></div>
                    BUFFERING...
                  </>
                ) : readingMode === 'FULL' && isReading ? (
                  <>
                    <span className="text-sm">⏸</span> PAUSE REPORT
                  </>
                ) : readingMode === 'FULL' && audioBuffer ? (
                  <>
                    <span className="text-sm">▶</span> RESUME REPORT
                  </>
                ) : (
                  <>
                    <span className="text-sm">🗣</span> PLAY FULL REPORT
                  </>
                )}
              </button>

              {(readingMode === 'FULL' && (isReading || audioBuffer)) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); stopPlayback(); }}
                  className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-black text-[9px] uppercase tracking-widest"
                >
                  STOP
                </button>
              )}
            </div>
          )}
          
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full py-4 glass border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
            {isExpanded ? 'Collapse Report' : 'Read Full Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewsCard);
