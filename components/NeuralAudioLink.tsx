
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { playUISound, decode, decodeAudioData, encode, getSharedAudioContext } from '../utils/audioUtils';
import { NewsItem } from '../types';

interface NeuralAudioLinkProps {
  news?: NewsItem[];
}

const NeuralAudioLink: React.FC<NeuralAudioLinkProps> = ({ news = [] }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [rms, setRms] = useState(0);

  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const latestNews = news.length > 0 ? news[0] : null;

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    playUISound('alert');
  };

  const startSession = async () => {
    setIsConnecting(true);
    playUISound('startup');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const outputAudioContext = getSharedAudioContext();
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            playUISound('success');

            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              setRms(Math.sqrt(sum / inputData.length));

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionRef.current.sendRealtimeInput({ media: pcmBlob });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64) {
              const ctx = getSharedAudioContext();
              const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `AI: ${message.serverContent?.outputTranscription?.text}`]);
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            stopSession();
          },
          onclose: () => {
            if (isActive) stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are the GMT Neural Liaison. Answer questions with tactical precision.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      stopSession();
    }
  };

  const synthesizeNews = () => {
    if (!latestNews || !isActive || !sessionRef.current) {
      if (!isActive) alert("UPLINK_OFFLINE: Initialize Voice Sync first.");
      return;
    }
    playUISound('click');
    setTranscript(prev => [...prev, `SYSTEM: Requesting synthesis for ${latestNews.title}`]);
    sessionRef.current.sendRealtimeInput({
      text: `Please read and summarize this intelligence report for me: Title: ${latestNews.title}. Content: ${latestNews.content}. Provide a tactical summary.`
    });
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-700">
      <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden flex flex-col items-center text-center">
        <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">Neural_Audio_Link</h2>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mb-12">Authorized Real-Time Voice Intelligence Bridge</p>

        {latestNews && (
          <div className="w-full max-w-lg mb-12 glass p-6 rounded-3xl border border-accent/20 bg-accent/5 animate-in slide-in-from-top-4 duration-700 group">
             <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-2">
                <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Latest_Intercept</span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
             </div>
             <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest line-clamp-1 mb-4">{latestNews.title}</h4>
             <button 
               onClick={synthesizeNews}
               disabled={!isActive}
               className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-3 ${
                 isActive 
                  ? 'bg-accent/20 border-accent/40 text-accent hover:bg-accent/30 shadow-lg' 
                  : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-50'
               }`}
             >
                <span>🎙️</span> SYNTHESIZE_INTEL_VIA_LINK
             </button>
          </div>
        )}

        <div className="relative mb-16">
          <div className={`w-48 h-48 rounded-full border-4 transition-all duration-700 flex items-center justify-center relative ${isActive ? 'border-accent shadow-[0_0_50px_var(--accent-glow)]' : 'border-white/5'}`}>
             <div className="absolute inset-0 rounded-full bg-accent opacity-0 animate-pulse" style={{ opacity: isActive ? Math.min(1, rms * 10) : 0 }}></div>
             <span className={`text-6xl transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-40 grayscale'}`}>🧠</span>
          </div>
          {isActive && (
            <div className="absolute inset-[-20px] border border-accent rounded-full animate-ping opacity-20 pointer-events-none"></div>
          )}
        </div>

        <div className="w-full max-w-md space-y-10">
           <div className="p-8 bg-black/40 rounded-3xl border border-white/5 h-40 overflow-y-auto no-scrollbar flex flex-col gap-3">
              {transcript.length > 0 ? transcript.map((t, i) => (
                <p key={i} className="text-[10px] font-mono text-slate-400 text-left animate-in slide-in-from-left-2">{t}</p>
              )) : (
                <p className="text-[9px] font-mono text-slate-700 uppercase italic mt-auto">Awaiting neural handshake...</p>
              )}
           </div>

           <button 
             onClick={isActive ? stopSession : startSession}
             disabled={isConnecting}
             className={`w-full py-6 rounded-3xl font-heading font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 ${isActive ? 'bg-red-600 hover:bg-red-500' : isConnecting ? 'bg-blue-600 animate-pulse' : 'bg-accent hover:bg-accent/80'} text-white active:scale-95 disabled:opacity-50`}
           >
             {isConnecting ? 'ESTABLISHING_LINK...' : isActive ? 'TERMINATE_UPLINK' : 'INITIALIZE_VOICE_SYNC'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralAudioLink;
