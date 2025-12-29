
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playUISound } from '../utils/audioUtils';

interface NexusLinkProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
}

const NexusLink: React.FC<NexusLinkProps> = ({ user, setUser }) => {
  const [socialTarget, setSocialTarget] = useState('');

  const handleConnect = () => {
    if (!socialTarget.trim()) return;
    setUser({
      ...user,
      connections: {
        ...user.connections,
        totalConnections: user.connections.totalConnections + 1,
        monthlyConnections: user.connections.monthlyConnections + 1,
        referralRewardEligible: user.connections.monthlyConnections + 1 >= 100
      }
    });
    setSocialTarget('');
    playUISound('success');
    if (user.connections.monthlyConnections + 1 === 100) {
      alert("COMMAND_NOTICE: You have reached the Gold Connector tier. $10 payout scheduled.");
    }
  };

  const progress = Math.min(100, (user.connections.monthlyConnections / 100) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-5">
      <div className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <span className="px-4 py-2 bg-blue-600/20 border border-blue-500 rounded-full text-[10px] font-black text-blue-400">STATUS: {user.connections.monthlyConnections >= 100 ? 'GOLD_CONNECTOR' : 'IN_TRAINING'}</span>
        </div>
        
        <h3 className="text-3xl font-heading font-black text-white mb-4">NEURAL_BRIDGE</h3>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-10">Connect to external social networks to grow your intelligence cluster.</p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Target Social ID</label>
               <div className="flex gap-4">
                 <input 
                   value={socialTarget}
                   onChange={(e) => setSocialTarget(e.target.value)}
                   placeholder="@user_handle..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs"
                 />
                 <button onClick={handleConnect} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black text-white">BRIDGE</button>
               </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-slate-400">Monthly Target Progress</span>
                <span className="text-lg font-heading font-black text-white">{user.connections.monthlyConnections}/100</span>
              </div>
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-[9px] font-mono text-slate-500 italic">Reach 100 connections per month for a recurring $10 capital injection.</p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="glass-bright p-6 rounded-3xl border border-white/10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">REWARD_HUB</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[9px] font-mono text-slate-400">Pending Payout</span>
                      <span className="text-lg font-heading font-black text-emerald-400">${user.connections.referralRewardEligible ? '10.00' : '0.00'}</span>
                   </div>
                   <div className="flex justify-between items-center py-3">
                      <span className="text-[9px] font-mono text-slate-400">Legacy Bonus</span>
                      <span className="text-lg font-heading font-black text-blue-400">${user.connections.tier2Eligible ? '10.00' : '0.00'}</span>
                   </div>
                   <button 
                     disabled={!user.connections.referralRewardEligible}
                     className="w-full py-4 bg-emerald-600 disabled:opacity-20 rounded-2xl text-[10px] font-black text-white mt-4"
                   >
                     Claim Capital
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusLink;
