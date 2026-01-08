
import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface AuthModalProps {
  onLogin: (user: any) => void;
}

const AUTH_STEPS = [
  { label: "Connecting to server...", icon: "📡" },
  { label: "Verifying credentials...", icon: "🤝" },
  { label: "Loading user profile...", icon: "👤" },
  { label: "Welcome back.", icon: "✅" }
];

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [codename, setCodename] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'RESET'>('LOGIN');

  useEffect(() => {
    let interval: number;
    if (isSyncing && currentStep < AUTH_STEPS.length - 1) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => prev + 1);
        playUISound('click');
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isSyncing, currentStep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (view === 'RESET') {
        alert("A password reset link has been sent to your email.");
        setView('LOGIN');
        playUISound('success');
        return;
    }

    // Simulation Logic
    const userData = {
        name: view === 'SIGNUP' ? codename || 'New_Operative' : 'Operative_77', 
        email: email,
        // In a real app, you would send 'pass' to your backend here
    };

    startAuthSequence(userData);
  };

  const handleGoogleLogin = () => {
    startAuthSequence({
        name: 'Google_Operative', 
        email: 'operative@gmail.com', 
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c', 
        provider: 'google' 
    });
  };

  const startAuthSequence = (userData: any) => {
    setIsSyncing(true);
    playUISound('startup');
    if (rememberMe) {
        localStorage.setItem('gmt_remember_me', 'true');
    }
    setTimeout(() => {
      onLogin(userData);
    }, AUTH_STEPS.length * 900 + 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl flex items-center justify-center z-[2000] p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-2xl overflow-hidden bg-slate-900/60">
        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in zoom-in-95 duration-500 text-center">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping"></div>
                <div className="absolute inset-4 border border-accent/40 rounded-full animate-spin-slow"></div>
                <span className="text-4xl">{AUTH_STEPS[currentStep].icon}</span>
             </div>
             <div className="space-y-4">
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-widest animate-pulse">
                    {view === 'SIGNUP' ? 'Creating Profile...' : 'Logging in...'}
                </h3>
                <p className="text-[10px] font-mono text-accent uppercase tracking-widest">{AUTH_STEPS[currentStep].label}</p>
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">GMT GLOBAL INTEL</h2>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest">
                  {view === 'LOGIN' ? 'Identify yourself to access the matrix' : 
                   view === 'SIGNUP' ? 'Initialize new operative credentials' : 
                   'Reset access protocols'}
              </p>
            </div>

            {/* Toggle Switch */}
            {view !== 'RESET' && (
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
                    <button 
                        type="button"
                        onClick={() => { setView('LOGIN'); playUISound('click'); }}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'LOGIN' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Log In
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setView('SIGNUP'); playUISound('click'); }}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'SIGNUP' ? 'bg-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Sign Up
                    </button>
                </div>
            )}

            <div className="space-y-4">
              {view === 'SIGNUP' && (
                  <input 
                    type="text" 
                    required 
                    placeholder="Operative Codename" 
                    value={codename}
                    onChange={e => setCodename(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent outline-none font-mono transition-all animate-in slide-in-from-top-2" 
                  />
              )}
              
              <input 
                type="email" 
                required 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent outline-none font-mono transition-all" 
              />
              
              {view !== 'RESET' && (
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      placeholder="Password" 
                      value={pass}
                      onChange={e => setPass(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-accent outline-none font-mono transition-all pr-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
              )}
            </div>

            {view !== 'RESET' && (
                <div className="flex items-center gap-3 px-2">
                    <input 
                        type="checkbox" 
                        id="remember" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-accent focus:ring-accent"
                    />
                    <label htmlFor="remember" className="text-[9px] font-mono text-slate-400 uppercase tracking-widest cursor-pointer select-none">Remember Me</label>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <button type="submit" className="w-full py-5 bg-accent hover:bg-accent/80 text-white font-heading font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95">
                    {view === 'LOGIN' ? 'Establish Link' : view === 'SIGNUP' ? 'Create Operative Profile' : 'Send Reset Link'}
                </button>

                {view !== 'RESET' && (
                    <>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-[8px] text-slate-500 uppercase font-mono tracking-widest">OR</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleGoogleLogin}
                            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-heading font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </>
                )}
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase items-center">
               <span>System Status: ONLINE</span>
               {view === 'LOGIN' && (
                   <button 
                     type="button" 
                     onClick={() => { setView('RESET'); playUISound('click'); }}
                     className="hover:text-white transition-colors underline"
                   >
                     Forgot Password?
                   </button>
               )}
               {view === 'RESET' && (
                   <button 
                     type="button" 
                     onClick={() => { setView('LOGIN'); playUISound('click'); }}
                     className="hover:text-white transition-colors underline"
                   >
                     Back to Login
                   </button>
               )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
