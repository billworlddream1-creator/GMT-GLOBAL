
import React, { useState, useMemo, memo, useEffect } from 'react';
import { NewsItem, IntelligenceMetric, GlobalTrendData, NetworkStatus, WeatherReport, MarketData } from '../types';
import { IntelligenceService } from '../services/geminiService';
import NewsCard from './NewsCard';
import NetworkRecon from './NetworkRecon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid } from 'recharts';
import { playUISound } from '../utils/audioUtils';

interface NewsFeedProps {
  news: NewsItem[];
  situationData: { metrics: IntelligenceMetric[], trends: GlobalTrendData[] } | null;
  weather: WeatherReport | null;
  loading: boolean;
  network: NetworkStatus;
  isVoiceEnabled: boolean;
  onVRView: (url: string, title: string) => void;
  intelService: IntelligenceService;
}

const MarketSnapshotWidget = memo(({ intelService }: { intelService: IntelligenceService }) => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const m = await intelService.getMarketIntelligence();
        setData(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [intelService]);

  if (loading) return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 h-64 animate-pulse flex items-center justify-center">
       <span className="text-[10px] font-mono text-accent animate-pulse uppercase tracking-[0.4em]">Acquiring_Market_Stream...</span>
    </div>
  );

  return (
    <div className="glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/60 relative overflow-hidden animate-in slide-in-from-right-4 duration-1000 group">
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
          <span className="text-8xl font-heading font-black text-white">BTC</span>
       </div>
       
       <div className="flex flex-col h-full gap-6">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <span className="text-[8px] font-mono text-accent uppercase tracking-widest font-black">Market_Intelligence_Fix</span>
                <h3 className="text-3xl font-heading font-black text-white leading-none">${data?.bitcoinPrice?.toLocaleString() ?? 0}</h3>
                <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Bitcoin // 24H_Uplink</p>
             </div>
             <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-400">ETH: ${(data?.ethereumPrice || 0).toLocaleString()}</div>
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-400">SOL: ${(data?.solanaPrice || 0).toLocaleString()}</div>
                </div>
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Grounding_Status: VERIFIED</span>
             </div>
          </div>

          <div className="flex-1 min-h-[120px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.bitcoinHistory}>
                   <defs>
                      <linearGradient id="marketPulse" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="time" hide />
                   <YAxis domain={['auto', 'auto']} hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                     itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="price" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#marketPulse)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
});

const WeatherImpactCard = memo(({ weather }: { weather: WeatherReport }) => {
  const isAlert = weather.impactAssessment.toUpperCase().includes('STORM') || 
                  weather.impactAssessment.toUpperCase().includes('HAZARD') ||
                  weather.impactAssessment.toUpperCase().includes('CRITICAL');

  return (
    <div className={`glass p-8 rounded-[3rem] border ${isAlert ? 'border-red-500/40 bg-red-500/10' : 'border-white/5 bg-slate-900/40'} animate-in slide-in-from-left-4 duration-1000 group relative overflow-hidden`}>
      {isAlert && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
           <div className="w-full h-full bg-red-600 animate-pulse"></div>
        </div>
      )}
      
      <div className="flex flex-col h-full justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl ${isAlert ? 'bg-red-600 animate-bounce' : 'bg-black/40'}`}>
             {weather.condition.toLowerCase().includes('rain') ? '🌧️' : '☀️'}
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{weather.location} // Atmos_Fix</span>
            <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">{weather.temperature}°C // {weather.condition}</h3>
            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block ${isAlert ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
               {isAlert ? 'CONDITION_CRITICAL' : 'OPTIMAL_FLIGHT_WINDOW'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
           <p className="text-[10px] font-mono text-slate-400 italic leading-relaxed uppercase">
              "{weather.impactAssessment}"
           </p>
        </div>
      </div>
    </div>
  );
});

const SituationVisualization = memo(({ metrics, trends }: { metrics: IntelligenceMetric[], trends: GlobalTrendData[] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="lg:col-span-4 glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 min-h-[300px] flex flex-col">
         <h3 className="text-[10px] font-heading font-black text-accent uppercase tracking-widest mb-6 px-2 flex justify-between items-center">
           <span>Situational_Risk_Matrix</span>
           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
         </h3>
         <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                  <Radar
                    name="Risk"
                    dataKey="intensity"
                    stroke="var(--accent-primary)"
                    fill="var(--accent-primary)"
                    fillOpacity={0.3}
                  />
               </RadarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="lg:col-span-8 glass p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 min-h-[300px] flex flex-col">
         <h3 className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-6 px-2">Neural_Volume_Trajectory</h3>
         <div className="flex-1 w-full h-full pb-6">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trends}>
                  <defs>
                     <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <div className="flex justify-between items-center px-4 pt-4 border-t border-white/5">
            {(metrics || []).map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                 <span className="text-[7px] font-mono text-slate-500 uppercase">{m.category}</span>
                 <span className={`text-[10px] font-heading font-black ${m.delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {m.delta > 0 ? '▲' : '▼'} {Math.abs(m.delta)}%
                 </span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
});

const NewsFeed: React.FC<NewsFeedProps> = ({ 
  news, 
  situationData, 
  weather,
  loading, 
  network, 
  isVoiceEnabled, 
  onVRView, 
  intelService 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set((news || []).map(n => (n.category || 'GENERAL').toUpperCase()));
    return ['ALL', ...Array.from(cats)];
  }, [news]);

  const filteredNews = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return (news || []).filter(n => {
      const nCat = (n.category || 'GENERAL').toUpperCase();
      const nTitle = (n.title || '').toLowerCase();
      const nContent = (n.content || '').toLowerCase();
      
      const categoryMatch = selectedCategory === 'ALL' || nCat === selectedCategory;
      const searchMatch = nTitle.includes(q) || nContent.includes(q);
      return categoryMatch && searchMatch;
    });
  }, [news, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl auto space-y-12 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         {weather && <WeatherImpactCard weather={weather} />}
         <MarketSnapshotWidget intelService={intelService} />
      </div>

      {situationData && <SituationVisualization metrics={situationData.metrics} trends={situationData.trends} />}
      
      <NetworkRecon network={network} />

      <div className="flex flex-col lg:flex-row items-center gap-6 glass p-6 rounded-[2.5rem] border border-white/5 bg-slate-900/20">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 border-r border-white/10 mr-2">Filters</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); playUISound('click'); }}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                selectedCategory === cat 
                  ? 'bg-accent border-accent text-white shadow-[0_0_15px_var(--accent-glow)]' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        
        <div className="w-full lg:w-80 relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Intelligence..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-mono text-white focus:border-accent outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
        {filteredNews.map((item) => (
          <NewsCard 
            key={item.id} 
            news={item} 
            intelService={intelService} 
            onVRView={onVRView}
            isVoiceEnabled={isVoiceEnabled}
          />
        ))}
        {loading && [...Array(3)].map((_, i) => (
          <div key={i} className="glass h-64 rounded-[3rem] animate-pulse bg-white/5" />
        ))}
        {!loading && filteredNews.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-20">
             <p className="text-[10px] font-mono uppercase tracking-[0.5em]">No intercepts found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
