export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

async function getApiKey(): Promise<string | null> {
  try {
    console.log('llm.getApiKey: starting...');
    
    console.log('llm.getApiKey: fetching OPENAI_API_KEY from Supabase secrets...');
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'OPENAI_API_KEY' }
    });

    if (error) {
      console.error('llm.getApiKey: error getting secret', error);
      return null;
    }

    if (!data?.value) {
      console.error('llm.getApiKey: no API key found in secrets');
      return null;
    }

    console.log('llm.getApiKey: API key retrieved successfully');
    return data.value;
  } catch (error) {
    console.error('llm.getApiKey: exception', error);
    return null;
  }
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
      model: 'gpt-4.1-2025-04-14',
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