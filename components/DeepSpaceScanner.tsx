import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { DeepSpaceObject } from '../types';
import { playUISound } from '../utils/audioUtils';

interface DeepSpaceScannerProps {
  intelService: IntelligenceService;
}

const ObjectSkeleton = () => (
  <div className="grid grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="w-1/2 h-2 bg-white/10 rounded-full shimmer"></div>
          <div className="w-12 h-3 bg-white/10 rounded shimmer"></div>
        </div>
        <div className="w-3/4 h-6 bg-white/10 rounded-xl shimmer"></div>
      </div>
    ))}
  </div>
);

const DeepSpaceScanner: React.FC<DeepSpaceScannerProps> = ({ intelService }) => {
  const [objects, setObjects] = useState<DeepSpaceObject[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<DeepSpaceObject | null>(null);

  const performScan = async () => {
    setScanning(true);
    playUISound('startup');
    try {
      const data = await intelService.scanDeepSpace();
      setObjects(data);
      playUISound('success');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => { performScan(); }, []);

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden bg-slate-900/10">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Space Scanner</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mt-2">Find objects in outer space</p>
          </div>
          <button 
            onClick={performScan} 
            disabled={scanning}
            className="px-10 py-4 bg-accent text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl shadow-accent disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 relative overflow-hidden bg-black/40 border border-white/5">
          <div className="relative z-10">
            {scanning ? (
              <ObjectSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {objects.map(obj => (
                  <div 
                    key={obj.id} 
                    onClick={() => { setSelected(obj); playUISound('click'); }}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                      selected?.id === obj.id ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Distance: {obj.distanceMiles}M MILES</span>
                      <span className="px-2 py-0.5 bg-accent/20 rounded text-[7px] text-accent font-black uppercase">{obj.type}</span>
                    </div>
                    <h4 className="text-lg font-heading font-black text-white uppercase tracking-tighter">{obj.name}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 flex flex-col space-y-8 bg-slate-900/20 border border-white/5">
          <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">Object Details</h3>
          {selected ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5 font-mono">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[9px] text-slate-500">SPEED</span>
                  <span className="text-xs text-emerald-400">{selected.velocity.toLocaleString()} MPH</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-relaxed italic">
                Data shows an object far from Earth. We are tracking it.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <p className="text-[10px] font-mono uppercase tracking-widest">Select an object</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepSpaceScanner;