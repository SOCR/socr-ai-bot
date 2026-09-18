// Persists Generate-tab work to localStorage so a page refresh doesn't lose
// prompts/code/results, and lets users save/restore named sessions.

export interface GenerateSessionData {
  prompt: string;
  selectedModel: string;
  selectedDataset: string | null;
  datasetName: string | null;
  result: {
    code: string;
    output: string;
    error?: string;
    plot?: string;
    datasetSummary?: string;
    datasetRows?: any[];
  } | null;
}

export interface SavedSession {
  id: string;
  name: string;
  createdAt: number;
  data: GenerateSessionData;
}

const DRAFT_KEY = 'socr-ai-bot.generate-draft';
const SESSIONS_KEY = 'socr-ai-bot.generate-sessions';
const MAX_SAVED_SESSIONS = 25;

export function saveDraft(data: GenerateSessionData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable - silently skip autosave
  }
}

export function loadDraft(): GenerateSessionData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

function readSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: SavedSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SAVED_SESSIONS)));
}

export function saveSession(name: string, data: GenerateSessionData): SavedSession {
  const session: SavedSession = {
    id: `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || `Session ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    data,
  };
  const sessions = [session, ...readSessions()];
  writeSessions(sessions);
  return session;
}

export function listSessions(): SavedSession[] {
  return readSessions().sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteSession(id: string): void {
  writeSessions(readSessions().filter((s) => s.id !== id));
}
