-- Fix the issue: Remove explicit user_id filtering since RLS should handle it
-- The problem is that the client code is trying to filter by user_id directly
-- but RLS policies should handle the user filtering automatically

-- Let's check current policies and make sure they're correct
-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('chat_sessions', 'chat_messages');

-- Let's also check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename IN ('chat_sessions', 'chat_messages');

-- Check table structure to understand the columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('chat_sessions', 'chat_messages') 
ORDER BY table_name, ordinal_position;