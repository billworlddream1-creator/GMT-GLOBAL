
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Partnership, PartnerRole } from '../types';
import { playUISound } from '../utils/audioUtils';

interface PartnershipHubProps {
  user: UserProfile;
  onPartner: (p: Partnership) => void;
  activePartnerships: Partnership[];
}

interface AlliancePlan {
  role: PartnerRole;
  minAmount: number;
  bonusRoi: number;
  color: string;
  border: string;
  bg: string;
  title: string;
  desc: string;
}

const ALLIANCE_PLANS: AlliancePlan[] = [
  {
    role: 'SHADOW_BACKER',
    minAmount: 50000,
    bonusRoi: 5,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    title: 'Sub-Level Alliance',
    desc: 'Establish low-visibility funding conduits for shadow operations.'
  },
  {
    role: 'STRATEGIC_ALLY',
    minAmount: 250000,
    bonusRoi: 12,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    title: 'Sector Coordination',
    desc: 'Joint coordination of continental intelligence assets and data flow.'
  },
  {
    role: 'BOARD_MEMBER',
    minAmount: 1000000,
    bonusRoi: 20,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    title: 'Sovereign Authority',
    desc: 'Full inclusion in global directive voting and high-priority yield.'
  },
  {
    role: 'SYSTEM_OVERLORD',
    minAmount: 5000000,
    bonusRoi: 35,
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    title: 'Nexus Architect',
    desc: 'The pinnacle of the alliance matrix. Absolute systemic control.'
  }
];

const PartnershipHub: React.FC<PartnershipHubProps> = ({ user, onPartner, activePartnerships }) => {
  const [selectedPlan, setSelectedPlan] = useState<AlliancePlan>(ALLIANCE_PLANS[0]);
  const [isSigning, setIsSigning] = useState(false);
  const [accumulatedYield, setAccumulatedYield] = useState(0);

  useEffect(() => {
    const totalActiveAmount = activePartnerships
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + p.amount, 0);
    if (totalActiveAmount === 0) return;
    const interval = setInterval(() => {
      setAccumulatedYield(prev => prev + (totalActiveAmount * 0.00000005));
    }, 100);
    return () => clearInterval(interval);
  }, [activePartnerships]);

  const handleApply = () => {
    setIsSigning(true);
    playUISound('startup');
    setTimeout(() => {
      const partnership: Partnership = {
        id: `PRT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id || 'ANONYMOUS',
        amount: selectedPlan.minAmount,
        durationMonths: 12,
        roi: selectedPlan.bonusRoi + 15,
        role: selectedPlan.role,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        trustScore: 85
      };
      onPartner(partnership);
      setIsSigning(false);
      playUISound('success');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in slide-in-from-bottom-10 duration-700 pb-32">
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/10 relative overflow-hidden">
        <h3 className="text-4xl font-heading font-black text-white mb-2 uppercase tracking-tighter">Alliance_Matrix</h3>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-10">Constant Diplomatic Partnership Tiers</p>
        
        <div className="grid grid-cols-3 gap-10 border-t border-white/5 pt-8">
          <div><span className="text-[9px] font-mono text-slate-500 block mb-1">Portfolio_Value</span><span className="text-2xl font-heading font-black text-white">${activePartnerships.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span></div>
          <div><span className="text-[9px] font-mono text-slate-500 block mb-1">Accumulated_Yield</span><span className="text-2xl font-heading font-black text-emerald-400">${accumulatedYield.toFixed(4)}</span></div>
          <div><span className="text-[9px] font-mono text-slate-500 block mb-1">Active_Nodes</span><span className="text-2xl font-heading font-black text-blue-400">{activePartnerships.length}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {ALLIANCE_PLANS.map((plan) => (
          <button 
            key={plan.role}
            onClick={() => { setSelectedPlan(plan); playUISound('click'); }}
            className={`glass p-8 rounded-[3rem] border transition-all text-left flex flex-col h-full relative group ${selectedPlan.role === plan.role ? 'bg-white/10 border-white/30 shadow-2xl scale-105 z-10' : 'opacity-60 hover:opacity-100 hover:bg-white/5 border-white/5'}`}
          >
             <span className={`text-[10px] font-mono font-black uppercase mb-2 ${plan.color}`}>Tier_0{ALLIANCE_PLANS.indexOf(plan) + 1}</span>
             <h4 className="text-xl font-heading font-black text-white uppercase mb-4 leading-tight">{plan.title}</h4>
             <p className="text-[10px] font-mono text-slate-400 mb-8 flex-1">{plan.desc}</p>
             <div className="mt-auto space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Min_Commit</span>
                  <span className="text-lg font-heading font-black text-white">${(plan.minAmount / 1000).toLocaleString()}K</span>
                </div>
                <div className={`py-3 rounded-2xl text-center border font-black text-[9px] uppercase tracking-widest ${selectedPlan.role === plan.role ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white'}`}>
                   {selectedPlan.role === plan.role ? 'PLAN_SELECTED' : 'SELECT_PROTOCOL'}
                </div>
             </div>
          </button>
        ))}
      </div>

      {selectedPlan && (
        <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/60 animate-in slide-in-from-bottom-4">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
              <div className="space-y-6 flex-1">
                 <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">Execute_Treaty: {selectedPlan.title}</h3>
                 <p className="text-xs font-mono text-slate-400 leading-relaxed uppercase tracking-wider">Ratifying this alliance requires a commitment of ${selectedPlan.minAmount.toLocaleString()} capital units. Strategic ROI is fixed at {selectedPlan.bonusRoi + 15}% per term.</p>
              </div>
              <button 
                onClick={handleApply}
                disabled={isSigning}
                className="px-16 py-6 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                 {isSigning ? 'RATIFYING...' : 'RATIFY_ALLIANCE'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipHub;
