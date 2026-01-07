
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Partnership, PartnerRole } from '../types';
import { playUISound } from '../utils/audioUtils';

interface PartnershipHubProps {
  user: UserProfile;
  onPartner: (p: Partnership) => void;
  activePartnerships: Partnership[];
}

const PartnershipHub: React.FC<PartnershipHubProps> = ({ user, onPartner, activePartnerships }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [duration, setDuration] = useState<12 | 24 | 36>(12);
  const [accumulatedYield, setAccumulatedYield] = useState(0);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    const totalActiveAmount = activePartnerships
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + p.amount, 0);
    if (totalActiveAmount === 0) return;
    const interval = setInterval(() => {
      setAccumulatedYield(prev => prev + (totalActiveAmount * 0.0000005));
    }, 100);
    return () => clearInterval(interval);
  }, [activePartnerships]);

  const roleInfo = useMemo(() => {
    if (selectedAmount >= 1000000) return { role: 'SYSTEM_OVERLORD' as PartnerRole, bonusRoi: 25, color: 'text-red-500', border: 'border-red-500/40', desc: 'Absolute dominion over network resources and priority yield.' };
    if (selectedAmount >= 500000) return { role: 'GLOBAL_ARCHITECT' as PartnerRole, bonusRoi: 20, color: 'text-purple-400', border: 'border-purple-500/40', desc: 'Architect-level access to global data streams and infrastructure.' };
    if (selectedAmount >= 250000) return { role: 'BOARD_MEMBER' as PartnerRole, bonusRoi: 15, color: 'text-amber-400', border: 'border-amber-500/40', desc: 'Voting rights on strategic directives and enhanced profit sharing.' };
    if (selectedAmount >= 50000) return { role: 'STRATEGIC_ALLY' as PartnerRole, bonusRoi: 10, color: 'text-emerald-400', border: 'border-emerald-500/40', desc: 'High-level strategic cooperation with significant data dividends.' };
    return { role: 'SHADOW_BACKER' as PartnerRole, bonusRoi: 5, color: 'text-blue-400', border: 'border-blue-500/40', desc: 'Covert funding channel establishing initial trust protocols.' };
  }, [selectedAmount]);

  const calculateROI = () => (duration === 12 ? 15 : duration === 24 ? 25 : 35) + roleInfo.bonusRoi;

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
        status: 'ACTIVE',
        trustScore: 0
      };
      onPartner(partnership);
      setIsSigning(false);
      playUISound('success');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in slide-in-from-bottom-10 duration-700 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
          <h3 className="text-4xl font-heading font-black text-white mb-2 uppercase tracking-tighter">Strategic_Alliances</h3>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-10">High-Stakes Neural Capital Deployment</p>
          
          <div className="grid grid-cols-3 gap-10 border-t border-white/5 pt-8">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Portfolio_Valuation</span>
              <span className="text-2xl font-heading font-black text-white">${activePartnerships.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Neural_Dividends</span>
              <span className="text-2xl font-heading font-black text-emerald-400">${accumulatedYield.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Handshake_Integrity</span>
              <span className="text-2xl font-heading font-black text-blue-400">99.9%</span>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center items-center text-center">
           <span className="text-[9px] font-mono text-emerald-500 uppercase mb-4 tracking-widest font-black">Diplomatic_Pulse</span>
           <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center relative">
              <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
              <span className="text-2xl">🤝</span>
           </div>
           <p className="text-[8px] font-mono text-slate-500 mt-6 uppercase">Handshakes established across 14 sovereign nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 space-y-12 bg-slate-900/20">
          <div className="space-y-10">
            <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">TREATY_PROPOSAL_PARAMETERS</h4>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake Magnitude (Capital Units)</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {[10000, 50000, 250000, 500000, 1000000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); playUISound('click'); }}
                    className={`px-4 py-4 rounded-2xl font-heading font-black text-[10px] transition-all border ${selectedAmount === amt ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                  >
                    ${(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Treaty Term</label>
                <div className="flex gap-4">
                  {[12, 24, 36].map(d => (
                    <button 
                      key={d}
                      onClick={() => { setDuration(d as any); playUISound('click'); }}
                      className={`flex-1 py-5 rounded-2xl font-heading font-black text-[10px] transition-all border ${duration === d ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      {d} MO
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-8 bg-black/40 rounded-3xl border transition-all ${roleInfo.border} flex flex-col justify-center`}>
                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Designated_Role</span>
                <div className={`text-xl font-heading font-black uppercase ${roleInfo.color}`}>{roleInfo.role.replace('_', ' ')}</div>
                <p className="text-[9px] font-mono text-slate-500 mt-3 leading-relaxed">{roleInfo.desc}</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/20 relative overflow-hidden">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">ALLIANCE_INTEGRITY_CHECK</h4>
            <div className="grid grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Projected Yield</span><span className="text-white">+{calculateROI()}%</span></div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Operational Bonus</span><span className="text-blue-400">+{roleInfo.bonusRoi}%</span></div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Total Return</span><span className="text-emerald-400 font-black">${(selectedAmount * (1 + calculateROI()/100)).toLocaleString()}</span></div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Handshake Delay</span><span className="text-white">0.2ms</span></div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Encryption Standard</span><span className="text-white">QUANTUM_AES_512</span></div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Auth Level</span><span className="text-blue-400">AUTHORIZED</span></div>
               </div>
            </div>
            
            <button 
              onClick={handleApply}
              disabled={isSigning}
              className={`w-full mt-10 py-6 rounded-3xl font-heading font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-4 ${isSigning ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {isSigning ? 'RATIFYING_ALLIANCE...' : 'EXECUTE_DIPLOMATIC_TREATY'}
            </button>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col bg-slate-900/40">
           <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4">ACTIVE_HANDSHAKES</h4>
           <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
             {activePartnerships.map(p => (
               <div key={p.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[8px] font-mono text-blue-500 font-black px-2 py-0.5 bg-blue-500/10 rounded uppercase">STAKED</span>
                     <span className="text-[8px] font-mono text-slate-600">ID_{(p.id || '').split('-').pop()}</span>
                  </div>
                  <h5 className="text-sm font-heading font-black text-white uppercase mb-2">{p.role.replace('_', ' ')}</h5>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4">
                     <div>
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">Yield</span>
                        <span className="text-xs font-heading font-black text-emerald-400">+{p.roi}%</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">Trust_Score</span>
                        <span className="text-xs font-heading font-black text-blue-400">{Math.floor(Math.random() * 20 + 80)}%</span>
                     </div>
                  </div>
               </div>
             ))}
             {activePartnerships.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6 py-20">
                 <span className="text-6xl">📜</span>
                 <p className="text-[10px] font-mono uppercase tracking-widest">No active diplomatic records.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipHub;
