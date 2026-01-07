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
        // Update existing tasks
        const updated = prev.map(t => {
          if (t.progress < 100 && t.status === 'ACTIVE') {
            // Variable speed for realism
            const step = Math.random() * 8 + 2; 
            return { ...t, progress: Math.min(100, t.progress + step) };
          }
          if (t.progress >= 100 && t.status !== 'COMPLETE') {
            return { ...t, status: 'COMPLETE' as const };
          }
          return t;
        }).filter(t => {
          // Keep completed tasks for a few seconds before purging
          if (t.status === 'COMPLETE') {
            return Math.random() > 0.05; 
          }
          return true;
        });

        // Add new tasks if queue is low
        if (updated.length < 5 && Math.random() > 0.8) {
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
        const change = (Math.random() - 0.5) * 6;
        return Math.max(5, Math.min(98, prev + change));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-72 z-40 w-72 glass p-5 rounded-[2rem] border border-white/5 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping shadow-[0_0_8px_var(--accent-glow)]"></div>
          <span className="text-[10px] font-heading font-black text-white tracking-[0.2em] uppercase">Tactical_Process_Monitor</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-mono text-accent font-bold tabular-nums">{load.toFixed(1)}%_LOAD</span>
        </div>
      </div>

      <div className="space-y-4 max-h-60 overflow-hidden">
        {tasks.map(task => (
          <div key={task.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-[7px] font-mono tracking-widest">
              <span className="text-slate-400 truncate w-40">{task.name} <span className="opacity-30">// {task.id}</span></span>
              <span className={`font-black ${task.progress >= 100 ? 'text-emerald-400' : 'text-accent'}`}>
                {Math.round(task.progress)}%
              </span>
            </div>
            
            {/* High-Fidelity Progress Bar */}
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className={`h-full transition-all duration-1000 ease-out relative ${
                  task.progress >= 100 
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                    : 'bg-accent shadow-[0_0_10px_var(--accent-glow)]'
                }`}
                style={{ width: `${task.progress}%` }}
              >
                {/* Traveling Bit-Pulse Shimmer */}
                {task.progress < 100 && (
                  <div className="absolute inset-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast"></div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-[8px] font-mono text-slate-700 uppercase italic py-4 text-center tracking-widest">
            Uplink_Idle_Standby...
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-[7px] font-mono text-slate-600 uppercase">Threads: {Math.floor(load / 6)} Established</span>
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-2 rounded-sm transition-all duration-500 ${
                i < (load / 12.5) ? 'bg-accent shadow-[0_0_4px_var(--accent-glow)]' : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default ProcessMonitor;