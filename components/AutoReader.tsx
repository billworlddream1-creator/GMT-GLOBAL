
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NewsItem } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData } from '../utils/audioUtils';

interface AutoReaderProps {
  news: NewsItem[];
  intelService: IntelligenceService;
  onClose: () => void;
}

const AutoReader: React.FC<AutoReaderProps> = ({ news, intelService, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const playItem = useCallback(async (index: number) => {
    if (index >= news.length) {
      onClose();
      return;
    }

    stopAudio();
    setIsLoading(true);
    setCurrentIndex(index);
    playUISound('click');

    try {
      const item = news[index];
      const textToRead = `Report ${index + 1}: ${item.title}. ${item.content}`;
      const audioData = await intelService.generateBroadcastAudio(textToRead);

      if (audioData) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current!;
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          setIsPlaying(false);
          // Auto-advance
          if (isPlaying) {
            setTimeout(() => playItem(index + 1), 1000);
          }
        };

        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
        playUISound('success');

        const startTime = Date.now();
        const duration = decodedBuffer.duration * 1000;
        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = Date.now() - startTime;
          const p = Math.min(100, (elapsed / duration) * 100);
          setProgress(p);
          if (p >= 100) clearInterval(progressIntervalRef.current!);
        }, 100);
      }
    } catch (err) {
      console.error("Auto-reader failed at index", index, err);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [news, intelService, onClose, stopAudio, isPlaying]);

  useEffect(() => {
    playItem(0);
    return () => {
      stopAudio();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playItem(currentIndex);
    }
  };

  const handleNext = () => playItem(currentIndex + 1);
  const handlePrev = () => playItem(Math.max(0, currentIndex - 1));

  const currentItem = news[currentIndex];

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl z-[1000] px-6 animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass p-8 rounded-[3.5rem] border border-accent/30 bg-slate-900/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Progress Bar Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-accent shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-10">
          {/* Visual Indicator */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-2xl border-2 border-accent/20 flex items-center justify-center transition-all ${isPlaying ? 'bg-accent/10' : 'bg-white/5'}`}>
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-3xl">{isPlaying ? '🔊' : '🔈'}</span>
              )}
            </div>
            {isPlaying && (
              <div className="absolute -inset-2 border border-accent/30 rounded-2xl animate-ping opacity-20 pointer-events-none"></div>
            )}
          </div>

          {/* Intel Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-[8px] font-mono text-accent uppercase font-black tracking-widest">
                STREAMING_INTEL_{currentIndex + 1}/{news.length}
              </span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <h4 className="text-lg font-heading font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors">
              {currentItem?.title || 'Initializing Uplink...'}
            </h4>
            <div className="flex gap-2 mt-3">
              {news.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i === currentIndex ? 'bg-accent w-4' : i < currentIndex ? 'bg-accent/40' : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={handlePrev} 
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
            >
              ⏮️
            </button>
            <button 
              onClick={handleTogglePlay}
              className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl shadow-2xl transition-all active:scale-90 ${isPlaying ? 'bg-red-600 text-white' : 'bg-accent text-white'}`}
            >
              {isPlaying ? '⏹️' : '▶️'}
            </button>
            <button 
              onClick={handleNext} 
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-slate-400"
            >
              ⏭️
            </button>
            <div className="w-px h-10 bg-white/10 mx-2"></div>
            <button 
              onClick={() => { playUISound('alert'); onClose(); }}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Ambient Neural Waves */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 w-full h-8 flex items-end justify-center gap-1 opacity-10 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-accent rounded-t-full animate-wave"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { height: 10%; }
          50% { height: 80%; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AutoReader;
