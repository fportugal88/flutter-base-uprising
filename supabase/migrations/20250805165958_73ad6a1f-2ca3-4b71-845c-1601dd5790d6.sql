-- Create the tables in the correct schema (api)
-- Check if tables exist in api schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'api' AND table_name IN ('chat_sessions', 'chat_messages');

-- If they don't exist, create them
CREATE TABLE IF NOT EXISTS api.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    request_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES api.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_messages ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON api.chat_sessions TO authenticated;
GRANT ALL ON api.chat_messages TO authenticated;