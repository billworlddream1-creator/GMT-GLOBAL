
import React, { useState, useMemo, useEffect } from 'react';
import { Investment, InvestmentSector, UserProfile } from '../types';
import { playUISound } from '../utils/audioUtils';

interface InvestmentHubProps {
  user: UserProfile;
  onInvest: (i: Investment) => void;
  activeInvestments: Investment[];
}

const SECTORS: { id: InvestmentSector, label: string, icon: string, risk: 'LOW' | 'MODERATE' | 'SPECULATIVE', baseRoi: number, desc: string }[] = [
  { id: 'CYBER_DEFENSE', label: 'Internet Security', icon: '🛡️', risk: 'LOW', baseRoi: 8, desc: 'Help protect the web. Safe and steady profit.' },
  { id: 'ORBITAL_TECH', label: 'Satellite Tech', icon: '📡', risk: 'MODERATE', baseRoi: 15, desc: 'Improve world-wide internet. Good growth.' },
  { id: 'DEEP_SPACE', label: 'Space Exploring', icon: '🌌', risk: 'SPECULATIVE', baseRoi: 35, desc: 'High risk, but very big potential returns.' },
  { id: 'NEURAL_RESEARCH', label: 'AI Science', icon: '🧠', risk: 'MODERATE', baseRoi: 22, desc: 'Help build better AI. Solid technology growth.' },
  { id: 'GLOBAL_LOGISTICS', label: 'World Shipping', icon: '📦', risk: 'LOW', baseRoi: 10, desc: 'Help move goods around the world. Very stable.' }
];

const InvestmentHub: React.FC<InvestmentHubProps> = ({ user, onInvest, activeInvestments }) => {
  const [selectedSector, setSelectedSector] = useState<InvestmentSector>('CYBER_DEFENSE');
  const [amount, setAmount] = useState<number>(500);
  const [duration, setDuration] = useState<3 | 6 | 12>(6);
  const [isDeploying, setIsDeploying] = useState(false);

  const currentSector = useMemo(() => SECTORS.find(s => s.id === selectedSector)!, [selectedSector]);
  
  const estimatedReturn = useMemo(() => {
    const durationMultiplier = duration === 12 ? 1.5 : duration === 6 ? 1.2 : 1.0;
    const roiPercent = currentSector.baseRoi * durationMultiplier;
    return Math.round(amount * (roiPercent / 100));
  }, [amount, duration, currentSector]);

  const handleDeploy = () => {
    setIsDeploying(true);
    playUISound('startup');
    
    setTimeout(() => {
      const investment: Investment = {
        id: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id || 'ANONYMOUS',
        amount: amount,
        durationMonths: duration,
        expectedReturn: estimatedReturn,
        sector: selectedSector,
        riskLevel: currentSector.risk,
        status: 'ACTIVE',
        timestamp: new Date().toISOString()
      };
      onInvest(investment);
      setIsDeploying(false);
      playUISound('success');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden bg-slate-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none"></div>
          <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-2">Investment Hub</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mb-10">Manage your money and grow your wealth.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-8">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Total Invested</span>
              <span className="text-2xl font-heading font-black text-white">${activeInvestments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Expected Profit</span>
              <span className="text-2xl font-heading font-black text-emerald-400">${activeInvestments.reduce((sum, inv) => sum + inv.expectedReturn, 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Active Plans</span>
              <span className="text-2xl font-heading font-black text-accent">{activeInvestments.filter(i => i.status === 'ACTIVE').length}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Risk Level</span>
              <span className="text-2xl font-heading font-black text-amber-500">MODERATE</span>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-accent/20 bg-accent/5 flex flex-col justify-center text-center">
          <span className="text-[9px] font-mono text-accent uppercase mb-4 tracking-widest font-black">Next Profit Update</span>
          <div className="text-3xl font-heading font-black text-white">04:12:55</div>
          <p className="text-[8px] font-mono text-slate-600 mt-4 uppercase">Syncing with bank data...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Choose a Sector
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTORS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedSector(s.id); playUISound('click'); }}
                  className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-5 group ${selectedSector === s.id ? 'bg-accent/20 border-accent shadow-xl' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform ${selectedSector === s.id ? 'text-accent' : 'text-slate-500'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-wider">{s.label}</h4>
                    <span className={`text-[8px] font-mono uppercase font-bold ${s.risk === 'LOW' ? 'text-emerald-500' : s.risk === 'MODERATE' ? 'text-amber-500' : 'text-red-500'}`}>{s.risk} RISK</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount to Invest</label>
              <div className="grid grid-cols-3 gap-3">
                {[250, 500, 1000, 2500, 5000, 10000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setAmount(amt); playUISound('click'); }}
                    className={`py-3 rounded-xl font-mono font-black text-[10px] transition-all border ${amount === amt ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investment Time</label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 6, 12].map(m => (
                  <button 
                    key={m}
                    onClick={() => { setDuration(m as any); playUISound('click'); }}
                    className={`py-3 rounded-xl font-mono font-black text-[10px] transition-all border ${duration === m ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                  >
                    {m} MO
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-8xl font-black">{currentSector.icon}</span>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
              <div className="space-y-4 flex-1">
                <h4 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Sector Details</h4>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-md">{currentSector.desc}</p>
                <div className="flex gap-6 pt-2">
                   <div>
                     <span className="text-[8px] font-mono text-slate-600 block uppercase">Yearly Profit</span>
                     <span className="text-lg font-heading font-black text-white">{currentSector.baseRoi}%</span>
                   </div>
                   <div>
                     <span className="text-[8px] font-mono text-slate-600 block uppercase">Total Profit</span>
                     <span className="text-lg font-heading font-black text-emerald-400">+${estimatedReturn.toLocaleString()}</span>
                   </div>
                </div>
              </div>
              <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className={`px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center gap-4 ${isDeploying ? 'bg-accent/40 cursor-wait' : 'bg-accent hover:bg-accent/80 text-white active:scale-95'}`}
              >
                {isDeploying ? 'Processing...' : 'Invest Now'}
              </button>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col">
          <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4">Investment History</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
            {activeInvestments.length > 0 ? (
              activeInvestments.map(inv => (
                <div key={inv.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                     <span className="text-2xl">{SECTORS.find(s => s.id === inv.sector)?.icon}</span>
                  </div>
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${inv.status === 'ACTIVE' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>{inv.status}</span>
                     <span className="text-[8px] font-mono text-slate-600">{inv.id.split('-').pop()}</span>
                  </div>
                  <h5 className="text-[10px] font-heading font-black text-white uppercase mb-4 tracking-wider">{inv.sector.replace('_', ' ')}</h5>
                  <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div>
                      <span className="text-[8px] font-mono text-slate-500 block">Amount</span>
                      <span className="text-sm font-heading font-black text-white">${inv.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-slate-500 block">Profit</span>
                      <span className="text-sm font-heading font-black text-emerald-400">+${inv.expectedReturn.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6">
                <span className="text-5xl">🏦</span>
                <p className="text-[10px] font-mono uppercase tracking-widest">No investments yet.</p>
              </div>
            )}
          </div>
          <div className="mt-10 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span className="uppercase">Sync: Connected</span>
              <span className="font-black text-emerald-500">OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentHub;
