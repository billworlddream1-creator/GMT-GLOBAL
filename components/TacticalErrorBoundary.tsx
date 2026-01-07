import React, { ErrorInfo, ReactNode } from 'react';
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
}

/**
 * TacticalErrorBoundary
 * Captures core component failures and displays a tactical GMT incident report.
 */
export default class TacticalErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    incidentId: null
  };

  /**
   * Static method required by React to update state when a crash occurs.
   */
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method to handle the side effects of a crash.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const incidentId = `INC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    this.setState({ errorInfo, incidentId });
    
    // Log to console with tactical styling
    console.group(`%c GMT_INCIDENT_REPORT: ${incidentId} `, 'background: #ef4444; color: white; font-weight: bold;');
    console.error("FAULT_LOCATION:", this.props.moduleName || "UNKNOWN_MODULE");
    console.error("ERROR_STACK:", error);
    console.groupEnd();
    
    playUISound('alert');
  }

  /**
   * Logic to reset the boundary and attempt re-initialization.
   */
  private handleReset = () => {
    playUISound('startup');
    this.setState({ hasError: false, error: null, errorInfo: null, incidentId: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 lg:p-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-full max-w-4xl glass p-1 rounded-[3.5rem] bg-red-950/20 border-red-500/30 overflow-hidden shadow-2xl relative">
            {/* Header: Identity Bar */}
            <div className="bg-red-600 px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <h2 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em]">Incident_Intelligence_Report</h2>
              </div>
              <span className="text-[9px] font-mono text-white/70 font-black tracking-widest">{this.state.incidentId}</span>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Visual Alert */}
                <div className="flex flex-col items-center justify-center space-y-6 border-r border-white/5 pr-10">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-red-500/40 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-4 border border-red-500/20 rounded-full flex items-center justify-center text-5xl">📡</div>
                    <div className="absolute inset-[-10px] border border-red-500 rounded-full animate-ping opacity-10"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">Core_Data_Fault</h3>
                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest leading-relaxed">
                      Sector: {this.props.moduleName || 'Global_Matrix'}<br/>
                      Status: DATA_CORRUPTION_DETECTED
                    </p>
                  </div>
                </div>

                {/* Technical Dossier */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fault_Summary</label>
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl font-mono text-[10px] text-red-300 leading-relaxed italic">
                      "{this.state.error?.message || "Undefined logical collapse during data synthesis."}"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Stack_Trace_Dump</label>
                    <div className="p-4 bg-black/60 border border-white/5 rounded-2xl h-32 overflow-y-auto no-scrollbar font-mono text-[8px] text-slate-500 uppercase leading-loose">
                      {this.state.error?.stack || "No trace available in encrypted buffer."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Protocols */}
              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={this.handleReset}
                  className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white font-heading font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95"
                >
                  Attempt_Buffer_Reset
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-10 py-5 glass border-white/10 text-slate-400 hover:text-white font-heading font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95"
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

    return this.props.children;
  }
}