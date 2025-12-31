
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData } from '../utils/audioUtils';

interface DossierBriefingProps {
  news: NewsItem[];
  intelService: IntelligenceService;
}

const DossierBriefing: React.FC<DossierBriefingProps> = ({ news, intelService }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startBriefing = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    playUISound('startup');
    
    // Male voices: Puck, Charon. Female voices: Kore, Zephyr.
    const voices = ['Kore', 'Puck', 'Charon', 'Zephyr'];
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];

    try {
      const summaryText = news.length > 0 
        ? `Attention Agent. Today's global briefing includes ${news.length} critical items. Primary focus: ${news[0].title}. Secondary report: ${news[1]?.title || 'none'}. Stay alert.`
        : "No new intelligence to report at this time.";

      const audioData = await intelService.generateBroadcastAudio(summaryText, randomVoice);
      if (audioData) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        const ctx = audioContextRef.current!;
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setIsPlaying(false);
          setProgress(0);
        };
        
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
        playUISound('success');

        // Simple progress simulation
        let start = Date.now();
        const duration = decodedBuffer.duration * 1000;
        const pInterval = setInterval(() => {
          const elapsed = Date.now() - start;
          const p = (elapsed / duration) * 100;
          if (p >= 100) {
            clearInterval(pInterval);
            setProgress(100);
          } else {
            setProgress(p);
          }
        }, 100);
      }
    } catch (err) {
      console.error("Briefing failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in duration-700">
      <div className="glass p-12 rounded-[4rem] border border-accent/20 bg-slate-900/40 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="mb-10 relative">
          <div className={`w-32 h-32 rounded-full border-4 border-accent/20 flex items-center justify-center relative ${isPlaying ? 'animate-pulse' : ''}`}>
             <span className="text-5xl">🎙️</span>
             {isPlaying && (
               <div className="absolute inset-[-10px] border border-accent rounded-full animate-ping opacity-25"></div>
             )}
          </div>
        </div>

        <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">Neural Briefing Engine</h2>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mb-12">Authorized Agent Briefing // Voice Uplink Alpha</p>

        <div className="w-full max-w-lg space-y-8">
           <div className="flex justify-between text-[10px] font-mono text-accent uppercase tracking-widest px-2">
              <span>Status: {isPlaying ? 'Broadcasting' : isLoading ? 'Generating' : 'Ready'}</span>
              <span>Encrypted: YES</span>
           </div>

           <button 
             onClick={startBriefing}
             disabled={isLoading}
             className={`w-full py-6 rounded-3xl font-heading font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-accent hover:bg-accent/80 text-white'} active:scale-95 disabled:opacity-50`}
           >
             {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Uplinking...
                </>
             ) : isPlaying ? 'Terminate Briefing' : 'Initialize Audio Dossier'}
           </button>

           <div className="grid grid-cols-3 gap-4 pt-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-[8px] font-mono text-slate-600 block mb-1">Items</span>
                 <span className="text-lg font-heading font-black text-white">{news.length}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-[8px] font-mono text-slate-600 block mb-1">Signal</span>
                 <span className="text-lg font-heading font-black text-emerald-400">HQ</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <span className="text-[8px] font-mono text-slate-600 block mb-1">Dynamics</span>
                 <span className="text-lg font-heading font-black text-blue-400">VAR</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DossierBriefing;
