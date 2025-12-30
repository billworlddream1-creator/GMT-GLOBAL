
import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Text, Float, RoundedBox } from '@react-three/drei';
import { NewsItem } from '../types';
import { playUISound } from '../utils/audioUtils';

interface SpatialLabProps {
  news: NewsItem[];
  onSelect: (url: string, title: string) => void;
}

// Fixed: Defined NewsPanelProps interface to properly handle React internal props like 'key'
interface NewsPanelProps {
  item: NewsItem;
  position: [number, number, number];
  onSelect: (url: string, title: string) => void;
}

// Fixed: Used React.FC with NewsPanelProps to ensure the component is recognized correctly by the TypeScript JSX compiler
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
  const displayNews = useMemo(() => news.slice(0, 12), [news]);

  return (
    <div className="w-full h-full glass rounded-[3rem] overflow-hidden relative border border-white/10 bg-black/40">
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Spatial Intelligence Lab</h2>
        <p className="text-[10px] font-mono text-accent uppercase tracking-[0.5em] mt-2 animate-pulse">Navigating Data in 3D Space</p>
      </div>

      <div className="absolute bottom-10 right-10 z-10 glass px-6 py-3 rounded-2xl border border-white/10 text-[9px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
        Scroll to Zoom • Drag to Rotate • Click Image for VR View
      </div>

      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
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
