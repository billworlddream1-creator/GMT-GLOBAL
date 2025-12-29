
import React, { useState } from 'react';
import { Investment, PaymentSettings, Partnership } from '../types';
import { playUISound } from '../utils/audioUtils';

interface AdminConsoleProps {
  paymentSettings: PaymentSettings;
  setPaymentSettings: (s: PaymentSettings) => void;
  investments: Investment[];
  setInvestments: (i: Investment[]) => void;
  partnerships: Partnership[];
  setPartnerships: (p: Partnership[]) => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ 
  paymentSettings, setPaymentSettings, 
  investments, setInvestments,
  partnerships, setPartnerships
}) => {
  const [activeTab, setActiveTab] = useState<'investments' | 'partnerships' | 'settings'>('investments');

  const handleAction = (id: string, type: 'invest' | 'partner', status: string) => {
    if (type === 'invest') {
      setInvestments(investments.map(i => i.id === id ? { ...i, status: status as any } : i));
    } else {
      setPartnerships(partnerships.map(p => p.id === id ? { ...p, status: status as any } : p));
    }
    
    // UI Feedback
    if (status === 'PAID' || status === 'ACTIVE') {
      playUISound('success');
    } else {
      playUISound('alert');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex space-x-4 border-b border-white/5 pb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('investments')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'investments' ? 'bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]' : 'glass border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          Investment Portfolio
        </button>
        <button 
          onClick={() => setActiveTab('partnerships')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'partnerships' ? 'bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]' : 'glass border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          Partner Agreements
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-accent text-white shadow-[0_0_15px_var(--accent-glow)]' : 'glass border border-white/5 text-slate-500 hover:text-slate-300'}`}
        >
          Global Configuration
        </button>
      </div>

      {(activeTab === 'investments' || activeTab === 'partnerships') && (
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">
              {activeTab === 'investments' ? 'User Investment Ledger' : 'Partnership Terminal'}
            </h3>
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-mono text-accent">
              {activeTab === 'investments' ? `${investments.length} Active Requests` : `${partnerships.length} Active Partners`}
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[10px] font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 uppercase tracking-widest">
                  <th className="py-5 px-4 font-black">ID</th>
                  <th className="py-5 px-4 font-black">Sector/Role</th>
                  <th className="py-5 px-4 font-black">Capital</th>
                  <th className="py-5 px-4 font-black">Duration</th>
                  <th className="py-5 px-4 font-black">Yield/ROI</th>
                  <th className="py-5 px-4 font-black">Status</th>
                  <th className="py-5 px-4 font-black">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(activeTab === 'investments' ? (investments as any[]) : (partnerships as any[])).map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-5 px-4 text-accent font-bold">{(item.id || "ITEM").split('-').pop()}</td>
                    <td className="py-5 px-4 text-slate-300">{activeTab === 'investments' ? (item.sector || 'GLOBAL').replace('_', ' ') : (item.role || 'ASSET').replace('_', ' ')}</td>
                    <td className="py-5 px-4 font-black text-white">${(item.amount || 0).toLocaleString()}</td>
                    <td className="py-5 px-4 text-slate-400">{item.durationMonths || 0} Months</td>
                    <td className="py-5 px-4 text-emerald-400 font-bold">
                      {activeTab === 'investments' ? `+$${item.expectedReturn}` : `${item.roi}%`}
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                        item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        item.status === 'REFUNDED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-accent/10 text-accent border border-accent/20 animate-pulse'
                      }`}>
                        {item.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {item.status === 'ACTIVE' && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleAction(item.id, activeTab === 'investments' ? 'invest' : 'partner', 'PAID')} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-heading font-black text-[8px] uppercase tracking-widest transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(item.id, activeTab === 'investments' ? 'invest' : 'partner', 'REFUNDED')} 
                            className="bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-500 hover:text-white px-4 py-1.5 rounded-lg font-heading font-black text-[8px] uppercase tracking-widest transition-all"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                      {item.status !== 'ACTIVE' && (
                        <span className="text-slate-600 italic text-[9px]">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {((activeTab === 'investments' && investments.length === 0) || (activeTab === 'partnerships' && partnerships.length === 0)) && (
              <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-[0.3em]">
                No pending requests in neural queue.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-10">
          <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Command Control Unit</h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Settlement Master Email</label>
              <input 
                value={paymentSettings.paypalEmail}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalEmail: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="master@gmt-global.net"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Primary Capital Gateway ID</label>
              <input 
                value={paymentSettings.bankAccount}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccount: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="BANK-NX-9922"
              />
            </div>
            <div className="space-y-4 md:col-span-2">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">Master Crypto Vault</label>
              <input 
                value={paymentSettings.cryptoWallet}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, cryptoWallet: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent transition-all outline-none"
                placeholder="0xVault..."
              />
            </div>
          </div>
          <div className="pt-6">
            <button 
              onClick={() => playUISound('success')}
              className="px-12 py-5 bg-accent hover:bg-accent/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95"
            >
              Update Global Protocols
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
