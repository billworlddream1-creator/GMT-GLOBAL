
import React, { useState, useMemo, useEffect } from 'react';
import { Investment, InvestmentSector, UserProfile, MarketData } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';

interface InvestmentHubProps {
  user: UserProfile;
  onInvest: (i: Investment) => void;
  activeInvestments: Investment[];
}

const SECTORS: { id: InvestmentSector, label: string, icon: string, risk: 'LOW' | 'MODERATE' | 'SPECULATIVE', baseRoi: number, desc: string }[] = [
  { id: 'QUANTUM_COMPUTING', label: 'Quantum Computing', icon: '💻', risk: 'MODERATE', baseRoi: 18, desc: 'Next-gen processing infrastructure. High growth, stable long-term yields.' },
  { id: 'FUSION_ENERGY', label: 'Fusion Energy', icon: '⚛️', risk: 'LOW', baseRoi: 12, desc: 'Clean, limitless power generation. Secure, government-backed dividends.' },
  { id: 'OFF_WORLD_MINING', label: 'Off-World Mining', icon: '☄️', risk: 'SPECULATIVE', baseRoi: 45, desc: 'High-risk asteroid resource harvesting. Explosive potential returns.' },
  { id: 'NEURAL_NETWORKS', label: 'Neural Networks', icon: '🧠', risk: 'MODERATE', baseRoi: 25, desc: 'Advanced AI integration grid. Rapidly expanding market sector.' },
  { id: 'BIO_SYNTHESIS', label: 'Bio-Synthesis', icon: '🧬', risk: 'LOW', baseRoi: 15, desc: 'Synthetic biology and medical augmentation. Consistent demand.' }
];

const InvestmentHub: React.FC<InvestmentHubProps> = ({ user, onInvest, activeInvestments }) => {
  const [selectedSector, setSelectedSector] = useState<InvestmentSector>('QUANTUM_COMPUTING');
  const [amount, setAmount] = useState<number>(5000);
  const [duration, setDuration] = useState<6 | 12 | 24>(12);
  const [isDeploying, setIsDeploying] = useState(false);
  const [volatility, setVolatility] = useState(0.5);
  const [marketAdvice, setMarketAdvice] = useState('Syncing neural market data...');
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const intelService = useMemo(() => new IntelligenceService(), []);

  useEffect(() => {
    const fetchMarket = async () => {
      const data = await intelService.getMarketIntelligence();
      setMarketData(data);
      const advice = await intelService.getStrategicInvestmentAdvice(data);
      setMarketAdvice(advice);
      setVolatility(0.4 + Math.random() * 0.4);
    };
    fetchMarket();
    const interval = setInterval(() => setVolatility(0.4 + Math.random() * 0.4), 5000);
    return () => clearInterval(interval);
  }, [intelService]);

  const currentSector = useMemo(() => SECTORS.find(s => s.id === selectedSector)!, [selectedSector]);
  
  const estimatedReturn = useMemo(() => {
    const durationMultiplier = duration === 24 ? 1.8 : duration === 12 ? 1.4 : 1.0;
    const volatilityImpact = 1 + (volatility - 0.5) * (currentSector.risk === 'SPECULATIVE' ? 0.5 : 0.1);
    const roiPercent = currentSector.baseRoi * durationMultiplier * volatilityImpact;
    return Math.round(amount * (roiPercent / 100));
  }, [amount, duration, currentSector, volatility]);

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
        timestamp: new Date().toISOString(),
        volatilityIndex: volatility
      };
      onInvest(investment);
      setIsDeploying(false);
      playUISound('success');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden bg-slate-900/10">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none"></div>
          <h3 className="text-4xl font-heading font-black text-white mb-2 uppercase tracking-tighter">Strategic_Deployment</h3>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-10">Capital Optimization & Geopolitical Growth</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-8">
            <div><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Assets_Under_Mgmt</span><span className="text-2xl font-heading font-black text-white">${activeInvestments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span></div>
            <div><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Projected_Yield</span><span className="text-2xl font-heading font-black text-emerald-400">${activeInvestments.reduce((sum, i) => sum + i.expectedReturn, 0).toLocaleString()}</span></div>
            <div><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Volatility_IDX</span><span className="text-2xl font-heading font-black text-amber-500">{(volatility * 10).toFixed(1)}</span></div>
            <div><span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Network_Trust</span><span className="text-2xl font-heading font-black text-blue-400">98.2%</span></div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-accent/20 bg-accent/5 flex flex-col justify-center">
           <span className="text-[9px] font-mono text-accent uppercase mb-4 tracking-widest font-black">Neural_Strategy_Advice</span>
           <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic border-l-2 border-accent/40 pl-4">
              "{marketAdvice}"
           </p>
           <span className="text-[7px] font-mono text-slate-600 mt-4 uppercase">GMT_ORACLE_V2.1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-12 rounded-[3.5rem] border border-white/10 space-y-12 bg-slate-900/20">
          <div className="space-y-8">
            <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">TARGET_SECTOR_IDENTIFICATION</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTORS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setSelectedSector(s.id); playUISound('click'); }}
                  className={`p-6 rounded-[2.5rem] border transition-all text-left flex items-center gap-5 group ${selectedSector === s.id ? 'bg-accent/20 border-accent shadow-xl' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform ${selectedSector === s.id ? 'text-accent' : 'text-slate-500'}`}>{s.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-wider">{s.label}</h4>
                    <span className={`text-[8px] font-mono uppercase font-bold ${s.risk === 'LOW' ? 'text-emerald-500' : s.risk === 'MODERATE' ? 'text-amber-500' : 'text-red-500'}`}>{s.risk}_RISK</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
             <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investment Magnitude</label>
                <div className="grid grid-cols-3 gap-3">
                   {[1000, 5000, 10000, 25000, 50000, 100000].map(amt => (
                     <button key={amt} onClick={() => setAmount(amt)} className={`py-3 rounded-xl font-mono text-[10px] border transition-all ${amount === amt ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>${(amt/1000).toFixed(0)}K</button>
                   ))}
                </div>
             </div>
             <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commitment Horizon</label>
                <div className="grid grid-cols-3 gap-3">
                   {[6, 12, 24].map(m => (
                     <button key={m} onClick={() => setDuration(m as any)} className={`py-3 rounded-xl font-mono text-[10px] border transition-all ${duration === m ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>{m} MO</button>
                   ))}
                </div>
             </div>
          </div>

          <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-10">
             <div className="space-y-4 flex-1">
                <h4 className="text-xl font-heading font-black text-white uppercase tracking-tighter leading-none">Sector_Synthesis</h4>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-md">{currentSector.desc}</p>
                <div className="flex gap-8 pt-4">
                   <div><span className="text-[8px] font-mono text-slate-600 block uppercase">Base_Yield</span><span className="text-lg font-heading font-black text-white">{currentSector.baseRoi}%</span></div>
                   <div><span className="text-[8px] font-mono text-slate-600 block uppercase">Net_Yield</span><span className="text-lg font-heading font-black text-emerald-400">+${estimatedReturn.toLocaleString()}</span></div>
                </div>
             </div>
             <button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="px-12 py-6 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl transition-all disabled:opacity-50"
             >
                {isDeploying ? 'DEPLOYING_CAPITAL...' : 'DEPLOY_RESOURCE'}
             </button>
          </div>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col bg-slate-900/40">
           <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4">DEPLOYMENT_LOGS</h4>
           <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
              {activeInvestments.map(inv => (
                <div key={inv.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-accent/30 transition-all group relative">
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] font-mono text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded uppercase">ACTIVE</span>
                      <span className="text-[8px] font-mono text-slate-600">ID_{(inv.id || '').split('-').pop()}</span>
                   </div>
                   <h5 className="text-[10px] font-heading font-black text-white uppercase mb-4 tracking-widest">{inv.sector.replace('_', ' ')}</h5>
                   <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div><span className="text-[7px] font-mono text-slate-500 uppercase block">Principal</span><span className="text-xs font-heading font-black text-white">${inv.amount.toLocaleString()}</span></div>
                      <div className="text-right"><span className="text-[7px] font-mono text-slate-500 uppercase block">Yield</span><span className="text-xs font-heading font-black text-emerald-400">+${inv.expectedReturn.toLocaleString()}</span></div>
                   </div>
                </div>
              ))}
              {activeInvestments.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6 py-20">
                   <span className="text-6xl">📊</span>
                   <p className="text-[10px] font-mono uppercase tracking-widest">No capital deployments recorded.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentHub;
