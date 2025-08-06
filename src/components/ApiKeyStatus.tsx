import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ApiKeyResult {
  success: boolean;
  error?: string;
  hasKey?: boolean;
  preview?: string;
  fullResponse?: any;
}

export function ApiKeyStatus() {
  const [result, setResult] = useState<ApiKeyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiKey = async () => {
    setLoading(true);
    try {
      console.log('Testando acesso ao secret OPENAI_API_KEY...');
      
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENAI_API_KEY' }
      });

      console.log('Resposta completa da função get-secret:');
      console.log('Data:', data);
      console.log('Error:', error);
      
      if (error) {
        console.error('Erro ao acessar secret:', error);
        setResult({ 
          success: false, 
          error: error.message,
          fullResponse: { data, error }
        });
        return;
      }
      
      if (data?.value) {
        console.log('API Key encontrada! Primeiros 10 caracteres:', data.value.substring(0, 10) + '...');
        setResult({ 
          success: true, 
          hasKey: true, 
          preview: data.value.substring(0, 20) + '...(' + data.value.length + ' caracteres)',
          fullResponse: { data: { ...data, value: '[HIDDEN]' }, error }
        });
      } else {
        console.log('API Key não encontrada nos secrets');
        setResult({ 
          success: true, 
          hasKey: false,
          fullResponse: { data, error }
        });
      }
    } catch (error: any) {
      console.error('Exceção ao testar secret:', error);
      setResult({ 
        success: false, 
        error: error.message,
        fullResponse: { error: error.toString() }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiKey();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Status da API Key OpenAI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testApiKey} disabled={loading}>
          {loading ? 'Testando...' : 'Testar Novamente'}
        </Button>
        
        {result && (
          <div className="space-y-3">
            <div className={`p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Status:</strong> {result.success ? 'Sucesso' : 'Erro'}
            </div>
            
            {result.error && (
              <div className="p-3 rounded bg-red-50 text-red-700">
                <strong>Erro:</strong> {result.error}
              </div>
            )}
            
            {result.hasKey !== undefined && (
              <div className={`p-3 rounded ${result.hasKey ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <strong>API Key:</strong> {result.hasKey ? 'Encontrada' : 'Não encontrada'}
              </div>
            )}
            
            {result.preview && (
              <div className="p-3 rounded bg-gray-100 text-gray-800">
                <strong>Preview:</strong> {result.preview}
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Resposta Completa (Debug)</summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(result.fullResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}