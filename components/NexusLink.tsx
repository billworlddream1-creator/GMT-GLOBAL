
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { playUISound } from '../utils/audioUtils';

interface NexusLinkProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
}

const NexusLink: React.FC<NexusLinkProps> = ({ user, setUser }) => {
  const [socialTarget, setSocialTarget] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!socialTarget.trim() || isConnecting) return;
    
    setIsConnecting(true);
    playUISound('startup');

    // Simulate neural handshake
    setTimeout(() => {
      const nextMonthlyCount = user.connections.monthlyConnections + 1;
      const nextTotalCount = user.connections.totalConnections + 1;
      
      const newlyEligible = nextMonthlyCount % 100 === 0 && nextMonthlyCount > 0;

      setUser({
        ...user,
        connections: {
          ...user.connections,
          totalConnections: nextTotalCount,
          monthlyConnections: nextMonthlyCount,
          referralRewardEligible: nextMonthlyCount >= 100
        }
      });

      setSocialTarget('');
      setIsConnecting(false);
      playUISound('success');

      if (newlyEligible) {
        playUISound('share');
        const tier = nextMonthlyCount / 100;
        alert(`CRITICAL MILESTONE: Tier ${tier} established. Your monthly stipend has been increased by $10.00. Total recurring yield: $${tier * 10}.00/mo.`);
      }
    }, 800);
  };

  const currentTier = useMemo(() => Math.floor(user.connections.monthlyConnections / 100), [user.connections.monthlyConnections]);
  const progressInCurrentTier = useMemo(() => user.connections.monthlyConnections % 100, [user.connections.monthlyConnections]);
  const monthlyStipend = useMemo(() => currentTier * 10, [currentTier]);
  const nextMilestone = useMemo(() => (currentTier + 1) * 100, [currentTier]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[10rem] font-heading font-black">NEXUS</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none">Nexus_Expansion_Protocol</h3>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-lg">
              Earn <span className="text-accent font-black">$10.00 USD per month</span> for every 100 active neural connections established. 
              Each additional block of 100 users compounds your monthly stipend indefinitely.
            </p>

            <div className="pt-6 space-y-6">
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Establish New Connection</label>
                  <div className="flex gap-4">
                    <input 
                      value={socialTarget}
                      onChange={(e) => setSocialTarget(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                      placeholder="Enter Target ID (e.g. @node_77)..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent outline-none transition-all"
                    />
                    <button 
                      onClick={handleConnect} 
                      disabled={isConnecting || !socialTarget.trim()}
                      className="px-10 py-4 bg-accent hover:bg-accent/80 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isConnecting ? 'Linking...' : 'Connect'}
                    </button>
                  </div>
               </div>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-6">
             <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Stipend</span>
                   <span className="text-2xl font-heading font-black text-emerald-400">${monthlyStipend.toFixed(2)}<span className="text-[10px] ml-1 opacity-60">/MO</span></span>
                </div>
                
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                      <span>Tier_{currentTier + 1}_Progress</span>
                      <span className="text-white">{progressInCurrentTier}/100</span>
                   </div>
                   <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" 
                        style={{ width: `${progressInCurrentTier}%` }}
                      ></div>
                   </div>
                   <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-widest">
                     Target 100 connections to increase stipend by +$10.00/mo
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/5 relative z-10">
           <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Total_Established_Nodes</span>
              <div className="text-2xl font-heading font-black text-white">{user.connections.totalConnections.toLocaleString()}</div>
              <div className="text-[8px] font-mono text-emerald-500 mt-2">▲ NETWORK_INTEGRITY_STABLE</div>
           </div>
           
           <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Monthly_Active_Handshakes</span>
              <div className="text-2xl font-heading font-black text-blue-400">{user.connections.monthlyConnections}</div>
              <div className="text-[8px] font-mono text-slate-600 mt-2">STIPEND_CYCLE: RECURRING</div>
           </div>

           <div className="glass p-6 rounded-3xl border border-accent/20 bg-accent/5 group hover:bg-accent/10 transition-all">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Total_Yield_Locked</span>
              <div className="text-2xl font-heading font-black text-emerald-400">${monthlyStipend.toFixed(2)}</div>
              <button 
                disabled={monthlyStipend === 0}
                className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Claim_Monthly_Payout
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 bg-white/5">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-xl text-blue-400 border border-blue-500/20">📈</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-2 tracking-widest">Compounding Rewards</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">Your monthly income scales linearly with your network size. Every 100 verified users is a permanent $10.00/month addition to your tactical funding.</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 bg-white/5">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-xl text-emerald-400 border border-emerald-500/20">🗓️</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-2 tracking-widest">Monthly Settlement</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">Payments are processed every 30 days based on your active connection tier. Ensure nodes remain active to maintain your stipend status.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NexusLink;
