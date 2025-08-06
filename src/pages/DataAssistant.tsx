import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ArrowLeft, Check, Database, Clock, Tag, ExternalLink, AlertCircle, FileText, Eye, Edit3, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  suggestions?: DataSuggestion[];
  richCard?: RichCard;
  reviewCard?: ReviewCard;
  loading?: boolean;
}

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

const DataAssistant = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ConversationStep>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Function placeholder for AI integration
  const callAIFunction = async (message: string, context: any) => {
    // TODO: Integrar com serviço de IA
    // Esta função será substituída pela integração real com IA Generativa
    console.log('AI Input:', { message, context, currentStep });
    
    // Mock response baseado no contexto
    if (currentStep === 'intention_detection') {
      return {
        intent: 'create_request',
        entities: {
          metric: 'ticket médio',
          dimension: 'região',
          timeframe: 'últimos 6 meses'
        },
        confidence: 0.95
      };
    }
    
    return {
      response: 'Entendi sua solicitação. Vou ajudar você com isso.',
      nextStep: 'context_enrichment'
    };
  };

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
        content: 'Olá! Me diga com o que você precisa de ajuda. Posso verificar se já temos algum dado pronto ou te ajudar a montar um pedido novo.',
        quickReplies: ['🔍 Buscar dado existente', '🧾 Criar novo pedido', '❓ Tirar dúvida']
      });
    });
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

  const handleIntentionDetection = async (intention: string) => {
    setRequestData(prev => ({ ...prev, objective: intention }));
    
    // Call AI function to detect entities and intent
    const aiResponse = await callAIFunction(intention, { step: 'intention_detection' });
    
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
      // Find relevant suggestions based on request data
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

  const handleConfirmRequest = () => {
    addMessage({
      type: 'user',
      content: 'Confirmar pedido'
    });

    setCurrentStep('confirmation');
    const requestId = '#DADOS-' + Math.floor(Math.random() * 10000);
    setRequestData(prev => ({ ...prev, requestId }));

    simulateTyping(() => {
      addMessage({
        type: 'assistant',
        content: `Pedido criado com sucesso! 

**Protocolo**: ${requestId}
⏱️ **SLA estimado**: até 3 dias úteis
📬 **Atualizações**: Você receberá por aqui

Posso te avisar quando estiver pronto?`,
        quickReplies: ['Sim, me avise', 'Ver minhas solicitações']
      });
    });
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
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue('');

    addMessage({
      type: 'user',
      content: message
    });

    // Route message based on current step
    if (currentStep === 'intention_detection') {
      handleIntentionDetection(message);
    } else if (currentStep === 'follow_up') {
      handleFollowUp(message);
    } else {
      // General AI integration for free-form conversation
      simulateTyping(async () => {
        try {
          const aiResponse = await callAIFunction(message, { 
            currentStep, 
            requestData,
            messageHistory: messages 
          });
          
          addMessage({
            type: 'assistant',
            content: aiResponse.response || 'Entendi! Como posso ajudar você com isso?'
          });
        } catch (error) {
          addMessage({
            type: 'assistant',
            content: 'Desculpe, houve um problema. Pode reformular sua pergunta?'
          });
        }
      });
    }
  };

  const handleFollowUp = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('status') || lowerMessage.includes('pedido')) {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: `Aqui estão suas solicitações:

🟡 **#DADOS-${Math.floor(Math.random() * 1000)}** - Em desenvolvimento
📊 Ticket médio por região
⏱️ Estimativa: 2 dias úteis

🟢 **#DADOS-${Math.floor(Math.random() * 1000)}** - Concluído
📈 Base de clientes inativos
✅ Disponível para acesso`
        });
      });
    } else if (lowerMessage.includes('cancelar')) {
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: 'Qual solicitação você gostaria de cancelar? Me informe o número do protocolo.',
          quickReplies: ['#DADOS-1234', '#DADOS-5678', 'Listar todas']
        });
      });
    } else {
      // Default AI response
      const aiResponse = await callAIFunction(message, { step: 'follow_up' });
      simulateTyping(() => {
        addMessage({
          type: 'assistant',
          content: aiResponse.response || 'Como posso ajudar você hoje?'
        });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (currentStep === 'welcome') {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          {/* Page Header */}
          <div className="flex items-center p-4 border-b bg-card">
            <Button variant="ghost" size="icon" className="mr-3" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-headline-large text-foreground">Descobrir</h1>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8">
              <MessageCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Descobrir
              </h2>
              <p className="text-base text-muted-foreground max-w-md">
                Seu parceiro inteligente para encontrar, solicitar e acessar dados. 
                Comece uma conversa e eu te ajudo a encontrar exatamente o que você precisa.
              </p>
            </div>

            <Button 
              onClick={handleStartConversation}
              size="lg"
              className="text-lg px-8 py-6"
            >
              <MessageCircle className="mr-3 h-5 w-5" />
              Iniciar Conversa
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="flex items-center p-4 border-b bg-card">
          <Button variant="ghost" size="icon" className="mr-3" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-headline-large text-foreground">Descobrir</h1>
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
                              addMessage({ type: 'user', content: reply });
                              handleQuickReply(reply);
                            } else if (currentStep === 'intention_detection' && reply !== 'Outro - vou digitar') {
                              addMessage({ type: 'user', content: reply });
                              handleIntentionDetection(reply);
                            } else if (currentStep === 'context_enrichment') {
                              addMessage({ type: 'user', content: reply });
                              handleContextEnrichment(reply);
                            } else if (currentStep === 'frequency_selection') {
                              addMessage({ type: 'user', content: reply });
                              handleFrequencySelection(reply);
                            } else if (currentStep === 'privacy_check') {
                              addMessage({ type: 'user', content: reply });
                              handlePrivacyCheck(reply);
                            } else if (currentStep === 'business_case') {
                              addMessage({ type: 'user', content: reply });
                              handleBusinessCase(reply);
                            } else if (currentStep === 'confirmation') {
                              addMessage({ type: 'user', content: reply });
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

                  {/* Rich Card for dashboards/tables */}
                  {message.richCard && (
                    <div className="mt-3">
                      <Card className="border-accent/20 bg-accent/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            {message.richCard.type === 'dashboard' ? (
                              <FileText className="h-5 w-5 text-accent mr-2" />
                            ) : (
                              <Database className="h-5 w-5 text-accent mr-2" />
                            )}
                            <CardTitle className="text-label-large">
                              {message.richCard.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-body-small text-muted-foreground mb-3">
                            {message.richCard.description}
                          </p>
                          {message.richCard.lastUsed && (
                            <p className="text-body-small text-muted-foreground mb-3">
                              <strong>Último uso:</strong> {message.richCard.lastUsed} • {message.richCard.usedBy}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver {message.richCard.type === 'dashboard' ? 'Dashboard' : 'Tabela'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Pré-visualizar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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

        {/* Success State */}
        {currentStep === 'confirmation' && messages.length > 0 && !messages[messages.length - 1].quickReplies && (
          <div className="flex justify-center">
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-label-large text-foreground mb-2">Solicitação Criada!</h3>
                <p className="text-body-small text-muted-foreground mb-4">
                  Você pode acompanhar o progresso em tempo real
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => navigate('/my-requests')}>
                    Ver minhas solicitações
                  </Button>
                  <Button size="sm" onClick={() => {
                    setCurrentStep('follow_up');
                    addMessage({
                      type: 'assistant',
                      content: 'Precisa de mais alguma coisa? Posso ajudar com outras solicitações ou esclarecer dúvidas.'
                    });
                  }}>
                    Nova solicitação
                  </Button>
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
            onKeyDown={handleKeyDown}
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
    </AppLayout>
  );
};

export default DataAssistant;