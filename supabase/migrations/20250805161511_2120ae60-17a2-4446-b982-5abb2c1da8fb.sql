-- Verificar se RLS está habilitado e forçar habilitação
ALTER TABLE api.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to view their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to create their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to update their own chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own chat sessions" ON api.chat_sessions;

DROP POLICY IF EXISTS "Allow authenticated users to view messages from their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated users to create messages in their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated users to update messages in their sessions" ON api.chat_messages;
DROP POLICY IF EXISTS "Allow authenticated users to delete messages in their sessions" ON api.chat_messages;

-- Criar políticas simples e funcionais para chat_sessions
CREATE POLICY "Users can manage their chat sessions" 
ON api.chat_sessions FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar políticas para chat_messages
CREATE POLICY "Users can manage their chat messages" 
ON api.chat_messages FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE api.chat_sessions.id = api.chat_messages.session_id 
    AND api.chat_sessions.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE api.chat_sessions.id = api.chat_messages.session_id 
    AND api.chat_sessions.user_id = auth.uid()
  )
);