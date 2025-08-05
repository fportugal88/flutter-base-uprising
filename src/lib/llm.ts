export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

const SECRET = 'fusion_data_bridge_secret_key';

async function getApiKey(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', 'openai')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const bytes = CryptoJS.AES.decrypt(data.encrypted_key, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }
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
    throw new Error(errorText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
