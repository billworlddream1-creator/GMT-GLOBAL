
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { LocalSensor } from '../types';
import { playUISound } from '../utils/audioUtils';

interface LocalSensorArrayProps {
  intelService: IntelligenceService;
}

const LocalSensorArray: React.FC<LocalSensorArrayProps> = ({ intelService }) => {
  const [sensors, setSensors] = useState<LocalSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<LocalSensor | null>(null);
  const [scanAngle, setScanAngle] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'PHONE' | 'CAMERA' | 'DRONE' | 'LISTENING_DEVICE'>('ALL');
  const [alert, setAlert] = useState<string | null>(null);
  const requestRef = useRef<number>(null);

  const performScan = async () => {
    setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.scanLocalEnvironment();
      setSensors(data);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateIntrusion = () => {
    const types: LocalSensor['type'][] = ['DRONE', 'CAMERA', 'LISTENING_DEVICE'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newSensor: LocalSensor = {
      id: `SIM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: `Unknown ${type === 'LISTENING_DEVICE' ? 'Bug' : type}`,
      type: type,
      distanceMeters: Math.floor(Math.random() * 190) + 10, // Updated for 200m range
      azimuth: Math.floor(Math.random() * 360),
      signalStrength: -30 - Math.floor(Math.random() * 40),
      status: 'RECORDING',
      manufacturer: 'UNKNOWN_SOURCE'
    };
    
    setSensors(prev => [...prev, newSensor]);
    setSelectedSensor(newSensor);
    playUISound('alert');
  };

  const animate = (time: number) => {
    setScanAngle((time / 15) % 360);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    performScan();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const threats = sensors.filter(s => s.status === 'RECORDING');
    if (threats.length > 0) {
      setAlert(`${threats.length} UNAUTHORIZED SENSOR(S) ACTIVE`);
    } else {
      setAlert(null);
    }
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    if (filter === 'ALL') return sensors;
    return sensors.filter(s => s.type === filter);
  }, [sensors, filter]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'PHONE': return '📱';
      case 'CAMERA': return '📷';
      case 'DRONE': return '🛸';
      case 'LISTENING_DEVICE': return '🎙️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'RECORDING' || status === 'ACTIVE') return 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_#ef4444]';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700 pb-32 relative">
      {/* Alert Overlay */}
      {alert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-8 py-3 bg-red-600 text-white font-heading font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-[0_0_30px_#ef4444] border border-white/20">
            ⚠️ {alert}
          </div>
        </div>
      )}

      <div className="glass p-8 rounded-[3.5rem] border border-emerald-500/20 bg-emerald-950/10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none">
           <span className="text-8xl font-heading font-black text-emerald-400 uppercase tracking-widest">SCAN</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Close_Range_Scanner</h2>
          <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.4em] mt-2">200M Radius Device Detection Array</p>
        </div>
        
        <div className="flex flex-wrap gap-2 relative z-20">
           {(['ALL', 'PHONE', 'CAMERA', 'DRONE', 'LISTENING_DEVICE'] as const).map(f => (
             <button
               key={f}
               onClick={() => { setFilter(f); playUISound('click'); }}
               className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                 filter === f ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white'
               }`}
             >
               {f.replace('_', ' ')}
             </button>
           ))}
        </div>

        <div className="flex gap-4 relative z-20">
          <button 
            onClick={simulateIntrusion}
            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            Simulate_Threat
          </button>
          <button 
            onClick={performScan} 
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'SWEEPING...' : 'INITIATE_SWEEP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        {/* Radar Visualizer */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black/80 relative overflow-hidden flex items-center justify-center min-h-[500px] shadow-2xl">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <div className="relative w-[500px] h-[500px] border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.05)]">
              {/* Concentric Rings - Scaled for 200m */}
              {[40, 80, 120, 160, 200].map((r, i) => (
                <div key={i} className="absolute border border-emerald-500/10 rounded-full flex items-center justify-center" style={{ width: `${(i + 1) * 20}%`, height: `${(i + 1) * 20}%` }}>
                   <span className="absolute top-2 text-[6px] font-mono text-emerald-500/40">{r}M</span>
                </div>
              ))}
              
              <div className="absolute w-full h-px bg-emerald-500/10"></div>
              <div className="absolute h-full w-px bg-emerald-500/10"></div>

              {/* Sweep Line */}
              <div 
                className="absolute top-1/2 left-1/2 w-[250px] h-[250px] origin-top-left z-10 pointer-events-none"
                style={{ 
                  transform: `rotate(${scanAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.4) 0deg, rgba(16, 185, 129, 0.1) 20deg, transparent 60deg)'
                }}
              >
                 <div className="w-full h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
              </div>

              {/* Devices */}
              {!loading && filteredSensors.map(sensor => {
                 // Convert Polar to Cartesian for display
                 // Distance max 200m maps to 250px radius (50% of container)
                 const r = (sensor.distanceMeters / 200) * 250;
                 const theta = (sensor.azimuth - 90) * (Math.PI / 180);
                 const x = Math.cos(theta) * r;
                 const y = Math.sin(theta) * r;

                 const isThreat = sensor.status === 'RECORDING' || sensor.type === 'LISTENING_DEVICE';

                 return (
                   <div 
                     key={sensor.id}
                     onClick={() => { setSelectedSensor(sensor); playUISound('click'); }}
                     className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all z-20 hover:scale-125 ${selectedSensor?.id === sensor.id ? 'z-50 scale-125' : ''}`}
                     style={{ 
                       left: `calc(50% + ${x}px)`, 
                       top: `calc(50% + ${y}px)`
                     }}
                   >
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${isThreat ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                      <div className={`relative z-10 w-full h-full rounded-full border border-white/20 flex items-center justify-center text-[10px] bg-black/60 backdrop-blur-sm shadow-lg ${selectedSensor?.id === sensor.id ? 'border-white' : isThreat ? 'border-red-500' : ''}`}>
                         {getIcon(sensor.type)}
                      </div>
                      {selectedSensor?.id === sensor.id && (
                        <div className="absolute top-full mt-2 px-3 py-1.5 bg-black/90 rounded-xl border border-white/20 text-[7px] font-mono text-white whitespace-nowrap z-50 flex flex-col items-center">
                           <span className="font-black text-emerald-400">{sensor.distanceMeters}M</span>
                           <span className="text-[6px] text-slate-400">{sensor.name}</span>
                        </div>
                      )}
                   </div>
                 );
              })}
              
              {/* User Center */}
              <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] z-30 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
           </div>

           <div className="absolute bottom-10 left-10 text-[8px] font-mono text-emerald-600/60 uppercase tracking-widest bg-black/60 p-4 rounded-xl border border-emerald-500/10 backdrop-blur-sm">
             Lidar Array Active // Range: 200M // Mode: PROXIMITY_ALERT
           </div>
        </div>

        {/* Device List / Details */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full min-w-0">
           <div className="glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-950/40 shadow-2xl relative overflow-hidden flex-1 h-full min-h-0">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
                 <span>Detected_Signatures</span>
                 <span className="text-[8px] font-mono text-slate-500">{filteredSensors.length} DEVICES</span>
              </h3>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                 {filteredSensors.map(sensor => (
                   <button 
                     key={sensor.id}
                     onClick={() => { setSelectedSensor(sensor); playUISound('click'); }}
                     className={`w-full p-4 rounded-2xl border transition-all text-left group flex items-center gap-4 ${
                       selectedSensor?.id === sensor.id 
                         ? 'bg-white/10 border-emerald-500/40 shadow-lg' 
                         : 'bg-white/5 border-transparent hover:bg-white/10'
                     }`}
                   >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-white/5 ${sensor.status === 'RECORDING' ? 'bg-red-500/20' : 'bg-black/40'}`}>
                         {getIcon(sensor.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-[10px] font-heading font-black text-white uppercase truncate">{sensor.name}</h4>
                         <span className="text-[8px] font-mono text-slate-500 uppercase">{sensor.distanceMeters}M // {sensor.status}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${sensor.status === 'RECORDING' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                   </button>
                 ))}
                 {filteredSensors.length === 0 && (
                   <div className="py-20 text-center opacity-20">
                      <span className="text-4xl block mb-4">📡</span>
                      <p className="text-[9px] font-mono uppercase tracking-widest">No local signals detected.</p>
                   </div>
                 )}
              </div>

              {selectedSensor && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-bottom-2">
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">INTERROGATING_TARGET</span>
                      <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border ${getStatusColor(selectedSensor.status)}`}>
                         {selectedSensor.status}
                      </span>
                   </div>
                   
                   <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="text-[7px] font-mono text-slate-500 block uppercase">Signal_Strength</span>
                            <span className="text-sm font-heading font-black text-white">{selectedSensor.signalStrength} dBm</span>
                         </div>
                         <div>
                            <span className="text-[7px] font-mono text-slate-500 block uppercase">Azimuth</span>
                            <span className="text-sm font-heading font-black text-white">{selectedSensor.azimuth}°</span>
                         </div>
                      </div>
                      
                      <div className="pt-2 border-t border-white/5">
                         <span className="text-[7px] font-mono text-emerald-400 block uppercase mb-1">Manufacturer_ID</span>
                         <span className="text-xs font-mono text-white uppercase">{selectedSensor.manufacturer || 'UNKNOWN_VENDOR'}</span>
                      </div>

                      {selectedSensor.status === 'RECORDING' && (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                           <span className="text-xl animate-pulse">🔴</span>
                           <span className="text-[8px] font-mono text-red-400 uppercase font-black">Active Transmission Detected</span>
                        </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LocalSensorArray;
