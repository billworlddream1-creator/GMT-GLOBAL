
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    // Fix: Explicitly cast gl context to WebGLRenderingContext to resolve missing properties on generic RenderingContext
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    
    // Check for essential WebGL features
    // Fix: getExtension is now accessible via the casted gl variable
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      // Fix: getParameter is now accessible via the casted gl variable
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Fix: Ensure renderer is a string before calling includes to satisfy compiler
      if (typeof renderer === 'string' && renderer.includes('Mali-400')) {
        // Known problematic GPU for complex R3F scenes
        return false;
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}
