import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { useChat } from "@/contexts/ChatContext";
import { sendChatMessage } from "@/lib/llm";
import { logError } from "@/lib/logger";
import type { Message as ChatMessage } from "@/contexts/ChatContext";
import { AppLayout } from "@/components/layout/AppLayout";

const SYSTEM_PROMPT = `Você é um assistente de IA útil e amigável. Responda de forma clara e objetiva às perguntas dos usuários.`;

const DataAssistantWithSidebar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentSession, 
    createNewSession, 
    loadSession, 
    addMessageToSession
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load specific session if chatId is provided
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      loadSession(chatId);
    }
  }, [searchParams, loadSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (currentSession) {
      addMessageToSession(currentSession.id, message);
    }
  };

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleNewChat = async () => {
    try {
      await createNewSession('Nova descoberta');
    } catch (e) {
      console.error('Erro ao criar sessão:', e);
      return;
    }

    try {
      const response = await sendChatMessage([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Inicie a conversa cumprimentando o usuário.' }
      ]);
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: response
        });
      });
    } catch (e) {
      logError('Erro ao chamar OpenAI:', e);
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Olá! Sou seu assistente de IA. Como posso ajudá-lo hoje?'
        });
      });
    }
  };

  const handleStartConversation = () => {
    if (!currentSession) {
      handleNewChat();
    }
  };



  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;

    const message = inputValue.trim();
    setInputValue('');

    addMessage({
      type: 'user',
      content: message
    });

    // Get conversation history
    const history = currentSession.messages.map(m => ({ 
      role: m.type === 'user' ? 'user' as const : 'assistant' as const, 
      content: m.content 
    }));

    try {
      setIsTyping(true);
      const aiResponse = await sendChatMessage([
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ]);
      
      setIsTyping(false);
      addMessage({
        type: 'assistant',
        content: aiResponse
      });
    } catch (e) {
      logError('Erro ao chamar OpenAI:', e);
      setIsTyping(false);
      addMessage({
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Show welcome screen if no session
  if (!currentSession) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          {/* Subheader que ocupa toda largura */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b bg-card gap-3">
            <div className="flex items-center w-full sm:w-auto">
              <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Descobrir</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Transforme perguntas em respostas. Solicite, explore e ganhe tempo com dados inteligentes.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleNewChat}
              className="w-full sm:w-auto h-12 text-base"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Nova Descoberta
            </Button>
          </div>

          {/* Área de conteúdo com sidebar + chat */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-border bg-card hidden md:block">
              <ChatSidebar onNewChat={handleNewChat} />
            </div>

            {/* Welcome Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <div className="mb-6 sm:mb-8">
                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-accent mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Descobrir</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                  Transforme perguntas em respostas. Solicite, explore e ganhe tempo com dados inteligentes.
                </p>
              </div>

              {/* Chat Ready Indicator */}
              <div className="mb-6 w-full max-w-2xl">
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Sistema de chat configurado e pronto para uso
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={handleStartConversation}
                size="lg"
                className="w-full max-w-xs h-12 text-base"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Iniciar Conversa
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Main chat interface
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Subheader que ocupa toda largura */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b bg-card gap-3">
          <div className="flex items-center w-full sm:w-auto">
            <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Descobrir</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {currentSession.title}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleNewChat}
            className="w-full sm:w-auto h-12 text-base"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Nova Descoberta
          </Button>
        </div>

        {/* Área de conteúdo com sidebar + chat */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-card hidden md:block">
            <ChatSidebar onNewChat={handleNewChat} />
          </div>
          
          <div className="flex-1 flex flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession.messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border-border'
                }`}>
                  <CardContent className="p-3">
                    {message.type === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-body-medium whitespace-pre-line">{message.content}</p>
                    )}
                  </CardContent>
                </Card>
                
                <p className="text-xs text-muted-foreground mt-1 px-3">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage}
              size="icon"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DataAssistantWithSidebar;