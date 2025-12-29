
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
  'GEOPOLITICAL_RISK_ASSESS'
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
            return { ...t, progress: Math.min(100, t.progress + Math.random() * 15) };
          }
          if (t.progress >= 100) return { ...t, status: 'COMPLETE' as const };
          return t;
        }).filter(t => t.status !== 'COMPLETE' || Math.random() > 0.1); // Slowly clear complete tasks

        // Add new tasks
        if (updated.length < 4 && Math.random() > 0.7) {
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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-72 z-40 w-64 glass p-4 rounded-2xl border border-white/5 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
          <span className="text-[9px] font-heading font-black text-white tracking-widest uppercase">System_Monitor</span>
        </div>
        <span className="text-[8px] font-mono text-blue-400 font-bold">{load.toFixed(1)}%_LOAD</span>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="space-y-1">
            <div className="flex justify-between items-center text-[7px] font-mono text-slate-500">
              <span className="truncate">{task.name} // {task.id}</span>
              <span className={task.progress >= 100 ? 'text-emerald-400' : 'text-blue-400'}>
                {Math.round(task.progress)}%
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${task.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-[7px] font-mono text-slate-700 uppercase italic py-2">Idle_Queue_Empty...</div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center">
        <span className="text-[7px] font-mono text-slate-600">THREADS: {Math.floor(load / 8)} ACTIVE</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-sm ${i < (load / 20) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessMonitor;
