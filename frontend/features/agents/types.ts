export interface Agent {
  id: number;
  name: string;
  description: string;
  provider: string;
  model: string;
  systemPrompt: string;
}