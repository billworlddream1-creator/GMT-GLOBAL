import React, { useState, useRef, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiGuideProps {
  intelService: IntelligenceService;
}

interface FeatureProjection {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: string;
  elements: string[];
}

const FEATURE_DATA: Record<string, FeatureProjection> = {
  'satellite-uplink': {
    id: 'satellite-uplink',
    name: 'Sat_Radar_Array',
    icon: '🛰️',
    description: 'Active terrestrial intercept and signal decryption.',
    status: 'ACTIVE_SCAN',
    elements: ['Orbital_Radar', 'Signal_Fix', 'Cipher_Decoder', 'Geo_Fix_ID']
  },
  'intelligence': {
    id: 'intelligence',
    name: 'Dossier_Terminal',
    icon: '🕵️',
    description: 'Deep-search archival and individual dossiers.',
    status: 'SECURE',
    elements: ['Tactical_Search', 'Key_Insights', 'Neural_Briefing', 'Source_Grounding']
  },
  'trade-brain': {
    id: 'trade-brain',
    name: 'Trade_Neural_Matrix',
    icon: '🚢',
    description: '3D visualization of global supply chain stability.',
    status: 'SYNCED',
    elements: ['Neural_Nodes', 'Synapse_Flow', 'Hub_Recon', 'Sentiment_Score']
  }
};

const QUICK_QUERIES = [
  { label: 'Signal_Intercept', query: 'How do I handle signals and decode ciphers in Satellite Uplink?', featureId: 'satellite-uplink' },
  { label: 'Intel_Dossiers', query: 'How do I manage tactical dossiers and intel search?', featureId: 'intelligence' },
  { label: 'Trade_Matrix', query: 'How do I navigate the Trade Matrix and neural nodes?', featureId: 'trade-brain' },
];

const AiGuide: React.FC<AiGuideProps> = ({ intelService }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'PROTOCOL_ESTABLISHED: AEGIS Technical Liaison online. Operational query required. Holographic projection surface initialized.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProjection, setActiveProjection] = useState<FeatureProjection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectFeature = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('signal') || lower.includes('sat') || lower.includes('cipher')) return 'satellite-uplink';
    if (lower.includes('intel') || lower.includes('dossier') || lower.includes('search')) return 'intelligence';
    if (lower.includes('trade') || lower.includes('node') || lower.includes('matrix')) return 'trade-brain';
    return null;
  };

  const handleSend = async (query?: string, featureId?: string) => {
    const text = query || inputValue;
    if (!text.trim() || isTyping) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    playUISound('click');

    const detectedId = featureId || detectFeature(text);
    if (detectedId) {
      setActiveProjection(FEATURE_DATA[detectedId]);
    }

    try {
      const response = await intelService.getAegisResponse(text, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      playUISound('success');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'SIGNAL_ERROR: Neural handshake failed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[78vh] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-20">
      {/* Comm-Link Terminal (Left) */}
      <div className="flex-1 glass p-8 rounded-[3.5rem] border border-white/10 bg-slate-900/40 relative overflow-hidden flex flex-col shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <span className="text-[10rem] font-heading font-black">AEGIS</span>
        </div>

        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
              <div>
                <h2 className="text-xl font-heading font-black text-white uppercase tracking-tighter leading-none">AEGIS_Comm_Link</h2>
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Core Technical Support Uplink</span>
              </div>
           </div>
           <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 h-2 bg-blue-500/20 rounded-full"></div>
              ))}
           </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-4 mb-8"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
               <div className={`max-w-[90%] p-5 rounded-3xl border transition-all ${
                 m.role === 'user' 
                   ? 'bg-accent/20 border-accent/40 rounded-tr-none' 
                   : 'bg-black/40 border-white/5 rounded-tl-none font-mono text-slate-300 text-[10px] leading-relaxed'
               }`}>
                  {m.role === 'model' && (
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded">Liaison_Output</span>
                    </div>
                  )}
                  <p className={m.role === 'user' ? 'text-xs text-white' : ''}>{m.text}</p>
               </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
               <div className="p-3 bg-black/20 border border-white/5 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                     <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                     <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                     <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-4 relative z-10">
           <div className="flex flex-wrap gap-2">
              {QUICK_QUERIES.map(q => (
                <button 
                  key={q.label}
                  onClick={() => handleSend(q.query, q.featureId)}
                  disabled={isTyping}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono text-slate-400 hover:text-white hover:border-accent/40 transition-all uppercase"
                >
                  {q.label}
                </button>
              ))}
           </div>
           
           <form 
             onSubmit={(e) => { e.preventDefault(); handleSend(); }}
             className="flex gap-3"
           >
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Operational inquiry..."
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white focus:border-blue-500 transition-all outline-none font-mono"
              />
              <button 
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-black text-[9px] uppercase tracking-widest rounded-2xl transition-all shadow-xl disabled:opacity-50"
              >
                Execute
              </button>
           </form>
        </div>
      </div>

      {/* Projection Matrix (Right) */}
      <div className="w-full lg:w-[450px] glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/60 relative overflow-hidden flex flex-col shadow-2xl">
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="w-full h-full opacity-10" style={{ 
               backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
            }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent"></div>
         </div>

         <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
               <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Visual_Projection
               </h3>
               <span className="text-[7px] font-mono text-slate-500 animate-pulse">MATRIX_SYNC: READY</span>
            </div>

            {activeProjection ? (
               <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-500">
                  <div className="relative aspect-square glass rounded-[2.5rem] border border-blue-500/20 bg-black/40 flex items-center justify-center mb-8 group overflow-hidden">
                     <div className="absolute inset-0 border-[8px] border-blue-500/5 group-hover:border-blue-500/10 transition-all"></div>
                     <span className="text-8xl group-hover:scale-110 transition-transform duration-700">{activeProjection.icon}</span>
                     
                     {/* HUD Overlays */}
                     <div className="absolute top-4 left-4 text-[7px] font-mono text-blue-500/60">PRJ_ID: {activeProjection.id.toUpperCase()}</div>
                     <div className="absolute bottom-4 right-4 text-[7px] font-mono text-emerald-500/60">STATUS: {activeProjection.status}</div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-xl font-heading font-black text-white uppercase tracking-tighter">{activeProjection.name}</h4>
                     <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase">{activeProjection.description}</p>
                     
                     <div className="pt-6 border-t border-white/5 space-y-4">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Interface_Nodes:</span>
                        <div className="grid grid-cols-2 gap-3">
                           {activeProjection.elements.map(el => (
                             <div key={el} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[8px] font-mono text-slate-500 uppercase flex items-center gap-2 group hover:border-blue-500/40 hover:text-white transition-all">
                                <div className="w-1 h-1 bg-blue-500 rounded-full group-hover:animate-ping"></div>
                                {el}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 gap-8">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center relative">
                     <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                     <span className="text-6xl grayscale">💡</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest">Ready_to_Project</h4>
                    <p className="text-[9px] font-mono uppercase tracking-[0.3em] max-w-[200px]">Discuss a feature to initialize visual interface simulation.</p>
                  </div>
               </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[7px] font-mono text-slate-600">
               <span>GMT_LIAISON_CORE_V4.2</span>
               <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-1 h-2 rounded-sm ${i < (activeProjection ? 8 : 2) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AiGuide;