-- Adicionar security definer e search_path para as funções
ALTER FUNCTION api.update_updated_at_column() SECURITY DEFINER SET search_path = '';

ALTER FUNCTION api.generate_request_code() SECURITY DEFINER SET search_path = 'api';

ALTER FUNCTION api.set_request_code() SECURITY DEFINER SET search_path = 'api';

ALTER FUNCTION api.handle_new_user() SECURITY DEFINER SET search_path = 'api';