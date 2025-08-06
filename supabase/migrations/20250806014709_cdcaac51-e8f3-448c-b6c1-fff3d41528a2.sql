-- Add missing fields to chat tables and create the chat-openai function

-- Add updated_at columns to tables if they don't exist
ALTER TABLE api.chat_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE api.chat_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create triggers for automatic updated_at management
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON api.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON api.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON api.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON api.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

-- Fix chat_messages table structure - use message_type instead of sender
ALTER TABLE api.chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT;
UPDATE api.chat_messages SET message_type = sender WHERE message_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON api.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON api.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON api.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON api.chat_messages(created_at);

-- Enable RLS
ALTER TABLE api.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON api.chat_sessions;
CREATE POLICY "Users can view their own chat sessions" 
ON api.chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON api.chat_sessions;
CREATE POLICY "Users can create their own chat sessions" 
ON api.chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON api.chat_sessions;
CREATE POLICY "Users can update their own chat sessions" 
ON api.chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON api.chat_sessions;
CREATE POLICY "Users can delete their own chat sessions" 
ON api.chat_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON api.chat_messages;
CREATE POLICY "Users can view messages from their sessions" 
ON api.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create messages in their sessions" ON api.chat_messages;
CREATE POLICY "Users can create messages in their sessions" 
ON api.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update messages in their sessions" ON api.chat_messages;
CREATE POLICY "Users can update messages in their sessions" 
ON api.chat_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete messages from their sessions" ON api.chat_messages;
CREATE POLICY "Users can delete messages from their sessions" 
ON api.chat_messages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM api.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);