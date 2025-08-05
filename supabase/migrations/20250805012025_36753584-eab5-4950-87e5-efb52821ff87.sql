-- Recriar funções no schema public
CREATE OR REPLACE FUNCTION public.generate_request_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number INTEGER;
    code TEXT;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(codigo_solicitacao FROM '#DADOS-(.*)') AS INTEGER)
    ), 0) + 1 
    INTO next_number 
    FROM public.requests 
    WHERE codigo_solicitacao ~ '^#DADOS-[0-9]+$';
    
    code := '#DADOS-' || LPAD(next_number::TEXT, 4, '0');
    RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_request_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.codigo_solicitacao IS NULL OR NEW.codigo_solicitacao = '' THEN
        NEW.codigo_solicitacao := public.generate_request_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Recriar trigger se não existir
DROP TRIGGER IF EXISTS set_request_code_trigger ON public.requests;
CREATE TRIGGER set_request_code_trigger
    BEFORE INSERT ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_request_code();

-- Recriar triggers de updated_at
DROP TRIGGER IF EXISTS update_requests_updated_at ON public.requests;
DROP TRIGGER IF EXISTS update_request_comments_updated_at ON public.request_comments;

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_comments_updated_at
    BEFORE UPDATE ON public.request_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();