
import React, { useState } from 'react';
import { ModuleConfig } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SidebarCustomizerProps {
  modules: ModuleConfig[];
  onSave: (modules: ModuleConfig[]) => void;
  onClose: () => void;
}

const SidebarCustomizer: React.FC<SidebarCustomizerProps> = ({ modules, onSave, onClose }) => {
  const [tempModules, setTempModules] = useState<ModuleConfig[]>([...modules]);

  const toggleVisibility = (id: string) => {
    playUISound('click');
    setTempModules(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    playUISound('click');
    const newModules = [...tempModules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newModules.length) return;
    
    [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
    setTempModules(newModules);
  };

  const handleSave = () => {
    playUISound('success');
    onSave(tempModules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/60 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">Matrix_Module_Editor</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Configure node visibility and synaptic priority</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-2 mb-8">
          {tempModules.map((module, index) => (
            <div 
              key={module.id} 
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${module.visible ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-50'}`}
            >
              <button 
                onClick={() => toggleVisibility(module.id)}
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${module.visible ? 'bg-accent border-accent text-white' : 'border-white/20'}`}
              >
                {module.visible && '✓'}
              </button>
              
              <span className="text-lg w-8 text-center">{module.icon}</span>
              
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-heading font-black text-white uppercase truncate">{module.label}</div>
                <div className="text-[8px] font-mono text-slate-500 uppercase truncate">{module.tooltip}</div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="w-8 h-8 glass border-white/10 rounded-lg flex items-center justify-center disabled:opacity-20 hover:border-accent transition-all"
                >
                  ↑
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === tempModules.length - 1}
                  className="w-8 h-8 glass border-white/10 rounded-lg flex items-center justify-center disabled:opacity-20 hover:border-accent transition-all"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 shrink-0">
          <button 
            onClick={handleSave}
            className="flex-1 py-5 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Apply_Configuration
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-5 glass border-white/10 text-slate-400 hover:text-white font-heading font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarCustomizer;
