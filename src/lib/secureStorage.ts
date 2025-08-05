import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'openai_api_key';
const SECRET = import.meta.env.VITE_API_KEY_SECRET || 'default_secret';

export function saveApiKey(apiKey: string) {
  const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export function getApiKey(): string | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (e) {
    return null;
  }
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}
