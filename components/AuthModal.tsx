
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

  const handleGoogleLogin = () => {
    playUISound('startup');
    // Mock Google Redirect
    setTimeout(() => {
      onLogin({ name: 'Google User', email: 'user@google.com' });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-[2000] p-6">
      <div className="scanline"></div>
      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-white tracking-tighter uppercase">GMT GLOBAL</h2>
          <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all"
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">
            {mode === 'login' ? 'Login' : mode === 'reset' ? 'Reset Password' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[9px] font-mono text-slate-700 uppercase">OR</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 glass-bright border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/5 transition-all"
          >
            <span className="text-lg">🌐</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sign in with Google</span>
          </button>
        </div>

        <div className="mt-10 flex justify-between text-[9px] font-mono text-slate-500 uppercase">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('reset')} className="hover:text-blue-400">Forgot Password?</button>
              <button onClick={() => setMode('register')} className="hover:text-blue-400">Sign Up</button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="w-full text-center hover:text-blue-400">Back to Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
