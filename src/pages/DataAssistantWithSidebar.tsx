import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ArrowLeft, Check, Database, Clock, Tag, ExternalLink, AlertCircle, FileText, Eye, Edit3, X } from "lucide-react";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { useChat } from "@/contexts/ChatContext";
import { useRequests } from "@/hooks/useRequests";
import { sendChatMessage } from "@/lib/llm";
import type { Message as ChatMessage } from "@/contexts/ChatContext";

interface DataSuggestion {
  name: string;
  lastUpdate: string;
  platform: string;
  tags: string[];
  description?: string;
  similarityScore?: number;
}

interface RichCard {
  type: 'table' | 'dashboard';
  title: string;
  description: string;
  link: string;
  lastUsed?: string;
  usedBy?: string;
}

interface ReviewCard {
  requestSummary: {
    metric: string;
    filters: string[];
    frequency: string;
    privacy: string;
    purpose: string;
  };
  estimatedDelivery: string;
  priority: string;
}

interface RequestData {
  objective: string;
  dataType: string;
  timePeriod: string;
  frequency: string;
  privacy: string;
  businessCase: string;
  requestId: string;
}

type ConversationStep =
  | 'welcome' 
  | 'initial' 
  | 'intention_detection'
  | 'context_enrichment'
  | 'frequency_selection'
  | 'privacy_check'
  | 'business_case'
  | 'asset_suggestions' 
  | 'review_request'
  | 'confirmation'
  | 'follow_up';

const SYSTEM_PROMPT = `Você é o Assistente de Dados. Auxilie usuários a consultar e solicitar dados disponíveis na companhia. Responda de forma breve e cite produtores quando possível.`;

const DataAssistantWithSidebar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentSession, 
    createNewSession, 
    loadSession, 
    addMessageToSession, 
    updateSessionTitle, 
    linkSessionToRequest,
    getSessionByRequest 
  } = useChat();
  const { createRequest } = useRequests({ autoFetch: false });
  
  const [currentStep, setCurrentStep] = useState<ConversationStep>('welcome');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [requestData, setRequestData] = useState<RequestData>({
    objective: '',
    dataType: '',
    timePeriod: '',
    frequency: '',
    privacy: '',
    businessCase: '',
    requestId: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load specific session if chatId or requestId is provided
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const requestId = searchParams.get('requestId');
    
    if (chatId) {
      loadSession(chatId);
      setCurrentStep('follow_up');
    } else if (requestId) {
      const session = getSessionByRequest(requestId);
      if (session) {
        loadSession(session.id);
        setCurrentStep('follow_up');
      }
    }
  }, [searchParams, loadSession, getSessionByRequest]);

  // Mock data catalog for suggestions
  const mockDataCatalog: DataSuggestion[] = [
    {
      name: 'clientes_ticket_regional',
      lastUpdate: '2025-01-15',
      platform: 'Databricks',
      tags: ['Clientes', 'Vendas', 'Regional'],
      description: 'Ticket médio de clientes por região com dados dos últimos 12 meses',
      similarityScore: 0.95
    },
    {
      name: 'comportamento_compra_regiao',
      lastUpdate: '2025-01-10',
      platform: 'BigQuery',
      tags: ['Comportamento', 'Regional', 'Analytics'],
      description: 'Dashboard analítico sobre padrões de compra regionais',
      similarityScore: 0.87
    },
    {
      name: 'clientes_inativos_base',
      lastUpdate: '2025-01-20',
      platform: 'Snowflake',
      tags: ['Clientes', 'Churn', 'CRM'],
      description: 'Base consolidada de clientes inativos com análise de motivos',
      similarityScore: 0.82
    }
  ];

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
    const sessionId = createNewSession('Nova conversa');
    setCurrentStep('initial');

    try {
      const response = await sendChatMessage([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Inicie a conversa cumprimentando o usuário e explique como pode ajudar.' }
      ]);
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: response,
          quickReplies: ['🔍 Buscar dado existente', '🧾 Criar novo pedido', '❓ Tirar dúvida']
        });
      });
    } catch (e) {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Olá! Me diga com o que você precisa de ajuda. Posso verificar se já temos algum dado pronto ou te ajudar a montar um pedido novo.',
          quickReplies: ['🔍 Buscar dado existente', '🧾 Criar novo pedido', '❓ Tirar dúvida']
        });
      });
    }
  };

  const handleStartConversation = () => {
    if (!currentSession) {
      handleNewChat();
    } else {
      setCurrentStep('initial');
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Olá! Me diga com o que você precisa de ajuda. Posso verificar se já temos algum dado pronto ou te ajudar a montar um pedido novo.',
          quickReplies: ['🔍 Buscar dado existente', '🧾 Criar novo pedido', '❓ Tirar dúvida']
        });
      });
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply.includes('Criar novo pedido')) {
      setCurrentStep('intention_detection');
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Perfeito! Agora me conte: qual tipo de informação você precisa? Pode ser bem específico.',
          quickReplies: ['Ticket médio por região', 'Base de clientes inativos', 'Abandono de carrinho', 'Outro - vou digitar']
        });
      });
    } else if (reply.includes('Buscar dado existente')) {
      setCurrentStep('asset_suggestions');
      simulateTyping(() => {
        const suggestions = mockDataCatalog.slice(0, 2);
        addMessage({
          type: 'assistant',
          content: 'Aqui estão alguns dados populares do nosso catálogo. O que você está procurando?',
          suggestions
        });
      }, 1000);
    } else if (reply.includes('Tirar dúvida')) {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Claro! Qual é sua dúvida? Posso te ajudar com:\n\n• Como solicitar dados\n• Status de solicitações\n• Acesso a tabelas\n• Políticas de dados\n\nO que você gostaria de saber?'
        });
      });
    }
  };

  const handleIntentionDetection = (intention: string) => {
    setRequestData(prev => ({ ...prev, objective: intention }));
    
    // Update session title based on intention
    if (currentSession && intention !== 'Outro - vou digitar') {
      updateSessionTitle(currentSession.id, intention);
    }
    
    setCurrentStep('context_enrichment');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: `Entendi que você precisa de ${intention.toLowerCase()}. Agora vou fazer algumas perguntas para entender melhor:

Qual granularidade você espera? (por cliente, por região, por pedido...)`,
        quickReplies: ['Por cliente', 'Por região', 'Por pedido', 'Por produto']
      });
    }, 1500);
  };

  const handleContextEnrichment = (granularity: string) => {
    setRequestData(prev => ({ ...prev, dataType: granularity }));

    setCurrentStep('frequency_selection');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Com que frequência você quer esse dado?',
        quickReplies: ['Uma vez só', 'Semanal', 'Mensal', 'Diário']
      });
    });
  };

  const handleFrequencySelection = (frequency: string) => {
    setRequestData(prev => ({ ...prev, frequency }));

    setCurrentStep('privacy_check');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Esses dados envolvem informações pessoais (CPF, e-mail, telefone etc.)?',
        quickReplies: ['Sim, dados pessoais', 'Não, dados agregados', 'Não sei']
      });
    });
  };

  const handlePrivacyCheck = (privacy: string) => {
    setRequestData(prev => ({ ...prev, privacy }));

    setCurrentStep('business_case');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Para finalizar, há algum dashboard ou relatório que você já usa com parte dessa informação?',
        quickReplies: ['Sim, já uso algo similar', 'Não, é novo', 'Não sei']
      });
    });
  };

  const handleBusinessCase = (businessCase: string) => {
    setRequestData(prev => ({ ...prev, businessCase }));

    setCurrentStep('asset_suggestions');
    simulateTyping(() => {
      const relevantSuggestions = mockDataCatalog.filter(item => 
        item.tags.some(tag => 
          requestData.objective.toLowerCase().includes(tag.toLowerCase()) ||
          requestData.dataType.toLowerCase().includes(tag.toLowerCase())
        )
      ).slice(0, 2);

      if (relevantSuggestions.length > 0) {
        addMessage({
          type: 'assistant',
          content: 'Encontrei alguns dados similares no nosso catálogo:',
          suggestions: relevantSuggestions,
          richCard: {
            type: 'dashboard',
            title: 'Comportamento de Compra por Região',
            description: 'Dashboard executivo com métricas de vendas regionais',
            link: '#dashboard-link',
            lastUsed: '3 dias atrás',
            usedBy: 'Equipe de CRM'
          }
        });
      } else {
        handleCreateNewRequest();
      }
    }, 2000);
  };

  const handleUseSuggestion = (suggestion: DataSuggestion) => {
    addMessage({
      type: 'user',
      content: `Usar a tabela: ${suggestion.name}`
    });

    setCurrentStep('confirmation');
    const requestId = '#DADOS-' + Math.floor(Math.random() * 10000);
    setRequestData(prev => ({ ...prev, requestId }));

    // Link session to request
    if (currentSession) {
      linkSessionToRequest(currentSession.id, requestId);
    }

    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: `Perfeito! Você terá acesso à tabela ${suggestion.name}.

🎯 **Acesso liberado em**: 1 dia útil
📧 **Notificação**: Você receberá um e-mail com instruções
📊 **Plataforma**: ${suggestion.platform}

**Protocolo**: ${requestId}

Posso te avisar quando estiver pronto?`,
        quickReplies: ['Sim, me avise', 'Não precisa']
      });
    });
  };

  const handleRejectSuggestion = () => {
    addMessage({
      type: 'user',
      content: 'Não é isso que eu preciso'
    });

    handleCreateNewRequest();
  };

  const handleCreateNewRequest = () => {
    setCurrentStep('review_request');
    simulateTyping(() => {
      const reviewCard: ReviewCard = {
        requestSummary: {
          metric: requestData.objective,
          filters: [requestData.dataType, requestData.timePeriod],
          frequency: requestData.frequency,
          privacy: requestData.privacy,
          purpose: requestData.businessCase
        },
        estimatedDelivery: '3 dias úteis',
        priority: 'Normal'
      };

      addMessage({
        type: 'assistant',
        content: 'Com base no que conversamos, aqui está um resumo da sua solicitação:',
        reviewCard
      });
    });
  };

  const handleConfirmRequest = async () => {
    addMessage({
      type: 'user',
      content: 'Confirmar pedido'
    });

    setCurrentStep('confirmation');

    // Create request in database
    const newRequest = await createRequest({
      titulo: requestData.objective,
      descricao: `Solicitação criada via chat assistente.
      
Detalhes:
- Granularidade: ${requestData.dataType}
- Frequência: ${requestData.frequency}
- Privacidade: ${requestData.privacy}
- Caso de negócio: ${requestData.businessCase}`,
      categoria: [requestData.dataType, requestData.frequency],
      prioridade: 'normal',
      origem_canal: 'chat',
      justificativa_negocio: requestData.businessCase,
      impacto_estimado: 'medio',
      classificacao_dado: requestData.privacy.includes('pessoais') ? 'PII' : 'nao_sensivel'
    });

    if (newRequest) {
      setRequestData(prev => ({ ...prev, requestId: newRequest.codigo_solicitacao }));

      // Link session to request
      if (currentSession) {
        linkSessionToRequest(currentSession.id, newRequest.codigo_solicitacao);
      }

      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: `Pedido criado com sucesso! 

**Protocolo**: ${newRequest.codigo_solicitacao}
⏱️ **SLA estimado**: até 3 dias úteis
📬 **Atualizações**: Você receberá por aqui

Posso te avisar quando estiver pronto?`,
          quickReplies: ['Sim, me avise', 'Ver minhas solicitações']
        });
      });
    }
  };

  const handleEditRequest = () => {
    addMessage({
      type: 'user',
      content: 'Editar campos'
    });

    setCurrentStep('intention_detection');
    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: 'Sem problema! Vamos revisar. O que você gostaria de alterar?',
        quickReplies: ['Mudar métrica', 'Alterar período', 'Outras especificações']
      });
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;

    const message = inputValue.trim();
    setInputValue('');

    addMessage({
      type: 'user',
      content: message
    });

    if (currentStep === 'intention_detection') {
      handleIntentionDetection(message);
    } else {
      const history = [
        ...currentSession.messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
        { role: 'user', content: message }
      ];
      try {
        const aiResponse = await sendChatMessage([
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ]);
        simulateTyping(() => {
          addMessage({
            type: 'assistant',
            content: aiResponse
          });
        });
      } catch (e) {
        simulateTyping(() => {
          addMessage({
            type: 'assistant',
            content: 'Desculpe, ocorreu um erro ao acessar a IA.'
          });
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Show welcome screen if no session
  if (!currentSession || currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <ChatSidebar onNewChat={handleNewChat} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center p-3 sm:p-4 border-b bg-card">
            <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Assistente de Dados</h1>
          </div>

          {/* Welcome Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center pb-20 md:pb-6">
            <div className="mb-6 sm:mb-8">
              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-accent mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Assistente de Dados</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                Converse comigo para solicitar ou consultar dados.
              </p>
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
    );
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <ChatSidebar onNewChat={handleNewChat} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center p-3 sm:p-4 border-b bg-card">
          <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground truncate">{currentSession.title}</h1>
        </div>

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
                              addMessage({ type: 'user', content: reply });
                              
                              if (currentStep === 'initial') {
                                handleQuickReply(reply);
                              } else if (currentStep === 'intention_detection' && reply !== 'Outro - vou digitar') {
                                handleIntentionDetection(reply);
                              } else if (currentStep === 'context_enrichment') {
                                handleContextEnrichment(reply);
                              } else if (currentStep === 'frequency_selection') {
                                handleFrequencySelection(reply);
                              } else if (currentStep === 'privacy_check') {
                                handlePrivacyCheck(reply);
                              } else if (currentStep === 'business_case') {
                                handleBusinessCase(reply);
                              } else if (currentStep === 'confirmation') {
                                if (reply.includes('me avise')) {
                                  setCurrentStep('follow_up');
                                  simulateTyping(() => {
                                    addMessage({
                                      type: 'assistant',
                                      content: 'Perfeito! Te aviso assim que estiver pronto. Precisa de mais alguma coisa?'
                                    });
                                  });
                                } else if (reply.includes('solicitações')) {
                                  navigate('/my-requests');
                                }
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
                      <div className="mt-3 space-y-3">
                        {message.suggestions.map((suggestion: DataSuggestion, index: number) => (
                          <Card key={index} className="border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                  <Database className="h-5 w-5 text-accent mr-2 mt-0.5" />
                                  <div>
                                    <h4 className="text-label-large text-foreground font-mono">
                                      {suggestion.name}
                                    </h4>
                                    {suggestion.description && (
                                      <p className="text-body-small text-muted-foreground mt-1">
                                        {suggestion.description}
                                      </p>
                                    )}
                                    <div className="flex items-center text-body-medium text-muted-foreground mt-1">
                                      <Clock className="h-4 w-4 mr-1" />
                                      Última atualização: {suggestion.lastUpdate}
                                    </div>
                                    <p className="text-body-medium text-muted-foreground">
                                      Disponível em: {suggestion.platform}
                                    </p>
                                    {suggestion.similarityScore && (
                                      <div className="flex items-center mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {(suggestion.similarityScore * 100).toFixed(0)}% de similaridade
                                        </Badge>
                                      </div>
                                    )}
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
                                  onClick={() => handleUseSuggestion(suggestion)}
                                  className="flex-1"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Usar essa tabela
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleRejectSuggestion}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Não é isso
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Review Card */}
                    {message.reviewCard && (
                      <div className="mt-3">
                        <Card className="border-primary/20 bg-primary/5">
                          <CardHeader>
                            <CardTitle className="text-label-large flex items-center">
                              <FileText className="h-5 w-5 text-primary mr-2" />
                              Resumo da Solicitação
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <span className="text-body-small font-medium text-foreground">📊 Métrica:</span>
                                <span className="text-body-small text-muted-foreground ml-2">{message.reviewCard.requestSummary.metric}</span>
                              </div>
                              <div>
                                <span className="text-body-small font-medium text-foreground">🎯 Filtros:</span>
                                <span className="text-body-small text-muted-foreground ml-2">{message.reviewCard.requestSummary.filters.join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-body-small font-medium text-foreground">🔄 Frequência:</span>
                                <span className="text-body-small text-muted-foreground ml-2">{message.reviewCard.requestSummary.frequency}</span>
                              </div>
                              <div>
                                <span className="text-body-small font-medium text-foreground">🛡️ Privacidade:</span>
                                <span className="text-body-small text-muted-foreground ml-2">{message.reviewCard.requestSummary.privacy}</span>
                              </div>
                              <div>
                                <span className="text-body-small font-medium text-foreground">⏱️ Estimativa:</span>
                                <span className="text-body-small text-muted-foreground ml-2">{message.reviewCard.estimatedDelivery}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" onClick={handleConfirmRequest} className="flex-1">
                                <Check className="h-4 w-4 mr-1" />
                                Confirmar Pedido
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleEditRequest}>
                                <Edit3 className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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
              placeholder={
                currentStep === 'intention_detection' 
                  ? "Descreva que tipo de dado você precisa..." 
                  : "Digite aqui sua pergunta..."
              }
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
  );
};

export default DataAssistantWithSidebar;