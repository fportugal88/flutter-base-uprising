-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON api.user_api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON api.user_api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON api.user_api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api.user_api_keys;

-- Create new policies with same pattern as chat_sessions
CREATE POLICY "user_api_keys_select" ON api.user_api_keys
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_api_keys_insert" ON api.user_api_keys
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_api_keys_update" ON api.user_api_keys
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_api_keys_delete" ON api.user_api_keys
FOR DELETE USING (user_id = auth.uid());