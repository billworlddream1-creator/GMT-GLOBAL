
import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { CloudFile } from '../types';
import { playUISound } from '../utils/audioUtils';

interface CloudHubProps {
  intelService: IntelligenceService;
}

const CloudHub: React.FC<CloudHubProps> = ({ intelService }) => {
  const [analytics, setAnalytics] = useState<{ usage: number, limit: number, files: CloudFile[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingFileId, setSyncingFileId] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.getCloudAnalytics();
      setAnalytics(data);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSync = (fileId: string) => {
    setSyncingFileId(fileId);
    playUISound('click');
    setTimeout(() => {
      setSyncingFileId(null);
      playUISound('success');
    }, 2000);
  };

  const usagePercent = analytics ? (analytics.usage / analytics.limit) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">CLOUD</span>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex-1">
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.5em] font-black">Nexus_Sync_Active</span>
             </div>
             <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Cloud_Dossier_Vault</h2>
             <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Decentralized neural storage across 14 GMT nodes.</p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 bg-black/40 min-w-[280px] space-y-6">
             <div className="flex justify-between items-end">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Neural_Memory_Load</span>
                <span className="text-2xl font-heading font-black text-white">{analytics?.usage || 0}<span className="text-[10px] ml-1 opacity-60">GB</span></span>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                  style={{ width: `${usagePercent}%` }}
                ></div>
             </div>
             <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-widest">Limit: {analytics?.limit || 1000} GB Authorized</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass p-10 rounded-[3rem] border border-white/10 bg-slate-900/20">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4 flex justify-between items-center">
                <span>Recent_Neural_Artifacts</span>
                <button 
                  onClick={fetchAnalytics}
                  className="text-[8px] font-mono text-accent hover:underline uppercase"
                >
                  Refresh_Buffer
                </button>
              </h3>

              <div className="space-y-4">
                 {loading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))
                 ) : analytics?.files.map(file => (
                    <div 
                      key={file.id} 
                      className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-accent/40 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-accent"
                    >
                       <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-lg">
                             {file.type === 'IMAGE' ? '🖼️' : file.type === 'VIDEO' ? '🎬' : '📄'}
                          </div>
                          <div>
                             <h4 className="text-[10px] font-heading font-black text-white uppercase truncate max-w-[200px]">{file.name}</h4>
                             <p className="text-[8px] font-mono text-slate-500 uppercase">{file.size} // {file.timestamp}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded border uppercase ${
                             file.status === 'SYNCED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                             file.status === 'ENCRYPTING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                             {file.status}
                          </span>
                          <button 
                            onClick={() => handleSync(file.id)}
                            disabled={syncingFileId === file.id}
                            className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-accent hover:border-accent ${syncingFileId === file.id ? 'animate-spin opacity-50' : ''}`}
                            aria-label={`Sync ${file.name}`}
                          >
                             🔄
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/60 shadow-xl">
              <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Cloud_Backbone_Status</h4>
              <div className="space-y-6">
                 {[
                   { node: 'GMT-Alpha (Zurich)', ping: '12ms', load: 42, status: 'OPTIMAL' },
                   { node: 'GMT-Beta (Tokyo)', ping: '145ms', load: 88, status: 'VOLATILE' },
                   { node: 'GMT-Gamma (New York)', ping: '65ms', load: 12, status: 'IDLE' },
                   { node: 'GMT-Delta (London)', ping: '24ms', load: 56, status: 'STABLE' },
                 ].map((node, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                         <span className="text-slate-400">{node.node}</span>
                         <span className={node.status === 'VOLATILE' ? 'text-amber-500' : 'text-emerald-500'}>{node.ping}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${node.status === 'VOLATILE' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${node.load}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 glass rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5">
              <h4 className="text-[10px] font-black text-white uppercase mb-2 tracking-widest">Encrypted Backup Directive</h4>
              <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase">Neural cloud data is shard-encrypted using quantum-resistant algorithms. Every dossiers saved is automatically synced to the primary GMT backbone for redundancy.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CloudHub;
