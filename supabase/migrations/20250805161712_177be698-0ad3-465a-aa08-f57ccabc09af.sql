-- Desabilitar RLS temporariamente para testar
ALTER TABLE api.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can manage their chat sessions" ON api.chat_sessions;
DROP POLICY IF EXISTS "Users can manage their chat messages" ON api.chat_messages;

-- Reativar RLS
ALTER TABLE api.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais específicas e testadas para cada operação
CREATE POLICY "chat_sessions_select" ON api.chat_sessions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "chat_sessions_insert" ON api.chat_sessions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_sessions_update" ON api.chat_sessions
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_sessions_delete" ON api.chat_sessions
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Políticas para chat_messages
CREATE POLICY "chat_messages_select" ON api.chat_messages
FOR SELECT TO authenticated
USING (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_insert" ON api.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_update" ON api.chat_messages
FOR UPDATE TO authenticated
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

CREATE POLICY "chat_messages_delete" ON api.chat_messages
FOR DELETE TO authenticated
USING (
  session_id IN (
    SELECT id FROM api.chat_sessions WHERE user_id = auth.uid()
  )
);