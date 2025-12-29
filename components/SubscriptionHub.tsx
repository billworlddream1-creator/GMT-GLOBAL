
import React, { useState } from 'react';
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
}

const TIERS: Tier[] = [
  {
    id: 'FREE',
    title: 'FREE AGENT',
    price: '$0/mo',
    perks: ['Global News Feed', 'Standard Intelligence Reports', 'Public Market Data'],
    color: 'border-slate-500/30',
    accent: 'text-slate-400'
  },
  {
    id: 'FIELD_AGENT',
    title: 'FIELD OPERATIVE',
    price: '$19/mo',
    perks: ['Intelligence Terminal Access', 'Shadow Recon Tools', 'Tech Power Monitoring'],
    color: 'border-blue-500/40',
    accent: 'text-blue-400'
  },
  {
    id: 'INTEL_DIRECTOR',
    title: 'INTEL DIRECTOR',
    price: '$49/mo',
    perks: ['Satellite Scan Matrix', 'Cyber Defense Console', 'Admin Privileges'],
    color: 'border-emerald-500/40',
    accent: 'text-emerald-400'
  },
  {
    id: 'NEXUS_ARCHITECT',
    title: 'NEXUS ARCHITECT',
    price: '$99/mo',
    perks: ['Deep Space Scanner', 'Galaxy Navigator Core', 'Full System Dominance'],
    color: 'border-purple-500/40',
    accent: 'text-purple-400'
  }
];

const SubscriptionHub: React.FC<SubscriptionHubProps> = ({ currentLevel, onUpgrade }) => {
  const [upgradingTo, setUpgradingTo] = useState<AccessLevel | null>(null);

  const handleUpgrade = (tierId: AccessLevel) => {
    if (LEVEL_WEIGHT[tierId] <= LEVEL_WEIGHT[currentLevel]) return;
    
    setUpgradingTo(tierId);
    playUISound('startup');
    
    // Simulate Neural Link Verification
    setTimeout(() => {
      onUpgrade(tierId);
      setUpgradingTo(null);
      playUISound('success');
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter">Clearance_Neural_Registry</h2>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.5em]">Upgrade your uplink to access high-clearance tactical modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {TIERS.map((tier) => {
          const isCurrent = currentLevel === tier.id;
          const isLocked = LEVEL_WEIGHT[tier.id] > LEVEL_WEIGHT[currentLevel];
          const isUpgrading = upgradingTo === tier.id;

          return (
            <div 
              key={tier.id}
              className={`relative glass p-8 rounded-[3rem] border transition-all duration-500 flex flex-col ${tier.color} ${isCurrent ? 'bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] scale-105 z-10' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                  ACTIVE_UPLINK
                </div>
              )}

              <div className="mb-8">
                <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${tier.accent}`}>{tier.price}</span>
                <h3 className="text-2xl font-heading font-black text-white uppercase mt-1 leading-none">{tier.title}</h3>
              </div>

              <ul className="space-y-4 flex-1 mb-10">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[10px] font-mono text-slate-400 group">
                    <span className={`text-sm ${isLocked && !isCurrent ? 'opacity-20' : tier.accent}`}>✓</span>
                    <span className="leading-relaxed group-hover:text-white transition-colors">{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={!isLocked || isUpgrading}
                onClick={() => handleUpgrade(tier.id)}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden ${
                  isCurrent 
                    ? 'bg-white/5 text-slate-500 border border-white/10 cursor-default' 
                    : isUpgrading 
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                }`}
              >
                {isUpgrading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    VERIFYING...
                  </span>
                ) : isCurrent ? (
                  'CURRENT_ACCESS'
                ) : LEVEL_WEIGHT[tier.id] < LEVEL_WEIGHT[currentLevel] ? (
                  'LOWER_TIER'
                ) : (
                  'INITIALIZE_UPGRADE'
                )}
              </button>

              {isUpgrading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-[3rem] z-20">
                   <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                   <span className="text-[10px] font-heading font-black text-blue-400 uppercase tracking-widest">Biometric_Sync...</span>
                   <p className="text-[8px] font-mono text-slate-500 mt-2 uppercase">Connecting to neural core</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass p-10 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 bg-slate-900/10">
        <div className="flex-1 space-y-4">
          <h4 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Strategic_Enterprise_Uplink</h4>
          <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-xl">
            For state-level actors and corporate entities requiring multi-agent management, dedicated orbital bands, and priority neural processing. Contact the Nexus Overlords for custom integration protocols.
          </p>
        </div>
        <button className="px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black text-white uppercase tracking-widest transition-all whitespace-nowrap">
          Request_Protocol_X
        </button>
      </div>
    </div>
  );
};

export default SubscriptionHub;
