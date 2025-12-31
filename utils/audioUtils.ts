
export const playVocalFeedback = (type: 'click' | 'success' | 'alert' | 'startup') => {
  if (!('speechSynthesis' in window)) return;

  const phrases = {
    click: ['Acknowledged', 'Confirmed', 'Accessing', 'Processing', 'Node Fixed'],
    success: ['Uplink Stable', 'Sync Complete', 'Data Secured', 'Encryption Active'],
    alert: ['Warning', 'Signal Loss', 'Threat Detected', 'Unauthorized'],
    startup: ['GMT Global Online', 'Neural Handshake Initialized', 'OS Loading']
  };

  const synth = window.speechSynthesis;
  const phraseList = phrases[type];
  const text = phraseList[Math.floor(Math.random() * phraseList.length)];
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  
  // Filter for English voices
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  
  if (enVoices.length > 0) {
    // Randomly pick a voice from the system
    utterance.voice = enVoices[Math.floor(Math.random() * enVoices.length)];
  }

  // Randomize pitch/rate to simulate different male/female personas
  // 0.7-0.9 pitch roughly simulates deeper male tones, 1.1-1.4 simulates higher female tones
  const isAltPersona = Math.random() > 0.5;
  utterance.pitch = isAltPersona ? 0.75 : 1.25;
  utterance.rate = 1.2;
  utterance.volume = 0.5;

  synth.cancel(); // Stop current speech to avoid stacking
  synth.speak(utterance);
};

/**
 * Triggered by UI interactions. 
 * Oscillator-based sounds have been removed per request, 
 * leaving only randomized vocal feedback.
 */
export const playUISound = (type: 'click' | 'hover' | 'alert' | 'startup' | 'success' | 'share') => {
  // We only trigger vocal feedback for significant interactions
  if (type === 'click' || type === 'alert' || type === 'success' || type === 'startup' || type === 'share') {
    // Mapping 'share' to 'success' vocal pool
    const feedbackType = type === 'share' ? 'success' : type as 'click' | 'success' | 'alert' | 'startup';
    playVocalFeedback(feedbackType);
  }
  
  // Synthetic beep logic removed to leave only male/female voices
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
