import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ArrowLeft, Check, Database, Clock, Tag } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  suggestions?: DataSuggestion[];
  loading?: boolean;
}

interface DataSuggestion {
  name: string;
  lastUpdate: string;
  platform: string;
  tags: string[];
}

type ConversationStep = 
  | 'welcome' 
  | 'initial' 
  | 'context' 
  | 'data-type' 
  | 'time-period' 
  | 'suggestions' 
  | 'confirmation';

const DataAssistant = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ConversationStep>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [requestData, setRequestData] = useState({
    objective: '',
    dataType: '',
    timePeriod: '',
    requestId: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleStartConversation = () => {
    setCurrentStep('initial');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Oi! Eu posso te ajudar a solicitar dados, consultar se algo já existe ou tirar dúvidas.',
        quickReplies: ['Solicitar dados', 'Consultar catálogo', 'Tenho uma dúvida']
      });
    });
  };

  const handleQuickReply = (reply: string) => {
    addMessage({
      type: 'user',
      content: reply
    });

    if (reply === 'Solicitar dados') {
      setCurrentStep('context');
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Legal! Qual é o objetivo dessa solicitação? (ex: relatório, campanha, decisão...)',
          quickReplies: ['Campanha de CRM', 'Análise de Vendas', 'Painel Executivo', 'Outro']
        });
      });
    } else if (reply === 'Consultar catálogo') {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Vou te mostrar nosso catálogo de dados disponíveis. O que você está procurando?'
        });
      });
    } else if (reply === 'Tenho uma dúvida') {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Claro! Qual é sua dúvida? Estou aqui para ajudar.'
        });
      });
    }
  };

  const handleContextSubmit = (context: string) => {
    setRequestData(prev => ({ ...prev, objective: context }));
    addMessage({
      type: 'user',
      content: context
    });

    setCurrentStep('data-type');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Entendi! Agora selecione o tipo de informação que você precisa.',
        quickReplies: ['Clientes', 'Transações', 'Produtos', 'Outros']
      });
    });
  };

  const handleDataTypeSelect = (dataType: string) => {
    setRequestData(prev => ({ ...prev, dataType }));
    addMessage({
      type: 'user',
      content: dataType
    });

    setCurrentStep('time-period');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Você precisa de dados de qual período?',
        quickReplies: ['Últimos 7 dias', 'Últimos 30 dias', 'Escolher intervalo']
      });
    });
  };

  const handleTimePeriodSelect = (period: string) => {
    setRequestData(prev => ({ ...prev, timePeriod: period }));
    addMessage({
      type: 'user',
      content: period
    });

    setCurrentStep('suggestions');
    simulateTyping(() => {
      const suggestion: DataSuggestion = {
        name: 'transacoes_crm_ultimos_30_dias',
        lastUpdate: '02/08/2025',
        platform: 'Databricks',
        tags: ['Clientes', 'CRM', 'Atualizado']
      };

      addMessage({
        type: 'assistant',
        content: 'Acho que encontrei algo parecido com o que você precisa.',
        suggestions: [suggestion]
      });
    }, 2000);
  };

  const handleUseSuggestion = () => {
    addMessage({
      type: 'user',
      content: 'Usar essa tabela'
    });

    setCurrentStep('confirmation');
    const requestId = '#' + Math.floor(Math.random() * 10000);
    setRequestData(prev => ({ ...prev, requestId }));

    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: `Sua solicitação foi registrada com sucesso! O time de dados vai analisar e você poderá acompanhar o status em 'Minhas Solicitações'.

ID da solicitação: ${requestId}
SLA estimado: até 3 dias úteis`
      });
    });
  };

  const handleRejectSuggestion = () => {
    addMessage({
      type: 'user',
      content: 'Não é isso que eu preciso'
    });

    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Sem problema! Vou registrar sua solicitação personalizada para o time de dados analisar.'
      });
      
      const requestId = '#' + Math.floor(Math.random() * 10000);
      setRequestData(prev => ({ ...prev, requestId }));
      setCurrentStep('confirmation');
      
      setTimeout(() => {
        addMessage({
          type: 'assistant',
          content: `Solicitação registrada com sucesso!

ID da solicitação: ${requestId}
SLA estimado: até 3 dias úteis`
        });
      }, 1000);
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue('');

    if (currentStep === 'context') {
      handleContextSubmit(message);
    } else {
      addMessage({
        type: 'user',
        content: message
      });

      // Placeholder para integração futura com IA
      // TODO: Chamar função de IA aqui
      // const aiResponse = await callAIFunction(message);
      
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Interessante! Como posso ajudar você com isso?' // Será substituído pela resposta da IA
        });
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="icon" className="mr-3" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
          <h1 className="text-headline-large text-foreground">Assistente de Dados</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-8">
            <MessageCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h2 className="text-display-small text-foreground mb-2">Assistente de Dados</h2>
            <p className="text-body-large text-muted-foreground max-w-sm mx-auto">
              Converse comigo para solicitar ou consultar dados.
            </p>
          </div>

          <Button 
            onClick={handleStartConversation}
            size="lg"
            className="w-full max-w-sm"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Iniciar Conversa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="icon" className="mr-3" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-headline-large text-foreground">Assistente de Dados</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <Card className={`${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border-border'
              }`}>
                <CardContent className="p-3">
                  <p className="text-body-medium whitespace-pre-line">{message.content}</p>
                  
                  {/* Quick Replies */}
                  {message.quickReplies && (
                    <div className="mt-3 space-y-2">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="mr-2 mb-2"
                          onClick={() => {
                            if (currentStep === 'initial') {
                              handleQuickReply(reply);
                            } else if (currentStep === 'context') {
                              handleContextSubmit(reply);
                            } else if (currentStep === 'data-type') {
                              handleDataTypeSelect(reply);
                            } else if (currentStep === 'time-period') {
                              handleTimePeriodSelect(reply);
                            }
                          }}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Data Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3">
                      {message.suggestions.map((suggestion, index) => (
                        <Card key={index} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <Database className="h-5 w-5 text-accent mr-2 mt-0.5" />
                                <div>
                                  <h4 className="text-label-large text-foreground font-mono">
                                    {suggestion.name}
                                  </h4>
                                  <div className="flex items-center text-body-medium text-muted-foreground mt-1">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Última atualização: {suggestion.lastUpdate}
                                  </div>
                                  <p className="text-body-medium text-muted-foreground">
                                    Disponível em: {suggestion.platform}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {suggestion.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleUseSuggestion}
                                className="flex-1"
                              >
                                Usar essa tabela
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleRejectSuggestion}
                                className="flex-1"
                              >
                                Não é isso que eu preciso
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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

        {/* Success State */}
        {currentStep === 'confirmation' && (
          <div className="flex justify-center">
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-accent-foreground" />
                </div>
                <Button variant="outline" className="mt-4">
                  Ver minhas solicitações
                </Button>
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
            placeholder="Digite aqui sua pergunta..."
            className="flex-1"
            disabled={currentStep === 'confirmation'}
          />
          <Button 
            onClick={handleSendMessage}
            size="icon"
            disabled={!inputValue.trim() || currentStep === 'confirmation'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;