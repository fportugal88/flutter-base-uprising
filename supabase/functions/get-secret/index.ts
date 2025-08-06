import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('get-secret function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    console.log('Requested secret name:', name);
    
    if (!name) {
      console.error('Secret name is required');
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se é uma das secrets suportadas
    const supportedSecrets = ['OPENAI_API_KEY'];
    if (!supportedSecrets.includes(name)) {
      console.error('Secret not supported:', name);
      return new Response(
        JSON.stringify({ error: 'Secret not supported' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar o secret do ambiente do Supabase
    const secretValue = Deno.env.get(name);
    console.log('Secret found:', secretValue ? 'Yes' : 'No');
    
    if (!secretValue) {
      console.error('Secret not found in environment:', name);
      return new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ value: secretValue }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});