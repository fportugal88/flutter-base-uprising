export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');

  try {
    console.log('sendChatMessage: invoking chat-openai function...');
    const { data, error } = await supabase.functions.invoke('chat-openai', {
      body: { messages }
    });

    if (error) {
      console.error('sendChatMessage: function error', error);
      throw new Error(error.message);
    }

    const content = data?.content?.trim();

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