
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Polyfill for process.env to prevent crashes on static hosting like Netlify
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' // Will be populated by build tools or remain empty
    }
  };
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical rendering error:", error);
    container.innerHTML = `
      <div style="color: #ef4444; background: #020617; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">SYSTEM_BOOT_FAILURE</h1>
        <p style="font-size: 14px; opacity: 0.7; max-width: 400px;">The neural uplink failed to initialize. Ensure your API_KEY is configured in your environment variables.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry Uplink</button>
      </div>
    `;
  }
} else {
  console.error("Failed to find root container");
}
