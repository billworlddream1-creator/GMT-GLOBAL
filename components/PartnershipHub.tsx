
import React, { useState, useMemo } from 'react';
import { UserProfile, Partnership, PartnerRole } from '../types';
import { playUISound } from '../utils/audioUtils';

interface PartnershipHubProps {
  user: UserProfile;
  onPartner: (p: Partnership) => void;
}

const PartnershipHub: React.FC<PartnershipHubProps> = ({ user, onPartner }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [duration, setDuration] = useState<6 | 12>(6);

  const roleInfo = useMemo(() => {
    if (selectedAmount >= 5000) return { role: 'NEXUS_OVERLORD' as PartnerRole, bonusRoi: 10, color: 'text-purple-400' };
    if (selectedAmount >= 2500) return { role: 'STRATEGIC_ASSET' as PartnerRole, bonusRoi: 5, color: 'text-amber-400' };
    if (selectedAmount >= 1000) return { role: 'FIELD_OPERATIVE' as PartnerRole, bonusRoi: 2, color: 'text-blue-400' };
    return { role: 'JUNIOR_AGENT' as PartnerRole, bonusRoi: 0, color: 'text-slate-400' };
  }, [selectedAmount]);

  const calculateROI = () => (duration === 6 ? 10 : 15) + roleInfo.bonusRoi;

  const handleApply = () => {
    const roi = calculateROI();
    const partnership: Partnership = {
      id: `PRT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: user.id,
      amount: selectedAmount,
      durationMonths: duration,
      roi: roi,
      role: roleInfo.role,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE'
    };
    onPartner(partnership);
    playUISound('success');
    alert(`PARTNERSHIP_INITIATED: High-clearance agreement for $${selectedAmount} as ${roleInfo.role.replace('_', ' ')} established.`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass p-12 rounded-[3.5rem] border border-white/10 relative overflow-hidden">
        <div className="scanline"></div>
        <h3 className="text-4xl font-heading font-black text-white mb-4">PARTNER_PROGRAM</h3>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-12">Tiered strategic alliances for long-term intelligence dominance.</p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Stake Amount</label>
              <div className="flex flex-wrap gap-4">
                {[500, 1000, 2500, 5000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => { setSelectedAmount(amt); playUISound('click'); }}
                    className={`px-6 py-3 rounded-xl font-heading font-black text-xs transition-all ${selectedAmount === amt ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'glass-bright border border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Alliance Duration</label>
              <div className="flex gap-4">
                {[6, 12].map(d => (
                  <button 
                    key={d}
                    onClick={() => { setDuration(d as any); playUISound('click'); }}
                    className={`flex-1 py-4 rounded-xl font-heading font-black text-xs transition-all ${duration === d ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'glass-bright border border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    {d} MONTHS
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase">Calculated_Role</span>
              <div className={`text-xl font-heading font-black uppercase ${roleInfo.color}`}>{roleInfo.role.replace('_', ' ')}</div>
              <p className="text-[8px] font-mono text-slate-600">Base ROI increased by {roleInfo.bonusRoi}% for this tier.</p>
            </div>
          </div>

          <div className="glass-bright p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">ROI_CALCULATION</h4>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-400">Fixed Yield</span>
                <span className="text-2xl font-heading font-black text-emerald-400">+{calculateROI()}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-400">Expected Settlement</span>
                <span className="text-2xl font-heading font-black text-white">${(selectedAmount * (1 + calculateROI()/100)).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleApply}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl mt-8"
            >
              EXECUTE_AGREEMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipHub;
