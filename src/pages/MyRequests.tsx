import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Clock, CheckCircle, AlertCircle, XCircle, Eye, Download, MessageSquare, Loader2 } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";

const MyRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { requests, loading, cancelRequest } = useRequests();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'em_curadoria':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'em_desenvolvimento':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'duplicada':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_curadoria':
        return 'Em Curadoria';
      case 'em_desenvolvimento':
        return 'Em Desenvolvimento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      case 'duplicada':
        return 'Duplicada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'secondary';
      case 'em_curadoria':
        return 'default';
      case 'em_desenvolvimento':
        return 'default';
      case 'concluida':
        return 'default';
      case 'cancelada':
        return 'destructive';
      case 'duplicada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'destructive';
      case 'alta':
        return 'destructive';
      case 'normal':
        return 'secondary';
      case 'baixa':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'Urgente';
      case 'alta':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'baixa':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.codigo_solicitacao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCancelRequest = async (requestId: string) => {
    await cancelRequest(requestId);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b bg-card gap-3">
          <div className="flex items-center w-full sm:w-auto">
            <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 md:hidden" onClick={() => navigate(-1)}>
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
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_curadoria">Em Curadoria</SelectItem>
                <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="duplicada">Duplicada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando solicitações...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
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
                             {request.titulo}
                           </CardTitle>
                           <div className="flex gap-2 flex-wrap">
                             <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                               {getStatusIcon(request.status)}
                               {getStatusText(request.status)}
                             </Badge>
                             <Badge variant={getPriorityVariant(request.prioridade)}>
                               Prioridade {getPriorityText(request.prioridade)}
                             </Badge>
                           </div>
                         </div>
                         
                         <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                           <span><strong>ID:</strong> {request.codigo_solicitacao}</span>
                           <span><strong>Solicitado em:</strong> {format(new Date(request.criado_em), 'dd/MM/yyyy', { locale: ptBR })}</span>
                           {request.estimativa_entrega && (
                             <span><strong>Estimativa:</strong> {format(new Date(request.estimativa_entrega), 'dd/MM/yyyy', { locale: ptBR })}</span>
                           )}
                           {request.responsavel_name && (
                             <span><strong>Responsável:</strong> {request.responsavel_name}</span>
                           )}
                         </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                   <CardContent className="pt-0">
                     <p className="text-sm sm:text-base text-muted-foreground mb-4">
                       {request.descricao}
                     </p>
                     
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                       <div className="flex gap-2 flex-wrap">
                         {request.categoria.map((tag, index) => (
                           <Badge key={index} variant="outline" className="text-xs">
                             {tag}
                           </Badge>
                         ))}
                       </div>
                      
                        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate(`/my-requests/${request.id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Detalhes</span>
                          </Button>
                        
                         {request.status === 'concluida' && (
                           <Button size="sm" className="flex-1 sm:flex-none">
                             <Download className="h-4 w-4 mr-1" />
                             <span className="hidden sm:inline">Acessar</span>
                           </Button>
                         )}
                         
                         {request.status === 'pendente' && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="flex-1 sm:flex-none"
                             onClick={() => handleCancelRequest(request.id)}
                           >
                             <XCircle className="h-4 w-4 mr-1" />
                             <span className="hidden sm:inline">Cancelar</span>
                           </Button>
                         )}
                        
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={() => navigate(`/data-assistant?requestId=${request.codigo_solicitacao}`)}
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
    </AppLayout>
  );
};

export default MyRequests;