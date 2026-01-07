
import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface AuthModalProps {
  onLogin: (user: any) => void;
}

const AUTH_STEPS = [
  { label: "Verifying credentials...", component: 'retina' },
  { label: "Checking security...", component: 'finger' },
  { label: "Setting up your session...", component: 'dna' },
  { label: "Connecting to the server...", component: 'neural' },
  { label: "Welcome back!", component: 'neural' }
];

const BioRetina = () => (
  <div className="relative w-48 h-48 flex items-center justify-center" aria-hidden="true">
    <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping"></div>
    <div className="absolute inset-4 border border-accent/40 rounded-full animate-spin-slow"></div>
    <div className="w-24 h-1 bg-accent shadow-[0_0_15px_var(--accent-primary)] absolute animate-[scan-retina_2s_linear_infinite]"></div>
    <span className="text-5xl">👁️</span>
    <style>{`
      @keyframes scan-retina {
        0%, 100% { transform: translateY(-60px); }
        50% { transform: translateY(60px); }
      }
    `}</style>
  </div>
);

const BioFinger = () => (
  <div className="relative w-48 h-48 flex flex-col items-center justify-center" aria-hidden="true">
    <div className="w-32 h-40 border-2 border-emerald-500/30 rounded-[2rem] relative overflow-hidden flex items-center justify-center bg-emerald-500/5">
       <span className="text-6xl grayscale opacity-40">☝️</span>
       <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_10px_emerald] animate-[scan-finger_1.5s_ease-in-out_infinite]"></div>
    </div>
    <style>{`
      @keyframes scan-finger {
        0% { top: 0; }
        100% { top: 100%; }
      }
    `}</style>
  </div>
);

const BioDNA = () => (
  <div className="relative w-48 h-48 flex items-center justify-center gap-2" aria-hidden="true">
     {[...Array(8)].map((_, i) => (
       <div 
         key={i} 
         className="w-2 bg-blue-500 rounded-full animate-[dna-float_2s_ease-in-out_infinite]"
         style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.2}s` }}
       ></div>
     ))}
     <style>{`
       @keyframes dna-float {
         0%, 100% { transform: translateY(0); opacity: 0.3; }
         50% { transform: translateY(-20px); opacity: 1; }
       }
     `}</style>
  </div>
);

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isSyncing && currentStep < AUTH_STEPS.length - 1) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => prev + 1);
        playUISound('click');
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isSyncing, currentStep]);

  const handleAuth = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mode === 'reset') {
      alert("RESET_REQUEST_SENT: Check your neural relay for a recovery link.");
      setMode('login');
      return;
    }
    setIsSyncing(true);
    playUISound('startup');
    setTimeout(() => {
      onLogin({ 
        name: mode === 'register' ? codename : 'Agent_' + Math.floor(Math.random() * 1000), 
        email 
      });
    }, AUTH_STEPS.length * 800 + 400);
  };

  const handleSocialLogin = (platform: string) => {
    setEmail(`${platform.toLowerCase()}@gmt-intel.net`);
    handleAuth();
  };

  const renderBioStage = () => {
    const stage = AUTH_STEPS[currentStep].component;
    if (stage === 'retina') return <BioRetina />;
    if (stage === 'finger') return <BioFinger />;
    if (stage === 'dna') return <BioDNA />;
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
         <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
         <span className="text-5xl animate-pulse">👤</span>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-3xl flex items-center justify-center z-[2000] p-6 animate-in fade-in duration-1000"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-2xl overflow-hidden">
        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-10 animate-in zoom-in-95 duration-500">
             {renderBioStage()}
             <div className="text-center space-y-4 w-full">
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-widest animate-pulse">Authenticating_Uplink...</h3>
                <div className="p-4 glass bg-black/40 rounded-2xl border border-white/5" aria-live="polite">
                   <p className="text-[10px] font-mono text-accent uppercase tracking-widest">{AUTH_STEPS[currentStep].label}</p>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 id="auth-title" className="text-3xl font-heading font-black text-white tracking-tighter uppercase leading-none">
                {mode === 'login' ? 'GMT_LOGIN' : mode === 'register' ? 'GMT_REGISTER' : 'GMT_RESET'}
              </h2>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-2">Intelligence Authorization Protocol</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="codename" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Agent ID</label>
                  <input id="codename" type="text" required value={codename} onChange={(e) => setCodename(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-accent transition-all outline-none" placeholder="Choose a codename" />
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Relay Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-accent transition-all outline-none" placeholder="agent@email.com" />
              </div>
              
              {mode !== 'reset' && (
                <div className="space-y-1 relative">
                  <label htmlFor="pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Secure Key</label>
                  <div className="relative">
                    <input 
                      id="pass" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 pr-12 text-sm text-white focus:border-accent transition-all outline-none font-mono" 
                      placeholder="Enter passkey" 
                    />
                    <button 
                      type="button"
                      onClick={() => { setShowPassword(!showPassword); playUISound('click'); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-accent transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? '👁️' : '🔒'}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between px-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => { setRememberMe(e.target.checked); playUISound('click'); }} 
                      className="hidden" 
                    />
                    <div className={`w-4 h-4 rounded border transition-all ${rememberMe ? 'bg-accent border-accent' : 'bg-black/40 border-white/10 group-hover:border-accent/40'} flex items-center justify-center`}>
                      {rememberMe && <span className="text-[10px] text-white">✓</span>}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Remember_Node</span>
                  </label>
                  <button type="button" onClick={() => setMode('reset')} className="text-[9px] font-mono text-accent hover:underline uppercase tracking-widest">Forgot_Pass?</button>
                </div>
              )}

              <button type="submit" className="w-full py-4 mt-2 bg-accent hover:bg-accent/80 text-white font-heading font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95">
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Agent' : 'Reset Key'}
              </button>
            </form>

            <div className="relative flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Third_Party_Uplink</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {['Google', 'Microsoft', 'Yahoo'].map(platform => (
                <button 
                  key={platform}
                  onClick={() => handleSocialLogin(platform)}
                  aria-label={`Sign in with ${platform}`}
                  className="py-3 flex items-center justify-center glass border-white/10 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <img src={`https://www.${platform.toLowerCase()}.com/favicon.ico`} className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="" />
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
              <button onClick={() => setMode('login')} className={mode === 'login' ? 'text-accent font-black underline underline-offset-4' : 'hover:text-slate-300'}>Login_Node</button>
              <button onClick={() => setMode('register')} className={mode === 'register' ? 'text-accent font-black underline underline-offset-4' : 'hover:text-slate-300'}>Create_Node</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
