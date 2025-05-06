import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API key storage utilities
const STORAGE_KEYS = {
  OPENAI_API_KEY: 'socr-ai-bot.openai-api-key',
  GEMINI_API_KEY: 'socr-ai-bot.gemini-api-key',
  TEMPERATURE: 'socr-ai-bot.temperature',
  RETRY_ON_ERROR: 'socr-ai-bot.retry-on-error',
};

export const apiKeyStorage = {
  // Set the API keys
  setOpenAIApiKey: (key: string): void => {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
    }
  },
  
  setGeminiApiKey: (key: string): void => {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    }
  },
  
  // Get the API keys with fallback to environment variables
  getOpenAIApiKey: (): string | null => {
    const userKey = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
    // Fallback to env variable for development
    return userKey || import.meta.env.VITE_OPENAI_API_KEY || null;
  },
  
  getGeminiApiKey: (): string | null => {
    const userKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
    // Fallback to env variable for development
    return userKey || import.meta.env.VITE_GEMINI_API_KEY || null;
  },
  
  // Setting and getting other preferences
  setTemperature: (temp: number): void => {
    localStorage.setItem(STORAGE_KEYS.TEMPERATURE, temp.toString());
  },
  
  getTemperature: (): number => {
    const temp = localStorage.getItem(STORAGE_KEYS.TEMPERATURE);
    return temp ? parseFloat(temp) : 0.7; // Default to 0.7 if not set
  },
  
  setRetryOnError: (retry: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.RETRY_ON_ERROR, retry ? '1' : '0');
  },
  
  getRetryOnError: (): boolean => {
    const retry = localStorage.getItem(STORAGE_KEYS.RETRY_ON_ERROR);
    return retry === '1';
  },
  
  // Check if API keys are available
  hasOpenAIApiKey: (): boolean => {
    return !!apiKeyStorage.getOpenAIApiKey();
  },
  
  hasGeminiApiKey: (): boolean => {
    return !!apiKeyStorage.getGeminiApiKey();
  },
  
  // Clear all settings
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    localStorage.removeItem(STORAGE_KEYS.TEMPERATURE);
    localStorage.removeItem(STORAGE_KEYS.RETRY_ON_ERROR);
  }
};
