import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  console.log('get-assistant-discovery function called:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the secret name from query params or body
    let secretName = 'ASSISTENT_DISCOVERY'; // default
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.name) {
          secretName = body.name;
        }
      } catch (error) {
        console.log('No JSON body or invalid JSON, using default secret name');
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      const nameParam = url.searchParams.get('name');
      if (nameParam) {
        secretName = nameParam;
      }
    }

    console.log('Fetching secret:', secretName);

    // Get the secret value from environment
    const secretValue = Deno.env.get(secretName);
    
    if (!secretValue) {
      console.error(`Secret ${secretName} not found`);
      return new Response(
        JSON.stringify({ error: `Secret ${secretName} not configured` }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Secret ${secretName} retrieved successfully`);

    // Return the secret value based on the secret name
    if (secretName === 'ASSISTENT_DISCOVERY') {
      return new Response(
        JSON.stringify({ assistant_id: secretValue }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (secretName === 'OPENAI_API_KEY') {
      return new Response(
        JSON.stringify({ api_key: secretValue }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // For any other secret, return it as a generic value
      return new Response(
        JSON.stringify({ value: secretValue }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in get-assistant-discovery function:', error);
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