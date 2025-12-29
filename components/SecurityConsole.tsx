
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { CyberThreat } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SecurityConsoleProps {
  intelService: IntelligenceService;
}

const SecurityConsole: React.FC<SecurityConsoleProps> = ({ intelService }) => {
  const [threats, setThreats] = useState<CyberThreat[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanPulse, setScanPulse] = useState(0);
  const [selectedThreat, setSelectedThreat] = useState<CyberThreat | null>(null);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);

  const performScan = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.scanForCyberIntruders();
      setThreats(data);
      if (data.length > 0) playUISound('alert');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [intelService]);

  useEffect(() => {
    performScan();
    const interval = setInterval(() => {
      setScanPulse(prev => (prev + 1) % 100);
    }, 50);
    const scanInterval = setInterval(() => performScan(true), 45000);
    return () => {
      clearInterval(interval);
      clearInterval(scanInterval);
    };
  }, [performScan]);

  const handleMitigate = (id: string) => {
    setMitigatingId(id);
    playUISound('success');
    setTimeout(() => {
      setThreats(prev => prev.map(t => t.id === id ? { ...t, status: 'NEUTRALIZED' as const } : t));
      setMitigatingId(null);
      setSelectedThreat(null);
    }, 2000);
  };

  const getSeverityColor = (s: string) => {
    switch(s) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'MODERATE': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      default: return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-6 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-emerald-500 animate-pulse font-black uppercase tracking-widest">FIREWALL_ACTIVE</span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${Math.random() * 20 + 80}%` }}></div>
              </div>
           </div>
        </div>
        <div>
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">CYBER_DEFENSE_IDS</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">REALTIME_INTRUSION_DETECTION_SYSTEM // NODE_ACTIVE</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => performScan()} 
             className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-900/20"
           >
             FORCE_DEEP_SCAN
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        <div className="lg:col-span-2 glass rounded-[3rem] border border-white/5 p-8 flex flex-col relative overflow-hidden bg-black/20">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-sm font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                 ACTIVE_THREAT_MAP
              </h3>
              <div className="flex gap-4 font-mono text-[9px]">
                 <span className="text-red-500">CRITICAL: {threats.filter(t => t.severity === 'CRITICAL').length}</span>
                 <span className="text-slate-500">WATCHING: {threats.length}</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 relative z-10">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
                   <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-[10px] font-mono uppercase tracking-widest">Intercepting Packets...</span>
                </div>
              ) : threats.length > 0 ? (
                threats.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => { setSelectedThreat(t); playUISound('click'); }}
                    className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                      selectedThreat?.id === t.id ? 'bg-red-500/10 border-red-500/40' : 'bg-white/5 border-white/10 hover:border-red-500/20'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-mono text-slate-500 uppercase font-black">SOURCE_IP: {t.ip}</span>
                           <h4 className="text-lg font-heading font-black text-white uppercase mt-1 tracking-tighter">{t.type.replace('_', ' ')}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getSeverityColor(t.severity)}`}>
                           {t.severity}
                        </span>
                     </div>
                     <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">ORIGIN: {t.origin.toUpperCase()}</span>
                        <span className={t.status === 'NEUTRALIZED' ? 'text-emerald-500 font-black' : 'text-red-500 animate-pulse'}>
                          {t.status}
                        </span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                   <span className="text-6xl">🛡️</span>
                   <p className="text-[10px] font-mono uppercase tracking-[0.4em]">No active intruders detected in sector</p>
                </div>
              )}
           </div>
        </div>

        <div className="glass rounded-[3rem] border border-white/5 p-8 flex flex-col space-y-8 bg-slate-900/10 shadow-2xl relative">
           <div className="border-b border-white/5 pb-4">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">THREAT_INSPECTOR</h3>
           </div>

           {selectedThreat ? (
             <div className="flex-1 space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                   <div className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Payload_Capture</span>
                      <p className="text-[10px] font-mono text-red-400 italic leading-relaxed break-all">
                        {selectedThreat.payload || "NO_DECRYPTABLE_PAYLOAD_DATA"}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-mono text-slate-500 block">TIMESTAMP</span>
                        <span className="text-[10px] font-mono text-white font-black">{new Date(selectedThreat.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-mono text-slate-500 block">LATENCY</span>
                        <span className="text-[10px] font-mono text-white font-black">{Math.floor(Math.random()*200)}ms</span>
                      </div>
                   </div>
                </div>

                <div className="pt-4 space-y-4">
                   <button 
                     onClick={() => handleMitigate(selectedThreat.id)}
                     disabled={selectedThreat.status === 'NEUTRALIZED' || mitigatingId === selectedThreat.id}
                     className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       selectedThreat.status === 'NEUTRALIZED' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20'
                     }`}
                   >
                     {mitigatingId === selectedThreat.id ? 'MITIGATING...' : selectedThreat.status === 'NEUTRALIZED' ? 'THREAT_NEUTRALIZED' : 'EXECUTE_COUNTER_MEASURES'}
                   </button>
                   <button 
                     onClick={() => setSelectedThreat(null)}
                     className="w-full text-[9px] font-mono text-slate-600 hover:text-white uppercase transition-colors"
                   >
                     Close_Inspector
                   </button>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center">
                   <span className="text-2xl animate-pulse">🔒</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">Select a threat from the tactical feed to inspect intruder telemetry.</p>
             </div>
           )}

           <div className="pt-6 border-t border-white/5 flex flex-col space-y-3">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Global_Invasion_Pulse</span>
              <div className="h-10 flex gap-1 items-end overflow-hidden">
                 {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-red-500/30 rounded-t transition-all duration-300"
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityConsole;
