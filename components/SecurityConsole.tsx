
import React, { useState, useEffect, useCallback } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { CyberThreat, ForensicReport } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SecurityConsoleProps {
  intelService: IntelligenceService;
}

const ThreatSkeletonRow = () => (
  <tr className="animate-pulse border-b border-white/5">
    <td className="p-4"><div className="h-3 w-8 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-3 w-20 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-3 w-16 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-3 w-24 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-5 w-16 bg-white/10 rounded-full"></div></td>
    <td className="p-4"><div className="h-3 w-16 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-3 w-12 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="h-6 w-16 bg-white/10 rounded-lg"></div></td>
  </tr>
);

const SecurityConsole: React.FC<SecurityConsoleProps> = ({ intelService }) => {
  const [threats, setThreats] = useState<CyberThreat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<CyberThreat | null>(null);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);
  const [mitigationProgress, setMitigationProgress] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [forensicReport, setForensicReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<{code: string, message: string} | null>(null);

  const performScan = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    playUISound('startup');
    try {
      const data = await intelService.scanForCyberIntruders();
      setThreats(data || []);
      if (data && data.length > 0 && !silent) playUISound('alert');
    } catch (err: any) {
      console.error("Uplink failed during cyber audit", err);
      if (!silent) {
        setError({
          code: err.code || "CYBER_ARRAY_OFFLINE",
          message: err.message || "Threat detection buffer corrupted. Sector scanning suspended."
        });
      }
    } finally {
      setLoading(false);
    }
  }, [intelService]);

  useEffect(() => {
    performScan();
    // Decreased background check frequency to 5m from 45s to avoid 429 quota errors
    const scanInterval = setInterval(() => performScan(true), 300000);
    return () => clearInterval(scanInterval);
  }, [performScan]);

  const handleDeepForensicScan = async (threat: CyberThreat) => {
    setIsAnalyzing(true);
    setForensicReport(null);
    setError(null);
    playUISound('startup');
    
    try {
      const report = await intelService.analyzeThreatDetails(threat);
      setForensicReport(report);
      playUISound('success');
    } catch (err: any) {
      console.error("Forensic scan failed", err);
      setError({
        code: err.code || "FORENSIC_BUFFER_OVERFLOW",
        message: err.message || "Deep packet inspection timed out. Source node highly volatile."
      });
      playUISound('alert');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectThreat = (t: CyberThreat) => {
    setSelectedThreat(t);
    setForensicReport(null);
    setError(null);
    playUISound('click');
    if (t.status !== 'NEUTRALIZED') {
      handleDeepForensicScan(t);
    }
  };

  const handleMitigate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mitigatingId) return;
    
    setMitigatingId(id);
    setMitigationProgress(0);
    playUISound('startup');
    
    // Simulate tactical neutralization with incremental progress
    const duration = 2500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, (currentStep / steps) * 100);
      setMitigationProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        setThreats(prev => prev.map(t => 
          t.id === id ? { ...t, status: 'NEUTRALIZED' as const } : t
        ));
        
        if (selectedThreat?.id === id) {
          setSelectedThreat(prev => prev ? { ...prev, status: 'NEUTRALIZED' } : null);
        }
        
        setMitigatingId(null);
        setMitigationProgress(0);
        playUISound('success');
      }
    }, intervalTime);
  };

  const getSeverityColor = (s: string | undefined) => {
    const sev = (s || 'UNKNOWN').toUpperCase();
    switch(sev) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'HIGH': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      case 'MEDIUM': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      default: return 'text-slate-500 border-white/5 bg-white/5';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-6 bg-slate-900/40 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Security_Firewall</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">Active Intrusion Detection & Forensic Interrogation</p>
          </div>
          <button 
            onClick={() => performScan()} 
            disabled={loading || mitigatingId !== null}
            className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-950/20 disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Trigger_Audit'}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass p-12 rounded-[3.5rem] border-red-500/40 bg-red-500/5 text-center space-y-6">
           <span className="text-6xl animate-pulse">🔒</span>
           <div className="space-y-2">
              <h3 className="text-2xl font-heading font-black text-white uppercase">Neural_Scan_Blocked</h3>
              <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">{error.code} // {error.message}</p>
           </div>
           <button onClick={() => performScan()} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Attempt Buffer Reset</button>
        </div>
      )}

      {(!error || selectedThreat) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
          {/* Threat Table */}
          <div className="lg:col-span-8 glass rounded-[3rem] border border-white/5 p-8 flex flex-col relative overflow-hidden bg-black/20">
             <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/5 pb-4">
                <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                   Active_Threat_Matrix
                </h3>
                <span className="text-[9px] font-mono text-slate-500">{threats.length} NODES_DETECTED</span>
             </div>

             <div className="flex-1 overflow-auto no-scrollbar relative z-10">
                <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 bg-[#020617] z-20 text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/10 shadow-lg">
                      <tr>
                         <th className="p-4 rounded-tl-2xl">ID</th>
                         <th className="p-4">IP_Address</th>
                         <th className="p-4">Origin</th>
                         <th className="p-4">Type</th>
                         <th className="p-4">Severity</th>
                         <th className="p-4">Timestamp</th>
                         <th className="p-4">Status</th>
                         <th className="p-4 rounded-tr-2xl">Action</th>
                      </tr>
                   </thead>
                   <tbody className="text-[10px] font-mono text-slate-300">
                      {loading ? (
                         <>
                           <ThreatSkeletonRow />
                           <ThreatSkeletonRow />
                           <ThreatSkeletonRow />
                           <ThreatSkeletonRow />
                           <ThreatSkeletonRow />
                         </>
                      ) : threats.length > 0 ? (
                         threats.map(t => (
                            <tr 
                              key={t.id} 
                              onClick={() => selectThreat(t)} 
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${selectedThreat?.id === t.id ? 'bg-white/10 border-l-2 border-l-accent' : ''}`}
                            >
                               <td className="p-4 font-bold text-accent">{t.id.split('-').pop()}</td>
                               <td className="p-4 font-mono">{t.ip}</td>
                               <td className="p-4 uppercase truncate max-w-[100px]" title={t.origin}>{t.origin}</td>
                               <td className="p-4 uppercase text-white font-bold">{t.type.replace(/_/g, ' ')}</td>
                               <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-[7px] font-black uppercase border ${getSeverityColor(t.severity)}`}>
                                     {t.severity}
                                  </span>
                               </td>
                               <td className="p-4 whitespace-nowrap text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</td>
                               <td className="p-4">
                                  <span className={t.status === 'NEUTRALIZED' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                                     {t.status}
                                  </span>
                                  {/* Visual mitigation progress for this specific row */}
                                  {mitigatingId === t.id && (
                                    <div className="w-full h-1 bg-blue-900/30 rounded-full mt-1 overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 transition-all duration-75"
                                        style={{ width: `${mitigationProgress}%` }}
                                      ></div>
                                    </div>
                                  )}
                               </td>
                               <td className="p-4">
                                  {t.status === 'ACTIVE' && (
                                     <button 
                                       onClick={(e) => handleMitigate(e, t.id)}
                                       disabled={mitigatingId !== null}
                                       className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase border transition-all ${
                                         mitigatingId === t.id ? 'bg-blue-600 border-blue-500 text-white cursor-wait' : 'bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border-red-500/30'
                                       }`}
                                     >
                                       {mitigatingId === t.id ? '...' : 'MITIGATE'}
                                     </button>
                                  )}
                               </td>
                            </tr>
                         ))
                      ) : (
                         <tr>
                            <td colSpan={8} className="p-20 text-center opacity-30">
                               <div className="flex flex-col items-center gap-4">
                                 <span className="text-4xl">🛡️</span>
                                 <span>NO_THREATS_DETECTED</span>
                               </div>
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Forensic Dossier */}
          <div className="lg:col-span-4 glass rounded-[3rem] border border-white/5 flex flex-col bg-slate-900/10 shadow-2xl relative overflow-hidden">
             <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">Forensic_Dossier</h3>
                {selectedThreat && selectedThreat.status === 'NEUTRALIZED' && (
                  <span className="px-3 py-1 bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[7px] font-black uppercase tracking-widest">
                    SECURED
                  </span>
                )}
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar p-8">
               {selectedThreat ? (
                 <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    {/* Header */}
                    <div className="space-y-2">
                       <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Incident_ID: {selectedThreat.id}</span>
                       <h4 className="text-xl font-heading font-black text-white uppercase leading-none">{selectedThreat.type.replace(/_/g, ' ')}</h4>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Origin_Vector</span>
                         <span className="text-[10px] font-mono text-white uppercase truncate block">{selectedThreat.origin}</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Impact_Class</span>
                         <span className={`text-[10px] font-black uppercase ${selectedThreat.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{selectedThreat.severity}</span>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 text-[9px] font-black text-purple-500 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                          Deep_Packet_Inspection
                       </div>
                       
                       {isAnalyzing ? (
                         <div className="p-8 glass rounded-3xl border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-4 animate-pulse">
                            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            <span className="text-[8px] font-mono text-purple-400 uppercase">Deciphering_Payload...</span>
                         </div>
                       ) : error ? (
                         <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
                            <p className="text-[8px] font-mono text-red-400 uppercase mb-2">{error.message}</p>
                            <button onClick={() => handleDeepForensicScan(selectedThreat)} className="text-[8px] underline text-white">RETRY</button>
                         </div>
                       ) : forensicReport ? (
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Profile_Signature</span>
                               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic">"{forensicReport.actorProfile}"</p>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tactical_Remediation</span>
                               <div className="space-y-2">
                                  {forensicReport.countermeasures.map((cm, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                       <span className="text-emerald-500 mt-0.5">🛡️</span>
                                       <span className="text-[9px] font-mono text-emerald-100">{cm}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                       ) : (
                         <button 
                           onClick={() => handleDeepForensicScan(selectedThreat)}
                           className="w-full py-4 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                         >
                           Initialize_Forensic_Scan
                         </button>
                       )}
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                    <span className="text-5xl">📁</span>
                    <p className="text-[9px] font-mono uppercase tracking-[0.4em] max-w-[200px]">Select a threat from the matrix to view detailed schematics.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityConsole;
