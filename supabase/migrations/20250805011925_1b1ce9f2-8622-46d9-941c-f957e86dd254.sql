-- Mover tabelas para o schema api
CREATE SCHEMA IF NOT EXISTS api;

-- Mover tabela requests para o schema api
ALTER TABLE public.requests SET SCHEMA api;

-- Mover tabela request_comments para o schema api  
ALTER TABLE public.request_comments SET SCHEMA api;

-- Recriar as políticas RLS no schema api
DROP POLICY IF EXISTS "Users can view all requests" ON api.requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON api.requests;
DROP POLICY IF EXISTS "Solicitantes and responsible users can update requests" ON api.requests;

DROP POLICY IF EXISTS "Users can view all comments" ON api.request_comments;
DROP POLICY IF EXISTS "Users can create comments" ON api.request_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON api.request_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON api.request_comments;

-- Recriar políticas RLS para requests no schema api
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

-- Recriar políticas RLS para comments no schema api
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

-- Atualizar funções para usar o novo schema
DROP FUNCTION IF EXISTS public.generate_request_code();
DROP FUNCTION IF EXISTS public.set_request_code();

CREATE OR REPLACE FUNCTION api.generate_request_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api
AS $$
DECLARE
    next_number INTEGER;
    code TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(codigo_solicitacao FROM '#DADOS-(.*)') AS INTEGER)
    ), 0) + 1 
    INTO next_number 
    FROM api.requests 
    WHERE codigo_solicitacao ~ '^#DADOS-[0-9]+$';
    
    -- Format as #DADOS-XXXX with padding
    code := '#DADOS-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION api.set_request_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = api
AS $$
BEGIN
    IF NEW.codigo_solicitacao IS NULL OR NEW.codigo_solicitacao = '' THEN
        NEW.codigo_solicitacao := api.generate_request_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS set_request_code_trigger ON api.requests;
CREATE TRIGGER set_request_code_trigger
    BEFORE INSERT ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION api.set_request_code();

-- Recriar triggers de updated_at
DROP TRIGGER IF EXISTS update_requests_updated_at ON api.requests;
DROP TRIGGER IF EXISTS update_request_comments_updated_at ON api.request_comments;

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_comments_updated_at
    BEFORE UPDATE ON api.request_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();