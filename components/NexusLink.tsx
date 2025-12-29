
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
        alert(`CRITICAL MILESTONE: Tier ${tier} reached. Additional $10.00 capital allocated to your terminal.`);
      }
    }, 800);
  };

  const currentTier = useMemo(() => Math.floor(user.connections.monthlyConnections / 100), [user.connections.monthlyConnections]);
  const progressInCurrentTier = useMemo(() => user.connections.monthlyConnections % 100, [user.connections.monthlyConnections]);
  const totalPayout = useMemo(() => currentTier * 10, [currentTier]);
  const nextMilestone = useMemo(() => (currentTier + 1) * 100, [currentTier]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[10rem] font-heading font-black">NEXUS</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none">Neural_Bridge_Matrix</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] leading-relaxed max-w-md">
              Expand the GMT network. For every 100 unique neural handshakes established, receive a $10.00 strategic stipend. No limit on expansion.
            </p>

            <div className="pt-6 space-y-6">
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Target Identity Hash</label>
                  <div className="flex gap-4">
                    <input 
                      value={socialTarget}
                      onChange={(e) => setSocialTarget(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                      placeholder="Enter Social ID (e.g. @agent_smith)..."
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
             <div className="glass p-8 rounded-[2.5rem] border border-accent/20 bg-accent/5 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Tier</span>
                   <span className="text-xl font-heading font-black text-accent">LEVEL_{currentTier + 1}</span>
                </div>
                
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                      <span>Milestone Progress</span>
                      <span className="text-white">{progressInCurrentTier}%</span>
                   </div>
                   <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" 
                        style={{ width: `${progressInCurrentTier}%` }}
                      ></div>
                   </div>
                   <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-widest">
                     {100 - progressInCurrentTier} more to unlock next $10 reward
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/5 relative z-10">
           <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Total_Network_Size</span>
              <div className="text-2xl font-heading font-black text-white">{user.connections.totalConnections.toLocaleString()}</div>
              <div className="text-[8px] font-mono text-emerald-500 mt-2">▲ GLOBAL_REACH_UP</div>
           </div>
           
           <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Current_Month_Volume</span>
              <div className="text-2xl font-heading font-black text-blue-400">{user.connections.monthlyConnections}</div>
              <div className="text-[8px] font-mono text-slate-600 mt-2">NEXT_RESET: 18_DAYS</div>
           </div>

           <div className="glass p-6 rounded-3xl border border-accent/20 bg-accent/5 group hover:bg-accent/10 transition-all">
              <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Total_Milestone_Yield</span>
              <div className="text-2xl font-heading font-black text-emerald-400">${totalPayout.toFixed(2)}</div>
              <button 
                disabled={totalPayout === 0}
                className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Claim_Funds
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 bg-white/5">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-xl text-blue-400 border border-blue-500/20">∞</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-2 tracking-widest">Infinite Expansion</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">There is no ceiling to your earnings. Every batch of 100 verified users triggers an automatic capital injection into your neural wallet.</p>
            </div>
         </div>
         <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 bg-white/5">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-xl text-emerald-400 border border-emerald-500/20">⚡</div>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-2 tracking-widest">Instant Verification</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">GMT satellites verify neural hashes in real-time. Once the 100th connection is confirmed, your status is updated across the global ledger instantly.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NexusLink;
