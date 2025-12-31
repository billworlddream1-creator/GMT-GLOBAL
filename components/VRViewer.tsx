
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import { playUISound } from '../utils/audioUtils';
import { isWebGLAvailable } from '../utils/webglUtils';

interface VRViewerProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

const ImmersiveImage = ({ url }: { url: string }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[16.2, 9.2]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
      </mesh>
    </Float>
  );
};

const VRViewer: React.FC<VRViewerProps> = ({ imageUrl, onClose, title }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  if (hasWebGL === false) {
    return (
      <div className="fixed inset-0 z-[4000] bg-[#020617] flex items-center justify-center p-10 animate-in fade-in duration-700">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ background: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative w-full max-w-6xl aspect-video glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <img src={imageUrl} alt={title} className="max-h-full max-w-full object-contain brightness-75 grayscale group-hover:grayscale-0 transition-all duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
          </div>
          <div className="p-8 border-t border-white/5 bg-slate-900/40 flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em] font-black">Spatial_Engine_Bypass_Active</span>
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">{title || 'IMAGE_FIX'}</h3>
            </div>
            <button
              onClick={() => { playUISound('alert'); onClose(); }}
              className="px-10 py-4 bg-white/5 border border-white/10 hover:border-accent text-white font-heading font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
            >
              Close_Buffer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[4000] bg-black animate-in fade-in duration-700">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} onCreated={({ gl }) => {
        if (!gl) setHasWebGL(false);
      }}>
        <color attach="background" args={['#020617']} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <ImmersiveImage url={imageUrl} />
          
          <Text
            position={[0, -6, 0]}
            color="white"
            fontSize={0.5}
            font="https://fonts.gstatic.com/s/orbitron/v25/yMJ4DifL97qlqHuxv4p5pXP68UFID_jI.woff"
            anchorX="center"
            anchorY="middle"
          >
            {title?.toUpperCase() || 'SPATIAL INTELLIGENCE VIEW'}
          </Text>

          <Text
            position={[0, -7, 0]}
            color="#94a3b8"
            fontSize={0.2}
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/t6nv2o97px6S0i1X9-Q_Eux_T36vT389.woff"
            anchorX="center"
            anchorY="middle"
          >
            DRAG TO ROTATE • SCROLL TO ZOOM
          </Text>

          <OrbitControls 
            enablePan={false} 
            minDistance={5} 
            maxDistance={30} 
            autoRotate 
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      <button
        onClick={() => {
          playUISound('alert');
          onClose();
        }}
        className="absolute top-10 right-10 z-[5000] glass px-8 py-3 rounded-full text-white font-heading font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/20"
      >
        Exit Spatial View
      </button>

      <div className="absolute bottom-10 left-10 z-[5000] glass p-6 rounded-3xl border border-white/5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-black">VR_MODE_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default VRViewer;
