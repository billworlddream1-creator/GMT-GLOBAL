
import React, { useState } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { playUISound, decode, decodeAudioData } from '../utils/audioUtils';

interface TranslatorHubProps {
  intelService: IntelligenceService;
}

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Portuguese', 'Italian', 'Hindi'
];

const TranslatorHub: React.FC<TranslatorHubProps> = ({ intelService }) => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    playUISound('startup');
    const result = await intelService.translateText(inputText, targetLang);
    setTranslatedText(result);
    setIsLoading(false);
    playUISound('success');
  };

  const handleSpeak = async () => {
    if (!translatedText || isSpeaking) return;
    setIsSpeaking(true);

    // Randomize voice selection
    const voices = ['Kore', 'Puck', 'Charon', 'Zephyr'];
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];

    try {
      const audioData = await intelService.generateBroadcastAudio(translatedText, randomVoice);
      if (audioData) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 });
        const decodedBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start(0);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 space-y-8 bg-slate-900/20">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Language Translator</h2>
          <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-xl font-mono text-[10px] text-accent uppercase tracking-widest">Live Engine</div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Enter text below</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm text-white focus:border-accent transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Choose Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none appearance-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="bg-slate-900 text-white">{lang}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleTranslate}
              disabled={isLoading}
              className="px-10 py-4 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>

        {translatedText && (
          <div className="pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent uppercase tracking-widest px-2">Translation</label>
              <div className="glass p-8 rounded-3xl border border-accent/20 bg-accent/5 relative group">
                <p className="text-lg text-white font-medium leading-relaxed italic">"{translatedText}"</p>
                <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                     onClick={() => { navigator.clipboard.writeText(translatedText); playUISound('click'); }}
                     className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                     title="Copy"
                   >
                     📋
                   </button>
                   <button 
                     onClick={handleSpeak}
                     disabled={isSpeaking}
                     className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${isSpeaking ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                     title="Listen"
                   >
                     🔊
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center opacity-30">
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Powered by GMT Bridge</p>
      </div>
    </div>
  );
};

export default TranslatorHub;
