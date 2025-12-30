import React, { useRef, useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface CameraCaptureProps {
  onSave: (photo: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shutterOpen, setShutterOpen] = useState(true);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraActive(true);
      playUISound('startup');
    } catch (err) {
      setError("Uplink failure: Optical sensors unresponsive.");
    }
  };

  const capturePhoto = () => {
    setShutterOpen(false);
    playUISound('click');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/png'));
        setTimeout(() => {
          setShutterOpen(true);
          playUISound('success');
        }, 150);
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-1000">
      <div className="glass p-10 rounded-[3.5rem] bg-slate-900/40 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-6 left-10 flex gap-6 z-20">
          <div className="flex flex-col">
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">Field Recon Unit</h2>
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] mt-1">Authorized Visual Intercept</span>
          </div>
        </div>

        <div className="relative w-full max-w-4xl aspect-video glass rounded-[2.5rem] overflow-hidden bg-black/80 shadow-2xl group border border-white/10 mt-16">
          <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity ${shutterOpen ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Tactical Viewfinder HUD */}
          <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 border-t-2 border-l-2 border-accent opacity-60"></div>
              <div className="w-12 h-12 border-t-2 border-r-2 border-accent opacity-60"></div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-16 h-16 border border-accent/20 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-accent rounded-full animate-ping"></div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="w-12 h-12 border-b-2 border-l-2 border-accent opacity-60"></div>
              <div className="w-12 h-12 border-b-2 border-r-2 border-accent opacity-60"></div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 text-[8px] font-mono text-accent bg-black/40 px-4 py-2 rounded-lg border border-accent/20">
            SENS_ISO: 400 // FR_AUTO: 60FPS // GRID: ENABLED
          </div>

          {!shutterOpen && <div className="absolute inset-0 bg-black z-50"></div>}
          {error && <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-red-500 font-heading">{error}</div>}
        </div>

        <div className="mt-12 flex gap-8">
          <button 
            onClick={capturePhoto}
            disabled={!isCameraActive}
            className="w-24 h-24 rounded-full bg-accent border-[6px] border-white/20 shadow-[0_0_30px_var(--accent-glow)] flex items-center justify-center transition-all active:scale-90 hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-10 animate-in fade-in backdrop-blur-3xl">
          <div className="absolute inset-0 bg-slate-950/80" onClick={() => setCapturedImage(null)}></div>
          <div className="relative max-w-5xl glass p-4 rounded-[3.5rem] bg-slate-900/60 shadow-2xl border border-white/20">
            <img src={capturedImage} alt="Captured Recon" className="w-full h-auto rounded-[3rem]" />
            <div className="absolute bottom-10 right-10 flex gap-4">
              <button onClick={() => { onSave(capturedImage); setCapturedImage(null); }} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-xl">Archive Intel</button>
              <button onClick={() => setCapturedImage(null)} className="px-10 py-4 glass border-white/10 text-white font-heading font-black uppercase text-[10px] tracking-widest rounded-2xl">Discard</button>
            </div>
            <div className="absolute top-10 left-10 glass px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Capture_Confirmed</span>
              <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Stamp: {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;