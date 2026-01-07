
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Safe polyfill for process.env
const globalWindow = window as any;
if (typeof globalWindow.process === 'undefined') {
  globalWindow.process = { env: {} };
}
if (!globalWindow.process.env) {
  globalWindow.process.env = {};
}
// Inject key if available on window or defined previously
globalWindow.process.env.API_KEY = globalWindow.process.env.API_KEY || globalWindow.API_KEY || '';

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
        <h1 style="font-size: 24px; margin-bottom: 10px; font-weight: 800;">SYSTEM_BOOT_FAILURE</h1>
        <p style="font-size: 14px; opacity: 0.7; max-width: 400px; font-family: monospace;">Neural uplink synchronization failed. Error: ${error instanceof Error ? error.message : 'Unknown Core Fault'}</p>
        <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Re-initialize Uplink</button>
      </div>
    `;
  }
} else {
  console.error("Failed to find root container");
}
