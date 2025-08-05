import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  deleteSession: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setCurrentSession(null);
      return;
    }

    supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id as any)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading sessions', error);
          return;
        }
        const loaded = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          createdAt: new Date(row.created_at),
          lastMessage: new Date(row.last_message_at),
          messages: [],
          requestId: row.request_id || undefined,
          status: row.status as 'active' | 'completed' | 'archived',
        }));
        setSessions(loaded);
      });
  }, [user]);

  const createNewSession = (title?: string): string => {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const newSession: ChatSession = {
      id,
      title: title || 'Nova conversa',
      createdAt,
      lastMessage: createdAt,
      messages: [],
      status: 'active'
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);

    if (user) {
      supabase.from('chat_sessions').insert({
        user_id: user.id,
        title: newSession.title,
        status: 'active'
      } as any).then(({ error }) => {
        if (error) console.error('Error creating session', error);
      });
    }

    return id;
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      if (session.messages.length === 0) {
        supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId as any)
          .order('created_at', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error('Error loading messages', error);
              return;
            }
            const msgs = (data || []).map((row: any) => ({
              id: row.id,
              type: row.sender as 'user' | 'assistant',
              content: row.content,
              timestamp: new Date(row.created_at)
            }));
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: msgs } : s));
            setCurrentSession(prev => prev && prev.id === sessionId ? { ...prev, messages: msgs } : prev);
          });
      }
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

    supabase.from('chat_sessions').update({ title } as any).eq('id', sessionId as any);
  };

  const addMessageToSession = (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const timestamp = new Date();
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp
    };

    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? {
            ...session,
            messages: [...session.messages, newMessage],
            lastMessage: timestamp
          }
        : session
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: timestamp
      } : null);
    }

    supabase.from('chat_messages').insert({
      session_id: sessionId,
      sender: newMessage.type,
      content: newMessage.content
    } as any).then(({ error }) => {
      if (error) console.error('Error saving message', error);
    });

    supabase.from('chat_sessions').update({ 
      last_message_at: timestamp.toISOString() 
    } as any).eq('id', sessionId as any);
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

    supabase.from('chat_sessions').update({ 
      request_id: requestId, 
      status: 'completed' 
    } as any).eq('id', sessionId as any);
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

    supabase.from('chat_sessions').update({ status: 'archived' } as any).eq('id', sessionId as any);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Delete messages first (foreign key constraint)
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      // Update local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting active session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
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
      archiveSession,
      deleteSession
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