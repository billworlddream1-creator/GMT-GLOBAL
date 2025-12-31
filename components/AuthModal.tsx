
import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface AuthModalProps {
  onLogin: (user: any) => void;
}

const AUTH_STEPS = [
  "Initial neural handshake...",
  "Bypassing secondary firewall nodes...",
  "Authenticating biometrics...",
  "Synchronizing orbital dossiers...",
  "Establishing secure P2P tunnel...",
  "Injecting global intelligence stream...",
  "Uplink stable. Protocol Alpha active."
];

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isSyncing && currentStep < AUTH_STEPS.length - 1) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => prev + 1);
        playUISound('click');
      }, 400); 
    }
    return () => clearInterval(interval);
  }, [isSyncing, currentStep]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'reset') {
      alert("Notice: A password reset link has been sent to " + email);
      setMode('login');
      return;
    }

    if (mode === 'register') {
      if (email !== confirmEmail) {
        alert("CRITICAL ERROR: Intelligence emails do not match. Verify signal integrity.");
        playUISound('alert');
        return;
      }
      if (!codename.trim()) {
        alert("ERROR: Codename required for protocol assignment.");
        return;
      }
    }
    
    setIsSyncing(true);
    playUISound('startup');
    
    setTimeout(() => {
      onLogin({ 
        name: mode === 'register' ? codename : 'Agent_' + Math.floor(Math.random() * 1000), 
        email 
      });
    }, 3200);
  };

  const handleProviderLogin = (provider: 'Google' | 'Microsoft' | 'Yahoo' | 'Apple') => {
    setIsSyncing(true);
    playUISound('startup');
    setTimeout(() => {
      onLogin({ 
        name: `${provider} Operative`, 
        email: `user@${provider.toLowerCase()}.com`,
        provider: provider
      });
    }, 3200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl flex items-center justify-center z-[2000] p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden window-entry">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
             <div className="relative w-28 h-28">
                <div className="absolute inset-0 border-2 border-accent/10 rounded-full"></div>
                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
                <div className="absolute inset-6 border border-accent/20 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-mono text-accent">{Math.round((currentStep / (AUTH_STEPS.length - 1)) * 100)}%</span>
                </div>
             </div>
             <div className="text-center space-y-4 max-w-[280px]">
                <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest animate-pulse">Neural Synchronization</h3>
                <p className="text-[8px] font-mono text-emerald-500 uppercase tracking-[0.3em] h-8 transition-all">
                  {AUTH_STEPS[currentStep]}
                </p>
                <div className="flex gap-1 justify-center">
                  {[...Array(AUTH_STEPS.length)].map((_, i) => (
                    <div key={i} className={`h-1 w-4 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-accent shadow-[0_0_8px_var(--accent-glow)]' : 'bg-white/5'}`}></div>
                  ))}
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10 relative">
              <h2 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">GMT GLOBAL</h2>
              <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] mt-2">
                {mode === 'register' ? 'Protocol Registration' : mode === 'reset' ? 'Protocol Recovery' : 'Field Agent Login'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 relative">
              {mode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Operational Codename</label>
                  <input 
                    type="text" 
                    required
                    value={codename}
                    onChange={(e) => setCodename(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. GHOST_RECON"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Intelligence Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all outline-none"
                  placeholder="agent@gmt-global.net"
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Confirm Intelligence Email</label>
                  <input 
                    type="email" 
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all outline-none"
                    placeholder="Repeat assigned email"
                  />
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Access Key (Password)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-xs text-white focus:border-blue-500 transition-all outline-none"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => { setShowPassword(!showPassword); playUISound('click'); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-5 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                {mode === 'login' ? 'Login' : mode === 'reset' ? 'Reset Password' : 'Initialize Protocol'}
              </button>
            </form>

            {mode !== 'reset' && (
              <div className="mt-8 space-y-4 relative">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-[9px] font-mono text-slate-600 uppercase">Secure Relay</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleProviderLogin('Google')}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">🌐</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Relay via Google</span>
                  </button>

                  <button 
                    onClick={() => handleProviderLogin('Microsoft')}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">💻</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Relay via Microsoft</span>
                  </button>

                  <button 
                    onClick={() => handleProviderLogin('Yahoo')}
                    className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">💜</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Relay via Yahoo</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-between text-[9px] font-mono text-slate-500 uppercase relative">
              {mode === 'login' ? (
                <>
                  <button onClick={() => { setMode('reset'); playUISound('click'); }} className="hover:text-blue-400 transition-colors">Key Recovery?</button>
                  <button onClick={() => { setMode('register'); playUISound('click'); }} className="hover:text-blue-400 transition-colors underline decoration-accent">New Operative?</button>
                </>
              ) : (
                <button onClick={() => { setMode('login'); playUISound('click'); }} className="w-full text-center hover:text-blue-400 transition-colors">Back to Terminal Login</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
