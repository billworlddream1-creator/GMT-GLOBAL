
import React, { useState, useEffect } from 'react';

const LOG_MESSAGES = [
  "INITIALIZING_CORE_NODES...",
  "CONNECTING_SUPER_COMPUTER_CLUSTER_01...",
  "SYNCHRONIZING_NEURAL_BUS...",
  "ESTABLISHING_QUANTUM_TUNNEL...",
  "VERIFYING_GMT_PROTOCOL_HANDSHAKE...",
  "UPLINK_STABLE_READY_FOR_INTERCEPT"
];

const ModuleLoader: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, LOG_MESSAGES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-in fade-in duration-700"
      role="alert"
      aria-busy="true"
      aria-label="Super computer cluster synchronization in progress"
    >
      <div className="relative w-64 h-64">
        {/* Central Core */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-16 h-16 bg-accent/20 rounded-full border border-accent animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-full animate-ping"></div>
           </div>
        </div>

        {/* Orbiting Nodes (Super Computers) */}
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-80px)` }}
          >
             <div className="w-8 h-8 glass border border-accent/40 rounded-xl flex items-center justify-center animate-spin-slow" style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="text-[10px] font-mono text-accent">CPU</span>
             </div>
             {/* Connection Line to Core */}
             <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-t from-accent/40 to-transparent"></div>
          </div>
        ))}

        {/* Outer Ring */}
        <div className="absolute inset-[-20px] border border-accent/5 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-[-40px] border border-accent/5 rounded-full animate-reverse-spin-slow"></div>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.4em]">Cluster_Sync_Sequence</h3>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-accent animate-load-fill shadow-[0_0_15px_var(--accent-primary)]"></div>
          </div>
        </div>

        <div 
          className="glass p-6 rounded-[2rem] border border-white/5 bg-black/40 h-40 overflow-hidden font-mono text-[9px] text-emerald-400/70 space-y-2"
          aria-live="polite"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 animate-in slide-in-from-left-2 duration-300">
               <span className="text-accent">»</span>
               <span className="uppercase">{log}</span>
               <span className="ml-auto text-[7px] opacity-40">[OK]</span>
            </div>
          ))}
          <div className="w-1.5 h-3 bg-accent animate-pulse inline-block ml-4"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes load-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-load-fill { animation: load-fill 4s linear infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .animate-reverse-spin-slow { animation: reverse-spin 12s linear infinite; }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default ModuleLoader;
