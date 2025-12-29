
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Partnership, PartnerRole } from '../types';
import { playUISound } from '../utils/audioUtils';

interface PartnershipHubProps {
  user: UserProfile;
  onPartner: (p: Partnership) => void;
  activePartnerships: Partnership[];
}

const PartnershipHub: React.FC<PartnershipHubProps> = ({ user, onPartner, activePartnerships }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [duration, setDuration] = useState<6 | 12>(6);
  const [accumulatedYield, setAccumulatedYield] = useState(0);
  const [isSigning, setIsSigning] = useState(false);

  // Live yield simulation
  useEffect(() => {
    const totalActiveAmount = activePartnerships
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + p.amount, 0);
    
    if (totalActiveAmount === 0) return;

    const interval = setInterval(() => {
      setAccumulatedYield(prev => prev + (totalActiveAmount * 0.0000001));
    }, 100);
    return () => clearInterval(interval);
  }, [activePartnerships]);

  const roleInfo = useMemo(() => {
    if (selectedAmount >= 10000) return { role: 'GLOBAL_HEGEMON' as PartnerRole, bonusRoi: 15, color: 'text-red-400', border: 'border-red-500/40', desc: 'Sovereign-level influence with maximum neural priority.' };
    if (selectedAmount >= 5000) return { role: 'NEXUS_OVERLORD' as PartnerRole, bonusRoi: 10, color: 'text-purple-400', border: 'border-purple-500/40', desc: 'Direct access to core GMT decision engines.' };
    if (selectedAmount >= 2500) return { role: 'STRATEGIC_ASSET' as PartnerRole, bonusRoi: 5, color: 'text-amber-400', border: 'border-amber-500/40', desc: 'Priority intelligence streams and localized control.' };
    if (selectedAmount >= 1000) return { role: 'FIELD_OPERATIVE' as PartnerRole, bonusRoi: 2, color: 'text-blue-400', border: 'border-blue-500/40', desc: 'Tactical field support and standard data dividends.' };
    return { role: 'COVERT_ASSET' as PartnerRole, bonusRoi: 0, color: 'text-slate-400', border: 'border-slate-500/40', desc: 'Entry-level reconnaissance and passive accumulation.' };
  }, [selectedAmount]);

  const calculateROI = () => (duration === 6 ? 10 : 15) + roleInfo.bonusRoi;

  const handleApply = () => {
    setIsSigning(true);
    playUISound('startup');
    
    setTimeout(() => {
      const roi = calculateROI();
      const partnership: Partnership = {
        id: `PRT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id || 'ANONYMOUS',
        amount: selectedAmount,
        durationMonths: duration,
        roi: roi,
        role: roleInfo.role,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE'
      };
      onPartner(partnership);
      setIsSigning(false);
      playUISound('success');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in slide-in-from-bottom-10 duration-700">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden bg-slate-900/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
          <h3 className="text-4xl font-heading font-black text-white mb-2 uppercase tracking-tighter">Strategic_Alliances</h3>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-10">Neural Capital Deployment & Intelligence Dividends</p>
          
          <div className="grid grid-cols-3 gap-10 border-t border-white/5 pt-8">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Total_Staked</span>
              <span className="text-2xl font-heading font-black text-white">${activePartnerships.reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Accumulated_ROI</span>
              <span className="text-2xl font-heading font-black text-emerald-400">${accumulatedYield.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Active_Contracts</span>
              <span className="text-2xl font-heading font-black text-blue-400">{activePartnerships.filter(p => p.status === 'ACTIVE').length}</span>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center items-center text-center">
           <span className="text-[9px] font-mono text-emerald-500 uppercase mb-4 tracking-widest font-black">Next_Intelligence_Payout</span>
           <div className="text-3xl font-heading font-black text-white">00:44:12</div>
           <button className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all">Collect_Dividends</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Alliance Configuration */}
        <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 space-y-12">
          <div className="space-y-6">
            <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              NEW_ALLIANCE_PARAMETERS
            </h4>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake Magnitude (Capital Units)</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {[500, 1000, 2500, 5000, 10000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); playUISound('click'); }}
                    className={`px-4 py-4 rounded-2xl font-heading font-black text-[10px] transition-all border ${selectedAmount === amt ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contract Horizon</label>
                <div className="flex gap-4">
                  {[6, 12].map(d => (
                    <button 
                      key={d}
                      onClick={() => { setDuration(d as any); playUISound('click'); }}
                      className={`flex-1 py-5 rounded-2xl font-heading font-black text-[10px] transition-all border ${duration === d ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      {d} MONTHS
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={`p-6 bg-white/5 rounded-3xl border transition-all ${roleInfo.border}`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Calculated_Status</span>
                <div className={`text-xl font-heading font-black uppercase ${roleInfo.color}`}>{roleInfo.role.replace('_', ' ')}</div>
                <p className="text-[9px] font-mono text-slate-500 mt-2 leading-relaxed">{roleInfo.desc}</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <span className="text-6xl">📝</span>
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">ALLIANCE_SUMMARY</h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Base_Yield</span>
                <div className="text-xl font-heading font-black text-white">{duration === 6 ? '10%' : '15%'}</div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Tier_Bonus</span>
                <div className="text-xl font-heading font-black text-emerald-400">+{roleInfo.bonusRoi}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Settlement_ID</span>
                <div className="text-xs font-mono text-white font-black">GMT-NX-AUTO</div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Total_Projected_Return</span>
                <div className="text-xl font-heading font-black text-emerald-400">${(selectedAmount * (1 + calculateROI()/100)).toLocaleString()}</div>
              </div>
            </div>
            
            <button 
              onClick={handleApply}
              disabled={isSigning}
              className={`w-full mt-10 py-6 rounded-3xl font-heading font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 ${isSigning ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {isSigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  SIGNING_NEURAL_CONTRACT...
                </>
              ) : 'EXECUTE_ALLIANCE_AGREEMENT'}
            </button>
          </div>
        </div>

        {/* Current Active Alliances List */}
        <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col">
           <div className="flex justify-between items-center mb-10">
              <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest">ACTIVE_ARCHIVE</h4>
              <span className="text-[9px] font-mono text-slate-500 font-bold">{activePartnerships.length} LOADED</span>
           </div>
           
           <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar flex-1">
             {activePartnerships.length > 0 ? (
               activePartnerships.map(p => (
                 <div key={p.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{p.status}</span>
                       <span className="text-[8px] font-mono text-slate-600">ID: {p.id.split('-').pop()}</span>
                    </div>
                    <h5 className="text-sm font-heading font-black text-white uppercase mb-2 group-hover:text-blue-400 transition-colors">{p.role.replace('_', ' ')}</h5>
                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                       <div>
                         <span className="text-[8px] font-mono text-slate-500 block">STAKE</span>
                         <span className="text-xs font-heading font-black text-white">${p.amount.toLocaleString()}</span>
                       </div>
                       <div className="text-right">
                         <span className="text-[8px] font-mono text-slate-500 block">YIELD</span>
                         <span className="text-xs font-heading font-black text-emerald-400">+{p.roi}%</span>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6">
                 <span className="text-5xl">📑</span>
                 <p className="text-[10px] font-mono uppercase tracking-widest">No active alliances in neural database.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipHub;
