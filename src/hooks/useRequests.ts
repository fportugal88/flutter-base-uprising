import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface Request {
  id: string;
  codigo_solicitacao: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_curadoria' | 'em_desenvolvimento' | 'concluida' | 'cancelada' | 'duplicada';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  categoria: string[];
  origem_canal: string;
  criado_em: string;
  estimativa_entrega?: string;
  entregue_em?: string;
  cancelado_em?: string;
  solicitante_id: string;
  equipe_solicitante?: string;
  justificativa_negocio?: string;
  objetivo_estrategico?: 'aumento_de_conversao' | 'reduzir_churn' | 'automatizacao' | 'eficiencia_operacional' | 'novo_produto';
  relevancia_financeira?: string;
  impacto_estimado?: 'baixo' | 'medio' | 'alto' | 'estrategico';
  responsavel_tecnico_id?: string;
  curador_id?: string;
  status_curadoria: 'aguardando' | 'em_curadoria' | 'validado' | 'reprovado' | 'reencaminhado';
  votos_endosso: number;
  usuarios_endosso: string[];
  pipeline_reutilizado?: string;
  nova_tabela_gerada?: string;
  dashboards_relacionados: string[];
  documentacao_gerada?: string;
  feedback_efetividade?: 'excelente' | 'bom' | 'mediano' | 'incompleto';
  proximo_passo_sugerido?: string;
  classificacao_dado: 'nao_sensivel' | 'PII' | 'financeiro' | 'confidencial';
  revisado_por_compliance: boolean;
  proposito_de_uso?: string;
  validade_uso?: string;
  updated_at: string;
  // Fields from the profiles table. These are populated only when the query joins the profiles table explicitly.
  solicitante_name?: string;
  responsavel_name?: string;
  curador_name?: string;
}

type CreateRequestInput = {
  titulo: string;
  descricao: string;
  categoria?: string[];
  status?: 'pendente' | 'em_curadoria' | 'em_desenvolvimento' | 'concluida' | 'cancelada' | 'duplicada';
  prioridade?: 'baixa' | 'normal' | 'alta' | 'urgente';
  origem_canal?: string;
  equipe_solicitante?: string;
  justificativa_negocio?: string;
  objetivo_estrategico?: 'aumento_de_conversao' | 'reduzir_churn' | 'automatizacao' | 'eficiencia_operacional' | 'novo_produto';
  relevancia_financeira?: string;
  impacto_estimado?: 'baixo' | 'medio' | 'alto' | 'estrategico';
  status_curadoria?: 'aguardando' | 'em_curadoria' | 'validado' | 'reprovado' | 'reencaminhado';
  classificacao_dado?: 'nao_sensivel' | 'PII' | 'financeiro' | 'confidencial';
  estimativa_entrega?: string;
  proposito_de_uso?: string;
};

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  comentario: string;
  criado_em: string;
  updated_at: string;
  user_name?: string;
}

interface UseRequestsOptions {
  autoFetch?: boolean;
}

export const useRequests = (options: UseRequestsOptions = {}) => {
  const { autoFetch = true } = options;
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('solicitante_id', currentUser.id)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching user requests:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar suas solicitações');
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas solicitações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createRequest = async (requestData: CreateRequestInput) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma solicitação",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          titulo: requestData.titulo,
          descricao: requestData.descricao,
          categoria: requestData.categoria || [],
          status: requestData.status || 'pendente',
          prioridade: requestData.prioridade || 'normal',
          origem_canal: requestData.origem_canal || 'chat',
          solicitante_id: user.id,
          equipe_solicitante: requestData.equipe_solicitante,
          justificativa_negocio: requestData.justificativa_negocio,
          objetivo_estrategico: requestData.objetivo_estrategico,
          relevancia_financeira: requestData.relevancia_financeira,
          impacto_estimado: requestData.impacto_estimado || 'medio',
          status_curadoria: requestData.status_curadoria || 'aguardando',
          classificacao_dado: requestData.classificacao_dado || 'nao_sensivel',
          estimativa_entrega: requestData.estimativa_entrega,
          proposito_de_uso: requestData.proposito_de_uso
        } as TablesInsert<'requests'>)
        .select('*')
        .single();

      if (error) throw error;

      setRequests(prev => [data, ...prev]);
      
      toast({
        title: "Sucesso",
        description: `Solicitação ${data.codigo_solicitacao} criada com sucesso!`,
      });

      return data;
    } catch (err) {
      console.error('Error creating request:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateRequest = async (id: string, updates: Partial<CreateRequestInput & { status: Request['status'] }>) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update(updates as TablesUpdate<'requests'>)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setRequests(prev => prev.map(req => req.id === id ? data : req));
      
      toast({
        title: "Sucesso",
        description: "Solicitação atualizada com sucesso!",
      });

      return data;
    } catch (err) {
      console.error('Error updating request:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a solicitação",
        variant: "destructive",
      });
      return null;
    }
  };

  const cancelRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'cancelada',
          cancelado_em: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'cancelada' as const, cancelado_em: new Date().toISOString() }
          : req
      ));
      
      toast({
        title: "Sucesso",
        description: "Solicitação cancelada com sucesso!",
      });

      return true;
    } catch (err) {
      console.error('Error canceling request:', err);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a solicitação",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchUserRequests();
    }
  }, [autoFetch, fetchUserRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    fetchUserRequests,
    createRequest,
    updateRequest,
    cancelRequest,
    refetch: fetchUserRequests
  };
};

export const useRequestComments = (requestId: string) => {
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('criado_em', { ascending: true });

      if (error) throw error;

      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (comentario: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('request_comments')
        .insert([{
          request_id: requestId,
          user_id: user.id,
          comentario
        }])
        .select('*')
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchComments();
    }
  }, [requestId]);

  return {
    comments,
    loading,
    fetchComments,
    addComment
  };
};