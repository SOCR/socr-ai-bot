// Lightweight, no-cost API key validation used by the Settings dialog so a bad
// key is caught at save time instead of on first real generation request.

export type KeyValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'unknown';

export interface KeyValidationResult {
  status: KeyValidationStatus;
  message: string;
}

export async function validateOpenAIKey(key: string): Promise<KeyValidationResult> {
  if (!key.trim()) return { status: 'idle', message: '' };
  if (!/^sk-/.test(key.trim())) {
    return { status: 'invalid', message: 'OpenAI keys normally start with "sk-".' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });

    if (response.ok) {
      return { status: 'valid', message: 'Key verified.' };
    }
    if (response.status === 401) {
      return { status: 'invalid', message: 'OpenAI rejected this key (401 Unauthorized).' };
    }
    return { status: 'unknown', message: `Could not verify key (HTTP ${response.status}). It will be used as-is.` };
  } catch {
    return { status: 'unknown', message: 'Could not reach OpenAI to verify the key. It will be used as-is.' };
  }
}

export async function validateGeminiKey(key: string): Promise<KeyValidationResult> {
  if (!key.trim()) return { status: 'idle', message: '' };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key.trim())}`
    );

    if (response.ok) {
      return { status: 'valid', message: 'Key verified.' };
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return { status: 'invalid', message: 'Google rejected this key.' };
    }
    return { status: 'unknown', message: `Could not verify key (HTTP ${response.status}). It will be used as-is.` };
  } catch {
    return { status: 'unknown', message: 'Could not reach Google to verify the key. It will be used as-is.' };
  }
}
