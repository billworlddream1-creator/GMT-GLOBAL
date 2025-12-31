
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
  
  // Persistent save state initialized from localStorage to prevent mount flicker
  const [isSaved, setIsSaved] = useState(() => {
    const savedItems = JSON.parse(localStorage.getItem('gmt_saved_intel') || '[]');
    return savedItems.some((item: any) => item.id === news.id);
  });
  
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tacticalOutlook, setTacticalOutlook] = useState<string | null>(null);
  
  // Voice selection state
  const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE'>(() => Math.random() > 0.5 ? 'MALE' : 'FEMALE');
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sync state if news.id changes without component unmounting
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

  useEffect(() => {
    if (isExpanded && !tacticalOutlook && !isAnalyzing) {
      handleTacticalOutlookInternal();
    }
  }, [isExpanded, tacticalOutlook, isAnalyzing]);

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
    setIsArchiving(true);
    playUISound('startup');

    // Simulate tactical archival processing
    setTimeout(() => {
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
      setIsArchiving(false);
      
      // Dispatch event to notify listeners (like Saved Intel view)
      window.dispatchEvent(new CustomEvent('saved_intel_updated'));
    }, 800);
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
    
    const maleVoices = ['Puck', 'Charon'];
    const femaleVoices = ['Kore', 'Zephyr'];
    const candidates = voiceGender === 'MALE' ? maleVoices : femaleVoices;
    const selectedVoice = candidates[Math.floor(Math.random() * candidates.length)];
    
    try {
      const audioData = await intelService.generateBroadcastAudio(news.content, selectedVoice);
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

  const handleTacticalOutlookInternal = async () => {
    setIsAnalyzing(true);
    try {
      const result = await intelService.getSummarizedTacticalOutlook(news.content);
      setTacticalOutlook(result);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTacticalOutlookClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playUISound('startup');
    handleTacticalOutlookInternal().then(() => playUISound('success'));
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

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    playUISound('click');
    const url = generateGoogleCalendarUrl({
      title: `[GMT_INTEL] ${news.title}`,
      details: `${news.content}\n\nGEOLOCATION: ${news.location || 'GLOBAL'}\n\nSOURCES:\n${news.sources.map(s => `• ${s.title}: ${s.uri}`).join('\n')}`,
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

  const toggleVoiceGender = (e: React.MouseEvent) => {
    e.stopPropagation();
    playUISound('click');
    setVoiceGender(prev => prev === 'MALE' ? 'FEMALE' : 'MALE');
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
    <div className={`glass rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 border ${isSaved ? 'border-accent/60 bg-accent/5 shadow-[0_0_30px_var(--accent-glow)]' : 'border-white/5'} hover:border-accent/40 hover:scale-[1.01] hover:shadow-[0_0_40px_var(--accent-glow)] group ${isExpanded ? 'md:col-span-2' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        {videoUrl ? (
          <div className="w-full h-full border-b-2 border-accent animate-in fade-in">
             <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
          </div>
        ) : (
          <img 
            src={news.image} 
            alt={news.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 group-hover:-translate-y-4 transition-all duration-[2000ms] ease-out" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        {/* Archival Overlay */}
        {isArchiving && (
          <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Archiving_Intel...</span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-accent border border-accent/20 uppercase tracking-widest">{news.category}</span>
          {isSaved && <span className="px-3 py-1 bg-accent rounded-lg text-[8px] font-black text-white uppercase tracking-widest shadow-lg">ARCHIVED</span>}
        </div>

        {reliabilityBadge}
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={toggleSave} data-tooltip={isSaved ? "Purge Archive" : "Archive Intel"} className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${isSaved ? 'bg-accent text-white' : 'hover:bg-accent/20'}`}>🔖</button>
          <button onClick={startSecureShare} data-tooltip="Secure Relay" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-emerald-500/20 transition-all">📤</button>
          <button onClick={handleVerify} data-tooltip="Verify Intel" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${verificationReport ? 'bg-emerald-500/20 border-emerald-500/40' : 'hover:bg-emerald-500/20'}`}>🛡️</button>
          <button onClick={handleTacticalOutlookClick} data-tooltip="Tactical Outlook" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg transition-all ${tacticalOutlook ? 'bg-purple-500/20 border-purple-500/40' : 'hover:bg-purple-500/20'}`}>🎯</button>
          <button onClick={handleGenerateVideoClick} data-tooltip="Synthesize Visuals" className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-lg hover:bg-accent/20 transition-all ${isVideoGenerating ? 'animate-pulse' : ''}`}>🎬</button>
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

        {isAnalyzing && (
           <div className="mb-6 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-center gap-3 animate-in fade-in duration-300">
              <div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="text-[9px] font-mono text-purple-400 uppercase animate-pulse">Tactical_Forecasting...</span>
           </div>
        )}

        {tacticalOutlook && !isAnalyzing && (
          <div className={`mb-6 p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 animate-in slide-in-from-top-4 relative overflow-hidden group/analysis transition-all ${!isExpanded ? 'max-h-32' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/analysis:opacity-10 transition-opacity">
               <span className="text-4xl">🎯</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em]">Strategic_Tactical_Outlook</span>
              <div className="flex gap-1">
                 {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
              </div>
            </div>
            <p className={`text-[10px] font-mono text-slate-300 italic leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-4' : ''}`}>
              "{tacticalOutlook}"
            </p>
            {!isExpanded && tacticalOutlook.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
            )}
          </div>
        )}

        {isExpanded && news.sources && news.sources.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grounding_Sources</h4>
            <div className="flex flex-wrap gap-2">
              {news.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-mono text-slate-400 hover:text-white hover:border-accent transition-all flex items-center gap-2">
                  <span>{s.title || 'Source'}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {verificationReport && isExpanded && (
          <div className="mb-6 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verification_Protocol_Alpha</span>
              <span className="text-[10px] font-heading font-bold text-white">{verificationReport.truthScore}% TRUTH</span>
            </div>
            <p className="text-[10px] font-mono text-slate-300 italic">"{verificationReport.analysis}"</p>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
          <div className="flex-1 flex gap-2">
            <button 
              onClick={toggleAudio}
              disabled={isAudioLoading}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isAudioPlaying ? 'bg-red-600' : 'bg-accent'} text-white shadow-lg`}
            >
              {isAudioLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isAudioPlaying ? '⏹ Terminate' : '▶ Audio_Intel')}
            </button>
            
            <button 
              onClick={toggleVoiceGender}
              data-tooltip={`Switch to ${voiceGender === 'MALE' ? 'Female' : 'Male'} AI`}
              className="w-12 h-14 glass rounded-2xl flex items-center justify-center text-lg border border-white/10 hover:border-accent/40 transition-all text-slate-400 hover:text-accent"
            >
              {voiceGender === 'MALE' ? '👨' : '👩'}
            </button>
          </div>
          
          {isExpanded && (
            <button 
              onClick={handleAddToCalendar}
              className="px-6 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all border border-blue-500/20 flex items-center gap-2"
            >
              <span>📅</span>
              <span>Calendar</span>
            </button>
          )}

          <button 
            onClick={() => { setIsExpanded(!isExpanded); playUISound('click'); }}
            className="px-6 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/10"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewsCard);
