
import React, { useState, useMemo, useEffect } from 'react';
import { Investment, InvestmentSector, UserProfile, MarketData } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';

interface InvestmentHubProps {
  user: UserProfile;
  onInvest: (i: Investment) => void;
  activeInvestments: Investment[];
}

interface DeploymentPlan {
  id: string;
  title: string;
  sector: InvestmentSector;
  icon: string;
  risk: 'LOW' | 'MODERATE' | 'SPECULATIVE';
  baseRoi: number;
  desc: string;
  color: string;
}

const DEPLOYMENT_PLANS: DeploymentPlan[] = [
  {
    id: 'FUSION_PRESERVE',
    title: 'Sovereign_Stability',
    sector: 'FUSION_ENERGY',
    icon: '⚛️',
    risk: 'LOW',
    baseRoi: 12,
    color: 'emerald',
    desc: 'Capital preservation through secure, long-term fusion infrastructure nodes.'
  },
  {
    id: 'NEURAL_GROWTH',
    title: 'Synaptic_Growth',
    sector: 'NEURAL_NETWORKS',
    icon: '🧠',
    risk: 'MODERATE',
    baseRoi: 28,
    color: 'blue',
    desc: 'Aggressive growth via the expansion of global AI training clusters.'
  },
  {
    id: 'QUANTUM_ALPHA',
    title: 'Alpha_Strike',
    sector: 'QUANTUM_COMPUTING',
    icon: '💻',
    risk: 'SPECULATIVE',
    baseRoi: 54,
    color: 'purple',
    desc: 'High-risk deployment in sub-zero quantum lattice breakthroughs.'
  }
];

const InvestmentHub: React.FC<InvestmentHubProps> = ({ user, onInvest, activeInvestments }) => {
  const [selectedPlan, setSelectedPlan] = useState<DeploymentPlan>(DEPLOYMENT_PLANS[0]);
  const [amount, setAmount] = useState<number>(10000);
  const [isDeploying, setIsDeploying] = useState(false);
  const [marketAdvice, setMarketAdvice] = useState('Syncing neural market data...');

  const intelService = useMemo(() => new IntelligenceService(), []);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const data = await intelService.getMarketIntelligence();
        const advice = await intelService.getStrategicInvestmentAdvice(data);
        setMarketAdvice(advice);
      } catch (e) {
        setMarketAdvice('Market uplink unstable. Proceed with caution.');
      }
    };
    fetchMarket();
  }, [intelService]);

  const handleDeploy = () => {
    setIsDeploying(true);
    playUISound('startup');
    setTimeout(() => {
      const investment: Investment = {
        id: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId: user.id || 'ANONYMOUS',
        amount: amount,
        durationMonths: 12,
        expectedReturn: Math.round(amount * (selectedPlan.baseRoi / 100)),
        sector: selectedPlan.sector,
        riskLevel: selectedPlan.risk,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
        volatilityIndex: 0.5
      };
      onInvest(investment);
      setIsDeploying(false);
      playUISound('success');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      {/* HUD Header */}
      <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex-1">
             <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Strategic_Deployment</h3>
             <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Constant Capital Allocation Protocols</p>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-accent/20 bg-accent/5 max-w-sm">
             <span className="text-[8px] font-mono text-accent uppercase font-black block mb-2">Strategy_Forecast</span>
             <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic border-l-2 border-accent/40 pl-4">
                "{marketAdvice}"
             </p>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {DEPLOYMENT_PLANS.map(plan => (
           <button 
             key={plan.id}
             onClick={() => { setSelectedPlan(plan); playUISound('click'); }}
             className={`glass p-10 rounded-[3.5rem] border transition-all text-left flex flex-col h-full relative overflow-hidden group ${
               selectedPlan.id === plan.id ? `border-${plan.color}-500/50 bg-${plan.color}-500/10 scale-105 z-10 shadow-2xl` : 'opacity-60 border-white/5 bg-white/5 hover:opacity-100'
             }`}
           >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <span className="text-8xl">{plan.icon}</span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                plan.risk === 'LOW' ? 'text-emerald-400' : plan.risk === 'MODERATE' ? 'text-blue-400' : 'text-purple-400'
              }`}>{plan.risk}_RISK</span>
              <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">{plan.title}</h4>
              <p className="text-[11px] font-mono text-slate-400 mb-8 leading-relaxed flex-1">{plan.desc}</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-baseline">
                 <span className="text-[8px] font-mono text-slate-500 uppercase">Target_Yield</span>
                 <span className="text-xl font-heading font-black text-white">+{plan.baseRoi}%</span>
              </div>
           </button>
         ))}
      </div>

      {/* Deployment Action Bar */}
      <div className="glass p-10 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
         <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div className="space-y-6 flex-1 w-full">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Allocation Magnitude</label>
               <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[1000, 5000, 10000, 25000, 50000, 100000].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => setAmount(amt)} 
                      className={`py-4 rounded-2xl font-mono text-[10px] border transition-all ${amount === amt ? 'bg-accent border-accent text-white shadow-xl' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                    >
                      ${(amt/1000).toFixed(0)}K
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="flex flex-col gap-6 shrink-0 w-full lg:w-auto">
               <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Projected_Asset_Increment</span>
                  <div className="text-4xl font-heading font-black text-emerald-400">+${Math.round(amount * (selectedPlan.baseRoi / 100)).toLocaleString()}</div>
               </div>
               <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="px-16 py-6 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
               >
                  {isDeploying ? 'INJECTING_CAPITAL...' : 'DEPLOY_RESOURCE'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InvestmentHub;
