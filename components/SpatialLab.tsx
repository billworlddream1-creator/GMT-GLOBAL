
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Text, Float, RoundedBox } from '@react-three/drei';
import { NewsItem } from '../types';
import { playUISound } from '../utils/audioUtils';
import { isWebGLAvailable } from '../utils/webglUtils';

interface SpatialLabProps {
  news: NewsItem[];
  onSelect: (url: string, title: string) => void;
}

interface NewsPanelProps {
  item: NewsItem;
  position: [number, number, number];
  onSelect: (url: string, title: string) => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ item, position, onSelect }) => {
  const texture = useLoader(THREE.TextureLoader, item.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800');
  
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={position}>
      <group 
        onClick={(e) => {
          e.stopPropagation();
          playUISound('success');
          onSelect(item.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', item.title);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <RoundedBox args={[4, 2.5, 0.1]} radius={0.1} smoothness={4}>
          <meshBasicMaterial map={texture} />
        </RoundedBox>
        
        <RoundedBox args={[4.2, 2.7, 0.05]} radius={0.1} smoothness={4} position={[0, 0, -0.06]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
        </RoundedBox>

        <Text
          position={[0, -1.8, 0]}
          color="white"
          fontSize={0.15}
          maxWidth={3.5}
          textAlign="center"
          font="https://fonts.gstatic.com/s/orbitron/v25/yMJ4DifL97qlqHuxv4p5pXP68UFID_jI.woff"
        >
          {item.title.toUpperCase()}
        </Text>
      </group>
    </Float>
  );
};

const SpatialLab: React.FC<SpatialLabProps> = ({ news, onSelect }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const displayNews = useMemo(() => news.slice(0, 12), [news]);

  if (hasWebGL === false) {
    return (
      <div className="w-full h-full glass rounded-[3rem] overflow-hidden flex flex-col p-10 border border-white/10 bg-black/40 animate-in fade-in">
        <div className="mb-10">
          <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Spatial Intelligence Lab</h2>
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-[0.4em] mt-2 animate-pulse">Hardware Incompatibility Detected // Reverting to 2D Matrix</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.image || '', item.title)}
              className="glass rounded-3xl overflow-hidden border border-white/5 hover:border-accent transition-all cursor-pointer group"
            >
              <div className="h-32 overflow-hidden relative">
                <img src={item.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-accent/10"></div>
              </div>
              <div className="p-4 bg-slate-900/60">
                <h4 className="text-[9px] font-heading font-black text-white uppercase leading-tight tracking-widest">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full glass rounded-[3rem] overflow-hidden relative border border-white/10 bg-black/40">
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Spatial Intelligence Lab</h2>
        <p className="text-[10px] font-mono text-accent uppercase tracking-[0.5em] mt-2 animate-pulse">Navigating Data in 3D Space</p>
      </div>

      <div className="absolute bottom-10 right-10 z-10 glass px-6 py-3 rounded-2xl border border-white/10 text-[9px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
        Scroll to Zoom • Drag to Rotate • Click Image for VR View
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 50 }} onCreated={({ gl }) => {
        // Double check after creation to catch late initialization errors
        if (!gl) setHasWebGL(false);
      }}>
        <color attach="background" args={['#020617']} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <group>
            {displayNews.map((item, i) => {
              const angle = (i / displayNews.length) * Math.PI * 2;
              const radius = 8;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const y = (Math.random() - 0.5) * 4;
              
              return (
                <NewsPanel 
                  key={item.id} 
                  item={item} 
                  position={[x, y, z]} 
                  onSelect={onSelect} 
                />
              );
            })}
          </group>

          <OrbitControls 
            enablePan={false} 
            minDistance={5} 
            maxDistance={25} 
            autoRotate 
            autoRotateSpeed={0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpatialLab;
