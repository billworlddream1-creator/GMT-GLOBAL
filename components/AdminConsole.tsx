
import React, { useState, useEffect, useRef } from 'react';
import { Investment, PaymentSettings, Partnership, ActivityLog, SystemConfig, ModuleConfig } from '../types';
import { playUISound } from '../utils/audioUtils';

interface AdminConsoleProps {
  paymentSettings: PaymentSettings;
  setPaymentSettings: (s: PaymentSettings) => void;
  investments: Investment[];
  setInvestments: (i: Investment[]) => void;
  partnerships: Partnership[];
  setPartnerships: (p: Partnership[]) => void;
  activityLogs: ActivityLog[];
  systemConfig: SystemConfig;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ 
  paymentSettings, setPaymentSettings, 
  investments, setInvestments,
  partnerships, setPartnerships,
  activityLogs, systemConfig, updateSystemConfig
}) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'system' | 'investments' | 'partnerships' | 'settings'>('monitor');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'monitor' && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [activityLogs, activeTab]);

  const handleAction = (id: string, type: 'invest' | 'partner', status: string) => {
    if (type === 'invest') {
      setInvestments(investments.map(i => i.id === id ? { ...i, status: status as any } : i));
    } else {
      setPartnerships(partnerships.map(p => p.id === id ? { ...p, status: status as any } : p));
    }
    
    // UI Feedback
    if (status === 'PAID' || status === 'ACTIVE') {
      playUISound('success');
    } else {
      playUISound('alert');
    }
  };

  const toggleLockdown = () => {
    playUISound('alert');
    updateSystemConfig({ maintenanceMode: !systemConfig.maintenanceMode });
  };

  const setDefcon = (level: 1 | 2 | 3 | 4 | 5) => {
    playUISound('click');
    updateSystemConfig({ defconLevel: level });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex space-x-4 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'monitor', label: 'Live Monitor' },
          { id: 'system', label: 'System Control' },
          { id: 'investments', label: 'Investments' },
          { id: 'partnerships', label: 'Partnerships' },
          { id: 'settings', label: 'Global Config' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); playUISound('click'); }}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]' : 'glass border border-white/5 text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'monitor' && (
        <div className="glass p-8 rounded-3xl border border-white/5 h-[600px] flex flex-col bg-slate-900/60">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter flex items-center gap-3">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 Agent_Activity_Stream
              </h3>
              <span className="text-[9px] font-mono text-slate-500">{activityLogs.length} EVENTS LOGGED</span>
           </div>
           
           <div ref={logContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
              {activityLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-mono animate-in slide-in-from-top-2">
                   <span className="text-slate-500 w-20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                   <span className="text-accent font-bold w-24 truncate">{log.agentId}</span>
                   <span className="text-white flex-1">{log.action}</span>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                     log.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 
                     log.severity === 'WARN' ? 'bg-amber-500 text-black' : 'bg-blue-500/20 text-blue-400'
                   }`}>
                     {log.module}
                   </span>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="text-center py-20 opacity-30 text-xs font-mono uppercase">Awaiting Network Traffic...</div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/60 space-y-8">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Threat_Condition_Level</h3>
              <div className="flex gap-2">
                 {[5, 4, 3, 2, 1].map((level) => (
                   <button 
                     key={level}
                     onClick={() => setDefcon(level as any)}
                     className={`flex-1 py-6 rounded-2xl font-black text-xl border transition-all ${
                       systemConfig.defconLevel === level 
                         ? level === 1 ? 'bg-white text-black border-white shadow-[0_0_30px_white]' 
                         : level === 2 ? 'bg-red-600 text-white border-red-500 shadow-[0_0_30px_red]' 
                         : level === 3 ? 'bg-amber-500 text-black border-amber-400' 
                         : 'bg-blue-600 text-white border-blue-500'
                         : 'bg-white/5 border-white/10 text-slate-600 hover:bg-white/10'
                     }`}
                   >
                     {level}
                   </button>
                 ))}
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                 <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Current Protocol</span>
                 <p className="text-xs font-heading font-black text-white uppercase">
                    {systemConfig.defconLevel === 1 ? 'MAXIMUM READINESS / NUCLEAR AUTH' : 
                     systemConfig.defconLevel === 2 ? 'HOSTILE ACTIVITY CONFIRMED' :
                     systemConfig.defconLevel === 3 ? 'ELEVATED FORCE READINESS' :
                     systemConfig.defconLevel === 4 ? 'DOUBLE INTELLIGENCE WATCH' : 'STANDARD PEACETIME OPS'}
                 </p>
              </div>
           </div>

           <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/60 space-y-8">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">App_Control_Override</h3>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                 <div>
                    <h4 className="text-sm font-bold text-white">Maintenance Lockdown</h4>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">Suspend all non-admin sessions</p>
                 </div>
                 <button 
                   onClick={toggleLockdown}
                   className={`w-14 h-8 rounded-full p-1 transition-all ${systemConfig.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                 >
                    <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all ${systemConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </button>
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Global Alert</label>
                 <div className="flex gap-2">
                    <input 
                      placeholder="Type alert message..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-accent outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                           updateSystemConfig({ globalAlert: (e.target as HTMLInputElement).value });
                           (e.target as HTMLInputElement).value = '';
                           playUISound('success');
                        }
                      }}
                    />
                    <button 
                      onClick={() => updateSystemConfig({ globalAlert: null })}
                      className="px-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-white/10"
                    >
                      Clear
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {(activeTab === 'investments' || activeTab === 'partnerships') && (
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">
              {activeTab === 'investments' ? 'User Investment Ledger' : 'Partnership Terminal'}
            </h3>
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-mono text-accent">
              {activeTab === 'investments' ? `${investments.length} Active Requests` : `${partnerships.length} Active Partners`}
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[10px] font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 uppercase tracking-widest">
                  <th className="py-5 px-4 font-black">ID</th>
                  <th className="py-5 px-4 font-black">Sector/Role</th>
                  <th className="py-5 px-4 font-black">Capital</th>
                  <th className="py-5 px-4 font-black">Duration</th>
                  <th className="py-5 px-4 font-black">Yield/ROI</th>
                  <th className="py-5 px-4 font-black">Status</th>
                  <th className="py-5 px-4 font-black">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(activeTab === 'investments' ? (investments as any[]) : (partnerships as any[])).map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-5 px-4 text-accent font-bold">{(item.id || "ITEM").split('-').pop()}</td>
                    <td className="py-5 px-4 text-slate-300">{activeTab === 'investments' ? (item.sector || 'GLOBAL').replace('_', ' ') : (item.role || 'ASSET').replace('_', ' ')}</td>
                    <td className="py-5 px-4 font-black text-white">${(item.amount || 0).toLocaleString()}</td>
                    <td className="py-5 px-4 text-slate-400">{item.durationMonths || 0} Months</td>
                    <td className="py-5 px-4 text-emerald-400 font-bold">
                      {activeTab === 'investments' ? `+$${item.expectedReturn}` : `${item.roi}%`}
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                        item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        item.status === 'REFUNDED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-accent/10 text-accent border border-accent/20 animate-pulse'
                      }`}>
                        {item.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {item.status === 'ACTIVE' && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleAction(item.id, activeTab === 'investments' ? 'invest' : 'partner', 'PAID')} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-heading font-black text-[8px] uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, activeTab === 'investments' ? 'invest' : 'partner', 'REFUNDED')} 
                            className="bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-500 hover:text-white px-4 py-1.5 rounded-lg font-heading font-black text-[8px] uppercase tracking-widest transition-all"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                      {item.status !== 'ACTIVE' && (
                        <span className="text-slate-600 italic text-[9px]">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {((activeTab === 'investments' && investments.length === 0) || (activeTab === 'partnerships' && partnerships.length === 0)) && (
              <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-[0.3em]">
                No pending requests in neural queue.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-10">
          <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Command Control Unit</h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Settlement Master Email</label>
              <input 
                value={paymentSettings.paypalEmail}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalEmail: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="master@gmt-global.net"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Primary Capital Gateway ID</label>
              <input 
                value={paymentSettings.bankAccount}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccount: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="BANK-NX-9922"
              />
            </div>
            <div className="space-y-4 md:col-span-2">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Master Crypto Vault</label>
              <input 
                value={paymentSettings.cryptoWallet}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, cryptoWallet: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="0xVault..."
              />
            </div>
          </div>
          <div className="pt-6">
            <button 
              onClick={() => playUISound('success')}
              className="px-12 py-5 bg-accent hover:bg-accent/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95"
            >
              Update Global Protocols
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
