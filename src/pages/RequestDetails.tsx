import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, MessageSquare, XCircle, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequests, useRequestComments } from "@/hooks/useRequests";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pendente':
      return <Clock className="h-4 w-4" />;
    case 'em_curadoria':
    case 'em_desenvolvimento':
      return <AlertCircle className="h-4 w-4" />;
    case 'concluida':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelada':
    case 'duplicada':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'cancelada':
    case 'duplicada':
      return 'destructive' as const;
    case 'pendente':
      return 'secondary' as const;
    default:
      return 'default' as const;
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'urgente':
    case 'alta':
      return 'destructive' as const;
    case 'baixa':
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
};

const RequestDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { cancelRequest } = useRequests({ autoFetch: false });

  // SEO basics
  useEffect(() => {
    if (request) {
      const title = `Detalhe da Solicitação - ${request?.codigo_solicitacao || request?.titulo || ''}`.slice(0, 60);
      document.title = title;
      const descContent = `Detalhe da solicitação ${request?.codigo_solicitacao}: ${request?.titulo || ''}`.slice(0, 155);
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', descContent);
      // canonical
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', window.location.href);
    }
  }, [request]);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await (supabase.from('requests' as any) as any)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setRequest(data);
    } catch (err) {
      console.error('Erro ao carregar solicitação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const commentsHook = useRequestComments(request?.id || '');
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim() || !request) return;
    const res = await commentsHook.addComment(newComment.trim());
    if (res) setNewComment('');
  };

  const handleCancel = async () => {
    if (!request) return;
    const ok = await cancelRequest(request.id);
    if (ok) {
      await fetchRequest();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 sm:p-6 border-b bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Detalhe da Solicitação</h1>
              <p className="text-sm text-muted-foreground">Acompanhe informações e comentários</p>
            </div>
          </div>
          {request?.status === 'concluida' && (
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Acessar Entrega
            </Button>
          )}
        </header>

        <div className="flex-1 p-3 sm:p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carregando detalhes...</p>
            </div>
          ) : !request ? (
            <Card>
              <CardHeader>
                <CardTitle>Solicitação não encontrada</CardTitle>
                <CardDescription>Verifique o link e tente novamente.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl">{request.titulo}</CardTitle>
                        <CardDescription>Código: {request.codigo_solicitacao}</CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status?.replaceAll('_',' ')}</span>
                        </Badge>
                        <Badge variant={getPriorityVariant(request.prioridade)}>
                          Prioridade {request.prioridade}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground">
                      <p className="text-muted-foreground mb-4">{request.descricao}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div><strong>Solicitado em:</strong> {request.criado_em ? format(new Date(request.criado_em), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</div>
                        <div><strong>Estimativa:</strong> {request.estimativa_entrega ? format(new Date(request.estimativa_entrega), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</div>
                        {request.responsavel_name && (<div><strong>Responsável:</strong> {request.responsavel_name}</div>)}
                        {Array.isArray(request.categoria) && request.categoria.length > 0 && (
                          <div className="col-span-1 sm:col-span-2">
                            <strong>Categorias:</strong>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {request.categoria.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.status === 'pendente' && (
                      <div className="mt-6">
                        <Separator className="my-4" />
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" onClick={() => navigate(`/data-assistant?requestId=${request.codigo_solicitacao}`)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Abrir Chat
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar Solicitação
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comentários</CardTitle>
                    <CardDescription>Converse com a equipe sobre esta solicitação.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {commentsHook.loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando comentários...</div>
                    ) : commentsHook.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
                    ) : (
                      <ul className="space-y-3">
                        {commentsHook.comments.map((c: any) => (
                          <li key={c.id} className="p-3 rounded-md border bg-card">
                            <div className="text-sm text-muted-foreground mb-1">
                              {c.user_name || 'Usuário'} • {c.criado_em ? format(new Date(c.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                            </div>
                            <div className="text-foreground">{c.comentario}</div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Adicionar um comentário"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[90px]"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                          Enviar comentário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ações rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => navigate(`/data-assistant?requestId=${request.codigo_solicitacao}`)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Abrir Chat
                    </Button>
                    {request.status === 'pendente' && (
                      <Button variant="outline" onClick={handleCancel}>
                        <XCircle className="h-4 w-4 mr-2" /> Cancelar Solicitação
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RequestDetails;
