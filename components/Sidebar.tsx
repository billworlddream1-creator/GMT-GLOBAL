
import React from 'react';
import { ViewType, AccessLevel } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userLevel: AccessLevel;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userLevel, onLogout }) => {
  const navItems = [
    { id: 'feed', label: 'GLOBAL FEED', icon: '🌐' },
    { id: 'deep-space', label: 'DEEP SPACE', icon: '🌌' },
    { id: 'security', label: 'CYBER DEFENSE', icon: '🛡️' },
    { id: 'snicking', label: 'SHADOW RECON', icon: '🕵️‍♂️' },
    { id: 'space-sat', label: 'SATELLITE SCAN', icon: '📡' },
    { id: 'market', label: 'GLOBAL MARKET', icon: '📊' },
    { id: 'intelligence', label: 'INTEL TERMINAL', icon: '🕵️' },
    { id: 'admin', label: 'ADMIN CONSOLE', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 glass h-screen flex flex-col p-6 border-r border-white/5 relative z-50 transition-all">
      <div className="mb-12">
        <h1 className="text-lg font-heading font-black tracking-tighter text-white">
          <span className="block text-[8px] text-slate-500 font-mono tracking-[0.4em] mb-1">GMT_OS_v6.0</span>
          <span className="text-blue-500">GMT</span> GLOBAL
        </h1>
        <div className="mt-3 flex items-center justify-between px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">Clearance</span>
          <span className="text-[9px] font-black text-white font-heading">{userLevel}</span>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id as ViewType); playUISound('click'); }}
              className={`group w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-accent/20 border-accent/40 text-white' 
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-bold text-[9px] tracking-widest font-heading uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-8 flex items-center space-x-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors px-4 py-2 border border-red-500/20 rounded-lg"
      >
        <span>🚪</span>
        <span>Terminate Link</span>
      </button>
    </aside>
  );
};

export default Sidebar;
