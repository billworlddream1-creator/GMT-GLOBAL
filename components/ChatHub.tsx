
import React, { useState, useEffect, useRef } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  relayNode?: string;
}

const ChatHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'System', text: 'End-to-end encryption active.', timestamp: '12:00', isEncrypted: true },
    { id: '2', sender: 'Agent_Zero', text: 'Package is secure. Standing by.', timestamp: '12:05', isEncrypted: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState<'General' | 'Security_Ops' | 'Private_Node'>('General');
  const [relayNode, setRelayNode] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      relayNode: relayNode,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    playUISound('click');

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: activeChannel === 'General' ? 'Global_Bot' : 'Ops_Lead',
        text: 'Message received via encrypted tunnel. Protocol confirmed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        relayNode: relayNode
      };
      setMessages(prev => [...prev, response]);
      playUISound('success');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto h-[75vh] flex gap-8 animate-in fade-in duration-700">
      {/* Sidebar: Channels & Users */}
      <div className="w-64 glass rounded-[3rem] border border-white/10 flex flex-col p-8 bg-slate-900/40">
        <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 pb-4 border-b border-white/5">Channels</h3>
        <div className="space-y-3 flex-1">
          {['General', 'Security_Ops', 'Private_Node'].map((ch) => (
            <button
              key={ch}
              onClick={() => { setActiveChannel(ch as any); playUISound('click'); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-mono transition-all border ${
                activeChannel === ch ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-transparent text-slate-500 hover:text-white'
              }`}
            >
              # {ch}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <label className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Relay Node (Proxy)</label>
          <select 
            onChange={(e) => setRelayNode(e.target.value || undefined)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[9px] text-accent outline-none font-mono"
          >
            <option value="">Direct Link</option>
            <option value="Proxy_London">Node: London-7</option>
            <option value="Proxy_Tokyo">Node: Tokyo-Red</option>
            <option value="Proxy_Zurich">Node: Zurich-Vault</option>
          </select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-[3rem] border border-white/10 flex flex-col overflow-hidden bg-slate-900/20">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
             <div>
               <h2 className="text-xl font-heading font-black text-white uppercase tracking-tighter">#{activeChannel}</h2>
               <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Secured via RSA-4096 GMT Neural Bridge</span>
             </div>
          </div>
          {relayNode && (
            <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[8px] font-mono text-accent">
              RELAY_ACTIVE: {relayNode}
            </span>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar"
        >
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase">{m.sender}</span>
                <span className="text-[8px] font-mono text-slate-700">{m.timestamp}</span>
              </div>
              <div className={`max-w-[80%] p-5 rounded-[2rem] text-xs font-mono leading-relaxed relative group ${
                m.sender === 'You' 
                  ? 'bg-accent text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none'
              }`}>
                {m.text}
                {m.relayNode && (
                  <div className="absolute -bottom-4 right-2 text-[7px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Routed through {m.relayNode}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
          <button type="button" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all">📎</button>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your encrypted message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-accent transition-all outline-none"
          />
          <button type="submit" className="px-8 bg-accent text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-accent/80 transition-all active:scale-95">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatHub;
