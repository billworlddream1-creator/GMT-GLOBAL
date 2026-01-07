
import React, { useState, useRef } from 'react';
import { UserProfile, CLEARANCE_LEVELS } from '../types';
import { playUISound } from '../utils/audioUtils';

interface ProfileHubProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
}

const INTEL_CATEGORIES = [
  'GEOPOLITICS',
  'TECHNOLOGY',
  'MARKETS',
  'CYBERSECURITY',
  'DEEP_SPACE',
  'INTELLIGENCE'
];

const OPERATIONAL_STATUSES = [
  'ACTIVE',
  'INFILTRATING',
  'EXFIL',
  'STANDBY',
  'COMPROMISED',
  'RECOVERING'
];

const ProfileHub: React.FC<ProfileHubProps> = ({ user, setUser }) => {
  const [displayName, setDisplayName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [clearance, setClearance] = useState(user.clearanceLevel || 'LEVEL_01');
  const [secClearance, setSecClearance] = useState(user.securityClearance || 'LEVEL_01');
  const [status, setStatus] = useState(user.operationalStatus || 'STANDBY');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(user.notificationSettings?.enabled ?? false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user.notificationSettings?.categories ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = () => {
    if (!displayName.trim() || isUpdating) return;
    
    setIsUpdating(true);
    playUISound('startup');

    // Simulate database write
    setTimeout(() => {
      setUser({ 
        ...user, 
        name: displayName, 
        email, 
        bio,
        clearanceLevel: clearance,
        securityClearance: secClearance,
        operationalStatus: status,
        notificationSettings: {
          enabled: notifEnabled,
          categories: selectedCategories
        }
      });
      
      // Secondary delay for visual satisfaction
      setTimeout(() => {
        setIsUpdating(false);
        playUISound('success');
      }, 500);
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("SIGNAL OVERLOAD: Imagery exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    setIsScanning(true);
    playUISound('startup');

    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Simulate imagery analysis
      setTimeout(() => {
        setUser({ ...user, photoUrl: result });
        setIsScanning(false);
        playUISound('success');
      }, 2000); 
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    playUISound('alert');
    setUser({ ...user, photoUrl: undefined });
  };

  const toggleCategory = (cat: string) => {
    playUISound('click');
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-32">
      {/* Identity Synthesis Panel */}
      <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden bg-slate-900/40">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
           <span className="text-[12rem] font-heading font-black">IDENTITY</span>
        </div>
        
        <div className="relative z-10 space-y-12">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tighter leading-none">Identity_Synthesis</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em]">Credential Management & Biometric Encoding</p>
          </div>

          <div className="flex flex-col md:flex-row gap-16 items-center md:items-start">
             {/* Profile Imagery Section */}
             <div className="flex flex-col items-center gap-6 shrink-0">
                <div 
                  className="w-56 h-56 rounded-[3rem] border-2 border-accent/20 bg-black/40 relative group overflow-hidden cursor-pointer"
                  onClick={() => !isScanning && fileInputRef.current?.click()}
                >
                   {user.photoUrl ? (
                     <img src={user.photoUrl} alt="Agent optics" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                        <span className="text-6xl">👤</span>
                        <span className="text-[8px] font-mono uppercase tracking-widest">Awaiting_Fix</span>
                     </div>
                   )}
                   
                   {isScanning && (
                     <div className="absolute inset-0 bg-accent/20 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                        <div className="w-full h-1 bg-white/40 absolute top-0 animate-scan"></div>
                        <span className="text-[10px] font-heading font-black text-white uppercase tracking-widest animate-pulse">Encoding...</span>
                     </div>
                   )}

                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <span className="text-[10px] font-heading font-black text-white uppercase tracking-widest">Update_Optics</span>
                   </div>

                   {/* Tactical Viewfinder Overlay */}
                   <div className="absolute inset-0 pointer-events-none z-30">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-accent/40"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-accent/40"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-accent/40"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-accent/40"></div>
                   </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="text-[9px] font-mono text-slate-400 hover:text-accent transition-colors uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl border border-white/5 hover:border-accent/40"
                  >
                    Load_Imagery
                  </button>
                  {user.photoUrl && (
                    <button 
                      onClick={clearPhoto}
                      className="text-[9px] font-mono text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Purge_Photo
                    </button>
                  )}
                </div>
             </div>

             {/* Biometric Credentials */}
             <div className="flex-1 space-y-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Agent_Codename</label>
                     <input 
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter Operational ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Communications_Relay</label>
                     <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="agent@gmt-intel.net"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono"
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Operational_Tier</label>
                     <select 
                        value={clearance}
                        onChange={(e) => setClearance(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono appearance-none"
                     >
                        {CLEARANCE_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl} className="bg-slate-900">{lvl}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Security_Clearance</label>
                     <select 
                        value={secClearance}
                        onChange={(e) => setSecClearance(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono appearance-none"
                     >
                        {CLEARANCE_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl} className="bg-slate-900">{lvl}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Mission_Status</label>
                     <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono appearance-none"
                     >
                        {OPERATIONAL_STATUSES.map(stat => (
                          <option key={stat} value={stat} className="bg-slate-900">{stat}</option>
                        ))}
                     </select>
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black text-accent uppercase tracking-[0.3em] ml-2">Biometric_Summary / Dossier</label>
                   <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Input mission profile details..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-accent outline-none transition-all font-mono resize-none"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Notification Protocols Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/60 relative overflow-hidden">
            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter mb-8">Notification_Protocols</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-10">Configure Tactical Signal Intercepts</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {INTEL_CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => toggleCategory(cat)}
                   className={`p-6 rounded-3xl border transition-all text-left group ${selectedCategories.includes(cat) ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                 >
                    <div className="flex justify-between items-center mb-2">
                       <span className={`text-[10px] font-heading font-black uppercase tracking-widest ${selectedCategories.includes(cat) ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{cat.replace('_', ' ')}</span>
                       <div className={`w-2 h-2 rounded-full ${selectedCategories.includes(cat) ? 'bg-accent animate-pulse' : 'bg-slate-800'}`}></div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-600 uppercase">Alert: ENABLED</span>
                 </button>
               ))}
            </div>
         </div>

         <div className="lg:col-span-4 glass p-12 rounded-[4rem] border border-white/10 bg-slate-900/20 flex flex-col justify-between">
            <div className="space-y-6">
               <h4 className="text-xs font-heading font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">Operational_Summary</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-mono text-slate-500 uppercase">Profile_Completeness</span>
                     <span className="text-lg font-heading font-black text-accent">92.4%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                     <div className="h-full bg-accent transition-all duration-1000" style={{ width: '92.4%' }}></div>
                  </div>
               </div>
               <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex justify-between text-[9px] font-mono uppercase">
                     <span className="text-slate-500">Node_ID</span>
                     <span className="text-white">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono uppercase">
                     <span className="text-slate-500">Active_Link</span>
                     <span className="text-emerald-500">SECURE</span>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleUpdate}
               disabled={isUpdating}
               className="w-full mt-12 py-6 bg-accent hover:bg-accent/80 text-white rounded-[2rem] text-xs font-heading font-black uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
            >
               {isUpdating ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   SYNCHRONIZING...
                 </>
               ) : 'COMMIT_CHANGES'}
            </button>
         </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileHub;
