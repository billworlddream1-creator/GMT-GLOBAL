
import React, { useState, useMemo } from 'react';
import { AccessLevel, LEVEL_WEIGHT } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SubscriptionHubProps {
  currentLevel: AccessLevel;
  onUpgrade: (level: AccessLevel) => void;
}

interface Tier {
  id: AccessLevel;
  title: string;
  price: string;
  perks: string[];
  color: string;
  accent: string;
  loadCapacity: number;
}

const TIERS: Tier[] = [
  {
    id: 'FREE',
    title: 'OPERATIVE_GUEST',
    price: 'FREE_ACCESS',
    perks: [
      'Global Intelligence Feed',
      'Surface Search Grounding',
      'Basic Market Analysis',
      'Standard Encryption Node',
      '12h Data Retention'
    ],
    color: 'border-slate-500/20',
    accent: 'text-slate-400',
    loadCapacity: 15
  },
  {
    id: 'FIELD_AGENT',
    title: 'TACTICAL_PRO',
    price: '$29/mo',
    perks: [
      'Deep Web Intelligence',
      'VIP Tracking Matrix',
      'Orbital Signal Decryption',
      'Priority Neural Processing',
      '30-Day Archive Access',
      'Unlimited Social Connects'
    ],
    color: 'border-blue-500/30',
    accent: 'text-blue-400',
    loadCapacity: 45
  },
  {
    id: 'INTEL_DIRECTOR',
    title: 'SECTOR_COMMAND',
    price: '$99/mo',
    perks: [
      'Full Satellite Control',
      'Vulnerability Audit Engine',
      'Predictive Geopolitics',
      'Neural Audio Broadcast',
      'Custom Module Layouts',
      'Permanent Data Vaults'
    ],
    color: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    loadCapacity: 80
  },
  {
    id: 'NEXUS_ARCHITECT',
    title: 'GLOBAL_OVERSEER',
    price: '$499/mo',
    perks: [
      'Total Network Dominance',
      'Infinite Temporal Forecasts',
      'Mass Anomaly Prediction',
      'Quantum Cipher Creation',
      'Unlimited Satellite Pulse',
      'Zero-Latency Command Link'
    ],
    color: 'border-purple-500/40',
    accent: 'text-purple-400',
    loadCapacity: 100
  }
];

const SubscriptionHub: React.FC<SubscriptionHubProps> = ({ currentLevel, onUpgrade }) => {
  const [upgradingTo, setUpgradingTo] = useState<AccessLevel | null>(null);

  const handleUpgrade = (tierId: AccessLevel) => {
    if (LEVEL_WEIGHT[tierId] <= LEVEL_WEIGHT[currentLevel]) return;
    setUpgradingTo(tierId);
    playUISound('startup');
    setTimeout(() => {
      onUpgrade(tierId);
      setUpgradingTo(null);
      playUISound('success');
    }, 2500);
  };

  const currentTier = useMemo(() => TIERS.find(t => t.id === currentLevel)!, [currentLevel]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-32">
      <div className="glass p-12 rounded-[4rem] border border-white/5 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">PLANS</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter">Access_Protocols</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.5em]">Active Clearance: <span className={currentTier.accent}>{currentTier.title}</span></p>
          </div>
          <div className="glass px-10 py-6 rounded-3xl border border-white/10 bg-black/40 text-center space-y-3">
             <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Network_Priority_Tier</span>
             <div className="text-4xl font-heading font-black text-white">{currentTier.loadCapacity}%</div>
             <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${currentTier.accent.replace('text', 'bg')}`} style={{ width: `${currentTier.loadCapacity}%` }}></div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIERS.map((tier) => {
            const isCurrent = currentLevel === tier.id;
            const isHigher = LEVEL_WEIGHT[tier.id] > LEVEL_WEIGHT[currentLevel];
            const isUpgrading = upgradingTo === tier.id;

            return (
              <div 
                key={tier.id}
                className={`relative glass p-8 rounded-[3rem] border transition-all duration-500 flex flex-col ${tier.color} ${isCurrent ? 'bg-white/5 shadow-2xl scale-105 z-10' : 'opacity-60 hover:opacity-100'}`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">AUTHORIZED</div>
                )}
                
                <div className="mb-8">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${tier.accent}`}>{tier.price}</span>
                  <h3 className="text-xl font-heading font-black text-white uppercase mt-1 leading-tight">{tier.title.replace('_', ' ')}</h3>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                   {tier.perks.map((p, i) => (
                     <div key={i} className="flex items-start gap-3 text-[10px] font-mono text-slate-400 group">
                        <span className={isHigher ? 'opacity-20' : tier.accent}>▹</span>
                        <span className="group-hover:text-white transition-colors uppercase">{p}</span>
                     </div>
                   ))}
                </div>

                <button
                  disabled={!isHigher || isUpgrading}
                  onClick={() => handleUpgrade(tier.id)}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isCurrent 
                      ? 'bg-white/5 text-slate-500 border border-white/10 cursor-default' 
                      : isUpgrading ? 'bg-blue-600 animate-pulse' : 'bg-accent hover:bg-accent/80 text-white'
                  }`}
                >
                  {isUpgrading ? 'UPLINKING...' : isCurrent ? 'CURRENT_PLAN' : 'SELECT_PROTOCOL'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHub;
