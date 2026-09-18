// Rough token/cost estimation and running usage tracking, stored client-side.
// Pricing is approximate (USD per 1M tokens) and only meant to give the user
// a ballpark sense of spend, not an exact bill.

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface UsageEntry {
  id: string;
  model: string;
  tabSource: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  timestamp: number;
}

// USD per 1,000,000 tokens, [input, output]
const TEXT_MODEL_PRICING: Record<string, [number, number]> = {
  'gpt-4o': [2.5, 10],
  'gpt-4o-mini': [0.15, 0.6],
  'gemini-2.0-flash': [0.1, 0.4],
  'gemini-2.0-flash-lite': [0.075, 0.3],
  'gemini-1.5-flash': [0.075, 0.3],
  'gemini-1.5-pro': [1.25, 5],
};

// Flat USD cost per generated image, keyed by "model:size" (falls back to model default)
const IMAGE_MODEL_PRICING: Record<string, number> = {
  'dall-e-3:1024x1024': 0.04,
  'dall-e-3': 0.04,
  'dall-e-2:1024x1024': 0.02,
  'dall-e-2:512x512': 0.018,
  'dall-e-2:256x256': 0.016,
  'dall-e-2': 0.02,
};

const DEFAULT_TEXT_PRICING: [number, number] = [1, 3];

const STORAGE_KEY = 'socr-ai-bot.usage-log';
const MAX_LOG_ENTRIES = 200;

type UsageListener = () => void;
const listeners = new Set<UsageListener>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function subscribeUsage(cb: UsageListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function estimateTextCost(model: string, usage: TokenUsage): number {
  const [inputRate, outputRate] = TEXT_MODEL_PRICING[model] || DEFAULT_TEXT_PRICING;
  return (usage.promptTokens / 1_000_000) * inputRate + (usage.completionTokens / 1_000_000) * outputRate;
}

export function estimateImageCost(model: string, size: string): number {
  return IMAGE_MODEL_PRICING[`${model}:${size}`] ?? IMAGE_MODEL_PRICING[model] ?? 0.04;
}

// Very rough fallback estimate (~4 chars/token) for providers that don't report usage.
export function estimateTokensFromText(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function readLog(): UsageEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: UsageEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_LOG_ENTRIES)));
}

export function recordUsage(entry: Omit<UsageEntry, 'id' | 'timestamp'>): UsageEntry {
  const full: UsageEntry = {
    ...entry,
    id: `usage-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
  };
  const log = readLog();
  log.push(full);
  writeLog(log);
  notify();
  return full;
}

export function getUsageLog(): UsageEntry[] {
  return readLog();
}

export function getSessionTotalCost(): number {
  return readLog().reduce((sum, e) => sum + e.costUsd, 0);
}

export function getSessionTotalTokens(): number {
  return readLog().reduce((sum, e) => sum + e.promptTokens + e.completionTokens, 0);
}

export function clearUsage(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

export function formatCost(usd: number): string {
  if (usd === 0) return '$0.00';
  if (usd < 0.01) return `<$0.01`;
  return `$${usd.toFixed(2)}`;
}
