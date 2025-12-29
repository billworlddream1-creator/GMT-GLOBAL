
import React, { useState } from 'react';
import { playUISound } from '../utils/audioUtils';

const BlackBox: React.FC = () => {
  const [files, setFiles] = useState<{ id: string, name: string, status: string, progress: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const sanitizeFile = (name: string) => {
    const id = Math.random().toString(36).substr(2, 6).toUpperCase();
    setFiles(prev => [...prev, { id, name, status: 'Sanitizing', progress: 0 }]);
    playUISound('startup');

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
      if (p >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'Secure', progress: 100 } : f));
        playUISound('success');
        
        // Self-destruct simulation
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== id));
          playUISound('alert');
        }, 5000);
      }
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/40 relative overflow-hidden flex flex-col items-center text-center">
        <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4">Black Box Vault</h2>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] mb-12">Authorized Metadata Stripping & Self-Destruct Sharing</p>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); sanitizeFile('INTEL_FILE.PDF'); }}
          className={`w-full max-w-xl h-64 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all ${isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
        >
           <span className="text-6xl">⬛</span>
           <div className="space-y-2">
             <p className="text-sm font-heading font-black text-white uppercase">Drop Intel Here</p>
             <p className="text-[9px] font-mono text-slate-500 uppercase">Files will be sanitized and auto-destructed after 5s</p>
           </div>
           <button onClick={() => sanitizeFile('MANUAL_ENTRY.TXT')} className="px-6 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Manual Upload</button>
        </div>

        {files.length > 0 && (
          <div className="w-full max-w-xl mt-12 space-y-4">
             {files.map(file => (
               <div key={file.id} className="glass p-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                     <div className="text-left">
                        <span className="text-[10px] font-heading font-black text-white uppercase">{file.name}</span>
                        <p className="text-[8px] font-mono text-slate-500 uppercase">ID: {file.id} // STATUS: {file.status}</p>
                     </div>
                     {file.status === 'Secure' && (
                       <span className="text-[8px] font-mono text-red-500 animate-pulse uppercase">DESTRUCT_IN: 5s</span>
                     )}
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-accent transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-8 rounded-3xl border border-white/5 flex items-start gap-6">
            <span className="text-3xl">🛡️</span>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Metadata Wipe</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed">Exif, GPS, and timestamp data are permanently purged using military-grade neural overrides.</p>
            </div>
         </div>
         <div className="glass p-8 rounded-3xl border border-white/5 flex items-start gap-6">
            <span className="text-3xl">🔥</span>
            <div>
               <h4 className="text-[10px] font-black text-white uppercase mb-1">Ghost Mode</h4>
               <p className="text-[9px] font-mono text-slate-500 leading-relaxed">Data is stored in volatile memory only. Once the connection is lost, all bits are zeroed out.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BlackBox;
