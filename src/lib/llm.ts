export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';

interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');
  
  try {
    console.log('sendChatMessage: calling secure chat-openai function...');
    
    const { data, error } = await supabase.functions.invoke('chat-openai', {
      body: { 
        messages,
        maxTokens: 1000 
      }
    });

    if (error) {
      console.error('sendChatMessage: edge function error', error);
      throw new Error(`Chat service error: ${error.message}`);
    }

    if (!data?.content) {
      console.error('sendChatMessage: no content in response', data);
      throw new Error('No response content received');
    }

    console.log('sendChatMessage: success');
    return data.content;
  } catch (error) {
    console.error('sendChatMessage: exception', error);
    throw error;
  }
}