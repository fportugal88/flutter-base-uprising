-- Corrigir políticas RLS para as tabelas de chat
-- Primeiro, verificar se as políticas existem e removê-las se necessário
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON api.chat_sessions;

DROP POLICY IF EXISTS "Users can view messages from their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages in their sessions" ON api.chat_messages;

-- Recriar políticas RLS mais permissivas para debug
-- Políticas para chat_sessions
CREATE POLICY "Allow authenticated users to view their own chat sessions" 
ON api.chat_sessions FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create their own chat sessions" 
ON api.chat_sessions FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own chat sessions" 
ON api.chat_sessions FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own chat sessions" 
ON api.chat_sessions FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para chat_messages
CREATE POLICY "Allow authenticated users to view messages from their sessions" 
ON api.chat_messages FOR SELECT 
TO authenticated
USING (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to create messages in their sessions" 
ON api.chat_messages FOR INSERT 
TO authenticated
WITH CHECK (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to update messages in their sessions" 
ON api.chat_messages FOR UPDATE 
TO authenticated
USING (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to delete messages in their sessions" 
ON api.chat_messages FOR DELETE 
TO authenticated
USING (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);