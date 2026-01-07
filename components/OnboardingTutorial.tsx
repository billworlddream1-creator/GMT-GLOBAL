import React, { useState, useEffect, useMemo } from 'react';
import { playUISound } from '../utils/audioUtils';

interface OnboardingStep {
  title: string;
  desc: string;
  targetId?: string;
  icon: string;
  command: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: "Operational_Boot",
    desc: "Welcome to GMT Global Intel, Operative. You have been granted Level 01 clearance to the world's most advanced neural intelligence matrix.",
    icon: "👁️",
    command: "SYNC_INITIALIZED"
  },
  {
    title: "The_Navigation_Matrix",
    desc: "Use the terminal on the left to navigate between specialized intelligence modules. Modules range from terrestrial news to deep-space orbital tracking.",
    targetId: "sidebar-nav",
    icon: "☰",
    command: "NODE_MAPPING"
  },
  {
    title: "Intelligence_Canvas",
    desc: "This central area is your workspace. Detailed dossiers, live satellite feeds, and tactical visualizers populate here based on your active mission.",
    targetId: "main-content-area",
    icon: "📊",
    command: "DATA_SYNTHESIS"
  },
  {
    title: "Operational_HUD",
    desc: "Monitor your uplink quality, toggle tactical visual modes (Dark/Deep Red), and manage neural audio links in the upper control bar.",
    targetId: "intel-hud-bar",
    icon: "🛰️",
    command: "STATUS_COMMAND"
  },
  {
    title: "AEGIS_Liaison",
    desc: "Confused? The AEGIS AI guide is always available to help you interrogate the matrix and explain advanced tactical features.",
    icon: "💡",
    command: "LOGIC_ASSIST"
  },
  {
    title: "Mission_Commence",
    desc: "The global state is in flux. Maintain total situational awareness. Your induction is complete.",
    icon: "⚡",
    command: "UPLINK_LOCKED"
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightStyles, setSpotlightStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Initial delay for dramatic entry
    setTimeout(() => {
      setIsVisible(true);
      playUISound('startup');
    }, 1000);
  }, []);

  useEffect(() => {
    const step = STEPS[currentStep];
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightStyles({
          top: rect.top - 10,
          left: rect.left - 10,
          width: rect.width + 20,
          height: rect.height + 20,
          opacity: 1
        });
      }
    } else {
      setSpotlightStyles({ opacity: 0 });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      playUISound('click');
    } else {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
        playUISound('success');
      }, 500);
    }
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-500">
      {/* Background Mask */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-none"></div>

      {/* Neural Spotlight Effect */}
      <div 
        className="absolute border-2 border-accent/40 rounded-3xl transition-all duration-700 ease-in-out pointer-events-none shadow-[0_0_50px_var(--accent-glow)] bg-accent/5"
        style={spotlightStyles}
      >
        <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-accent animate-pulse"></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-accent animate-pulse"></div>
      </div>

      {/* Briefing Modal */}
      <div className="relative w-full max-w-lg glass p-1 rounded-[3.5rem] border-accent/20 bg-slate-900/60 overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        <div className="bg-accent/10 border-b border-white/10 px-10 py-6 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
              <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.3em]">Induction_Protocol</span>
           </div>
           <span className="text-[10px] font-mono text-accent font-black tracking-widest">{currentStep + 1} / {STEPS.length}</span>
        </div>

        <div className="p-10 space-y-8">
           <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center text-4xl shadow-inner group">
                 <span className="group-hover:scale-110 transition-transform">{step.icon}</span>
              </div>
           </div>

           <div className="text-center space-y-4">
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">{step.title}</h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed uppercase tracking-wider">
                {step.desc}
              </p>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                 <span>Synapse_Link</span>
                 <span>{step.command}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-accent transition-all duration-500 shadow-[0_0_10px_var(--accent-glow)]" 
                   style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                 ></div>
              </div>
           </div>

           <button 
             onClick={handleNext}
             className="w-full py-5 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl active:scale-95 shadow-accent/20"
           >
             {currentStep === STEPS.length - 1 ? 'BEGIN_MISSION' : 'ACKNOWLEDGE_TRANSITION'}
           </button>
        </div>

        <div className="px-10 py-4 bg-black/40 border-t border-white/5 text-center">
           <span className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em]">GMT_GLOBAL_INTEL // OS_4.2.1</span>
        </div>
      </div>

      <style>{`
        .glass {
          backdrop-filter: blur(25px) saturate(180%);
        }
      `}</style>
    </div>
  );
};

export default OnboardingTutorial;
