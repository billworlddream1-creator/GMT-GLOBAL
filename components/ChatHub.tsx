
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  relayNode?: string;
}

interface UserPresence {
  name: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface ChatTheme {
  id: string;
  name: string;
  icon: string;
  accent: string;
  bubbleUser: string;
  bubbleOther: string;
  sidebarBg: string;
  mainBg: string;
  border: string;
}

const CHAT_THEMES: ChatTheme[] = [
  { 
    id: 'neural', 
    name: 'Neural Blue', 
    icon: '🔵', 
    accent: 'text-accent', 
    bubbleUser: 'bg-accent text-white', 
    bubbleOther: 'bg-white/5 text-slate-300 border-white/10',
    sidebarBg: 'bg-slate-900/40',
    mainBg: 'bg-slate-900/20',
    border: 'border-white/10'
  },
  { 
    id: 'phantom', 
    name: 'Phantom Red', 
    icon: '🔴', 
    accent: 'text-red-500', 
    bubbleUser: 'bg-red-600 text-white', 
    bubbleOther: 'bg-red-950/20 text-red-100 border-red-900/30',
    sidebarBg: 'bg-red-950/20',
    mainBg: 'bg-black/60',
    border: 'border-red-900/20'
  },
  { 
    id: 'matrix', 
    name: 'Matrix Green', 
    icon: '🟢', 
    accent: 'text-emerald-500', 
    bubbleUser: 'bg-emerald-600 text-white font-mono', 
    bubbleOther: 'bg-emerald-950/20 text-emerald-100 border-emerald-900/30 font-mono',
    sidebarBg: 'bg-emerald-950/10',
    mainBg: 'bg-black/80',
    border: 'border-emerald-900/20'
  },
  { 
    id: 'solar', 
    name: 'Solar Flare', 
    icon: '🟠', 
    accent: 'text-amber-500', 
    bubbleUser: 'bg-amber-600 text-white', 
    bubbleOther: 'bg-amber-950/20 text-amber-100 border-amber-900/30',
    sidebarBg: 'bg-amber-950/10',
    mainBg: 'bg-slate-900/40',
    border: 'border-amber-900/20'
  }
];

const ChatHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'System', text: 'End-to-end encryption active.', timestamp: '12:00', isEncrypted: true },
    { id: '2', sender: 'Agent_Zero', text: 'Package is secure. Standing by.', timestamp: '12:05', isEncrypted: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState<'General' | 'Security_Ops' | 'Private_Node'>('General');
  const [relayNode, setRelayNode] = useState<string | undefined>(undefined);
  const [currentTheme, setCurrentTheme] = useState<ChatTheme>(CHAT_THEMES[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [users] = useState<UserPresence[]>([
    { name: 'You', status: 'online' },
    { name: 'Agent_Zero', status: 'online' },
    { name: 'System', status: 'online' },
    { name: 'Global_Bot', status: 'online' },
    { name: 'Ops_Lead', status: 'online' },
    { name: 'Shadow_Node', status: 'offline', lastSeen: '2H ago' },
    { name: 'Nexus_Arch', status: 'offline', lastSeen: '5M ago' },
  ]);

  const userStatusMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.name] = user.status;
      return acc;
    }, {} as Record<string, 'online' | 'offline'>);
  }, [users]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getPreciseTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputValue,
      timestamp: getPreciseTime(),
      isEncrypted: true,
      relayNode: relayNode,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    playUISound('click');

    setTimeout(() => {
      const responder = activeChannel === 'General' ? 'Global_Bot' : 'Ops_Lead';
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: responder,
        text: 'Message received via encrypted tunnel. Protocol confirmed.',
        timestamp: getPreciseTime(),
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
      <div className={`w-64 glass rounded-[3rem] border ${currentTheme.border} flex flex-col p-8 ${currentTheme.sidebarBg} transition-all duration-500`}>
        <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 pb-4 border-b border-white/5">Channels</h3>
        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
          {['General', 'Security_Ops', 'Private_Node'].map((ch) => (
            <button
              key={ch}
              onClick={() => { setActiveChannel(ch as any); playUISound('click'); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-mono transition-all border ${
                activeChannel === ch ? `bg-white/10 ${currentTheme.border} text-white` : 'bg-white/5 border-transparent text-slate-500 hover:text-white'
              }`}
            >
              # {ch}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">Interface Skin</h3>
           <div className="grid grid-cols-4 gap-2">
              {CHAT_THEMES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => { setCurrentTheme(t); playUISound('click'); }}
                  data-tooltip={t.name}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${currentTheme.id === t.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  {t.icon}
                </button>
              ))}
           </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">Active Agents</h3>
           <div className="space-y-4 max-h-48 overflow-y-auto no-scrollbar">
              {users.map(u => (
                <div key={u.name} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${u.status === 'online' ? 'text-slate-200' : 'text-slate-500'}`}>{u.name}</span>
                   </div>
                   {u.status === 'offline' && <span className="text-[7px] font-mono text-slate-700 uppercase">{u.lastSeen}</span>}
                </div>
              ))}
           </div>
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
      <div className={`flex-1 glass rounded-[3rem] border ${currentTheme.border} flex flex-col overflow-hidden ${currentTheme.mainBg} transition-all duration-500`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
             <div>
               <h2 className="text-xl font-heading font-black text-white uppercase tracking-tighter">#{activeChannel}</h2>
               <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Secured via RSA-4096 GMT Neural Bridge</span>
             </div>
          </div>
          {relayNode && (
            <span className={`px-3 py-1 bg-white/5 border ${currentTheme.border} rounded-full text-[8px] font-mono ${currentTheme.accent}`}>
              RELAY_ACTIVE: {relayNode}
            </span>
          )}
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar"
        >
          {messages.map((m) => {
            const status = userStatusMap[m.sender] || 'offline';
            return (
              <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-2">
                  {m.sender !== 'You' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                  )}
                  <span className="text-[9px] font-black text-slate-500 uppercase">{m.sender}</span>
                  {m.sender === 'You' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                  )}
                  <span className="text-[8px] font-mono text-slate-500/80">[{m.timestamp}]</span>
                </div>
                <div className={`max-w-[80%] p-5 rounded-[2rem] text-xs font-mono leading-relaxed relative group border ${
                  m.sender === 'You' 
                    ? `${currentTheme.bubbleUser} rounded-tr-none shadow-xl border-transparent` 
                    : `${currentTheme.bubbleOther} rounded-tl-none`
                }`}>
                  {m.text}
                  {m.relayNode && (
                    <div className="absolute -bottom-4 right-2 text-[7px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Routed through {m.relayNode}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
          <button type="button" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all">📎</button>
          <input 
            type="text"
            required
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your encrypted message..."
            className={`flex-1 bg-white/5 border ${currentTheme.border} rounded-2xl px-6 text-sm text-white focus:border-accent transition-all outline-none`}
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className={`px-8 ${currentTheme.bubbleUser.split(' ')[0]} text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatHub;
