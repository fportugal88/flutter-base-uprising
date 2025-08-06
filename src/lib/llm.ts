export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieve the OpenAI API key stored as a Supabase secret.
 */
async function getOpenAIApiKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('get-secret', {
    body: { name: 'OPENAI_API_KEY' }
  });

  if (error || !data?.value) {
    console.error('getOpenAIApiKey: failed', error, data);
    throw new Error('Failed to load OpenAI API key');
  }

  return data.value as string;
}

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');

  try {
    console.log('sendChatMessage: retrieving API key...');
    const apiKey = await getOpenAIApiKey();
    const assistantId = import.meta.env.VITE_ASSISTANT_ID;
    if (!assistantId) {
      throw new Error('Assistant ID not configured');
    }

    console.log('sendChatMessage: calling OpenAI responses API...');
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: messages,
        max_output_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('sendChatMessage: OpenAI error', response.status, errorText);
      throw new Error('Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    const content = data.output_text?.trim();

    if (!content) {
      console.error('sendChatMessage: no content in response', data);
      throw new Error('No response content received');
    }

    console.log('sendChatMessage: success');
    return content;
  } catch (error) {
    console.error('sendChatMessage: exception', error);
    throw error;
  }
}