import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Archive, Clock, CheckCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  onNewChat: () => void;
}

export function ChatSidebar({ onNewChat }: ChatSidebarProps) {
  const { sessions, currentSession, loadSession } = useChat();

  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'completed');

  const getSessionIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova conversa
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma conversa ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em "Nova conversa" para começar
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-accent/50",
                    currentSession?.id === session.id 
                      ? "bg-accent text-accent-foreground" 
                      : "text-foreground"
                  )}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium truncate pr-2">
                      {session.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      {getSessionIcon(session.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.lastMessage)}
                      </span>
                    </div>
                  </div>
                  
                  {session.messages.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {session.messages[session.messages.length - 1]?.content}
                    </p>
                  )}
                  
                  {session.requestId && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {session.requestId}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          {activeSessions.length} conversa{activeSessions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}