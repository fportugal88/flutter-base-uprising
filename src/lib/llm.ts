export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Usar a chave do Supabase secrets diretamente
const OPENAI_API_KEY = 'sk-proj-dKAR6mWLtVfhEI1Qr5OuRMRRWFfM3uQm7QZjEk3sQTfn7_L8OP0Y3kA8Qk5pN2T3BlbkFJrHk9QnMjGhR8EwK4zL1bY_Xv2VfLnK7qCdSgA6FcJdNmPqZ1';

export async function sendChatMessage(messages: LLMMessage[]): Promise<string> {
  console.log('sendChatMessage: starting...');
  
  if (!OPENAI_API_KEY) {
    console.error('sendChatMessage: no API key configured');
    throw new Error('API key not configured');
  }
  
  console.log('sendChatMessage: API key found, making OpenAI call...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
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