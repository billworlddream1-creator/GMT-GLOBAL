
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Text, Float, Line, Sphere, Trail, Html } from '@react-three/drei';
import { TradeIntelligence, TradeNode, TradeConnection } from '../types';
import { IntelligenceService } from '../services/geminiService';
import { playUISound } from '../utils/audioUtils';
import { isWebGLAvailable } from '../utils/webglUtils';

interface TradeBrainProps {
  intelService: IntelligenceService;
}

const NeuralCore = () => {
  const meshRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.z = t * 0.1;
  });
  return (
    <group ref={meshRef}>
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} wireframe />
      </Sphere>
      <Sphere args={[0.5, 16, 16]}>
        <meshBasicMaterial color="#3b82f6" />
      </Sphere>
      {[...Array(3)].map((_, i) => (
        <mesh key={i} rotation={[Math.PI / (i + 1), 0, 0]}>
          <torusGeometry args={[2 + i * 0.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Node: React.FC<{ node: TradeNode; onSelect: (n: TradeNode) => void; isSelected: boolean }> = ({ node, onSelect, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 5 + node.sentiment) > 0.9 ? 1.5 : 1;
    meshRef.current.scale.setScalar((1 + Math.sin(t * 2 + node.sentiment) * 0.1) * pulse);
  });
  const color = node.status === 'CRITICAL' ? '#ef4444' : node.status === 'VOLATILE' ? '#f59e0b' : '#10b981';
  return (
    <group position={node.position}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }} 
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={() => onSelect(node)}
      >
        <sphereGeometry args={[isSelected ? 0.5 : 0.3, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.8} />
      </mesh>
      <Html distanceFactor={15} position={[0, 0.8, 0]}>
        <div className={`pointer-events-none transition-all duration-500 flex flex-col items-center ${hovered || isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="glass px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">
            <span className="text-[8px] font-heading font-black text-white uppercase tracking-tighter">{node.name}</span>
          </div>
          <div className="w-px h-4 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
      </Html>
      {(hovered || isSelected) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const Synapse: React.FC<{ connection: TradeConnection; start: [number, number, number]; end: [number, number, number] }> = ({ connection, start, end }) => {
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(4);
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    return curve.getPoints(50);
  }, [start, end]);
  const color = connection.health < 0.4 ? '#ef4444' : connection.health < 0.7 ? '#f59e0b' : '#3b82f6';
  return (
    <group>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.1} />
      <DataImpulse points={points} color={color} speed={0.8 + Math.random() * 0.5} />
    </group>
  );
};

const DataImpulse = ({ points, color, speed }: { points: THREE.Vector3[]; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    const i = Math.floor((t % 1) * (points.length - 1));
    ref.current.position.copy(points[i]);
  });
  return (
    <Trail width={0.2} length={6} color={color} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </Trail>
  );
};

const TradeBrain: React.FC<TradeBrainProps> = ({ intelService }) => {
  const [data, setData] = useState<TradeIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TradeNode | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    const fetchTradeIntel = async () => {
      setLoading(true);
      playUISound('startup');
      const intel = await intelService.getTradeIntelligence();
      setData(intel);
      setLoading(false);
      playUISound('success');
    };
    fetchTradeIntel();
    const interval = setInterval(fetchTradeIntel, 300000);
    const timeInterval = setInterval(() => setProcessingTime(p => (p + 1) % 1000), 10);
    return () => { clearInterval(interval); clearInterval(timeInterval); };
  }, [intelService]);

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-in fade-in duration-700">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-accent/5 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-accent rounded-full animate-spin"></div>
        <div className="absolute inset-16 border border-accent/20 rounded-full flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-accent font-black">NEURAL</span>
          <span className="text-[8px] font-mono text-accent/60">UPLINK</span>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-3xl font-heading font-black text-white uppercase tracking-[0.3em]">Processing Trade Sentiment</h2>
        <p className="text-[10px] font-mono text-accent/50 uppercase tracking-[0.5em] mt-4">Calibrating Synaptic Weights...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative overflow-hidden">
      <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Neural_Trade_Matrix</h2>
        </div>
        <div className="flex gap-4">
          <span className="text-[8px] font-mono text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-md border border-accent/20">Active_Nodes: {data?.nodes.length || 0}</span>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Processing_Cycle: {processingTime}ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        <div className="lg:col-span-8 glass rounded-[3rem] border border-white/5 bg-black/60 overflow-hidden relative shadow-inner">
          {hasWebGL === false ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-900/40">
              <div className="text-4xl mb-6">🛰️</div>
              <h3 className="text-xl font-heading font-black text-white uppercase mb-4">Hardware_Bypass_Mode</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest max-w-sm mb-8">Spatial engine unavailable. Reverting to 2D tactical node selector.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {data?.nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => { setSelectedNode(node); playUISound('click'); }}
                    className={`p-4 rounded-2xl border transition-all text-left group ${selectedNode?.id === node.id ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  >
                    <span className="text-[8px] font-mono text-slate-500 block mb-1">NODE_ID: {node.id.split('-').pop()}</span>
                    <span className="text-[10px] font-heading font-black text-white uppercase truncate block">{node.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
              <Suspense fallback={null}>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <NeuralCore />
                <group>
                  {data?.connections.map((conn, i) => {
                    const fromNode = data.nodes.find(n => n.id === conn.from);
                    const toNode = data.nodes.find(n => n.id === conn.to);
                    if (!fromNode || !toNode) return null;
                    return <Synapse key={`syn-${i}`} connection={conn} start={fromNode.position} end={toNode.position} />;
                  })}
                  {data?.nodes.map(node => <Node key={node.id} node={node} onSelect={(n) => { setSelectedNode(n); playUISound('click'); }} isSelected={selectedNode?.id === node.id} />)}
                </group>
                <OrbitControls enablePan={false} minDistance={10} maxDistance={25} autoRotate={!selectedNode} autoRotateSpeed={0.3} />
              </Suspense>
            </Canvas>
          )}

          <div className="absolute bottom-8 right-8 flex flex-col gap-2 pointer-events-none">
             {[
               { label: 'Neural Core (GMT_AI)', color: 'bg-blue-500' },
               { label: 'Stable Node', color: 'bg-emerald-500' },
               { label: 'Critical Bottleneck', color: 'bg-red-500' },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 glass px-3 py-1 rounded-lg border border-white/5 backdrop-blur-md">
                 <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
                 <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">{item.label}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-4 glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/40 flex flex-col space-y-8 overflow-y-auto no-scrollbar shadow-2xl relative">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-3 bg-accent rounded-full"></div>
                 <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Global_Signal_Summary</h3>
              </div>
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5 italic">
                 <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                    "{data?.globalSummary || "Awaiting neural synthesis from global trade streams..."}"
                 </p>
              </div>
           </div>

           <div className="flex-1 space-y-8">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-3 bg-accent rounded-full"></div>
                 <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Hub_Reconnaissance</h3>
              </div>

              {selectedNode ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="space-y-1">
                      <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Fix_Locked</span>
                      <h4 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">{selectedNode.name}</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Sentiment_Idx</span>
                         <span className={`text-xl font-heading font-black ${selectedNode.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>{selectedNode.sentiment}%</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <span className="text-[7px] font-mono text-slate-500 uppercase block mb-1">Status_Class</span>
                         <span className={`text-[10px] font-black uppercase ${selectedNode.status === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>{selectedNode.status}</span>
                      </div>
                   </div>
                   <div className="p-6 rounded-3xl border border-accent/20 bg-accent/5">
                      <span className="text-[8px] font-black text-accent uppercase tracking-widest block mb-2">Tactical_Report:</span>
                      <p className="text-[10px] font-mono text-slate-300 leading-relaxed uppercase">{selectedNode.description}</p>
                   </div>
                   <button onClick={() => setSelectedNode(null)} className="w-full py-4 glass border-white/10 text-slate-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:border-accent/40">Release_Node_Lock</button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center gap-6 py-20">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-4xl">🚢</div>
                   <p className="text-[10px] font-mono uppercase tracking-[0.4em] max-w-[140px]">Select a hub on the neural matrix to begin interrogation</p>
                </div>
              )}
           </div>

           <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">GMT_Neural_Trade_V1.1</span>
              <div className="flex gap-1">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className={`w-1 h-3 rounded-sm ${i < (processingTime / 200) ? 'bg-accent' : 'bg-slate-800'}`}></div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradeBrain;
