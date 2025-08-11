import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not set in Supabase secrets');
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: missing OPENAI_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, threadId } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-message] Incoming message:', message?.slice(0, 200));
    if (threadId) console.log('[send-message] Using existing threadId:', threadId);

    // Call OpenAI Chat Completions API
    const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        messages: [
          { role: 'system', content: 'Você é um assistente útil, objetivo e cordial. Responda em português quando possível.' },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!oaRes.ok) {
      const errText = await oaRes.text();
      console.error('[send-message] OpenAI error:', oaRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oaData = await oaRes.json();

    // Safely extract reply text
    let reply = '';
    try {
      const choice = oaData?.choices?.[0];
      const content = choice?.message?.content;
      if (typeof content === 'string') {
        reply = content;
      } else if (Array.isArray(content)) {
        reply = content.map((c: any) => (typeof c === 'string' ? c : (c?.text ?? ''))).join('');
      }
    } catch (e) {
      console.error('[send-message] Failed to parse OpenAI response:', e);
    }

    if (!reply) {
      reply = 'Desculpe, não consegui gerar uma resposta agora.';
    }

    const outThreadId = threadId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);

    console.log('[send-message] Responding with threadId:', outThreadId);

    return new Response(
      JSON.stringify({ reply, threadId: outThreadId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[send-message] Uncaught error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
