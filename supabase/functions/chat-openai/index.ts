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
  threadId?: string;
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
    const { messages, threadId }: ChatRequest = await req.json();
    
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

    // Obter Assistant ID da função de descoberta
    let assistantId: string;
    try {
      console.log('Fetching assistant ID from discovery function...');
      const discoveryResponse = await fetch(`${supabaseUrl}/functions/v1/get-assistant-discovery`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      if (discoveryResponse.ok) {
        const discoveryData = await discoveryResponse.json();
        assistantId = discoveryData.assistant_id;
        console.log('Assistant ID retrieved from discovery function:', assistantId);
      } else {
        const errorText = await discoveryResponse.text();
        console.error('Failed to get assistant ID from discovery function:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to get assistant ID' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error) {
      console.error('Error calling discovery function:', sanitizeLog(error));
      return new Response(
        JSON.stringify({ error: 'Failed to get assistant ID' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!assistantId) {
      console.error('Assistant ID not available');
      return new Response(
        JSON.stringify({ error: 'Assistant ID not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Making OpenAI Assistant API calls...');

    try {
      // Criar ou usar thread existente
      let currentThreadId = threadId;
      if (!currentThreadId) {
        console.log('Creating new thread...');
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2',
          },
          body: JSON.stringify({})
        });

        if (!threadResponse.ok) {
          const errorText = await threadResponse.text();
          console.error('OpenAI thread creation error:', threadResponse.status, sanitizeLog(errorText));
          return new Response(
            JSON.stringify({ error: 'Failed to create thread' }),
            { status: threadResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const threadData = await threadResponse.json();
        currentThreadId = threadData.id;
        console.log('Thread created:', currentThreadId);
      }

      // Adicionar mensagem do usuário ao thread
      const userMessage = messages[messages.length - 1]; // Pegar a última mensagem (do usuário)
      if (userMessage && userMessage.role === 'user') {
        console.log('Adding user message to thread...');
        const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2',
          },
          body: JSON.stringify({
            role: 'user',
            content: userMessage.content
          })
        });

        if (!messageResponse.ok) {
          const errorText = await messageResponse.text();
          console.error('OpenAI message creation error:', messageResponse.status, sanitizeLog(errorText));
          return new Response(
            JSON.stringify({ error: 'Failed to add message to thread' }),
            { status: messageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Executar o assistente
      console.log('Running assistant...');
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('OpenAI run creation error:', runResponse.status, sanitizeLog(errorText));
        return new Response(
          JSON.stringify({ error: 'Failed to run assistant' }),
          { status: runResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const runData = await runResponse.json();
      const runId = runData.id;
      console.log('Run created:', runId);

      // Aguardar conclusão do run
      let runStatus = 'queued';
      let attempts = 0;
      const maxAttempts = 30; // 30 segundos de timeout

      while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
        attempts++;

        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2',
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          runStatus = statusData.status;
          console.log(`Run status: ${runStatus}, attempt: ${attempts}`);
        } else {
          console.error('Failed to check run status');
          break;
        }
      }

      if (runStatus !== 'completed') {
        console.error('Run did not complete successfully, status:', runStatus);
        return new Response(
          JSON.stringify({ error: 'Assistant run did not complete' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Recuperar mensagens do thread
      console.log('Fetching messages from thread...');
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        }
      });

      if (!messagesResponse.ok) {
        const errorText = await messagesResponse.text();
        console.error('OpenAI messages fetch error:', messagesResponse.status, sanitizeLog(errorText));
        return new Response(
          JSON.stringify({ error: 'Failed to fetch messages' }),
          { status: messagesResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const messagesData = await messagesResponse.json();
      const assistantMessages = messagesData.data.filter((msg: any) => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        console.error('No assistant message found');
        return new Response(
          JSON.stringify({ error: 'No assistant response found' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Pegar a primeira mensagem do assistente (mais recente)
      const latestAssistantMessage = assistantMessages[0];
      const content = latestAssistantMessage.content[0]?.text?.value;

      if (!content) {
        console.error('Assistant message has no text content');
        return new Response(
          JSON.stringify({ error: 'No text content in assistant response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('OpenAI Assistant response received successfully');

      return new Response(
        JSON.stringify({
          content,
          threadId: currentThreadId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('Error in OpenAI Assistant API calls:', sanitizeLog(error));
      return new Response(
        JSON.stringify({ error: 'Failed to communicate with OpenAI Assistant' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
