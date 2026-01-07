
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Node {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  avatar: string;
}

const NODES: Node[] = [
  { id: 'GMT-AL-01', name: 'Alpha Lead', location: 'Zurich', status: 'ONLINE', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
  { id: 'GMT-OP-77', name: 'Operator 77', location: 'Tokyo', status: 'ONLINE', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
  { id: 'GMT-SH-ND', name: 'Shadow Node', location: 'Classified', status: 'BUSY', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
  { id: 'GMT-EX-09', name: 'Exfil 09', location: 'London', status: 'OFFLINE', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
];

const DirectBroadcast: React.FC = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [bitrate, setBitrate] = useState(2500);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isBroadcasting) {
      interval = window.setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isBroadcasting]);

  const toggleNode = (id: string) => {
    setSelectedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
    playUISound('click');
  };

  const startBroadcast = async () => {
    if (selectedNodes.length === 0) {
      alert("SIGNAL_ERROR: Specify at least one target node for intercept.");
      return;
    }
    
    playUISound('startup');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ 
        video: mode === 'VIDEO', 
        audio: true 
      });
      setStream(media);
      if (videoRef.current) videoRef.current.srcObject = media;
      setIsBroadcasting(true);
      playUISound('success');
    } catch (err) {
      alert("HARDWARE_FAILURE: Sensors unresponsive.");
    }
  };

  const stopBroadcast = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsBroadcasting(false);
    playUISound('alert');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="glass p-10 rounded-[3.5rem] border border-red-500/20 bg-red-950/10 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 select-none">
           <span className="text-[12rem] font-heading font-black text-red-500">LIVE</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Command_Broadcast_Relay</h2>
          <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em] mt-2">End-to-End Encrypted Neural Stream Protocol</p>
        </div>
        {isBroadcasting && (
          <div className="flex items-center gap-6 glass px-6 py-3 rounded-2xl border-red-500/40 bg-red-500/10 animate-pulse">
             <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
             <span className="text-xl font-heading font-black text-white tabular-nums">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stream Viewport */}
        <div className="lg:col-span-8 glass rounded-[3.5rem] border border-white/5 bg-black overflow-hidden relative shadow-2xl flex items-center justify-center min-h-[500px]">
           {isBroadcasting ? (
             <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-75 transition-all duration-[2000ms]" />
                {/* CRT Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.4)_100%)] opacity-40"></div>
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 4px 100%' }}></div>
                
                {/* HUD Overlays */}
                <div className="absolute top-10 left-10 space-y-4">
                   <div className="glass px-4 py-2 rounded-xl border-red-500/40 bg-red-500/20 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      On_Air_Relay
                   </div>
                   <div className="glass px-4 py-2 rounded-xl border-white/10 bg-black/40 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                      Protocol: RSA-4096 // Bitrate: {bitrate}kbps
                   </div>
                </div>

                <div className="absolute bottom-10 right-10 flex gap-4">
                   <button onClick={stopBroadcast} className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95">Terminate_Stream</button>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center gap-8 opacity-20 text-center">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center text-6xl">🎥</div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-heading font-black text-white uppercase tracking-[0.3em]">Ready_to_Broadast</h3>
                  <p className="text-[10px] font-mono uppercase tracking-[0.5em] max-w-sm">Select target nodes and initiate tactical uplink.</p>
                </div>
             </div>
           )}
        </div>

        {/* Node & Control Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="glass p-8 rounded-[3.5rem] border border-white/10 bg-slate-900/40 flex-1 flex flex-col shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
                <span>Target_Nodes</span>
                <span className="text-[8px] font-mono opacity-40">{selectedNodes.length} SELECTED</span>
              </h3>

              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                 {NODES.map(node => (
                   <button 
                     key={node.id} 
                     disabled={isBroadcasting || node.status === 'OFFLINE'}
                     onClick={() => toggleNode(node.id)}
                     className={`w-full p-4 rounded-[2rem] border transition-all flex items-center gap-4 group ${
                       selectedNodes.includes(node.id) ? 'bg-red-500/10 border-red-500/40' : 'bg-white/5 border-transparent hover:bg-white/10'
                     } ${node.status === 'OFFLINE' ? 'opacity-30 cursor-not-allowed' : ''}`}
                   >
                      <div className="relative shrink-0">
                         <img src={node.avatar} className="w-10 h-10 rounded-xl object-cover grayscale" />
                         <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                           node.status === 'ONLINE' ? 'bg-emerald-500' : node.status === 'BUSY' ? 'bg-amber-500' : 'bg-red-500'
                         }`}></div>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                         <h4 className="text-[10px] font-heading font-black text-white uppercase truncate">{node.name}</h4>
                         <p className="text-[8px] font-mono text-slate-500 uppercase">{node.location} // {node.id}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedNodes.includes(node.id) ? 'bg-red-500 border-red-500' : 'border-white/10'}`}>
                         {selectedNodes.includes(node.id) && <span className="text-[8px] text-white">✓</span>}
                      </div>
                   </button>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setMode('VIDEO'); playUISound('click'); }} 
                      disabled={isBroadcasting}
                      className={`py-3 rounded-xl font-heading font-black text-[9px] uppercase border transition-all ${mode === 'VIDEO' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-transparent text-slate-500'}`}
                    >VIDEO_LINK</button>
                    <button 
                      onClick={() => { setMode('AUDIO'); playUISound('click'); }}
                      disabled={isBroadcasting}
                      className={`py-3 rounded-xl font-heading font-black text-[9px] uppercase border transition-all ${mode === 'AUDIO' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-transparent text-slate-500'}`}
                    >AUDIO_ONLY</button>
                 </div>

                 {!isBroadcasting ? (
                   <button 
                     onClick={startBroadcast}
                     className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-[0.4em] rounded-3xl shadow-xl transition-all active:scale-95"
                   >
                     Initiate_Intercept
                   </button>
                 ) : (
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase">
                         <span>Bandwidth_Health</span>
                         <span className="text-emerald-500">OPTIMAL</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '88%' }}></div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DirectBroadcast;
