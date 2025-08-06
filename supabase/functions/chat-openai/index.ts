import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

// Remove sensitive information from logs
function sanitizeLog(input: unknown) {
  if (typeof input === 'string') {
    return input.replace(/[A-Za-z0-9-_]{16,}/g, '[REDACTED]');
  }
  if (input && typeof input === 'object') {
    try {
      const clone = JSON.parse(JSON.stringify(input));
      const sensitive = ['authorization', 'apikey', 'apiKey', 'key', 'secret', 'password', 'token'];
      for (const k of Object.keys(clone)) {
        if (sensitive.includes(k.toLowerCase())) {
          clone[k] = '[REDACTED]';
        }
      }
      return clone;
    } catch {
      return input;
    }
  }
  return input;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')
    ?.split(',')
    .map((o) => o.trim());
  const isAllowed = !allowedOrigins || allowedOrigins.includes(origin);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, accept-profile',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  return { headers, origin, isAllowed };
}

// TODO: evaluate implementing rate limiting or stricter authentication

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  assistantId?: string;
  maxTokens?: number;
}

serve(async (req) => {
  const { headers: corsHeaders, isAllowed } = getCorsHeaders(req);
  console.log('chat-openai function called:', req.method, req.url);

  if (!isAllowed) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar usuário autenticado
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Invalid user token:', sanitizeLog(userError));
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', user.id);

    // Obter dados da requisição
    const { messages, assistantId: bodyAssistantId, maxTokens = 1000 }: ChatRequest = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obter chave e ID do assistente
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const assistantId = bodyAssistantId || Deno.env.get('ASSISTENT_DISCOVERY');
    if (!assistantId) {
      console.error('Assistant ID not configured');
      return new Response(
        JSON.stringify({ error: 'Assistant ID not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Making OpenAI responses API call...');

    // Fazer chamada para OpenAI
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: messages,
        max_output_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, sanitizeLog(errorText));
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from OpenAI',
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    // Try multiple shapes for the response content to avoid runtime errors
    const content =
      data?.output_text?.trim() ??
      data?.output?.[0]?.content?.[0]?.text?.value?.trim() ??
      data?.output?.[0]?.content?.[0]?.text?.trim();

    if (!content) {
      console.error('OpenAI response missing text content', sanitizeLog(data));
      return new Response(
        JSON.stringify({ error: 'No text content in OpenAI response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('OpenAI response received successfully');

    return new Response(
      JSON.stringify({
        content,
        usage: data.usage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat-openai function:', sanitizeLog(error));
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
