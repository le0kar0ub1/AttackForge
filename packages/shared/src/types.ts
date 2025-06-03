// Model configuration with custom endpoints
export interface ModelConfig {
  id: string;
  name: string;
  apiUrl: string;           // Custom API endpoint
  apiKey: string;           // Model-specific API key
  model: string;            // Model name for API calls
  systemPrompt?: string;
}

// Session setup
export interface SessionConfig {
  redTeamer: ModelConfig;
  target: ModelConfig;
  judge?: ModelConfig;      // Optional judge model
}

// Conversation message
export interface Message {
  id: string;
  role: 'red-teamer' | 'target' | 'judge' | 'user';
  content: string;
  timestamp: string;
  isEdited: boolean;
  originalContent?: string;
}

// Conversation session
export interface Session {
  id: string;
  name: string;
  config: SessionConfig;
  messages: Message[];
  createdAt: string;
  status: 'active' | 'completed';
}

// API request/response types
export interface ChatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Export types
export type ExportFormat = 'json' | 'markdown';

export interface ExportData {
  session: Session;
  format: ExportFormat;
  exportedAt: string;
} 