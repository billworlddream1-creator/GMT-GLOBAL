
import React, { useState, useEffect } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Game {
  id: string;
  title: string;
  category: 'Racing' | 'Sports' | 'Aircraft' | 'Strategy' | 'Board';
  icon: string;
  players: string;
  difficulty: string;
  desc: string;
}

const GAMES: Game[] = [
  { id: '1', title: 'Sonic Horizon', category: 'Racing', icon: '🏎️', players: '1-4 Agents', difficulty: 'MODERATE', desc: 'High-speed neural racing across neon cities.' },
  { id: '2', title: 'Aero Strike', category: 'Aircraft', icon: '✈️', players: 'Single/Co-op', difficulty: 'HARD', desc: 'Tactical air superiority mission.' },
  { id: '3', title: 'Grandmaster Chess', category: 'Board', icon: '♟️', players: '1v1 Dual', difficulty: 'ELITE', desc: 'The classic game, GMT edition.' },
  { id: '4', title: 'Quantum Football', category: 'Sports', icon: '⚽', players: 'Group vs Group', difficulty: 'EASY', desc: 'Strategic football with power-ups.' },
  { id: '5', title: 'Void Commander', category: 'Strategy', icon: '⚔️', players: 'Massive Group', difficulty: 'HARD', desc: 'Lead fleets against rogue clusters.' },
  { id: '6', title: 'Neon Sprint', category: 'Racing', icon: '🏍️', players: 'Multiplayer', difficulty: 'EASY', desc: 'Arcade bike racing for quick sessions.' },
];

const GamesHub: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('23:59:59');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 flex justify-between items-center bg-slate-900/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-2">Game Hub</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">Play together. Engage your mind. Free for all agents.</p>
        </div>
        <div className="text-right relative z-10">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-black block mb-2">Next Library Refresh</span>
          <div className="text-3xl font-heading font-black text-white tabular-nums">{timeLeft}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES.map(game => (
            <div 
              key={game.id}
              onClick={() => { setSelectedGame(game); playUISound('click'); }}
              className={`glass p-8 rounded-[3rem] border transition-all cursor-pointer group relative overflow-hidden flex flex-col ${
                selectedGame?.id === game.id ? 'bg-accent/20 border-accent shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                <span className="text-8xl">{game.icon}</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                 <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono text-slate-500 uppercase tracking-widest">{game.category}</span>
              </div>
              <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">{game.title}</h4>
              <p className="text-[10px] font-mono text-slate-400 mb-8 flex-1">{game.desc}</p>
              <div className="flex justify-between items-center border-t border-white/5 pt-6">
                 <div className="flex flex-col">
                   <span className="text-[8px] font-mono text-slate-600 uppercase">Players</span>
                   <span className="text-[10px] font-black text-white">{game.players}</span>
                 </div>
                 <div className="text-right flex flex-col">
                   <span className="text-[8px] font-mono text-slate-600 uppercase">Difficulty</span>
                   <span className={`text-[10px] font-black ${game.difficulty === 'ELITE' ? 'text-red-500' : game.difficulty === 'HARD' ? 'text-amber-500' : 'text-emerald-500'}`}>{game.difficulty}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Game Window / Preview */}
        <div className="glass rounded-[3.5rem] border border-white/10 p-10 flex flex-col bg-slate-900/40 h-fit sticky top-12 shadow-2xl">
          <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4">Game Terminal</h3>
          {selectedGame ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-full aspect-video glass rounded-[2.5rem] border border-accent/20 bg-accent/5 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <span className="text-6xl animate-bounce">{selectedGame.icon}</span>
               </div>
               <div className="space-y-4 text-center">
                  <h5 className="text-xl font-heading font-black text-white uppercase">{selectedGame.title}</h5>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Single & Multiplayer Ready</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 bg-accent text-white font-heading font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-accent/80 transition-all">Solo Play</button>
                  <button className="py-4 bg-white/5 border border-white/10 text-white font-heading font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Join Group</button>
               </div>
               <div className="pt-6 border-t border-white/5">
                  <span className="text-[8px] font-mono text-slate-600 uppercase block mb-4">Live Activity</span>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>Agent_K</span>
                        <span className="text-emerald-500">WIN_STREAK: 4</span>
                     </div>
                     <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>Shadow_Node</span>
                        <span className="text-amber-500">SEARCHING...</span>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30 py-20">
               <div className="text-5xl">🕹️</div>
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Select a simulation to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamesHub;
