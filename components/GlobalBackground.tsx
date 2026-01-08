
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IntelligenceService } from '../services/geminiService';
import { NewsItem } from '../types';
import { isWebGLAvailable } from '../utils/webglUtils';

interface GlobalBackgroundProps {
  intelService: IntelligenceService;
  news: NewsItem[];
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uVolatility;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float time = uTime * uVolatility * 0.1;
    float noise1 = snoise(vUv * 3.0 + time);
    float noise2 = snoise(vUv * 5.0 - time * 0.5);
    
    vec3 color = mix(uColor1, uColor2, smoothstep(-1.0, 1.0, noise1));
    color = mix(color, uColor3, smoothstep(-0.5, 0.5, noise2) * 0.5);
    
    // Vignette
    float dist = distance(vUv, vec2(0.5));
    color *= 1.0 - dist * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const BackgroundPlane = ({ params }: { params: { primaryColor: string, secondaryColor: string, tertiaryColor: string, volatility: number } }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#020617') },
    uColor2: { value: new THREE.Color('#1e293b') },
    uColor3: { value: new THREE.Color('#3b82f6') },
    uVolatility: { value: 0.2 },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate to target values
      mat.uniforms.uColor1.value.lerp(new THREE.Color(params.primaryColor), 0.02);
      mat.uniforms.uColor2.value.lerp(new THREE.Color(params.secondaryColor), 0.02);
      mat.uniforms.uColor3.value.lerp(new THREE.Color(params.tertiaryColor), 0.02);
      mat.uniforms.uVolatility.value = THREE.MathUtils.lerp(mat.uniforms.uVolatility.value, params.volatility, 0.01);
    }
  });

  return (
    <mesh ref={meshRef} scale={[20, 20, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default function GlobalBackground({ intelService, news }: GlobalBackgroundProps) {
  const [params, setParams] = useState({ 
    primaryColor: '#020617', 
    secondaryColor: '#1e293b', 
    tertiaryColor: '#3b82f6', 
    volatility: 0.2 
  });
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const lastProcessedRef = useRef<string>("");

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      // Fingerprint the news to avoid calling API if headlines haven't actually changed
      const fingerprint = news.map(n => n.id).join(',');
      if (fingerprint === lastProcessedRef.current) return;
      
      lastProcessedRef.current = fingerprint;
      intelService.analyzeSentimentForEnvironment(news).then(newParams => {
        if (newParams) setParams(newParams);
      }).catch(err => console.error("BG_UPDATE_FAIL", err));
    }
  }, [news, intelService]);

  if (hasWebGL === false) return null; // Fallback to CSS background

  return (
    <div className="fixed inset-0 z-[-2] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
        <BackgroundPlane params={params} />
      </Canvas>
    </div>
  );
}
