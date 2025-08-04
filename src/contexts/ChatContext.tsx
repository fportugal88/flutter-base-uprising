import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  suggestions?: any[];
  richCard?: any;
  reviewCard?: any;
  loading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage: Date;
  messages: Message[];
  requestId?: string;
  status: 'active' | 'completed' | 'archived';
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createNewSession: (title?: string) => string;
  loadSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  addMessageToSession: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  linkSessionToRequest: (sessionId: string, requestId: string) => void;
  getSessionByRequest: (requestId: string) => ChatSession | undefined;
  archiveSession: (sessionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const createNewSession = (title?: string): string => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: title || 'Nova conversa',
      createdAt: new Date(),
      lastMessage: new Date(),
      messages: [],
      status: 'active'
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession.id;
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title }
        : session
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title } : null);
    }
  };

  const addMessageToSession = (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages: [...session.messages, newMessage],
            lastMessage: new Date()
          }
        : session
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: new Date()
      } : null);
    }
  };

  const linkSessionToRequest = (sessionId: string, requestId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, requestId, status: 'completed' as const }
        : session
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, requestId, status: 'completed' } : null);
    }
  };

  const getSessionByRequest = (requestId: string): ChatSession | undefined => {
    return sessions.find(session => session.requestId === requestId);
  };

  const archiveSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'archived' as const }
        : session
    ));
  };

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSession,
      createNewSession,
      loadSession,
      updateSessionTitle,
      addMessageToSession,
      linkSessionToRequest,
      getSessionByRequest,
      archiveSession
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}