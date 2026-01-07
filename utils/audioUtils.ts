
let sharedAudioCtx: AudioContext | null = null;

export const getSharedAudioContext = (sampleRate: number = 24000): AudioContext => {
  if (!sharedAudioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass({ sampleRate });
  } else if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

export const playVocalFeedback = (type: 'click' | 'success' | 'alert' | 'startup') => {
  if (!('speechSynthesis' in window)) return;

  const phrases = {
    click: ['Acknowledged', 'Confirmed', 'Accessing', 'Processing', 'Node Fixed'],
    success: ['Uplink Stable', 'Sync Complete', 'Data Secured', 'Encryption Active'],
    alert: ['Warning', 'Signal Loss', 'Threat Detected', 'Unauthorized'],
    startup: ['GMT Global Intel Online', 'Neural Handshake Initialized', 'OS Loading']
  };

  const synth = window.speechSynthesis;
  const phraseList = phrases[type];
  const text = phraseList[Math.floor(Math.random() * phraseList.length)];
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const enVoices = voices.filter(v => v.lang.startsWith('en'));
  
  if (enVoices.length > 0) {
    utterance.voice = enVoices[Math.floor(Math.random() * enVoices.length)];
  }

  const isAltPersona = Math.random() > 0.5;
  utterance.pitch = isAltPersona ? 0.75 : 1.25;
  utterance.rate = 1.2;
  utterance.volume = 0.4; // Lower volume for less intrusive feedback

  synth.cancel(); 
  synth.speak(utterance);
};

export const playUISound = (type: 'click' | 'hover' | 'alert' | 'startup' | 'success' | 'share') => {
  if (type === 'click' || type === 'alert' || type === 'success' || type === 'startup' || type === 'share') {
    const feedbackType = type === 'share' ? 'success' : type as 'click' | 'success' | 'alert' | 'startup';
    playVocalFeedback(feedbackType);
  }
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
