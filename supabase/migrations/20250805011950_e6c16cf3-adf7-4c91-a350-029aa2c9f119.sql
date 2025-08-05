-- Corrigir a migração removendo dependências primeiro
DROP TRIGGER IF EXISTS set_request_code_trigger ON public.requests;
DROP TRIGGER IF EXISTS set_request_code_trigger ON api.requests;
DROP TRIGGER IF EXISTS update_requests_updated_at ON public.requests;
DROP TRIGGER IF EXISTS update_request_comments_updated_at ON public.request_comments;

DROP FUNCTION IF EXISTS public.generate_request_code() CASCADE;
DROP FUNCTION IF EXISTS public.set_request_code() CASCADE;

-- Criar schema api se não existir
CREATE SCHEMA IF NOT EXISTS api;

-- Mover tabelas para o schema api
ALTER TABLE IF EXISTS public.requests SET SCHEMA api;
ALTER TABLE IF EXISTS public.request_comments SET SCHEMA api;

-- Recriar funções no schema api
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
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(codigo_solicitacao FROM '#DADOS-(.*)') AS INTEGER)
    ), 0) + 1 
    INTO next_number 
    FROM api.requests 
    WHERE codigo_solicitacao ~ '^#DADOS-[0-9]+$';
    
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

-- Recriar triggers
CREATE TRIGGER set_request_code_trigger
    BEFORE INSERT ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION api.set_request_code();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_comments_updated_at
    BEFORE UPDATE ON api.request_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();