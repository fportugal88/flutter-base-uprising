-- Mover tabelas do schema public para o schema api
CREATE SCHEMA IF NOT EXISTS api;

-- Mover a tabela requests
ALTER TABLE public.requests SET SCHEMA api;

-- Mover a tabela request_comments
ALTER TABLE public.request_comments SET SCHEMA api;

-- Mover a tabela profiles
ALTER TABLE public.profiles SET SCHEMA api;

-- Atualizar as funções para usar o schema api
DROP FUNCTION IF EXISTS public.generate_request_code();
DROP FUNCTION IF EXISTS public.set_request_code();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar as funções no schema api
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api.generate_request_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api.set_request_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_solicitacao IS NULL OR NEW.codigo_solicitacao = '' THEN
        NEW.codigo_solicitacao := api.generate_request_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers
DROP TRIGGER IF EXISTS set_request_code_trigger ON api.requests;
CREATE TRIGGER set_request_code_trigger
    BEFORE INSERT ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION api.set_request_code();

DROP TRIGGER IF EXISTS update_requests_updated_at ON api.requests;
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON api.requests
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_request_comments_updated_at ON api.request_comments;
CREATE TRIGGER update_request_comments_updated_at
    BEFORE UPDATE ON api.request_comments
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON api.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON api.profiles
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

-- Recreate the trigger on auth.users for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION api.handle_new_user();