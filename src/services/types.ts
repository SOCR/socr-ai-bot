export type Role = 'user' | 'assistant' | 'model' | 'system';

export interface ChatMessage {
  role: Role;
  content: string;
}