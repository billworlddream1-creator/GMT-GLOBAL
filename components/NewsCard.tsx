
import React, { useState, useRef, useMemo, memo, useEffect } from 'react';
import { NewsItem, VerificationReport, IntelligenceReminder } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData } from '../utils/audioUtils';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';
import { GoogleGenAI } from "@google/genai";

interface NewsCardProps {
  news: NewsItem;
  intelService: IntelligenceService;
  onVRView?: (url: string, title: string) => void;
  onSetReminder?: (reminder: IntelligenceReminder) => void;
}

const REASSURING_MESSAGES = [
  "Synchronizing orbital buffers...",
  "Synthesizing volumetric frames...",
  "Uplinking temporal data to Veo...",
  "Analyzing report semantics...",
  "Generating cinematic keyframes...",
  "Rendering high-fidelity visuals...",
  "Finalizing neural stream..."
];

const NewsCard: React.FC<NewsCardProps> = ({ news, intelService, onVRView, onSetReminder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('gmt_saved_intel') || '[]');
    setIsSaved(savedItems.some((item: any) => item.id === news.id));
  }, [news.id]);

  useEffect(() => {
    let interval: number;
    if (isVideoGenerating) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % REASSURING_MESSAGES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isVideoGenerating]);

  const formattedDate = useMemo(() => {
    return new Date(news.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [news.timestamp]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const savedItems = JSON.parse(localStorage.getItem('gmt_saved_intel') || '[]');
    let updated;
    if (isSaved) {
      updated = savedItems.filter((item: any) => item.id !== news.id);
      playUISound('alert');
    } else {
      updated = [...savedItems, news];
      playUISound('success');
    }
    localStorage.setItem('gmt_saved_intel', JSON.stringify(updated));
    setIsSaved(!isSaved);
    window.dispatchEvent(new CustomEvent('saved_intel_updated'));
  };

  const startSecureShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    setShareProgress(0);
    playUISound('startup');

    const interval = setInterval(() => {
      setShareProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSharing(false);
            playUISound('share');
          }, 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const toggleAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) {
      sourceRef.current?.stop();
      setIsAudioPlaying(false);
      return;
    }

    setIsAudioLoading(true);
    playUISound('startup');
    try {
      const audioData = await intelService.generateBroadcastAudio(news.content);
      if (audioData) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 });
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsAudioPlaying(false);
        source.start(0);
        sourceRef.current = source;
        setIsAudioPlaying(true);
      }
    } catch (err) {
      console.error('Audio synth error:', err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerifying(true);
    setIsExpanded(true);
    playUISound('startup');
    try {
      const report = await intelService.verifyNewsStory(news.title, news.content);
      setVerificationReport(report);
      playUISound('success');
    } finally {
      setIsVerifying(false);
    }
  };

  const executeVideoGeneration = async () => {
    if (isVideoGenerating) return;
    setIsVideoGenerating(true);
    playUISound('startup');
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic news coverage sequence for: "${news.title}". The visuals should show: ${news.content.substring(0, 200)}. Tactical intelligence agency aesthetic, high quality 4k digital feel.`,
        config: { resolution: '720p', aspectRatio: '16:9', numberOfVideos: 1 }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${(process.env as any).API_KEY}`);
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob));
      playUISound('success');
    } catch (err: any) {
      console.error('Video gen failed', err);
      if (err?.message?.includes("Requested entity was not found")) {
        setShowApiKeyDialog(true);
      }
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleGenerateVideoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setShowApiKeyDialog(true);
    } else {
      executeVideoGeneration();
    }
  };

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setShowApiKeyDialog(false);
    executeVideoGeneration();
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    playUISound('click');
    const url = generateGoogleCalendarUrl({
      title: `[INTEL] ${news.title}`,
      details: `${news.content}\n\nSources: ${news.sources.map(s => s.uri).join(', ')}`,
      location: news.location,
      startTime: news.timestamp
    });
    window.open(url, '_blank');
  };

  const setQuickReminder = (minutes: number) => {
    if (!onSetReminder) return;
    const reminder: IntelligenceReminder = {
      id: `REM-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      intelTitle: news.title,
      triggerTimestamp: Date.now() + (minutes * 60 * 1000),
      severity: news.sentiment === 'CRITICAL' ? 'CRITICAL' : 'ELEVATED',
      status: 'PENDING',
      category: news.category
    };
    onSetReminder(reminder);
    setShowReminderPicker(false);
    playUISound('success');
  };

  const reliabilityBadge = useMemo(() => {
    if (!verificationReport) return null;
    const score = verificationReport.truthScore;
    let colorClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
    let statusText = "VERIFIED_HIGH";
    
    if (score < 50) {
      colorClass = "bg-red-500/20 border-red-500/40 text-red-400";
      statusText = "VERIFIED_LOW";
    } else if (score < 80) {
      colorClass = "bg-amber-500/20 border-amber-500/40 text-amber-400";
      statusText = "VERIFIED_MODERATE";
    }

    return (
      <div className={`absolute top-4 right-4 px-3 py-1 backdrop-blur-md rounded-lg text-[8px] font-black border uppercase tracking-widest flex items-center gap-2 animate-in zoom-in-50 duration-500 shadow-lg ${colorClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
        {statusText}: {score}%
      </div>
    );
  }, [verificationReport]);

  return (
    <div className={`glass rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 border ${isSaved ? 'border-accent/60 bg-accent/5 shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.1)]' : 'border-white/5'} hover:border-accent/30 group ${isExpanded ? 'md:col-span-2' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        {videoUrl ? (
          <div className="w-full h-full border-b-2 border-accent animate-in fade-in">
             <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
          </div>
        ) : (
          <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-accent border border-accent/20 uppercase tracking-widest">{news.category}</span>
          {isSaved && <span className="px-3 py-1 bg-accent rounded-lg text-[8px] font-black text-white uppercase tracking-widest shadow-lg">ARCHIVED</span>}
        </div>

        {reliabilityBadge}
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={toggleSave} data-tooltip={isSaved ? "Purge Archive" : "Archive Intel"} className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${isSaved ? 'bg-accent text-white' : 'hover:bg-accent/20'}`}>🔖</button>
          <button onClick={startSecureShare} data-tooltip="Secure Relay" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-emerald-500/20 transition-all">📤</button>
          <button onClick={handleVerify} data-tooltip="Verify Intel" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${verificationReport ? 'bg-emerald-500/20 border-emerald-500/40' : 'hover:bg-emerald-500/20'}`}>🛡️</button>
          <button onClick={handleGenerateVideoClick} data-tooltip="Synthesize Visuals" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-accent/20 transition-all ${isVideoGenerating ? 'animate-pulse' : ''}`}>
             🎬
          </button>
          <button onClick={handleAddToCalendar} data-tooltip="Add to Calendar" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-blue-500/20 transition-all">📅</button>
          <button onClick={() => setShowReminderPicker(!showReminderPicker)} data-tooltip="Schedule Alert" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${showReminderPicker ? 'bg-accent text-white' : 'hover:bg-amber-500/20'}`}>🔔</button>
          <button onClick={() => onVRView?.(news.image || '', news.title)} data-tooltip="Spatial View" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-purple-500/20 transition-all">🥽</button>
        </div>

        {isVideoGenerating && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
             <div className="w-20 h-20 relative mb-6">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">📽️</span>
             </div>
             <h4 className="text-xs font-heading font-black text-white uppercase tracking-[0.3em] mb-4">Uplink in Progress</h4>
             <p className="text-[10px] font-mono text-accent animate-pulse uppercase tracking-widest min-h-[1.5em]">
                {REASSURING_MESSAGES[loadingMsgIdx]}
             </p>
             <p className="text-[8px] font-mono text-slate-500 uppercase mt-8 max-w-xs">
                Video synthesis can take up to 2-3 minutes. Protocol requires maintaining active connection.
             </p>
          </div>
        )}

        {showApiKeyDialog && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-[70] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
             <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-4">Auth Required</h4>
             <p className="text-[9px] font-mono text-slate-400 mb-6 leading-relaxed">
                Volumetric video synthesis requires a paid GCP project API key. Select a key to proceed with the Veo protocol.
             </p>
             <a 
               href="https://ai.google.dev/gemini-api/docs/billing" 
               target="_blank" 
               className="text-[8px] font-mono text-accent hover:underline uppercase mb-8 block"
             >
               View Billing Documentation ↗
             </a>
             <div className="flex flex-col w-full gap-2">
                <button 
                  onClick={handleSelectKey}
                  className="w-full py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
                >
                  Select API Key
                </button>
                <button 
                  onClick={() => setShowApiKeyDialog(false)}
                  className="w-full py-3 text-[8px] font-mono text-slate-500 uppercase hover:text-white"
                >
                  Cancel Protocol
                </button>
             </div>
          </div>
        )}

        {showReminderPicker && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 space-y-6 animate-in zoom-in-95 duration-300">
             <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Schedule Watch Alert</h4>
             <div className="grid grid-cols-2 gap-3 w-full">
                {[5, 15, 60, 240].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setQuickReminder(m)}
                    className="py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-mono text-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-all"
                  >
                    IN {m >= 60 ? `${m/60}H` : `${m}M`}
                  </button>
                ))}
             </div>
             <button onClick={() => setShowReminderPicker(false)} className="text-[8px] font-mono text-slate-500 uppercase hover:text-white pt-2">Cancel</button>
          </div>
        )}

        {isSharing && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
             <div className="w-20 h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all" style={{ width: `${shareProgress}%` }}></div>
             </div>
             <h4 className="text-xs font-heading font-black text-white uppercase tracking-[0.3em] mb-2">Establishing Secure Relay</h4>
             <p className="text-[8px] font-mono text-emerald-500 uppercase animate-pulse">
                {shareProgress < 100 ? `BROADCASTING_BITSTREAM_${Math.random().toString(16).substr(2, 6).toUpperCase()}...` : 'UPLINK_STABLE_RECON_SENT'}
             </p>
             <div className="mt-6 flex gap-1 h-3 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`w-1 h-full bg-emerald-500/30 ${i*8 < shareProgress ? 'bg-emerald-500 animate-pulse' : ''}`}></div>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">👤</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{news.author || 'ANONYMOUS_SOURCE'}</span>
          </div>
          <div className="h-3 w-px bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{formattedDate}</span>
          </div>
        </div>

        <h3 className="text-xl font-heading font-black text-white uppercase leading-tight tracking-tighter mb-4 group-hover:text-accent transition-colors">{news.title}</h3>
        
        <p className={`text-[11px] font-mono text-slate-400 leading-relaxed mb-6 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {news.content}
        </p>

        {verificationReport && (
          <div className="mb-6 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verification_Protocol_Alpha</span>
              <span className="text-[10px] font-heading font-bold text-white">{verificationReport.truthScore}% TRUTH</span>
            </div>
            <p className="text-[10px] font-mono text-slate-300 italic">"{verificationReport.analysis}"</p>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 flex gap-4">
          <button 
            onClick={toggleAudio}
            disabled={isAudioLoading}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isAudioPlaying ? 'bg-red-600' : 'bg-accent'} text-white shadow-lg`}
          >
            {isAudioLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isAudioPlaying ? '⏹ Terminate' : '▶ Audio_Intel')}
          </button>
          <button 
            onClick={() => { setIsExpanded(!isExpanded); playUISound('click'); }}
            className="px-6 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/10"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isVerifying && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-10">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
          <span className="text-xs font-heading font-black text-accent uppercase tracking-widest animate-pulse">Running Neural Fact-Check...</span>
        </div>
      )}
    </div>
  );
};

export default memo(NewsCard);
