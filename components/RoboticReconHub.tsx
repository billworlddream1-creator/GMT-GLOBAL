
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { ReconBot } from '../types';
import { playUISound } from '../utils/audioUtils';

interface RoboticReconHubProps {
  intelService: IntelligenceService;
}

const ZONES = ['EURASIA_NORTH', 'MIDDLE_EAST_RECON', 'PACIFIC_RIM_LINK', 'AMERICAS_LATIN', 'AFRICA_SUB_SAHARA', 'DEEP_SPACE_ORBIT'];

const BOT_CLASSES = [
  { class: 'DRONE', id: 'SKY_WATCHER', icon: '🚁', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', desc: 'High-altitude optical intercept & atmospheric scanning.' },
  { class: 'SPIDER', id: 'VOID_VIPER', icon: '🕷️', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', desc: 'Urban data-port infiltration & hardline neural taps.' },
  { class: 'SENTINEL', id: 'AEGIS_EYE', icon: '🤖', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', desc: 'Area denial monitoring & real-time threat detection.' },
  { class: 'CRAWLER', id: 'NODE_HUNTER', icon: '🐛', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', desc: 'Deep-web packet sniffing & dark-node reconnaissance.' },
];

const RoboticReconHub: React.FC<RoboticReconHubProps> = ({ intelService }) => {
  const [bots, setBots] = useState<ReconBot[]>([
    { id: 'UNIT-01', name: 'GHOST_RAY', class: 'DRONE', status: 'IDLE', battery: 100, targetZone: 'STANDBY', signalStrength: 98 },
    { id: 'UNIT-02', name: 'VOID_VIPER', class: 'SPIDER', status: 'IDLE', battery: 94, targetZone: 'STANDBY', signalStrength: 82 },
    { id: 'UNIT-03', name: 'AEGIS_SENTINEL', class: 'SENTINEL', status: 'IDLE', battery: 100, targetZone: 'STANDBY', signalStrength: 99 },
  ]);
  
  const [activeLogs, setActiveLogs] = useState<Record<string, string>>({});
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [configBotId, setConfigBotId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [matrixNoise, setMatrixNoise] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const chars = '01ABCDEF#%&*@';
      const newLine = Array(20).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(' ');
      setMatrixNoise(prev => [newLine, ...prev].slice(0, 15));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleDeployStart = (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot || bot.status !== 'IDLE') return;
    setConfigBotId(botId);
    playUISound('click');
  };

  const executeDeployment = async () => {
    if (!configBotId) return;
    const botId = configBotId;
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    setConfigBotId(null);
    setDeployingId(botId);
    playUISound('startup');

    setTimeout(async () => {
      setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'RECON', targetZone: selectedZone, battery: Math.max(0, b.battery - 12) } : b));
      
      try {
        const log = await intelService.getBotMissionIntel(bot.class, selectedZone);
        setActiveLogs(prev => ({ ...prev, [botId]: log }));
        playUISound('success');
      } catch (e) {
        setActiveLogs(prev => ({ ...prev, [botId]: "CRITICAL_FAILURE: Neural packet loss during transmission." }));
      }
      
      setDeployingId(null);
    }, 3000);
  };

  const handleRecall = (botId: string) => {
    setBots(prev => prev.map(b => b.id === botId ? { ...b, status: 'IDLE', targetZone: 'STANDBY' } : b));
    setActiveLogs(prev => {
      const next = { ...prev };
      delete next[botId];
      return next;
    });
    playUISound('alert');
  };

  const activeReconBots = useMemo(() => bots.filter(b => b.status === 'RECON'), [bots]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      {/* Operation Dashboard */}
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">RECON</span>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex-1">
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.5em] font-black">Hardware_Uplink_Online</span>
             </div>
             <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Robotic_Command_Node</h2>
             <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Deploying neural-linked autonomous units for terrestrial intercept.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="glass p-6 rounded-3xl border border-white/5 bg-black/40 text-center min-w-[150px]">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Active_Units</span>
                <div className="text-3xl font-heading font-black text-white">{activeReconBots.length}</div>
             </div>
             <div className="glass p-6 rounded-3xl border border-white/5 bg-black/40 text-center min-w-[150px]">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Neural_Sync</span>
                <div className="text-3xl font-heading font-black text-emerald-400">92.8%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
        {/* Fleet Inventory (Left) */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto no-scrollbar">
           <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 px-2 flex justify-between">
              <span>Managed_Fleet</span>
              <span className="opacity-40">GEN_V.9.4</span>
           </h3>
           
           <div className="space-y-4 pb-10">
              {bots.map(bot => {
                const botClass = BOT_CLASSES.find(c => c.class === bot.class) || BOT_CLASSES[0];
                const isConfiguring = configBotId === bot.id;
                const isDeploying = deployingId === bot.id;
                
                return (
                  <div 
                    key={bot.id} 
                    className={`glass p-6 rounded-[2.5rem] border transition-all duration-500 relative group overflow-hidden ${
                      bot.status === 'RECON' ? 'border-blue-500/40 bg-blue-500/5' : isConfiguring ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl ${isDeploying ? 'animate-pulse' : ''}`}>
                              {botClass.icon}
                           </div>
                           <div>
                              <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-tighter">{bot.name}</h4>
                              <span className="text-[8px] font-mono text-slate-500 uppercase">{bot.id} // {bot.class}</span>
                           </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-tighter border flex items-center gap-1.5 transition-all ${
                           bot.status === 'RECON' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           bot.status === 'IDLE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                           bot.status === 'DAMAGED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                           'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${
                             bot.status === 'RECON' ? 'bg-emerald-400 animate-pulse shadow-[0_0_5px_#10b981]' : 
                             bot.status === 'IDLE' ? 'bg-amber-400' :
                             bot.status === 'DAMAGED' ? 'bg-red-500 animate-ping' :
                             'bg-blue-400'
                           }`}></span>
                           {bot.status}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                           <div className="flex justify-between text-[7px] font-mono text-slate-500 uppercase"><span>BATTERY</span><span>{bot.battery}%</span></div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${bot.battery < 20 ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${bot.battery}%` }}></div>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[7px] font-mono text-slate-500 uppercase"><span>LOAD</span><span>{bot.status === 'RECON' ? '42' : '0'}%</span></div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400" style={{ width: bot.status === 'RECON' ? '42%' : '0%' }}></div>
                           </div>
                        </div>
                     </div>

                     {bot.status === 'RECON' ? (
                       <div className="space-y-4">
                          <div className="p-3 bg-black/40 rounded-xl border border-blue-500/10 text-center">
                             <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest">Zone_Lock: {bot.targetZone}</span>
                          </div>
                          <button 
                            onClick={() => handleRecall(bot.id)}
                            className="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Recall_Unit
                          </button>
                       </div>
                     ) : (
                       <button 
                         onClick={() => isConfiguring ? executeDeployment() : handleDeployStart(bot.id)}
                         disabled={isDeploying}
                         className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl ${
                           isDeploying ? 'bg-blue-600 animate-pulse' : isConfiguring ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-accent hover:bg-accent/80 text-white'
                         }`}
                       >
                          {isDeploying ? 'LINKING...' : isConfiguring ? 'Execute_Uplink' : 'Begin_Deployment'}
                       </button>
                     )}

                     {isConfiguring && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2">
                           <label className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block px-1">Target_Zone_Acquisition</label>
                           <select 
                             value={selectedZone}
                             onChange={(e) => setSelectedZone(e.target.value)}
                             className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-accent"
                           >
                              {ZONES.map(z => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
                           </select>
                           <button onClick={() => setConfigBotId(null)} className="w-full text-[8px] font-mono text-slate-600 hover:text-slate-400 uppercase">Cancel_Mission</button>
                        </div>
                     )}
                  </div>
                );
              })}
           </div>
        </div>

        {/* Mission Control Visualizer (Right) */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/10 bg-slate-950/60 overflow-hidden flex flex-col shadow-2xl relative">
           {/* Terminal Overlay */}
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 z-20">
              <div className="h-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]" style={{ width: '100%' }}></div>
           </div>

           <div className="p-8 border-b border-white/5 bg-black/40 flex justify-between items-center relative z-10 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                 <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.2em]">Neural_Sensor_Matrix</h3>
              </div>
              <div className="flex gap-4">
                 <span className="text-[8px] font-mono text-slate-500 uppercase animate-pulse">Sync_ID: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                 <span className="text-[8px] font-mono text-slate-500 uppercase">Frequency: 44.2GHz</span>
              </div>
           </div>

           <div className="flex-1 flex overflow-hidden relative">
              <div className="w-48 border-r border-white/5 bg-black p-4 font-mono text-[8px] text-blue-500/40 overflow-hidden select-none shrink-0">
                 {matrixNoise.map((line, i) => <div key={i} className="whitespace-nowrap">{line}</div>)}
              </div>

              <div className="flex-1 flex flex-col p-10 overflow-y-auto no-scrollbar relative">
                 <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                 
                 <div className="relative z-10 space-y-10">
                    {Object.keys(activeLogs).length > 0 ? (
                      Object.keys(activeLogs).map(botId => {
                        const bot = bots.find(b => b.id === botId);
                        const log = activeLogs[botId];
                        return (
                          <div key={botId} className="animate-in slide-in-from-bottom-4 duration-500">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest">{bot?.name}</div>
                                <div className="h-px flex-1 bg-white/5"></div>
                                <span className="text-[8px] font-mono text-slate-600 uppercase">Target: {bot?.targetZone}</span>
                             </div>
                             
                             <div className="glass p-8 rounded-[3rem] border border-white/5 bg-black/40 font-mono text-[11px] text-slate-400 leading-relaxed relative group hover:border-blue-500/20 transition-all">
                                <div className="absolute top-4 right-4 text-[7px] text-blue-500/30 font-black">RAW_SENSOR_DATA_STREAM</div>
                                <div className="whitespace-pre-wrap">
                                  {log.split('\n').map((line, i) => (
                                    <div key={i} className="mb-2 hover:text-white transition-colors cursor-default">
                                      <span className="text-blue-500/40 mr-4">[{i < 9 ? '0' : ''}{i+1}]</span>
                                      {line}
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-[500px] flex flex-col items-center justify-center text-center gap-8 opacity-20">
                         <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-4 border border-blue-500/10 rounded-full flex items-center justify-center text-5xl">📡</div>
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-xl font-heading font-black text-white uppercase tracking-[0.2em]">Ready_to_Intercept</h4>
                           <p className="text-[10px] font-mono uppercase tracking-[0.5em] max-w-sm mx-auto">Select a bot from your inventory and acquire a target zone to begin real-time neural data gathering.</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-10 shrink-0">
              <div className="flex gap-1">
                 {[...Array(20)].map((_, i) => (
                   <div key={i} className={`w-1 h-3 rounded-sm ${i < 14 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                 ))}
              </div>
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.2em]">Neural_Latency: 0.12ms // Encrypted: YES</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {BOT_CLASSES.map(bc => (
           <div key={bc.id} className={`glass p-8 rounded-[2.5rem] border ${bc.border} ${bc.bg} flex items-start gap-6 group hover:scale-[1.02] transition-all`}>
              <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform ${bc.color}`}>{bc.icon}</div>
              <div className="space-y-1">
                 <h4 className="text-[11px] font-heading font-black text-white uppercase tracking-widest">{bc.id}</h4>
                 <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">{bc.desc}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default RoboticReconHub;
