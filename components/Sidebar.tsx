
import React from 'react';
import { ViewType, AccessLevel, UserProfile } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userLevel: AccessLevel;
  onLogout: () => void;
  rank?: string;
  user?: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userLevel, onLogout, rank, user }) => {
  const navItems = [
    { id: 'feed', label: 'News Feed', icon: '🌐', tooltip: 'Global breaking intelligence' },
    { id: 'saved-intel', label: 'Saved Intel', icon: '🔖', tooltip: 'Archived intelligence reports' },
    { id: 'live-pulse', label: 'Live Pulse', icon: '🔥', tooltip: 'Real-time global heat map' },
    { id: 'internet-stats', label: 'Net Stats', icon: '🕸️', tooltip: 'Digital reach & influencer tracking' },
    { id: 'profile', label: 'Identity Matrix', icon: '👤', tooltip: 'Agent profile & biometrics' },
    { id: 'reminders', label: 'Alert Watch', icon: '⏰', tooltip: 'Scheduled intelligence notifications' },
    { id: 'celebrity-spotlight', label: 'VIP Recon', icon: '🌟', tooltip: 'High-profile individual dossiers' },
    { id: 'camera-recon', label: 'Field Cam', icon: '📸', tooltip: 'Capture tactical reconnaissance' },
    { id: 'world-live', label: 'Geo Navigator', icon: '📍', tooltip: 'Localized signal monitoring' },
    { id: 'briefing', label: 'Daily Briefing', icon: '🎙️', tooltip: 'Synthesized daily report' },
    { id: 'sentiments', label: 'Global Mood', icon: '🌡️', tooltip: 'Geopolitical emotion tracking' },
    { id: 'oracle', label: 'The Oracle', icon: '🔮', tooltip: 'AI predictive trajectory engine' },
    { id: 'spatial-lab', label: 'Spatial Lab', icon: '🥽', tooltip: '3D immersive data analysis' },
    { id: 'chat', label: 'Secret Chat', icon: '💬', tooltip: 'End-to-end encrypted relay' },
    { id: 'blackbox', label: 'Black Box', icon: '⬛', tooltip: 'Metadata wipe & ghost sharing' },
    { id: 'vulnerability-scanner', label: 'Cyber Audit', icon: '🔍', tooltip: 'Remote network recon probe' },
    { id: 'satellite-uplink', label: 'Sat Radar', icon: '🛰️', tooltip: 'Orbital intelligence signals' },
    { id: 'deep-space', label: 'Space Scan', icon: '🌌', tooltip: 'Orbital object tracking' },
    { id: 'intelligence', label: 'Dossiers', icon: '🕵️', tooltip: 'Deep-dive intelligence reports' },
    { id: 'market', label: 'Markets', icon: '📊', tooltip: 'Global financial reconnaissance' },
    { id: 'nexus-link', label: 'Nexus Link', icon: '🔗', tooltip: 'Expand your node network' },
    { id: 'investment', label: 'Invest', icon: '💰', tooltip: 'Strategic capital deployment' },
    { id: 'partnership', label: 'Partners', icon: '🤝', tooltip: 'Sign strategic alliances' },
    { id: 'games', label: 'Simulation', icon: '🎮', tooltip: 'Strategic mental exercises' },
    { id: 'translator', label: 'Translator', icon: '🗣️', tooltip: 'Universal language bridge' },
    { id: 'security', label: 'Security', icon: '🛡️', tooltip: 'Threat monitoring console' },
    { id: 'admin', label: 'Settings', icon: '⚙️', tooltip: 'Core OS protocols' },
  ];

  return (
    <aside className="w-64 glass h-screen flex flex-col p-6 border-r border-white/5 relative z-50 transition-all shrink-0">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl border border-accent/30 bg-black/40 overflow-hidden relative group cursor-pointer" onClick={() => onViewChange('profile')}>
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Agent" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900/50">👤</div>
            )}
            <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-heading font-black tracking-tighter text-white truncate uppercase">
              {user?.name || 'FIELD_AGENT'}
            </h1>
            <span className="block text-[7px] text-slate-500 font-mono tracking-[0.2em] uppercase truncate">ID_{user?.id.split('-').pop()}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
            <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Rank</span>
            <span className="text-[9px] font-black text-white font-heading uppercase">{rank || 'Cadet'}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Auth</span>
            <span className="text-[9px] font-black text-white font-heading">{userLevel}</span>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar pr-2 pb-10">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id as ViewType); playUISound('click'); }}
              data-tooltip={item.tooltip}
              className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-accent/20 border-accent/40 text-white shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.1)]' 
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-bold text-[8px] tracking-[0.15em] font-heading uppercase truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-4 flex items-center space-x-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors px-4 py-3 border border-red-500/20 rounded-xl bg-red-500/5"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
