import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import { playUISound } from '../utils/audioUtils';

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
      {/* Subtle glow behind image */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[16.2, 9.2]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
      </mesh>
    </Float>
  );
};

const VRViewer: React.FC<VRViewerProps> = ({ imageUrl, onClose, title }) => {
  return (
    <div className="fixed inset-0 z-[4000] bg-black animate-in fade-in duration-700">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
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