import React, { Component, ErrorInfo, ReactNode } from 'react';
import { playUISound } from '../utils/audioUtils';

interface Props {
  children?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  incidentId: string | null;
  isRateLimit: boolean;
}

// Fix: Explicitly extending Component with Props and State interfaces to ensure props and state are correctly typed via inheritance.
export default class TacticalErrorBoundary extends Component<Props, State> {
  // Fix: Defining state as a class property for more reliable TypeScript inference across the component instance.
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    incidentId: null,
    isRateLimit: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const isRateLimit = 
      error.message.includes("429") || 
      error.message.includes("OVERLOAD") || 
      error.message.includes("EXHAUSTED");
    return { hasError: true, error, isRateLimit };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const incidentId = `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    // Fix: setState is available on the Component instance from standard React inheritance.
    this.setState({ errorInfo, incidentId });
    
    console.group(`%c GMT_INCIDENT_REPORT: ${incidentId} `, 'background: #ef4444; color: white; font-weight: bold;');
    // Fix: props is available on the Component instance from standard React inheritance.
    console.error("FAULT_LOCATION:", this.props.moduleName || "UNKNOWN_MODULE");
    console.error("ERROR_STACK:", error);
    console.groupEnd();
    
    playUISound('alert');
  }

  private handleReset = () => {
    playUISound('startup');
    // Fix: Using arrow function ensures 'this' context points to the class instance for setState.
    this.setState({ hasError: false, error: null, errorInfo: null, incidentId: null, isRateLimit: false });
  };

  public render() {
    // Fix: Standard access to this.state which is now properly recognized by the compiler.
    if (this.state.hasError) {
      const isRateLimit = this.state.isRateLimit;
      
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 lg:p-12 animate-in fade-in zoom-in-95 duration-700">
          <div className={`w-full max-w-4xl glass p-1 rounded-[3.5rem] border overflow-hidden shadow-2xl relative ${isRateLimit ? 'bg-blue-950/20 border-blue-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
            {/* Header: Identity Bar */}
            <div className={`px-8 py-4 flex justify-between items-center ${isRateLimit ? 'bg-blue-600' : 'bg-red-600'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{isRateLimit ? '⚡' : '⚠️'}</span>
                <h2 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em]">
                  {isRateLimit ? 'Neural_Overload_Detected' : 'Incident_Intelligence_Report'}
                </h2>
              </div>
              <span className="text-[9px] font-mono text-white/70 font-black tracking-widest">{this.state.incidentId}</span>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Visual Alert */}
                <div className={`flex flex-col items-center justify-center space-y-6 border-r border-white/5 pr-10`}>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className={`absolute inset-0 border-2 border-dashed rounded-full animate-spin-slow ${isRateLimit ? 'border-blue-500/40' : 'border-red-500/40'}`}></div>
                    <div className={`absolute inset-4 border rounded-full flex items-center justify-center text-5xl ${isRateLimit ? 'border-blue-500/20' : 'border-red-500/20'}`}>
                      {isRateLimit ? '🔋' : '📡'}
                    </div>
                    <div className={`absolute inset-[-10px] border rounded-full animate-ping opacity-10 ${isRateLimit ? 'border-blue-500' : 'border-red-500'}`}></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">
                      {isRateLimit ? 'Uplink_Stabilizing' : 'Core_Data_Fault'}
                    </h3>
                    <p className={`text-[10px] font-mono uppercase tracking-widest leading-relaxed ${isRateLimit ? 'text-blue-400' : 'text-red-400'}`}>
                      {/* Fix: Accessing moduleName from this.props via established inheritance. */}
                      Sector: {this.props.moduleName || 'Global_Matrix'}<br/>
                      Status: {isRateLimit ? 'RECOVERING_SYNAPSE' : 'DATA_CORRUPTION_DETECTED'}
                    </p>
                  </div>
                </div>

                {/* Technical Dossier */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fault_Summary</label>
                    <div className={`p-4 bg-black/40 border border-white/10 rounded-2xl font-mono text-[10px] leading-relaxed italic ${isRateLimit ? 'text-blue-300' : 'text-red-300'}`}>
                      "{isRateLimit ? 'Neural bandwidth exceeded. The system is staggering requests to maintain matrix integrity. Stand by for automatic recalibration.' : (this.state.error?.message || "Undefined logical collapse during data synthesis.")}"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol_Guidance</label>
                    <div className="p-4 bg-black/60 border border-white/5 rounded-2xl h-32 overflow-y-auto no-scrollbar font-mono text-[8px] text-slate-500 uppercase leading-loose">
                      {isRateLimit ? '1. Avoid manual synchronization burst.\n2. Allow 30-60 seconds for buffer clearing.\n3. Background polling has been throttled.' : (this.state.error?.stack || "No trace available in encrypted buffer.")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Protocols */}
              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={this.handleReset}
                  className={`flex-1 py-5 text-white font-heading font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95 ${isRateLimit ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'}`}
                >
                  {isRateLimit ? 'Retry_Neural_Sync' : 'Attempt_Buffer_Reset'}
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-10 py-5 glass border-white/10 text-slate-400 hover:text-white font-heading font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                >
                  Reload_Core_OS
                </button>
              </div>

              <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-[0.4em] pt-4 animate-pulse">
                GMT_TACTICAL_AUTO_RECOVERY_V4.0 // END_OF_REPORT
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Fix: Final fallback to returning children from props.
    return this.props.children;
  }
}
