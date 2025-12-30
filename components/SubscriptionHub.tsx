
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
    title: 'CIVILIAN_ACCESS',
    price: '$0/mo',
    perks: ['Global News Feed', 'Standard Reports', 'Public Markets'],
    color: 'border-slate-500/20',
    accent: 'text-slate-400',
    loadCapacity: 25
  },
  {
    id: 'FIELD_AGENT',
    title: 'TACTICAL_OPERATIVE',
    price: '$19/mo',
    perks: ['Intelligence Terminal', 'Shadow Recon', 'VIP Recon', 'Tech Power'],
    color: 'border-blue-500/30',
    accent: 'text-blue-400',
    loadCapacity: 50
  },
  {
    id: 'INTEL_DIRECTOR',
    title: 'STRATEGIC_DIRECTOR',
    price: '$49/mo',
    perks: ['Satellite Scan', 'Cyber Defense', 'Spatial Lab', 'Admin Ops'],
    color: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    loadCapacity: 75
  },
  {
    id: 'NEXUS_ARCHITECT',
    title: 'SYSTEM_ARCHITECT',
    price: '$99/mo',
    perks: ['Deep Space Scan', 'Galaxy Navigator', 'Oracle Engine', 'Full Dominance'],
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
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="glass p-12 rounded-[4rem] border border-white/5 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black">AUTH</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter">Clearance_Registry</h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.5em]">Current Clearance Status: <span className={currentTier.accent}>{currentTier.title}</span></p>
          </div>
          <div className="glass px-10 py-6 rounded-3xl border border-white/10 bg-black/40 text-center space-y-3">
             <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Neural_Load_Capacity</span>
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
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">ACTIVE_UPLINK</div>
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
                  {isUpgrading ? 'SYNCING...' : isCurrent ? 'CURRENT' : 'UPGRADE'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="glass p-12 rounded-[4rem] border border-white/5 bg-slate-900/20">
         <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-6 flex items-center gap-3">
           <span className="w-2 h-2 bg-accent rounded-full"></span>
           CLEARANCE_PERK_MATRIX
         </h3>
         <div className="space-y-4">
            {[
              { perk: 'Satellite Signal Frequency', free: '10Hz', agent: '100Hz', director: '1GHz', architect: 'Deep Link' },
              { perk: 'Concurrent Node Connections', free: '1', agent: '5', director: '25', architect: 'Unlimited' },
              { perk: 'Data Persistence Horizon', free: '24h', agent: '30 Days', director: 'Full Archive', architect: 'Neural Store' },
              { perk: 'Search Grounding Depth', free: 'Surface', agent: 'Deep Web', director: 'Classified', architect: 'Oracle Level' }
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-4 border-b border-white/5 text-[9px] font-mono uppercase">
                <div className="text-slate-500 font-black">{row.perk}</div>
                <div className="text-center text-slate-600">{row.free}</div>
                <div className="text-center text-blue-400">{row.agent}</div>
                <div className="text-center text-emerald-400">{row.director}</div>
                <div className="text-center text-purple-400">{row.architect}</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SubscriptionHub;
