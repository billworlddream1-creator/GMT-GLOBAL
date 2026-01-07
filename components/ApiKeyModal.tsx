
import React from 'react';
import { playUISound } from '../utils/audioUtils';

interface ApiKeyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSuccess }) => {
  const handleSelectKey = async () => {
    try {
      playUISound('click');
      await (window as any).aistudio.openSelectKey();
      // Assume success as per race condition rules
      onSuccess();
    } catch (err) {
      console.error("Selection failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-accent/30 bg-slate-900/60 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <span className="text-8xl font-heading font-black">KEY</span>
        </div>
        
        <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
           🔑
        </div>

        <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">Uplink Authorization Required</h3>
        
        <p className="text-[11px] font-mono text-slate-400 leading-relaxed mb-8 uppercase tracking-widest">
          Cinematic synthesis via Veo requires a valid paid API key. Please select a key from a project with active billing enabled.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleSelectKey}
            className="w-full py-5 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Select API Key
          </button>
          
          <div className="flex flex-col gap-2 pt-4">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-mono text-blue-400 hover:text-white underline uppercase tracking-widest transition-colors"
            >
              Billing Documentation ↗
            </a>
            <button 
              onClick={onClose}
              className="text-[9px] font-mono text-slate-500 hover:text-white uppercase tracking-widest"
            >
              Cancel Uplink
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5">
           <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">GMT_AUTH_GATEWAY_V1.1</span>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
