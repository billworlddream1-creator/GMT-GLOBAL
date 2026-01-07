
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { NetworkMass } from '../types';
import { playUISound } from '../utils/audioUtils';

interface NetworkMassDetectorProps {
  intelService: IntelligenceService;
}

const ANOMALY_TYPES = [
  { id: 'BOTNET_CLUSTER', label: 'Botnet Cluster', icon: '🤖', risk: 'CRITICAL', color: 'bg-red-500' },
  { id: 'DATA_STORM', label: 'Data Storm', icon: '⚡', risk: 'HIGH', color: 'bg-blue-500' },
  { id: 'PEERING_SPIKE', label: 'Peering Spike', icon: '🌊', risk: 'MEDIUM', color: 'bg-emerald-500' },
  { id: 'ANOMALY', label: 'Unidentified Anomaly', icon: '❓', risk: 'LOW', color: 'bg-purple-500' }
];

const NetworkMassDetector: React.FC<NetworkMassDetectorProps> = ({ intelService }) => {
  const [masses, setMasses] = useState<NetworkMass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMass, setSelectedMass] = useState<NetworkMass | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationType, setSimulationType] = useState<string | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    playUISound('startup');
    try {
      const data = await intelService.getNetworkMassSignals();
      setMasses(data);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [intelService]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleSimulateInjection = (typeId: string) => {
    setIsSimulating(true);
    setSimulationType(typeId);
    setShowSimPanel(false);
    playUISound('startup');

    setTimeout(() => {
      const typeData = ANOMALY_TYPES.find(t => t.id === typeId);
      const newAnomaly: NetworkMass = {
        id: `SIM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        label: `SIMULATED_${typeId}`,
        magnitude: 70 + Math.random() * 30,
        velocity: 400 + Math.random() * 600,
        type: typeId as any,
        risk: typeData?.risk as any || 'MEDIUM',
        origin: 'LOCAL_INJECTION',
        coordinates: {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80
        }
      };

      setMasses(prev => [newAnomaly, ...prev]);
      setSelectedMass(newAnomaly);
      setIsSimulating(false);
      setSimulationType(null);
      playUISound('success');
    }, 2000);
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("VOICE_UPLINK_UNAVAILABLE: Browser does not support SpeechRecognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      playUISound('startup');
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('VOICE_CMD_INTERCEPT:', command);
      
      if (command.includes('scan') || command.includes('refresh')) {
        fetchSignals();
      } else if (command.includes('simulate botnet')) {
        handleSimulateInjection('BOTNET_CLUSTER');
      } else if (command.includes('simulate storm')) {
        handleSimulateInjection('DATA_STORM');
      } else if (command.includes('simulate spike')) {
        handleSimulateInjection('PEERING_SPIKE');
      } else if (command.includes('clear')) {
        setSelectedMass(null);
        playUISound('alert');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      playUISound('alert');
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'CRITICAL': return 'bg-red-500 shadow-[0_0_25px_#ef4444]';
      case 'HIGH': return 'bg-amber-500 shadow-[0_0_20px_#f59e0b]';
      case 'MEDIUM': return 'bg-blue-500 shadow-[0_0_15px_#3b82f6]';
      default: return 'bg-emerald-500 shadow-[0_0_10px_#10b981]';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Header Panel */}
      <div className="glass p-10 rounded-[3.5rem] border border-blue-500/20 bg-blue-950/10 flex justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none">
           <span className="text-8xl font-heading font-black text-blue-400 uppercase tracking-widest">MASS</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Network_Mass_Detector</h2>
          <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] mt-2">Anomaly Clustering & High-Density Traffic Tracking</p>
        </div>
        <div className="flex gap-4 relative z-20">
          <button 
            onClick={startVoiceCommand}
            className={`flex items-center gap-3 px-6 py-4 glass border-accent/30 rounded-2xl transition-all ${isListening ? 'bg-accent/20 border-accent shadow-[0_0_15px_var(--accent-glow)]' : 'hover:bg-white/5'}`}
          >
            <span className={isListening ? 'animate-pulse' : ''}>{isListening ? '🛑' : '🎙️'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{isListening ? 'LISTENING...' : 'VOICE_CMD'}</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowSimPanel(!showSimPanel)}
              className="px-8 py-4 glass border-blue-500/30 text-blue-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              SIMULATE_INJECTION
            </button>
            {showSimPanel && (
              <div className="absolute top-full right-0 mt-4 w-64 glass p-4 rounded-3xl border border-white/10 z-[100] space-y-2 shadow-2xl animate-in zoom-in-95 duration-200">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3">Target Anomaly Type</h4>
                {ANOMALY_TYPES.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => handleSimulateInjection(type.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group flex items-center gap-3"
                  >
                    <span className="text-lg grayscale group-hover:grayscale-0">{type.icon}</span>
                    <span className="text-[10px] font-heading font-black text-white uppercase tracking-tighter">{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={fetchSignals} 
            disabled={loading || isSimulating}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'ACQUIRING...' : 'INIT_SCAN'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 overflow-hidden">
        {/* Spatial Visualizer (Bubble Map) */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black/80 relative overflow-hidden flex items-center justify-center min-h-[500px] shadow-inner">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative w-full h-full">
              {!loading && masses.map((mass) => (
                <div 
                  key={mass.id}
                  onClick={() => { setSelectedMass(mass); playUISound('click'); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all duration-700 hover:scale-110 group ${selectedMass?.id === mass.id ? 'z-50' : 'z-10'}`}
                  style={{ 
                    left: `${50 + mass.coordinates.x}%`, 
                    top: `${50 + mass.coordinates.y}%`,
                    width: `${mass.magnitude * 2.2}px`,
                    height: `${mass.magnitude * 2.2}px`,
                  }}
                >
                  <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${getRiskColor(mass.risk)}`}></div>
                  <div 
                    className={`absolute inset-[15%] rounded-full opacity-30 animate-ping ${getRiskColor(mass.risk)}`}
                    style={{ animationDuration: `${Math.max(0.5, 3 - (mass.velocity / 300))}s` }}
                  ></div>
                  <div className={`absolute inset-[30%] rounded-full shadow-inner border border-white/20 flex flex-col items-center justify-center ${getRiskColor(mass.risk)}`}>
                     <span className="text-[8px] font-black text-white">{Math.round(mass.magnitude)}%</span>
                     <div className={`w-1 h-1 bg-white rounded-full mt-0.5 ${selectedMass?.id === mass.id ? 'animate-pulse scale-125 shadow-[0_0_5px_white]' : ''}`}></div>
                  </div>

                  {/* Heatmap Integrated Labels */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                     <span className="text-[7px] font-mono text-white/60 font-black uppercase tracking-tighter whitespace-nowrap">V: {Math.round(mass.velocity)} GB/S</span>
                  </div>

                  {/* Enhanced Tooltip Label */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-12 px-4 py-1.5 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl text-[7px] font-mono text-white opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-1 whitespace-nowrap shadow-2xl">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-black text-accent">{mass.label}</span>
                      <span className="opacity-50">ID: {mass.id} // RISK: {mass.risk}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isSimulating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/20 backdrop-blur-[2px] z-[60] animate-in fade-in duration-300">
                   <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin mb-6"></div>
                   <div className="text-center space-y-2">
                     <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.4em] animate-pulse">Injecting Anomaly: {simulationType}</h3>
                     <p className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">Routing through unauthorized nodes...</p>
                   </div>
                </div>
              )}

              {(loading && !isSimulating) && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-500/20 animate-spin-slow flex items-center justify-center">
                      <span className="text-[10px] font-mono text-blue-500/60 font-black">SCANNING</span>
                   </div>
                </div>
              )}
           </div>

           <div className="absolute bottom-10 left-10 text-[8px] font-mono text-blue-600/60 uppercase tracking-widest bg-black/40 p-4 rounded-xl border border-blue-500/10">
             Monitoring Node Magnitude // Freq: 0.1Hz // Status: {isSimulating ? 'INJECTING' : 'LISTENING'}
           </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-4 glass rounded-[3.5rem] border border-white/5 p-10 flex flex-col bg-slate-950/40 shadow-2xl relative overflow-hidden">
           {selectedMass && (
             <div className="absolute -top-10 -right-10 opacity-[0.03] select-none pointer-events-none overflow-hidden">
                <span className="text-[12rem] font-heading font-black text-white transform -rotate-12 block">{selectedMass.id.split('-').pop()}</span>
             </div>
           )}

           <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/10 pb-4 flex justify-between relative z-10">
             <span>Mass_Dossier</span>
             <span className="opacity-40">{masses.length} SIGNALS</span>
           </h3>
           
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 relative z-10">
              {selectedMass ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                   <div>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Target_Designation: {selectedMass.id}</span>
                      <h4 className="text-3xl font-heading font-black text-white uppercase mt-1 leading-tight tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{selectedMass.label}</h4>
                   </div>

                   <div className={`p-4 rounded-2xl border text-center text-[10px] font-black uppercase tracking-[0.3em] ${
                     selectedMass.risk === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                     selectedMass.risk === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                   }`}>
                     THREAT_LEVEL: {selectedMass.risk}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Mass_Density</span>
                         <span className="text-xl font-heading font-black text-white">{Math.round(selectedMass.magnitude)}%</span>
                      </div>
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Packet_Velocity</span>
                         <span className="text-xl font-heading font-black text-blue-400">{Math.round(selectedMass.velocity)} <span className="text-[8px]">GB/s</span></span>
                      </div>
                   </div>

                   <div className="p-6 rounded-3xl border border-white/5 bg-white/5 space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                         <span className="text-slate-500 uppercase">Traffic_Class</span>
                         <span className="text-white font-black">{selectedMass.type.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono">
                         <span className="text-slate-500 uppercase">Origin_Node</span>
                         <span className="text-white uppercase truncate ml-4">{selectedMass.origin}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-4">
                         <span className="text-slate-500 uppercase">Integrity</span>
                         <span className="text-emerald-500 font-black">STABLE</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => setSelectedMass(null)}
                     className="w-full py-4 glass border-white/10 text-slate-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                   >
                     Clear_Matrix_Focus
                   </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20">
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-4xl">🌫️</div>
                   <div className="space-y-2">
                     <h4 className="text-lg font-heading font-black text-white uppercase tracking-widest leading-none">Awaiting_Fix</h4>
                     <p className="text-[10px] font-mono uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">Select a mass node from the visualizer or inject a simulation to analyze traffic characteristics.</p>
                   </div>
                   <div className="mt-4 p-4 border border-blue-500/20 rounded-2xl">
                      <p className="text-[8px] font-mono text-blue-400 uppercase">Voice Shortcuts: "Initiate Scan", "Simulate Botnet", "Clear Focus"</p>
                   </div>
                </div>
              )}
           </div>
           
           <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest animate-pulse">GMT_MASS_DETECTOR_V4.1 // VOICE_CAPABLE</span>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {ANOMALY_TYPES.map(item => (
           <div key={item.id} className="glass p-6 rounded-[2.5rem] border border-white/5 bg-white/5 flex items-start gap-4 hover:border-white/20 transition-all">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${item.color}`}></div>
              <div>
                 <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">{item.id}</h4>
                 <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase leading-tight">
                   {item.id === 'BOTNET_CLUSTER' && 'Aggregated malicious node synchronization.'}
                   {item.id === 'DATA_STORM' && 'Massive burst of packet movement.'}
                   {item.id === 'PEERING_SPIKE' && 'Legitimate high-capacity interchange.'}
                   {item.id === 'ANOMALY' && 'Unidentified network mass patterns.'}
                 </p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default NetworkMassDetector;
