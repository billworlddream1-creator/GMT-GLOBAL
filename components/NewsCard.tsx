
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { NewsItem } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData } from '../utils/audioUtils';
import { GoogleGenAI } from "@google/genai";

interface NewsCardProps {
  news: NewsItem;
  intelService: IntelligenceService;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onLocationClick?: (location: string) => void;
}

const FUTURISTIC_PLACEHOLDER = `data:image/svg+xml;base64,${btoa(`
<svg width="400" height="225" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="225" fill="#020617"/>
  <circle cx="200" cy="112" r="40" stroke="#0ea5e922" stroke-width="1" fill="none"/>
</svg>
`)}`;

const NewsCard: React.FC<NewsCardProps> = ({ news, intelService, isSaved, onToggleSave, onLocationClick }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const [currentImage] = useState(news.image || FUTURISTIC_PLACEHOLDER);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Player State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  const readingTime = useMemo(() => Math.ceil(news.content.split(/\s+/).length / 200), [news.content]);

  // Updated to handle Veo key selection as per guidelines
  const handleWatchVideo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideoGenerating) return;

    // MANDATORY: Check if API key has been selected before using Veo models
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Guidelines state to proceed after triggering openSelectKey due to race condition
    }
    
    playUISound('startup');
    setIsVideoGenerating(true);
    setIsExpanded(true);

    try {
      // Create a new instance right before making the API call as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `News briefing: ${news.title}. Cinematic visualization. High-tech.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(blob));
        playUISound('success');
      }
    } catch (err: any) {
      console.error("Video generation failed:", err);
      // Reset key selection if entity not found error occurs
      if (err?.message?.includes("Requested entity was not found.") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
      setErrorMsg('VEO_UPLINK_FAIL');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const toggleAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    playUISound('startup');
    try {
      const audioData = await intelService.generateBroadcastAudio(news.content);
      if (audioData) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        const ctx = audioContextRef.current!;
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        setAudioBuffer(decodedBuffer);
        
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.start(0);
        sourceRef.current = source;
        setIsAudioPlaying(true);
      }
    } catch (err) {
      setErrorMsg('SIGNAL_LOSS');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    playUISound('click');
  };

  return (
    <div className={`group relative glass rounded-[2.5rem] overflow-hidden transition-all duration-700 flex flex-col h-full bg-slate-900/20 hover:bg-slate-900/40 border border-white/5 hover:border-accent/30 shadow-2xl ${isExpanded ? 'md:col-span-2' : ''}`}>
      <div className={`relative overflow-hidden transition-all duration-700 ${isExpanded ? 'h-[24rem]' : 'h-56'}`}>
        {videoUrl ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <img 
            src={currentImage} 
            alt={news.title}
            className={`w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 ${isVideoGenerating ? 'blur-2xl' : ''}`} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        {isVideoGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 p-10 text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] font-heading font-black text-accent tracking-[0.3em] animate-pulse uppercase">Generating Intelligence Video...</span>
            <div className="mt-4 text-[8px] font-mono text-slate-400">VEO engine processing. This may take a few minutes.</div>
          </div>
        )}

        <div className="absolute top-6 left-6 flex gap-3 z-30">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] rounded-lg text-accent border border-accent/20">{news.category}</span>
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10 text-white">
            {news.sentiment}
          </span>
        </div>

        <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(news.id); }}
             className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSaved ? 'bg-accent text-white shadow-accent' : 'bg-black/60 backdrop-blur-md text-slate-400 hover:text-white border border-white/10'}`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
           </button>
        </div>
        
        {!videoUrl && (
          <div className="absolute bottom-6 right-6 flex gap-3 z-30">
            <button onClick={handleWatchVideo} className="w-12 h-12 bg-accent/20 hover:bg-accent backdrop-blur-md border border-accent/30 rounded-2xl flex items-center justify-center text-xl transition-all">🎬</button>
          </div>
        )}
      </div>
      
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="flex items-center justify-between mb-4 text-[9px] font-mono text-slate-500 border-b border-white/5 pb-3">
           <span className="uppercase font-bold tracking-widest">{news.sources[0]?.title || 'NEXUS_SOURCE'}</span>
           <span className="flex items-center gap-1">{readingTime}m READ</span>
        </div>

        <h3 className={`font-heading font-black text-white leading-[1.1] mb-4 group-hover:text-accent transition-colors ${isExpanded ? 'text-4xl' : 'text-xl'}`}>{news.title}</h3>
        
        <div className={`grid transition-all duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
             <p className={`text-xs text-slate-400 font-mono leading-relaxed mb-6 ${isExpanded ? '' : 'line-clamp-3'}`}>{news.content}</p>
             {isExpanded && (
               <div className="pt-6 border-t border-white/5 space-y-6 animate-in fade-in duration-1000">
                  <div className="glass p-5 rounded-3xl border border-accent/20 bg-accent/5 flex items-center gap-5">
                     <button 
                       onClick={toggleAudio}
                       className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-accent"
                     >
                       {isAudioPlaying ? '■' : '▶'}
                     </button>
                     <div className="flex-1">
                       <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Intel_Broadcast_Stream</div>
                       <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-accent" style={{ width: `${isAudioPlaying ? '60%' : '0%'}` }}></div>
                       </div>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {news.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="text-[9px] font-mono text-accent hover:text-white uppercase tracking-widest underline decoration-accent/30">[{s.title.substring(0, 15)}]</a>
                    ))}
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="mt-auto pt-6 flex gap-4">
          <button 
            onClick={toggleAudio} 
            disabled={isAudioLoading} 
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isAudioPlaying ? 'bg-emerald-600 text-white' : 'bg-accent text-white shadow-accent'}`}
          >
            {isAudioLoading ? 'CONNECTING...' : isAudioPlaying ? 'STOP_INTEL' : 'LISTEN_INTEL'}
          </button>
          <button 
            onClick={toggleExpand} 
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isExpanded ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-slate-500 hover:text-accent hover:border-accent'}`}
          >
            {isExpanded ? 'COLLAPSE' : 'EXPAND'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewsCard);
