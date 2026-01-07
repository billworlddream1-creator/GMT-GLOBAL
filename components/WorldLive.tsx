
import React, { useState, useEffect, memo } from 'react';
import { IntelligenceService } from '../services/geminiService';
import { NewsItem, WeatherReport } from '../types';
import { playUISound } from '../utils/audioUtils';
import NewsCard from './NewsCard';

interface WorldLiveProps {
  intelService: IntelligenceService;
}

const LOCATIONS = [
  { name: 'London', country: 'UK', coords: { x: 48, y: 22 } },
  { name: 'Tokyo', country: 'Japan', coords: { x: 88, y: 35 } },
  { name: 'New York', country: 'USA', coords: { x: 25, y: 32 } },
  { name: 'Paris', country: 'France', coords: { x: 49, y: 28 } },
  { name: 'Beijing', country: 'China', coords: { x: 82, y: 34 } },
  { name: 'Dubai', country: 'UAE', coords: { x: 62, y: 45 } },
  { name: 'Berlin', country: 'Germany', coords: { x: 52, y: 25 } },
  { name: 'Seoul', country: 'South Korea', coords: { x: 86, y: 36 } },
  { name: 'Mumbai', country: 'India', coords: { x: 72, y: 52 } },
  { name: 'Moscow', country: 'Russia', coords: { x: 58, y: 18 } },
];

const WeatherTacticalAssessment = memo(({ weather }: { weather: WeatherReport | null }) => {
  if (!weather) return null;

  const isHazardous = weather.impactAssessment.toUpperCase().includes('CRITICAL') || 
                      weather.impactAssessment.toUpperCase().includes('HAZARD') ||
                      weather.impactAssessment.toUpperCase().includes('REDUCED');

  return (
    <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/60 relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
       
       <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex items-center gap-6 shrink-0">
             <div className="relative w-20 h-20 rounded-[2rem] bg-black/40 border border-white/10 flex items-center justify-center text-4xl shadow-2xl group">
                <span className="group-hover:scale-110 transition-transform">
                  {weather.condition.toLowerCase().includes('rain') ? '🌧️' : 
                   weather.condition.toLowerCase().includes('cloud') ? '☁️' : 
                   weather.condition.toLowerCase().includes('clear') || weather.condition.toLowerCase().includes('sun') ? '☀️' : '🌡️'}
                </span>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${isHazardous ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
             </div>
             <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black">Tactical_Atmos_Sync</span>
                <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">{weather.temperature}°C // {weather.condition}</h3>
                <div className="flex gap-4 mt-1">
                   <span className="text-[7px] font-mono text-slate-500 uppercase">Wind: {weather.windSpeed}KM/H</span>
                   <span className="text-[7px] font-mono text-slate-500 uppercase">Vis: {weather.visibility}KM</span>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isHazardous ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Meteorological_Impact_Assessment</h4>
             </div>
             <div className="p-5 bg-black/40 rounded-2xl border border-white/5 relative group hover:border-accent/30 transition-all">
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed uppercase italic">
                   "{weather.impactAssessment}"
                </p>
                <div className="absolute top-2 right-4 text-[6px] font-black text-accent opacity-30 group-hover:opacity-100 transition-opacity">GMT_ATMOS_V4</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0 w-full lg:w-auto">
             <div className="glass p-4 rounded-2xl border border-white/5 bg-white/5 text-center flex flex-col justify-center">
                <span className="text-[7px] font-mono text-slate-500 uppercase mb-1">Drone Ceiling</span>
                <span className={`text-[10px] font-black ${weather.visibility < 5 ? 'text-red-500' : 'text-white'}`}>{weather.visibility < 5 ? 'GND_LOCKED' : '45,000 FT'}</span>
             </div>
             <div className="glass p-4 rounded-2xl border border-white/5 bg-white/5 text-center flex flex-col justify-center">
                <span className="text-[7px] font-mono text-slate-500 uppercase mb-1">Signal Decibel</span>
                <span className="text-[10px] font-black text-blue-400">-{Math.round(weather.humidity/5)} dB</span>
             </div>
          </div>
       </div>
    </div>
  );
});

const WorldLive: React.FC<WorldLiveProps> = ({ intelService }) => {
  const [selectedLoc, setSelectedLoc] = useState(LOCATIONS[0]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocalIntel = async (loc: typeof LOCATIONS[0]) => {
    setSelectedLoc(loc);
    setLoading(true);
    playUISound('startup');
    try {
      const [newsData, weatherData] = await Promise.all([
        intelService.getLocalizedNews(loc.name),
        intelService.getAtmosIntelligence(loc.name)
      ]);
      setNews(newsData);
      setWeather(weatherData);
      playUISound('success');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalIntel(LOCATIONS[0]);
  }, []);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full min-h-0">
        {/* Geographic Selector Sidebar */}
        <div className="lg:col-span-1 glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col bg-slate-900/40 min-h-0">
           <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
             Primary Nodes
           </h3>
           
           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
             {LOCATIONS.map((loc) => (
               <button 
                 key={loc.name}
                 onClick={() => fetchLocalIntel(loc)}
                 className={`w-full group p-5 rounded-3xl border transition-all flex items-center justify-between ${
                   selectedLoc.name === loc.name ? 'bg-accent/20 border-accent shadow-lg' : 'bg-white/5 border-transparent hover:border-white/10'
                 }`}
               >
                 <div className="text-left">
                   <h4 className="text-[10px] font-heading font-black text-white uppercase tracking-tighter">{loc.name}</h4>
                   <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{loc.country}</span>
                 </div>
                 <div className={`w-2 h-2 rounded-full transition-all ${selectedLoc.name === loc.name ? 'bg-accent shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)] scale-125' : 'bg-slate-700 group-hover:bg-slate-500'}`}></div>
               </button>
             ))}
           </div>

           <div className="mt-10 pt-8 border-t border-white/5 shrink-0">
              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                <span className="text-[8px] font-mono text-slate-500 uppercase block mb-2">Neural Status</span>
                <p className="text-[9px] font-mono text-slate-400 leading-relaxed italic">"GMT satellites currently parsing high-frequency social noise in {selectedLoc.name}."</p>
              </div>
           </div>
        </div>

        {/* Localized Intel Feed Area */}
        <div className="lg:col-span-2 flex flex-col space-y-8 overflow-hidden">
           <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-slate-900/20 relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <span className="text-8xl font-heading font-black">GEO</span>
             </div>
             <div className="relative z-10">
               <span className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] font-black block mb-2">Terrestrial Intelligence Uplink</span>
               <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">{selectedLoc.name}_COMMAND_CENTER</h2>
             </div>
           </div>

           {/* Tactical Weather Assessment Section */}
           {!loading && <WeatherTacticalAssessment weather={weather} />}

           <div className="flex-1 overflow-y-auto no-scrollbar pr-2 pb-10">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass h-[300px] rounded-[3rem] animate-pulse bg-white/5"></div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {news.map(item => (
                    <NewsCard key={item.id} news={item} intelService={intelService} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-6 py-20">
                   <span className="text-6xl">📡</span>
                   <p className="text-[10px] font-mono uppercase tracking-[0.5em]">No unique signals localized in this sector.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorldLive;
