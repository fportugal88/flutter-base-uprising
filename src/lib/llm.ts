export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { supabase } from '@/integrations/supabase/client';
import { log, logError } from '@/lib/logger';

export async function sendChatMessage(
  messages: LLMMessage[],
  timeoutMs = 30000
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  log('sendChatMessage: starting...');

  try {
    log('sendChatMessage: invoking chat-openai function...');

    const { data, error } = await supabase.functions.invoke('chat-openai', {
      body: { messages },
      signal: controller.signal
    });

    if (error) {
      logError('sendChatMessage: chat-openai function error', error);
      throw new Error(error.message);
    }

    const content = data?.content?.trim();
    if (!content) {
      logError('sendChatMessage: no content in response', data);
      throw new Error('No response content received');
    }

    log('sendChatMessage: success');
    return content;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      logError('sendChatMessage: request aborted');
      throw new Error('Request timed out');
    }
    logError('sendChatMessage: exception', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
