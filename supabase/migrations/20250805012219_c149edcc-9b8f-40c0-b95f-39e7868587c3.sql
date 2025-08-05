-- Verificar se as tabelas existem no schema public e criar no schema api
CREATE SCHEMA IF NOT EXISTS api;

-- Copiar estrutura e dados da tabela requests para o schema api
CREATE TABLE IF NOT EXISTS api.requests AS 
SELECT * FROM public.requests;

-- Copiar estrutura e dados da tabela request_comments para o schema api
CREATE TABLE IF NOT EXISTS api.request_comments AS 
SELECT * FROM public.request_comments;

-- Adicionar constraints primárias e outros constraints necessários
ALTER TABLE api.requests ADD CONSTRAINT requests_pkey PRIMARY KEY (id) ON CONFLICT DO NOTHING;
ALTER TABLE api.requests ADD CONSTRAINT requests_codigo_solicitacao_key UNIQUE (codigo_solicitacao) ON CONFLICT DO NOTHING;

ALTER TABLE api.request_comments ADD CONSTRAINT request_comments_pkey PRIMARY KEY (id) ON CONFLICT DO NOTHING;
ALTER TABLE api.request_comments ADD CONSTRAINT request_comments_request_id_fkey 
    FOREIGN KEY (request_id) REFERENCES api.requests(id) ON DELETE CASCADE ON CONFLICT DO NOTHING;

-- Habilitar RLS nas tabelas do schema api
ALTER TABLE api.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.request_comments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para requests no schema api
CREATE POLICY "Users can view all requests" 
    ON api.requests 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own requests" 
    ON api.requests 
    FOR INSERT 
    WITH CHECK (auth.uid() = solicitante_id);

CREATE POLICY "Solicitantes and responsible users can update requests" 
    ON api.requests 
    FOR UPDATE 
    USING (
        auth.uid() = solicitante_id OR 
        auth.uid() = responsavel_tecnico_id OR 
        auth.uid() = curador_id
    );

-- Criar políticas RLS para comments no schema api
CREATE POLICY "Users can view all comments" 
    ON api.request_comments 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can create comments" 
    ON api.request_comments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
    ON api.request_comments 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
    ON api.request_comments 
    FOR DELETE 
    USING (auth.uid() = user_id);