import React, { useState, useEffect } from 'react';
import { IntelligenceReminder } from '../types';
import { playUISound } from '../utils/audioUtils';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';

interface ReminderTerminalProps {
  reminders: IntelligenceReminder[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const ReminderTerminal: React.FC<ReminderTerminalProps> = ({ reminders, onDismiss, onClearAll }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (timestamp: number) => {
    const diff = timestamp - currentTime;
    if (diff <= 0) return "TRIGGERED";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}M ${secs}S`;
  };

  const getSeverityStyle = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'ELEVATED': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      default: return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    }
  };

  const handleCalendarSync = (rem: IntelligenceReminder) => {
    playUISound('click');
    const url = generateGoogleCalendarUrl({
      title: `[GMT ALERT] ${rem.intelTitle}`,
      details: `Scheduled intelligence check-in for category: ${rem.category}. Severity: ${rem.severity}.`,
      startTime: rem.triggerTimestamp,
      durationMinutes: 15
    });
    window.open(url, '_blank');
  };

  const sortedReminders = [...reminders].sort((a, b) => a.triggerTimestamp - b.triggerTimestamp);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black text-white">WATCH</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Temporal_Intel_Watch</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mt-2">Active Intelligence Monitoring Schedule</p>
          </div>
          <button 
            onClick={() => { playUISound('alert'); onClearAll(); }}
            className="px-8 py-3 glass border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-red-500/40 transition-all"
          >
            Purge All Alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedReminders.length > 0 ? sortedReminders.map((rem) => {
          const isTriggered = currentTime >= rem.triggerTimestamp;
          return (
            <div 
              key={rem.id} 
              className={`glass p-8 rounded-[3rem] border transition-all duration-500 relative group overflow-hidden ${
                isTriggered ? 'border-red-500/40 bg-red-500/5 animate-pulse' : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getSeverityStyle(rem.severity)}`}>
                  {rem.severity}
                </span>
                <span className="text-[8px] font-mono text-slate-600">ID_{rem.id.split('-').pop()}</span>
              </div>

              <h4 className="text-sm font-heading font-black text-white uppercase mb-4 leading-tight line-clamp-2">
                {rem.intelTitle}
              </h4>

              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                 <span className="text-[10px] font-mono text-slate-500 uppercase">{rem.category}</span>
              </div>

              <div className="flex justify-between items-end border-t border-white/5 pt-6 mt-auto">
                 <div>
                    <span className="text-[8px] font-mono text-slate-600 uppercase block mb-1">Time_Horizon</span>
                    <span className={`text-lg font-heading font-black tabular-nums ${isTriggered ? 'text-red-500' : 'text-accent'}`}>
                      {formatTimeRemaining(rem.triggerTimestamp)}
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleCalendarSync(rem)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 transition-all text-blue-400"
                      title="Sync to Calendar"
                    >
                      📅
                    </button>
                    <button 
                      onClick={() => { playUISound('click'); onDismiss(rem.id); }}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      ✕
                    </button>
                 </div>
              </div>

              {isTriggered && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="col-span-full py-40 text-center opacity-10 space-y-6">
             <span className="text-8xl block">💤</span>
             <p className="text-[11px] font-mono uppercase tracking-[0.5em]">No temporal alerts currently scheduled</p>
          </div>
        )}
      </div>
      
      <div className="glass p-10 rounded-[3rem] border border-white/5 bg-slate-900/40">
         <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Watch Protocols
         </h4>
         <p className="text-xs font-mono text-slate-400 leading-relaxed max-w-2xl">
           The Watch module schedules high-frequency neural notifications for critical developments. When a timer expires, a tactical override will trigger to ensure the agent is aware of the shift in global state. Alerts persist in memory until manual purge.
         </p>
      </div>
    </div>
  );
};

export default ReminderTerminal;
