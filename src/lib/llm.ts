export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');

  try {
    console.log('sendChatMessage: fetching OpenAI API key...');

    const { data: secret, error: secretError } = await supabase.functions.invoke('get-secret', {
      body: { name: 'OPENAI_API_KEY' }
    });

    if (secretError) {
      console.error('sendChatMessage: secret function error', secretError);
      throw new Error(secretError.message);
    }

    const openaiApiKey = secret?.value;
    if (!openaiApiKey) {
      console.error('sendChatMessage: no API key returned', secret);
      throw new Error('OpenAI API key not found');
    }

    console.log('sendChatMessage: fetching assistant ID...');

    const { data: assistantData, error: assistantError } = await supabase.functions.invoke(
      'get-assistant-discovery'
    );

    if (assistantError) {
      console.error('sendChatMessage: assistant function error', assistantError);
      throw new Error(assistantError.message);
    }

    const assistantId =
      assistantData?.assistantId || assistantData?.assistant_id || assistantData?.id;

    if (!assistantId) {
      console.error('sendChatMessage: no assistant ID returned', assistantData);
      throw new Error('Assistant ID not found');
    }

    console.log('sendChatMessage: calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
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
      console.error('sendChatMessage: OpenAI API error', response.status, errorText);
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    const content =
      data?.output_text?.trim() ??
      data?.output?.[0]?.content?.[0]?.text?.value?.trim() ??
      data?.output?.[0]?.content?.[0]?.text?.trim();

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
