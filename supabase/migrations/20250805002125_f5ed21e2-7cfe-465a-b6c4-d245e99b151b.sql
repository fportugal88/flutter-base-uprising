-- Create enum types for the requests system
CREATE TYPE public.request_status AS ENUM ('pendente', 'em_curadoria', 'em_desenvolvimento', 'concluida', 'cancelada', 'duplicada');
CREATE TYPE public.request_priority AS ENUM ('baixa', 'normal', 'alta', 'urgente');
CREATE TYPE public.curation_status AS ENUM ('aguardando', 'em_curadoria', 'validado', 'reprovado', 'reencaminhado');
CREATE TYPE public.strategic_objective AS ENUM ('aumento_de_conversao', 'reduzir_churn', 'automatizacao', 'eficiencia_operacional', 'novo_produto');
CREATE TYPE public.impact_level AS ENUM ('baixo', 'medio', 'alto', 'estrategico');
CREATE TYPE public.data_classification AS ENUM ('nao_sensivel', 'PII', 'financeiro', 'confidencial');
CREATE TYPE public.effectiveness_feedback AS ENUM ('excelente', 'bom', 'mediano', 'incompleto');

-- Create main requests table
CREATE TABLE public.requests (
    -- Metadados básicos
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_solicitacao TEXT NOT NULL UNIQUE, -- #DADOS-XXXX format
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pendente',
    prioridade request_priority NOT NULL DEFAULT 'normal',
    categoria TEXT[] DEFAULT '{}',
    origem_canal TEXT NOT NULL DEFAULT 'chat',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    estimativa_entrega TIMESTAMP WITH TIME ZONE,
    entregue_em TIMESTAMP WITH TIME ZONE,
    cancelado_em TIMESTAMP WITH TIME ZONE,
    
    -- Contexto de negócio
    solicitante_id UUID NOT NULL REFERENCES auth.users(id),
    equipe_solicitante TEXT,
    justificativa_negocio TEXT,
    objetivo_estrategico strategic_objective,
    relevancia_financeira TEXT,
    impacto_estimado impact_level DEFAULT 'medio',
    
    -- Colaboração e governança
    responsavel_tecnico_id UUID REFERENCES auth.users(id),
    curador_id UUID REFERENCES auth.users(id),
    status_curadoria curation_status DEFAULT 'aguardando',
    votos_endosso INTEGER DEFAULT 0,
    usuarios_endosso UUID[] DEFAULT '{}',
    
    -- Relacionamento com entregas e reuso
    pipeline_reutilizado TEXT,
    nova_tabela_gerada TEXT,
    dashboards_relacionados TEXT[] DEFAULT '{}',
    documentacao_gerada TEXT,
    feedback_efetividade effectiveness_feedback,
    proximo_passo_sugerido TEXT,
    
    -- Auditoria e rastreamento
    classificacao_dado data_classification DEFAULT 'nao_sensivel',
    revisado_por_compliance BOOLEAN DEFAULT false,
    proposito_de_uso TEXT,
    validade_uso TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for request collaboration
CREATE TABLE public.request_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comentario TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate request codes
CREATE OR REPLACE FUNCTION public.generate_request_code()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    code TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(codigo_solicitacao FROM '#DADOS-(.*)') AS INTEGER)
    ), 0) + 1 
    INTO next_number 
    FROM public.requests 
    WHERE codigo_solicitacao ~ '^#DADOS-[0-9]+$';
    
    -- Format as #DADOS-XXXX with padding
    code := '#DADOS-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate request codes
CREATE OR REPLACE FUNCTION public.set_request_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_solicitacao IS NULL OR NEW.codigo_solicitacao = '' THEN
        NEW.codigo_solicitacao := public.generate_request_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_code_trigger
    BEFORE INSERT ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_request_code();

-- Create trigger for updated_at on requests
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on comments
CREATE TRIGGER update_request_comments_updated_at
    BEFORE UPDATE ON public.request_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on requests table
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comments table
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requests
CREATE POLICY "Users can view all requests" 
    ON public.requests 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own requests" 
    ON public.requests 
    FOR INSERT 
    WITH CHECK (auth.uid() = solicitante_id);

CREATE POLICY "Solicitantes and responsible users can update requests" 
    ON public.requests 
    FOR UPDATE 
    USING (
        auth.uid() = solicitante_id OR 
        auth.uid() = responsavel_tecnico_id OR 
        auth.uid() = curador_id
    );

-- RLS Policies for comments
CREATE POLICY "Users can view all comments" 
    ON public.request_comments 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create comments" 
    ON public.request_comments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
    ON public.request_comments 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
    ON public.request_comments 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_requests_solicitante ON public.requests(solicitante_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_prioridade ON public.requests(prioridade);
CREATE INDEX idx_requests_criado_em ON public.requests(criado_em);
CREATE INDEX idx_requests_codigo ON public.requests(codigo_solicitacao);
CREATE INDEX idx_request_comments_request_id ON public.request_comments(request_id);
CREATE INDEX idx_request_comments_user_id ON public.request_comments(user_id);