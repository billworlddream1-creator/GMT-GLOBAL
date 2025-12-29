
import React from 'react';
import { ViewType, AccessLevel } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userLevel: AccessLevel;
  onLogout: () => void;
  rank?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userLevel, onLogout, rank }) => {
  const navItems = [
    { id: 'feed', label: 'News Feed', icon: '🌐' },
    { id: 'world-live', label: 'Geo Navigator', icon: '📍' },
    { id: 'briefing', label: 'Daily Briefing', icon: '🎙️' },
    { id: 'sentiments', label: 'Global Mood', icon: '🌡️' },
    { id: 'oracle', label: 'The Oracle', icon: '🔮' },
    { id: 'chat', label: 'Secret Chat', icon: '💬' },
    { id: 'blackbox', label: 'Black Box', icon: '⬛' },
    { id: 'games', label: 'Game Hub', icon: '🎮' },
    { id: 'translator', label: 'Translator', icon: '🗣️' },
    { id: 'intelligence', label: 'Reports', icon: '🕵️' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'deep-space', label: 'Space Scan', icon: '🌌' },
    { id: 'market', label: 'Markets', icon: '📊' },
    { id: 'admin', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 glass h-screen flex flex-col p-6 border-r border-white/5 relative z-50 transition-all">
      <div className="mb-12">
        <h1 className="text-lg font-heading font-black tracking-tighter text-white">
          <span className="block text-[8px] text-slate-500 font-mono tracking-[0.4em] mb-1">GMT_OS_v6.5</span>
          <span className="text-accent">GMT</span> GLOBAL
        </h1>
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
            <span className="text-[8px] font-mono text-accent uppercase tracking-widest">Rank</span>
            <span className="text-[9px] font-black text-white font-heading uppercase">{rank || 'Cadet'}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Clearance</span>
            <span className="text-[9px] font-black text-white font-heading">{userLevel}</span>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar pr-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id as ViewType); playUISound('click'); }}
              className={`group w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-accent/20 border-accent/40 text-white shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.1)]' 
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
        className="mt-8 flex items-center space-x-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors px-4 py-3 border border-red-500/20 rounded-xl bg-red-500/5"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
