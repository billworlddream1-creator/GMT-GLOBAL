
/**
 * GMT_SECURE_STORAGE_PROTOCOL_V1
 * Implements AES-GCM encryption for local persistence.
 */

const ENCRYPTION_KEY_NAME = 'gmt_neural_salt';

// Internal salt management
const getOrCreateSalt = () => {
  let salt = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (!salt) {
    salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(ENCRYPTION_KEY_NAME, salt);
  }
  return salt;
};

const deriveKey = async (salt: string) => {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(salt),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('GMT_STABILITY_SALT'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptSensitiveData = async (data: string): Promise<string> => {
  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error("ENCRYPTION_FAILURE:", e);
    return data; // Fallback to raw if crypto fails
  }
};

export const decryptSensitiveData = async (encryptedBase64: string): Promise<string> => {
  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(salt);
    const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("DECRYPTION_FAILURE:", e);
    // If it's not base64/encrypted, it might be legacy raw data
    return encryptedBase64; 
  }
};
