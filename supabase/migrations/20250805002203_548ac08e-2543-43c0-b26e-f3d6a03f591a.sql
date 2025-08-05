-- Fix security issues by setting proper search_path for functions
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