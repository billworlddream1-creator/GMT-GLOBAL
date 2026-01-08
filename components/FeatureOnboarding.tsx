
import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Step {
  title: string;
  text: string;
}

interface FeatureOnboardingProps {
  featureType: 'AUDIO' | 'VIDEO';
  onComplete: () => void;
}

const FEATURE_STEPS: Record<'AUDIO' | 'VIDEO', Step[]> = {
  AUDIO: [
    { title: "Neural Audio Link", text: "This module connects directly to the GMT Voice Core for real-time intelligence synthesis." },
    { title: "Voice Activation", text: "Ensure your microphone permissions are granted. The system listens for tactical commands and natural language queries." },
    { title: "Transcription Stream", text: "All verbal exchanges are transcribed instantly. Watch the log for documented feedback from the AI." },
    { title: "Latency Check", text: "Monitor the 'Neural Latency' indicator. Optimal performance requires sub-200ms latency." }
  ],
  VIDEO: [
    { title: "Direct Broadcast", text: "Initiate secure video uplinks to global GMT nodes for visual reconnaissance." },
    { title: "Target Selection", text: "Select a node from the sidebar list (e.g., 'Alpha Lead') to establish a handshake." },
    { title: "Encryption Protocol", text: "All video streams are end-to-end encrypted using RSA-4096. No data leaks permitted." },
    { title: "Bandwidth Monitor", text: "The system automatically adjusts bitrate based on network health. Watch for 'Signal Critical' warnings." }
  ]
};

const FeatureOnboarding: React.FC<FeatureOnboardingProps> = ({ featureType, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = FEATURE_STEPS[featureType];

  useEffect(() => {
    playUISound('startup');
  }, []);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
      playUISound('click');
    } else {
      playUISound('success');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full glass p-1 rounded-[3rem] border border-accent/30 bg-slate-900/80 shadow-[0_0_50px_rgba(var(--accent-primary-rgb),0.2)] overflow-hidden">
        {/* Header */}
        <div className="bg-accent/10 border-b border-white/10 px-8 py-6 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="text-2xl">{featureType === 'AUDIO' ? '🎙️' : '🎥'}</span>
              <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.2em]">Module_Training</span>
           </div>
           <span className="text-[9px] font-mono text-accent font-black tracking-widest">{stepIndex + 1} / {steps.length}</span>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8 min-h-[300px] flex flex-col justify-between">
           <div className="space-y-4 animate-in slide-in-from-right-4 duration-300" key={stepIndex}>
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">{steps[stepIndex].title}</h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed uppercase tracking-wider">
                {steps[stepIndex].text}
              </p>
           </div>

           {/* Progress */}
           <div className="space-y-6">
              <div className="flex gap-1">
                 {steps.map((_, i) => (
                   <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= stepIndex ? 'bg-accent shadow-[0_0_10px_var(--accent-glow)]' : 'bg-white/5'}`}></div>
                 ))}
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-5 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95"
              >
                {stepIndex === steps.length - 1 ? 'INITIALIZE_MODULE' : 'NEXT_PROTOCOL'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureOnboarding;
