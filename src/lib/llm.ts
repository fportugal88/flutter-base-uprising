export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

const SECRET = 'fusion_data_bridge_secret_key';

async function getApiKey(): Promise<string | null> {
  try {
    console.log('llm.getApiKey: starting...');
    
    // Usar getUser igual ao ChatContext - padrão que funciona
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('llm.getApiKey: user error or no user', userError);
      return null;
    }

    console.log('llm.getApiKey: user found, making API call...');
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', 'openai')
      .maybeSingle();

    console.log('llm.getApiKey: API response data=', !!data, 'error=', error);

    if (error || !data) {
      console.log('llm.getApiKey: no data or error');
      return null;
    }

    console.log('llm.getApiKey: decrypting...');
    const bytes = CryptoJS.AES.decrypt(data.encrypted_key, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    console.log('llm.getApiKey: decryption success=', !!decrypted);
    return decrypted || null;
  } catch (error) {
    console.error('llm.getApiKey: exception', error);
    return null;
  }
}

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('sendChatMessage: no API key');
    throw new Error('API key not configured');
  }
  
  console.log('sendChatMessage: API key found, making OpenAI call...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('sendChatMessage: OpenAI error', errorText);
    throw new Error(errorText);
  }

  const data = await response.json();
  console.log('sendChatMessage: success');
  return data.choices?.[0]?.message?.content?.trim() || '';
}