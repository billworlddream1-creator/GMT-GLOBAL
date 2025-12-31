
import React, { useState, useEffect, useCallback } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { CyberThreat } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SecurityConsoleProps {
  intelService: IntelligenceService;
}

const ThreatSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/5 space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="w-1/4 h-2 bg-white/10 rounded-full shimmer"></div>
            <div className="w-1/2 h-6 bg-white/10 rounded-xl shimmer"></div>
          </div>
          <div className="w-20 h-5 bg-white/10 rounded-full shimmer"></div>
        </div>
        <div className="flex justify-between">
          <div className="w-1/3 h-2 bg-white/5 rounded-full shimmer"></div>
          <div className="w-1/4 h-2 bg-white/5 rounded-full shimmer"></div>
        </div>
      </div>
    ))}
  </div>
);

const SecurityConsole: React.FC<SecurityConsoleProps> = ({ intelService }) => {
  const [threats, setThreats] = useState<CyberThreat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<CyberThreat | null>(null);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);

  const performScan = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.scanForCyberIntruders();
      setThreats(data);
      if (data.length > 0 && !silent) playUISound('alert');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [intelService]);

  useEffect(() => {
    performScan();
    const scanInterval = setInterval(() => performScan(true), 45000);
    return () => clearInterval(scanInterval);
  }, [performScan]);

  const handleDeepForensicScan = async (threat: CyberThreat) => {
    setIsAnalyzing(true);
    setAnalysisReport(null);
    playUISound('startup');
    
    try {
      const report = await intelService.analyzeThreatDetails(threat);
      setAnalysisReport(report);
      playUISound('success');
    } catch (err) {
      console.error("Forensic scan failed", err);
      setAnalysisReport("CRITICAL: Forensic engine timed out. Threat signature remains obscured.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectThreat = (t: CyberThreat) => {
    setSelectedThreat(t);
    setAnalysisReport(null);
    playUISound('click');
    handleDeepForensicScan(t);
  };

  const handleMitigate = (id: string) => {
    setMitigatingId(id);
    playUISound('startup');
    setTimeout(() => {
      setThreats(prev => prev.map(t => t.id === id ? { ...t, status: 'NEUTRALIZED' as const } : t));
      setMitigatingId(null);
      playUISound('success');
    }, 2000);
  };

  const getSeverityColor = (s: string) => {
    switch(s.toUpperCase()) {
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
            disabled={loading}
            className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-950/20 disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Trigger_Audit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Threat Queue */}
        <div className="lg:col-span-5 glass rounded-[3rem] border border-white/5 p-8 flex flex-col relative overflow-hidden bg-black/20">
           <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/5 pb-4">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
                 Intrusion_Queue
              </h3>
              <span className="text-[9px] font-mono text-slate-500">{threats.length} NODES_DETECTED</span>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 space-y-4">
              {loading ? (
                <ThreatSkeleton />
              ) : threats.length > 0 ? (
                threats.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => selectThreat(t)}
                    className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                      selectedThreat?.id === t.id ? 'bg-accent/10 border-accent' : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-mono text-slate-500 uppercase font-black">SRC_IP: {t.ip}</span>
                           <h4 className="text-lg font-heading font-black text-white uppercase mt-1 tracking-tighter">{t.type.replace(/_/g, ' ')}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getSeverityColor(t.severity)}`}>
                           {t.severity}
                        </span>
                     </div>
                     <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">Node: {t.origin.toUpperCase()}</span>
                        <span className={t.status === 'NEUTRALIZED' ? 'text-emerald-500 font-black' : 'text-red-500'}>
                          {t.status}
                        </span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-6">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-4xl">🛡️</div>
                   <p className="text-[10px] font-mono uppercase tracking-[0.4em]">Zero Active Threats Detected</p>
                </div>
              )}
           </div>
        </div>

        {/* Forensic Dossier */}
        <div className="lg:col-span-7 glass rounded-[3rem] border border-white/5 flex flex-col bg-slate-900/10 shadow-2xl relative overflow-hidden">
           <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">Forensic_Intelligence_Dossier</h3>
              {selectedThreat && (
                <button 
                  onClick={() => handleMitigate(selectedThreat.id)}
                  disabled={selectedThreat.status === 'NEUTRALIZED' || mitigatingId === selectedThreat.id}
                  className={`px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    selectedThreat.status === 'NEUTRALIZED' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                  }`}
                >
                  {mitigatingId === selectedThreat.id ? 'Applying_Filter...' : selectedThreat.status === 'NEUTRALIZED' ? 'Node_Hardened' : 'Isolate_Threat'}
                </button>
              )}
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar p-10">
             {selectedThreat ? (
               <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Capture Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
                       <span className="text-[8px] font-mono text-slate-500 uppercase">Detection_Time</span>
                       <span className="text-xs font-mono text-white">{new Date(selectedThreat.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
                       <span className="text-[8px] font-mono text-slate-500 uppercase">Vector_Status</span>
                       <span className={`text-xs font-mono font-black ${selectedThreat.status === 'NEUTRALIZED' ? 'text-emerald-500' : 'text-red-500'}`}>{selectedThreat.status}</span>
                    </div>
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-2">
                       <span className="text-[8px] font-mono text-slate-500 uppercase">Packet_Origin</span>
                       <span className="text-xs font-mono text-white uppercase">{selectedThreat.origin}</span>
                    </div>
                  </div>

                  {/* Raw Data */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Intercepted_Payload</h4>
                     <div className="p-6 bg-black/40 rounded-[2rem] border border-white/10 font-mono text-[11px] text-red-400/80 leading-relaxed break-all max-h-32 overflow-y-auto custom-scrollbar">
                        {selectedThreat.payload || "No persistent data packets captured for this stream."}
                     </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest px-2 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                        Neural_Logic_Synthesis
                     </h4>
                     
                     {isAnalyzing ? (
                       <div className="p-12 glass rounded-[2.5rem] border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-6 animate-pulse">
                          <div className="relative w-12 h-12">
                             <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full"></div>
                             <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                          </div>
                          <div className="text-center space-y-2">
                             <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.3em]">Decoding Threat Vectors</p>
                             <p className="text-[8px] font-mono text-slate-600 uppercase">Synchronizing with GMT Forensic Core...</p>
                          </div>
                       </div>
                     ) : analysisReport ? (
                       <div className="p-8 glass rounded-[2.5rem] border border-purple-500/30 bg-purple-500/5 animate-in fade-in slide-in-from-top-4 duration-700 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                             <span className="text-6xl">🧠</span>
                          </div>
                          <div className="prose prose-invert max-w-none">
                             <p className="text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                                {analysisReport}
                             </p>
                          </div>
                          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                             <span className="text-[8px] font-mono text-slate-600 uppercase">Report_ID: FR-{selectedThreat.id.split('-').pop()}</span>
                             <span className="text-[8px] font-mono text-purple-500/60 uppercase">GMT_ORACLE_V4.2</span>
                          </div>
                       </div>
                     ) : (
                       <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
                          <p className="text-[10px] font-mono uppercase tracking-widest">Select a node to begin interrogation</p>
                       </div>
                     )}
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-30">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-5xl">🕵️</div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-heading font-black text-white uppercase tracking-widest leading-none">Awaiting_Target</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] max-w-xs mx-auto">Select an intruder node from the queue to initiate deep-packet forensic analysis.</p>
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SecurityConsole;
