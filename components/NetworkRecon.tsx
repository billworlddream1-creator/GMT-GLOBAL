
import React, { useMemo } from 'react';
import { NetworkStatus } from '../types';

interface NetworkReconProps {
  network: NetworkStatus;
}

const NetworkRecon: React.FC<NetworkReconProps> = ({ network }) => {
  const getQualityColor = () => {
    switch (network.quality) {
      case 'OPTIMAL': return 'text-emerald-400';
      case 'STABLE': return 'text-blue-400';
      case 'WEAK': return 'text-amber-400';
      case 'CRITICAL': return 'text-red-400';
      case 'OFFLINE': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  const getWaveColor = () => {
    switch (network.quality) {
      case 'OPTIMAL': return '#10b981';
      case 'STABLE': return '#3b82f6';
      case 'WEAK': return '#f59e0b';
      case 'CRITICAL': return '#ef4444';
      default: return '#64748b';
    }
  };

  const stats = useMemo(() => [
    { label: 'UPLINK_PROTOCOL', value: network.effectiveType.toUpperCase(), icon: '📡' },
    { label: 'DOWNLINK_VELOCITY', value: `${network.downlink} MBPS`, icon: '🌊' },
    { label: 'NEURAL_LATENCY', value: `${network.rtt} MS`, icon: '🧠' },
    { label: 'NODE_STATUS', value: network.online ? 'SYNCED' : 'DISCONNECTED', icon: network.online ? '✅' : '❌' }
  ], [network]);

  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 relative overflow-hidden animate-in slide-in-from-right-4 duration-1000">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
         <span className="text-8xl font-heading font-black">LINK</span>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${network.online ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
            <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.3em]">Network_Recon_Telemetry</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-40">{stat.icon}</span>
                  <span className="text-[10px] font-heading font-black text-white">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-64 h-24 glass rounded-3xl border-white/5 bg-black/40 flex flex-col items-center justify-center p-6 relative">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 pointer-events-none">
            <svg width="100%" height="40" viewBox="0 0 100 40">
              <path 
                d="M 0 20 Q 25 10, 50 20 T 100 20" 
                fill="none" 
                stroke={getWaveColor()} 
                strokeWidth="0.5"
                className="animate-wave-path"
              />
            </svg>
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">Uplink_Quality</span>
          <div className={`text-xl font-heading font-black ${getQualityColor()} drop-shadow-[0_0_8px_currentColor]`}>
            {network.quality}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-path {
          animation: wave 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NetworkRecon;
