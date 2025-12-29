
import React, { useState } from 'react';
import { playUISound } from '../utils/audioUtils';

interface AuthModalProps {
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      alert("Notice: A password reset link has been sent to " + email);
      setMode('login');
      return;
    }
    onLogin({ name: 'User', email });
  };

  const handleProviderLogin = (provider: 'Google' | 'Microsoft' | 'Apple') => {
    playUISound('startup');
    // Simulated Provider Redirect & Auth Flow
    setTimeout(() => {
      onLogin({ 
        name: `${provider} User`, 
        email: `user@${provider.toLowerCase()}.com`,
        provider: provider
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl flex items-center justify-center z-[2000] p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden window-entry">
        {/* Galaxy ambient glow internal */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
              />
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

            <button 
              onClick={() => handleProviderLogin('Apple')}
              className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
            >
              <svg className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Sign in with Apple</span>
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
      </div>
    </div>
  );
};

export default AuthModal;
