export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

import { getApiKey } from './secureStorage';

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  const apiKey = getApiKey();
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
