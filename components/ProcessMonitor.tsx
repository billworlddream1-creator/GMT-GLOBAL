
import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  name: string;
  progress: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETE';
}

const PROCESS_NAMES = [
  'DECRYPT_SAT_UPLINK',
  'FILTER_SOCIAL_NOISE',
  'SYNC_MARKET_STREAMS',
  'RECOGNITION_PHASE_04',
  'PARSING_DIPLOMATIC_CABLES',
  'NEURAL_LINK_STABILIZE',
  'GEOPOLITICAL_RISK_ASSESS',
  'SOCIAL_SENTIMENT_SCAN',
  'ORBITAL_DEBRIS_TRACK',
  'DEEP_WEB_PACKET_INTERCEPT'
];

const ProcessMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [load, setLoad] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => {
        const updated = prev.map(t => {
          if (t.progress < 100 && t.status === 'ACTIVE') {
            const step = Math.random() * 12 + 4; 
            return { ...t, progress: Math.min(100, t.progress + step) };
          }
          if (t.progress >= 100 && t.status !== 'COMPLETE') {
            return { ...t, status: 'COMPLETE' as const };
          }
          return t;
        }).filter(t => {
          if (t.status === 'COMPLETE') {
            return Math.random() > 0.08; 
          }
          return true;
        });

        if (updated.length < 6 && Math.random() > 0.7) {
          updated.push({
            id: `PRC-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)],
            progress: 0,
            status: 'ACTIVE'
          });
        }
        return updated;
      });

      setLoad(prev => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(10, Math.min(95, prev + change));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-10 left-24 right-8 z-[150] h-20 glass rounded-3xl border border-white/10 pointer-events-none select-none animate-in slide-in-from-bottom-4 duration-1000 flex items-center px-8 gap-8 bg-black/40 backdrop-blur-3xl shadow-2xl">
      {/* HUD Lead */}
      <div className="flex flex-col shrink-0 border-r border-white/10 pr-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping shadow-[0_0_8px_var(--accent-primary)]"></div>
          <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.2em]">Matrix_Flow</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-heading font-black text-accent tabular-nums">{load.toFixed(1)}%</span>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Global_Load</span>
        </div>
      </div>

      {/* Landscape Task View */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {tasks.map(task => (
          <div key={task.id} className="flex-1 min-w-[140px] max-w-[200px] flex flex-col justify-center gap-1.5 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-[7px] font-mono tracking-widest">
              <span className="text-slate-400 truncate uppercase">{task.name}</span>
              <span className={`font-black ${task.progress >= 100 ? 'text-emerald-400' : 'text-accent'}`}>
                {Math.round(task.progress)}%
              </span>
            </div>
            
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className={`h-full transition-all duration-1000 ease-out relative ${
                  task.progress >= 100 
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                    : 'bg-accent shadow-[0_0_8px_var(--accent-primary)]'
                }`}
                style={{ width: `${task.progress}%` }}
              >
                {task.progress < 100 && (
                  <div className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                )}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.5em] animate-pulse">Scanning_Synaptic_Pathways...</span>
          </div>
        )}
      </div>

      {/* Network Waveform Visualization */}
      <div className="w-32 h-10 shrink-0 flex items-center justify-center opacity-40">
        <svg viewBox="0 0 100 40" className="w-full h-full text-accent">
          <path 
            d="M0 20 Q 10 5, 20 20 T 40 20 T 60 20 T 80 20 T 100 20" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="animate-wave-offset"
          />
        </svg>
      </div>

      <style>{`
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1s infinite linear;
        }
        @keyframes wave-offset {
          0% { stroke-dasharray: 0 100; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 100 0; stroke-dashoffset: -50; }
          100% { stroke-dasharray: 0 100; stroke-dashoffset: -100; }
        }
        .animate-wave-offset {
          animation: wave-offset 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProcessMonitor;
