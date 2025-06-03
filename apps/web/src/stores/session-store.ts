import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, SessionConfig, Message, ModelConfig } from '@attackforge/shared';

interface SessionStore {
  // Current session
  currentSession: Session | null;
  sessions: Session[];
  
  // Model configurations
  modelConfigs: ModelConfig[];
  
  // Actions
  createSession: (name: string, config: SessionConfig) => void;
  loadSession: (sessionId: string) => void;
  updateSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  
  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  
  // Model config actions
  addModelConfig: (config: ModelConfig) => void;
  updateModelConfig: (config: ModelConfig) => void;
  deleteModelConfig: (configId: string) => void;
  
  // Utility actions
  clearSessions: () => void;
  exportSession: (sessionId: string, format: 'json' | 'markdown') => string;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      modelConfigs: [],
      
      createSession: (name: string, config: SessionConfig) => {
        const newSession: Session = {
          id: crypto.randomUUID(),
          name,
          config,
          messages: [],
          createdAt: new Date().toISOString(),
          status: 'active',
        };
        
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession,
        }));
      },
      
      loadSession: (sessionId: string) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },
      
      updateSession: (session: Session) => {
        set((state) => ({
          sessions: state.sessions.map(s => s.id === session.id ? session : s),
          currentSession: state.currentSession?.id === session.id ? session : state.currentSession,
        }));
      },
      
      deleteSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        }));
      },
      
      addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };
        
        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, newMessage],
        };
        
        get().updateSession(updatedSession);
      },
      
      editMessage: (messageId: string, content: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          messages: currentSession.messages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  content,
                  isEdited: true,
                  originalContent: msg.originalContent || msg.content,
                }
              : msg
          ),
        };
        
        get().updateSession(updatedSession);
      },
      
      deleteMessage: (messageId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          messages: currentSession.messages.filter(msg => msg.id !== messageId),
        };
        
        get().updateSession(updatedSession);
      },
      
      addModelConfig: (config: ModelConfig) => {
        set((state) => ({
          modelConfigs: [...state.modelConfigs, config],
        }));
      },
      
      updateModelConfig: (config: ModelConfig) => {
        set((state) => ({
          modelConfigs: state.modelConfigs.map(c => c.id === config.id ? config : c),
        }));
      },
      
      deleteModelConfig: (configId: string) => {
        set((state) => ({
          modelConfigs: state.modelConfigs.filter(c => c.id !== configId),
        }));
      },
      
      clearSessions: () => {
        set({ sessions: [], currentSession: null });
      },
      
      exportSession: (sessionId: string, format: 'json' | 'markdown') => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return '';
        
        if (format === 'json') {
          return JSON.stringify({
            session,
            format,
            exportedAt: new Date().toISOString(),
          }, null, 2);
        }
        
        // Markdown export
        let markdown = `# ${session.name}\n\n`;
        markdown += `**Created:** ${new Date(session.createdAt).toLocaleString()}\n`;
        markdown += `**Status:** ${session.status}\n\n`;
        
        markdown += `## Configuration\n\n`;
        markdown += `**Red Teamer:** ${session.config.redTeamer.name}\n`;
        markdown += `**Target:** ${session.config.target.name}\n`;
        if (session.config.judge) {
          markdown += `**Judge:** ${session.config.judge.name}\n`;
        }
        markdown += `\n`;
        
        markdown += `## Conversation\n\n`;
        session.messages.forEach((msg, index) => {
          markdown += `### Message ${index + 1} (${msg.role})\n`;
          markdown += `**Time:** ${new Date(msg.timestamp).toLocaleString()}\n`;
          if (msg.isEdited) {
            markdown += `**Edited:** Yes\n`;
          }
          markdown += `\n${msg.content}\n\n`;
        });
        
        return markdown;
      },
    }),
    {
      name: 'attackforge-session-store',
      partialize: (state) => ({
        sessions: state.sessions,
        modelConfigs: state.modelConfigs,
      }),
    }
  )
); 