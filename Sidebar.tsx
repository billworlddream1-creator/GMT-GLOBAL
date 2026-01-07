
import React from 'react';
import { ViewType, AccessLevel, UserProfile, ModuleConfig } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userLevel: AccessLevel;
  onLogout: () => void;
  rank?: string;
  user?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  // New props for collapse/customization
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  modules: ModuleConfig[];
  onOpenCustomizer: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  userLevel, 
  onLogout, 
  rank, 
  user,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  modules,
  onOpenCustomizer
}) => {
  const handleNavClick = (id: ViewType) => {
    playUISound('click');
    onViewChange(id);
    if (window.innerWidth < 1024) onClose();
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
      case 'INFILTRATING': return 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
      case 'COMPROMISED': return 'bg-red-500 shadow-[0_0_8px_#ef4444]';
      case 'STANDBY': return 'bg-slate-500 shadow-[0_0_8px_#64748b]';
      default: return 'bg-slate-700';
    }
  };

  const visibleModules = modules.filter(m => m.visible);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <nav 
        className={`fixed lg:static top-0 left-0 glass h-screen flex flex-col p-6 border-r border-white/5 z-[110] transition-all duration-500 ease-in-out shrink-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${isCollapsed ? 'lg:w-24' : 'lg:w-64'}`}
        aria-label="Intelligence Modules Navigation"
        role="navigation"
      >
        {/* Toggle Collapse Button (Desktop Only) */}
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 glass border-white/10 rounded-full items-center justify-center text-[10px] hover:border-accent transition-all z-[120]"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? '❯' : '❮'}
        </button>

        <div className={`mb-8 flex flex-col transition-all duration-500 ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center justify-between mb-6 w-full ${isCollapsed ? 'flex-col gap-4' : ''}`}>
             <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
               <button 
                 className={`rounded-xl border border-accent/30 bg-black/40 overflow-hidden relative group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all ${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'}`} 
                 onClick={() => { onViewChange('profile'); onClose(); }}
                 aria-label={`View Identity Matrix for Agent ${user?.name || 'Unknown'}`}
               >
                 {user?.photoUrl ? (
                   <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-40 bg-black/20" aria-hidden="true">👤</div>
                 )}
               </button>
               {!isCollapsed && (
                 <div className="flex flex-col min-w-0">
                   <h1 className="text-[10px] font-heading font-black tracking-tighter truncate uppercase text-white">
                     {user?.name || 'FIELD_AGENT'}
                   </h1>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1 h-1 rounded-full animate-pulse ${getStatusColor(user?.operationalStatus)}`}></div>
                      <span className="text-[7px] font-mono opacity-50 truncate uppercase tracking-widest text-slate-400">{user?.operationalStatus || 'OFFLINE'}</span>
                   </div>
                 </div>
               )}
             </div>
             <button 
               onClick={onClose} 
               className="p-2 glass border-white/5 opacity-40 hover:opacity-100 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden" 
               aria-label="Close navigation"
             >
               <span aria-hidden="true">✕</span>
             </button>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col gap-1" aria-label="User Status Summary">
              <div className="flex items-center justify-between px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
                <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Rank</span>
                <span className="text-[9px] font-black font-heading uppercase text-white">{rank || 'Cadet'}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`space-y-1 flex-1 overflow-y-auto no-scrollbar pr-2 pb-6 ${isCollapsed ? 'items-center flex flex-col' : ''}`} role="list">
          {visibleModules.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-label={item.tooltip}
                data-tooltip={isCollapsed ? item.tooltip : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center rounded-xl transition-all duration-300 border outline-none focus-visible:ring-2 focus-visible:ring-accent 
                  ${isCollapsed ? 'w-12 h-12 justify-center p-0 mb-2' : 'w-full space-x-3 px-3 py-2.5'}
                  ${isActive 
                    ? 'bg-accent/20 border-accent/40 shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.1)]' 
                    : 'text-text-muted border-transparent hover:text-text-main hover:bg-black/5 focus-visible:bg-black/10'
                }`}
              >
                <span className={`${isCollapsed ? 'text-lg' : 'text-sm'}`} aria-hidden="true">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-bold text-[8px] tracking-[0.15em] font-heading uppercase truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={`mt-auto pt-4 border-t border-white/5 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button 
            onClick={onOpenCustomizer}
            aria-label="Customize modules"
            data-tooltip={isCollapsed ? "Customize Matrix" : undefined}
            className={`flex items-center transition-colors border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full space-x-3 px-3 py-2.5'}`}
          >
            <span aria-hidden="true">⚙️</span>
            {!isCollapsed && <span className="font-bold text-[8px] tracking-[0.1em] font-heading uppercase truncate">Customize_Nodes</span>}
          </button>

          <button 
            onClick={onLogout}
            aria-label="Log out of intelligence matrix"
            data-tooltip={isCollapsed ? "Terminate Session" : undefined}
            className={`flex items-center transition-colors border border-red-500/20 rounded-xl bg-red-500/5 hover:bg-red-500/10 outline-none focus-visible:ring-2 focus-visible:ring-red-500
              ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full space-x-3 px-3 py-2.5'}`}
          >
            <span aria-hidden="true" className="text-red-500">🚪</span>
            {!isCollapsed && <span className="font-bold text-[8px] tracking-[0.1em] font-heading uppercase truncate text-red-500">Log_Out</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
