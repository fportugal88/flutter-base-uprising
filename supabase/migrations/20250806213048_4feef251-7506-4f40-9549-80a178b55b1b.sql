-- Corrigir a migração anterior: adicionar thread_id ao schema correto (api.chat_sessions)
ALTER TABLE api.chat_sessions ADD COLUMN IF NOT EXISTS thread_id TEXT;