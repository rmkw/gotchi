export type GotchiAiProvider = 'gemini' | 'minimax';

export interface GotchiAiConfig {
  provider: GotchiAiProvider;
  apiKey: string;
  model: string;
}

export interface GotchiAiContext {
  name: string;
  mood: string;
  statusMessage: string;
  health: number;
  food: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  isSleeping: boolean;
  isDead: boolean;
}

export interface GotchiAiTestResult {
  ok: boolean;
  message: string;
}
