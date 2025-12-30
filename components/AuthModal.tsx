
import React, { useState } from 'react';
import { playUISound } from '../utils/audioUtils';

interface AuthModalProps {
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      alert("Notice: A password reset link has been sent to " + email);
      setMode('login');
      return;
    }
    
    setIsSyncing(true);
    playUISound('startup');
    
    // Simulate a tactical synchronization delay
    setTimeout(() => {
      onLogin({ name: 'User', email });
    }, 2800);
  };

  const handleProviderLogin = (provider: 'Google' | 'Microsoft' | 'Apple') => {
    setIsSyncing(true);
    playUISound('startup');
    // Simulated Provider Redirect & Auth Flow
    setTimeout(() => {
      onLogin({ 
        name: `${provider} User`, 
        email: `user@${provider.toLowerCase()}.com`,
        provider: provider
      });
    }, 2800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl flex items-center justify-center z-[2000] p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden window-entry">
        {/* Galaxy ambient glow internal */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full"></div>
                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin"></div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest animate-pulse">Synchronizing Neural Link</h3>
                <p className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.5em]">Establishing encrypted proxy path...</p>
             </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-10 relative">
              <h2 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">GMT GLOBAL</h2>
              <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all outline-none"
                  placeholder="email@example.com"
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Password</label>
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

              <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                {mode === 'login' ? 'Login' : mode === 'reset' ? 'Reset Password' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-8 space-y-4 relative">
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[9px] font-mono text-slate-600 uppercase">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleProviderLogin('Google')}
                  className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🌐</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Sign in with Google</span>
                </button>

                <button 
                  onClick={() => handleProviderLogin('Microsoft')}
                  className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h11v11H0z"/>
                    <path fill="#f3f3f3" d="M12 0h11v11H12z"/>
                    <path fill="#f3f3f3" d="M0 12h11v11H0z"/>
                    <path fill="#f3f3f3" d="M12 12h11v11H12z"/>
                  </svg>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Sign in with Microsoft</span>
                </button>
              </div>
            </div>

            <div className="mt-10 flex justify-between text-[9px] font-mono text-slate-500 uppercase relative">
              {mode === 'login' ? (
                <>
                  <button onClick={() => setMode('reset')} className="hover:text-blue-400 transition-colors">Forgot Password?</button>
                  <button onClick={() => setMode('register')} className="hover:text-blue-400 transition-colors">Sign Up</button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="w-full text-center hover:text-blue-400 transition-colors">Back to Login</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
