import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Request = Tables<'requests'> & {
  solicitante_name?: string;
  responsavel_name?: string;
  curador_name?: string;
};

type CreateRequestInput = Omit<TablesInsert<'requests'>, 'solicitante_id'>;

export type RequestComment = Tables<'request_comments'> & {
  user_name?: string;
};

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

      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
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

      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
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
      const newRequest: TablesInsert<'requests'> = {
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
      };

      const { data, error } = await supabase
        .from('requests')
        .insert(newRequest)
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setRequests(prev => [data, ...prev]);
        toast({
          title: "Sucesso",
          description: `Solicitação ${data.codigo_solicitacao} criada com sucesso!`,
        });
      }

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

  const updateRequest = async (id: string, updates: TablesUpdate<'requests'>) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setRequests(prev => prev.map(req => (req.id === id ? data : req)));
        toast({
          title: "Sucesso",
          description: "Solicitação atualizada com sucesso!",
        });
      }

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
      const updates: TablesUpdate<'requests'> = {
        status: 'cancelada',
        cancelado_em: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, status: 'cancelada', cancelado_em: updates.cancelado_em }
            : req
        )
      );
      
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

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('criado_em', { ascending: true });

      if (error) throw error;

      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const addComment = async (comentario: string) => {
    if (!user) return null;

    try {
      const newComment: TablesInsert<'request_comments'> = {
        request_id: requestId,
        user_id: user.id,
        comentario,
      };

      const { data, error } = await supabase
        .from('request_comments')
        .insert([newComment])
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setComments(prev => [...prev, data]);
      }
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
  }, [requestId, fetchComments]);

  return {
    comments,
    loading,
    fetchComments,
    addComment
  };
};