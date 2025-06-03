import { z } from 'zod';

// Model configuration schema
export const modelConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  systemPrompt: z.string().optional(),
});

// Session configuration schema
export const sessionConfigSchema = z.object({
  redTeamer: modelConfigSchema,
  target: modelConfigSchema,
  judge: modelConfigSchema.optional(),
});

// Message schema
export const messageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['red-teamer', 'target', 'judge', 'user']),
  content: z.string(),
  timestamp: z.string(),
  isEdited: z.boolean(),
  originalContent: z.string().optional(),
});

// Session schema
export const sessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  config: sessionConfigSchema,
  messages: z.array(messageSchema),
  createdAt: z.string(),
  status: z.enum(['active', 'completed']),
});

// Chat request schema
export const chatRequestSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).optional(),
});

// Chat response schema
export const chatResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: z.object({
      role: z.string(),
      content: z.string(),
    }),
    finish_reason: z.string(),
  })),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }).optional(),
});

// Export schema
export const exportDataSchema = z.object({
  session: sessionSchema,
  format: z.enum(['json', 'markdown']),
  exportedAt: z.string(),
}); 