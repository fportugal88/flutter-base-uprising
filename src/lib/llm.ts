export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

async function getApiKey(): Promise<string | null> {
  try {
    console.log('llm.getApiKey: starting...');
    
    // Primeiro, tentar buscar do localStorage como fallback
    const localKey = localStorage.getItem('openai_api_key');
    if (localKey) {
      console.log('llm.getApiKey: using localStorage API key');
      return localKey;
    }
    
    console.log('llm.getApiKey: fetching OPENAI_API_KEY from Supabase secrets...');
    try {
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENAI_API_KEY' }
      });

      if (error) {
        console.error('llm.getApiKey: error getting secret from Supabase', error);
        // Se falhar, solicitar ao usuário
        console.log('llm.getApiKey: Edge Function failed, requesting API key from user');
        return requestApiKeyFromUser();
      }

      if (!data?.value) {
        console.error('llm.getApiKey: no API key found in Supabase secrets');
        return requestApiKeyFromUser();
      }

      console.log('llm.getApiKey: API key retrieved successfully from Supabase');
      return data.value;
    } catch (functionError) {
      console.error('llm.getApiKey: Edge Function error', functionError);
      return requestApiKeyFromUser();
    }
  } catch (error) {
    console.error('llm.getApiKey: general exception', error);
    return requestApiKeyFromUser();
  }
}

function requestApiKeyFromUser(): string | null {
  const userKey = prompt('Por favor, insira sua chave da API do OpenAI:');
  if (userKey) {
    localStorage.setItem('openai_api_key', userKey);
    return userKey;
  }
  return null;
}

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');
  
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('sendChatMessage: no API key available');
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
      model: 'gpt-4o-mini', // Usando modelo mais estável
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