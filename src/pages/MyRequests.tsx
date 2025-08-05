import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Clock, CheckCircle, AlertCircle, XCircle, Eye, Download, MessageSquare } from "lucide-react";

interface DataRequest {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  requestDate: string;
  estimatedCompletion: string;
  description: string;
  requestedBy: string;
  assignedTo?: string;
  tags: string[];
}

const MyRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for requests
  const mockRequests: DataRequest[] = [
    {
      id: '#DADOS-1234',
      title: 'Ticket médio por região',
      status: 'in_progress',
      priority: 'high',
      requestDate: '2025-01-15',
      estimatedCompletion: '2025-01-18',
      description: 'Análise de ticket médio de vendas segmentado por região para campanha de CRM',
      requestedBy: 'Você',
      assignedTo: 'Equipe Analytics',
      tags: ['Vendas', 'Regional', 'CRM']
    },
    {
      id: '#DADOS-5678',
      title: 'Base de clientes inativos',
      status: 'completed',
      priority: 'normal',
      requestDate: '2025-01-10',
      estimatedCompletion: '2025-01-13',
      description: 'Base consolidada de clientes inativos com análise de motivos de churn',
      requestedBy: 'Você',
      assignedTo: 'Equipe Data Science',
      tags: ['Clientes', 'Churn', 'Analytics']
    },
    {
      id: '#DADOS-9012',
      title: 'Abandono de carrinho por categoria',
      status: 'pending',
      priority: 'normal',
      requestDate: '2025-01-20',
      estimatedCompletion: '2025-01-25',
      description: 'Análise de abandono de carrinho segmentado por categoria de produto',
      requestedBy: 'Você',
      tags: ['E-commerce', 'Conversão', 'Produto']
    },
    {
      id: '#DADOS-3456',
      title: 'Relatório de performance semanal',
      status: 'cancelled',
      priority: 'low',
      requestDate: '2025-01-05',
      estimatedCompletion: '2025-01-08',
      description: 'Relatório automatizado de performance semanal de vendas',
      requestedBy: 'Você',
      tags: ['Performance', 'Vendas', 'Automatizado']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in_progress':
        return 'Em Desenvolvimento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b bg-card gap-3">
        <div className="flex items-center w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Minhas Solicitações</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Acompanhe o status de todas suas solicitações de dados
            </p>
          </div>
        </div>
        
        <Button onClick={() => navigate('/data-assistant')} className="w-full sm:w-auto h-12 text-base">
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-6 border-b bg-card">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Desenvolvimento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-6">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-headline-small text-foreground mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Nenhuma solicitação encontrada' : 'Nenhuma solicitação ainda'}
            </h3>
            <p className="text-body-medium text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros para encontrar o que você procura.'
                : 'Que tal criar sua primeira solicitação de dados?'
              }
            </p>
            <Button onClick={() => navigate('/data-assistant')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Criar Solicitação
            </Button>
          </div>
        ) : (
           <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                        <CardTitle className="text-lg sm:text-xl font-semibold">
                          {request.title}
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {getStatusText(request.status)}
                          </Badge>
                          <Badge variant={getPriorityVariant(request.priority)}>
                            Prioridade {request.priority === 'high' ? 'Alta' : request.priority === 'normal' ? 'Normal' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span><strong>ID:</strong> {request.id}</span>
                        <span><strong>Solicitado em:</strong> {new Date(request.requestDate).toLocaleDateString('pt-BR')}</span>
                        <span><strong>Estimativa:</strong> {new Date(request.estimatedCompletion).toLocaleDateString('pt-BR')}</span>
                        {request.assignedTo && (
                          <span><strong>Responsável:</strong> {request.assignedTo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {request.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex gap-2 flex-wrap">
                      {request.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                      
                      {request.status === 'completed' && (
                        <Button size="sm" className="flex-1 sm:flex-none">
                          <Download className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Acessar</span>
                        </Button>
                      )}
                      
                      {request.status === 'pending' && (
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/data-assistant?requestId=${request.id}`)}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;