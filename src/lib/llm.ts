export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');

  try {
    console.log('sendChatMessage: invoking get-secret function...');

    const assistantId = "asst_Oh75yptf7Tj8hLDVJJ2o9CqC";
    if (!assistantId) {
      throw new Error('Assistant ID not configured');
    }

    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { messages, assistantId }
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
