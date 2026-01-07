
import React, { useState, useEffect, useCallback } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { WeatherReport } from '../types';
import { playUISound } from '../utils/audioUtils';

interface AtmosMonitorProps {
  intelService: IntelligenceService;
}

const AtmosMonitor: React.FC<AtmosMonitorProps> = ({ intelService }) => {
  const [locationInput, setLocationInput] = useState('');
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('gmt_atmos_history');
    return saved ? JSON.parse(saved) : ['London', 'Tokyo', 'New York'];
  });

  const fetchAtmos = async (loc: string) => {
    setLoading(true);
    setError(null);
    setSelectedDay(null);
    playUISound('startup');
    try {
      const data = await intelService.getAtmosIntelligence(loc);
      setReport(data);
      
      // Update history
      setHistory(prev => {
        const next = [data.location, ...prev.filter(l => l !== data.location)].slice(0, 5);
        localStorage.setItem('gmt_atmos_history', JSON.stringify(next));
        return next;
      });
      
      playUISound('success');
    } catch (err: any) {
      setError(err.message || 'ATMOS_UPLINK_FAILURE');
      playUISound('alert');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) fetchAtmos(locationInput);
  };

  const detectLocation = useCallback(() => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchAtmos(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          setDetecting(false);
        },
        (err) => {
          console.error(err);
          setDetecting(false);
          setError("GEO_LOC_DENIED: Operational manual entry required.");
        }
      );
    } else {
      setDetecting(false);
      setError("GEO_LOC_UNAVAILABLE");
    }
  }, [intelService]);

  useEffect(() => {
    detectLocation();
  }, []);

  const getWeatherIcon = (condition: string | undefined) => {
    const c = (condition || 'unknown').toLowerCase();
    if (c.includes('rain')) return '🌧️';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('sun') || c.includes('clear')) return '☀️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('storm') || c.includes('thunder')) return '⛈️';
    return '🌡️';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="text-[12rem] font-heading font-black text-white">ATMOS</span>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="space-y-4 flex-1">
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.5em] font-black">Meteorological_Intercept</span>
             </div>
             <h2 className="text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">Climate_Matrix</h2>
             <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Real-time neural analysis of global atmospheric stability.</p>
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-auto relative z-20">
             <form onSubmit={handleManualSearch} className="flex gap-4">
               <input 
                 type="text"
                 value={locationInput}
                 onChange={(e) => setLocationInput(e.target.value)}
                 placeholder="Acquire Sector (e.g. London)..."
                 className="flex-1 lg:w-64 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent outline-none transition-all font-mono"
               />
               <button 
                 type="submit" 
                 disabled={loading || !locationInput.trim()}
                 className="px-8 py-4 bg-accent hover:bg-accent/80 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
               >
                  Intercept
               </button>
               <button 
                 type="button"
                 onClick={detectLocation}
                 disabled={detecting || loading}
                 className="p-4 glass border-white/10 hover:border-accent text-white rounded-2xl transition-all disabled:opacity-50"
                 title="Detect Operative Coordinates"
               >
                 🛰️
               </button>
             </form>
             <div className="flex flex-wrap gap-2">
                {history.map(loc => (
                  <button 
                    key={loc} 
                    onClick={() => fetchAtmos(loc)}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-mono text-slate-500 hover:text-accent hover:border-accent transition-all uppercase tracking-widest"
                  >
                    {loc}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-10 animate-pulse">
           <div className="w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
           <p className="font-mono text-xs text-accent uppercase tracking-widest">Parsing_Atmos_Data...</p>
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
             <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/60 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-10">
                   <div className="text-9xl select-none animate-in zoom-in duration-1000 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {getWeatherIcon(report.condition)}
                   </div>
                   <div className="space-y-2">
                      <span className="text-[10px] font-mono text-accent font-black uppercase tracking-widest">{report.location}</span>
                      <h3 className="text-7xl font-heading font-black text-white">{report.temperature}°C</h3>
                      <p className="text-xl font-heading font-black text-white uppercase opacity-60 tracking-widest">{report.condition}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-10 w-full md:w-auto">
                   {[
                     { label: 'Humidity', val: `${report.humidity}%`, icon: '💧' },
                     { label: 'Pressure', val: `${report.pressure} hPa`, icon: '🧭' },
                     { label: 'Wind_Spd', val: `${report.windSpeed} km/h`, icon: '💨' },
                     { label: 'Visibility', val: `${report.visibility} km`, icon: '👁️' },
                   ].map((stat, i) => (
                     <div key={i} className="flex flex-col border-l border-white/10 pl-6 group">
                        <span className="text-[8px] font-mono text-slate-500 uppercase mb-1">{stat.label}</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-[8px] opacity-40 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                           <span className="text-lg font-heading font-black text-white group-hover:text-accent transition-colors">{stat.val}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="glass p-12 rounded-[4rem] border border-accent/20 bg-accent/5 relative overflow-hidden">
                <div className="absolute top-4 right-8 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></div>
                   <span className="text-[8px] font-mono text-accent font-black uppercase">Field_Impact_Analysis</span>
                </div>
                <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-6">Tactical_Briefing</h4>
                <div className="p-8 bg-black/40 rounded-3xl border border-white/5 shadow-2xl">
                   <p className="text-sm font-mono text-slate-300 leading-relaxed italic uppercase">
                      "{report.impactAssessment}"
                   </p>
                </div>
                
                {selectedDay && (
                  <div className="mt-8 p-8 glass bg-accent/10 border border-accent/30 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-4">
                       <h5 className="text-lg font-heading font-black text-white uppercase tracking-widest">In-Depth_Forecast: {selectedDay.day}</h5>
                       <button onClick={() => setSelectedDay(null)} className="text-accent hover:text-white transition-colors">✕</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Avg_Temp</span>
                          <div className="text-xl font-heading font-black text-white">{selectedDay.temp}°C</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Wind_Vector</span>
                          <div className="text-xl font-heading font-black text-white">{selectedDay.wind || '8km/h'}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Precipitation</span>
                          <div className="text-xl font-heading font-black text-white">{selectedDay.precip || '2%'}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Acoustic_State</span>
                          <div className="text-xl font-heading font-black text-emerald-400">STABLE</div>
                       </div>
                    </div>
                    <p className="mt-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest border-t border-white/5 pt-4">
                       Summary: {selectedDay.description || "Consistent terrestrial stabilization expected."}
                    </p>
                  </div>
                )}
             </div>

             {report.sources && report.sources.length > 0 && (
               <div className="glass p-10 rounded-[3rem] border border-white/5 bg-slate-900/20">
                  <h4 className="text-[9px] font-heading font-black text-slate-500 uppercase tracking-widest mb-6">Intelligence_Origin_Nodes</h4>
                  <div className="flex flex-wrap gap-4">
                     {report.sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-mono text-accent hover:text-white hover:border-accent/40 transition-all flex items-center gap-2">
                           {(s.title || 'Atmos Node')} ↗
                        </a>
                     ))}
                  </div>
               </div>
             )}
          </div>

          <div className="lg:col-span-4 glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col bg-slate-900/40 shadow-2xl">
             <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex justify-between items-center">
                <span>Predictive_Horizon</span>
                <span className="text-[8px] font-mono opacity-40">3D_TRAJECTORY</span>
             </h4>
             <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                {(report.forecast || []).map((day, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setSelectedDay(day); playUISound('click'); }}
                    className={`w-full p-6 bg-black/40 border rounded-3xl transition-all flex items-center justify-between group animate-in slide-in-from-right-4 ${
                      selectedDay?.day === day.day ? 'border-accent bg-accent/10' : 'border-white/5 hover:border-accent/40'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                     <div className="flex items-center gap-5">
                        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-110">{getWeatherIcon(day.condition)}</div>
                        <div className="text-left">
                           <h5 className="text-[10px] font-heading font-black text-white uppercase">{day.day}</h5>
                           <span className="text-[8px] font-mono text-slate-500 uppercase">{day.condition}</span>
                        </div>
                     </div>
                     <div className="text-xl font-heading font-black text-accent">{day.temp}°C</div>
                  </button>
                ))}
                {(!report.forecast || report.forecast.length === 0) && (
                  <div className="py-20 text-center opacity-20 italic text-[10px] font-mono">Uplinking_Trajectory_Data...</div>
                )}
             </div>
             <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase">
                   <span>Stability Model</span>
                   <span className="text-accent">98.2%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-accent animate-pulse" style={{ width: '98%' }}></div>
                </div>
                <span className="text-[8px] font-mono text-slate-600 uppercase block text-center">Neural Predictive Modeling: ACTIVE</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-40 opacity-20 space-y-8 animate-pulse">
           <span className="text-9xl grayscale">🌤️</span>
           <div className="space-y-4">
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-widest">Atmos_Buffer_Empty</h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.5em] max-w-sm mx-auto">Initiate location intercept to gather real-time meteorological intelligence.</p>
           </div>
        </div>
      )}

      {error && (
        <div className="glass p-10 rounded-3xl border-red-500/30 bg-red-500/5 text-center space-y-4 animate-in shake duration-500">
           <span className="text-3xl">⚠️</span>
           <p className="text-xs font-mono text-red-400 uppercase font-black">{error}</p>
           <button onClick={detectLocation} className="text-[9px] text-white underline uppercase tracking-widest font-black">Retry Neural Uplink</button>
        </div>
      )}
    </div>
  );
};

export default AtmosMonitor;
