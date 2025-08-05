-- Criar as tabelas chat_sessions e chat_messages no schema api
CREATE TABLE api.chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active',
    request_id UUID
);

CREATE TABLE api.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS às novas tabelas
ALTER TABLE api.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
ON api.chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON api.chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON api.chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON api.chat_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para chat_messages
CREATE POLICY "Users can view messages from their sessions" 
ON api.chat_messages 
FOR SELECT 
USING (
    session_id IN (
        SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in their sessions" 
ON api.chat_messages 
FOR INSERT 
WITH CHECK (
    session_id IN (
        SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update messages in their sessions" 
ON api.chat_messages 
FOR UPDATE 
USING (
    session_id IN (
        SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete messages in their sessions" 
ON api.chat_messages 
FOR DELETE 
USING (
    session_id IN (
        SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
    )
);

-- Criar triggers para updated_at se necessário
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON api.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

-- Adicionar foreign key para relacionamento
ALTER TABLE api.chat_messages 
ADD CONSTRAINT fk_chat_messages_session_id 
FOREIGN KEY (session_id) REFERENCES api.chat_sessions(id) ON DELETE CASCADE;