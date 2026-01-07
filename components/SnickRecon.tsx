
import React, { useState } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { DecodedSignal } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SnickReconProps {
  intelService: IntelligenceService;
}

const SnickRecon: React.FC<SnickReconProps> = ({ intelService }) => {
  const [reconMode, setReconMode] = useState<'VISUAL' | 'RADIO' | 'DECODER'>('VISUAL');
  const [cipher, setCipher] = useState('');
  const [decoded, setDecoded] = useState<DecodedSignal | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecode = async () => {
    if (!cipher.trim()) return;
    setIsDecoding(true);
    playUISound('startup');
    try {
      const result = await intelService.decodeEncryptedSignal(cipher);
      setDecoded(result);
      playUISound('success');
    } catch (err) {
      console.error("Decoding failure", err);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-heading font-black text-accent uppercase tracking-tighter">
             {reconMode === 'DECODER' ? '🔒 TACTICAL_DECRYPTER' : '🕵️ SHADOW_RECON'}
          </h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-1">Multi-Domain Snick Array v4.0</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
           {(['VISUAL', 'RADIO', 'DECODER'] as const).map(m => (
             <button 
               key={m}
               onClick={() => { setReconMode(m); playUISound('click'); }}
               className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${reconMode === m ? 'bg-accent text-white shadow-accent' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {m}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1">
        {reconMode === 'DECODER' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
            <div className="glass p-10 rounded-[3rem] space-y-8">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Signal_Cipher_Input</h3>
              <textarea 
                value={cipher}
                onChange={(e) => setCipher(e.target.value)}
                placeholder="Paste encrypted bitstream or cipher text here..."
                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-white outline-none focus:border-accent"
              />
              <button 
                onClick={handleDecode} 
                disabled={isDecoding || !cipher}
                className="w-full py-5 bg-accent text-white font-heading font-black rounded-2xl shadow-accent disabled:opacity-50"
              >
                {isDecoding ? 'RUNNING_DECRYPTION_ALGORITHMS...' : 'EXECUTE_DECODE'}
              </button>
            </div>

            <div className="glass p-10 rounded-[3rem] flex flex-col space-y-6 bg-slate-900/10">
               <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">DECRYPTED_OUTPUT</h3>
               {decoded ? (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                       <span className="text-[8px] font-mono text-emerald-500 block mb-2 uppercase font-black">Success_Rate: {decoded.confidence}%</span>
                       <p className="text-sm font-mono text-white leading-relaxed">{decoded.decrypted}</p>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase">Origin_Node: {decoded.origin}</div>
                 </div>
               ) : (
                 <div className="flex-1 flex items-center justify-center opacity-10 text-center italic text-xs">
                    Awaiting Signal Decryption Sequence...
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="glass p-20 rounded-[3rem] text-center opacity-40">
            <span className="text-4xl block mb-6">🛰️</span>
            <p className="text-sm font-mono uppercase tracking-[0.3em]">Module mode {reconMode} operational. Monitoring channels.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnickRecon;
