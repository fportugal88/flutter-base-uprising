// Arquivo temporário para testar se conseguimos acessar a API key do Supabase
import { supabase } from '@/integrations/supabase/client';

export async function testGetSecret() {
  try {
    console.log('Testando acesso ao secret OPENAI_API_KEY...');
    
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'OPENAI_API_KEY' }
    });

    console.log('Resposta da função get-secret:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('Erro ao acessar secret:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.value) {
      console.log('API Key encontrada! Primeiros 10 caracteres:', data.value.substring(0, 10) + '...');
      return { success: true, hasKey: true, preview: data.value.substring(0, 10) + '...' };
    } else {
      console.log('API Key não encontrada nos secrets');
      return { success: true, hasKey: false };
    }
  } catch (error) {
    console.error('Exceção ao testar secret:', error);
    return { success: false, error: error.message };
  }
}

// Função para chamar no console do navegador
(window as any).testGetSecret = testGetSecret;