import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CryptoJS from 'crypto-js';

const SECRET = 'fusion_data_bridge_secret_key';

interface ApiKey {
  id: string;
  provider: string;
  encrypted_key: string;
  created_at: string;
  updated_at: string;
}

export const useApiKeys = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

  console.log('useApiKeys: user=', !!user, 'session=', !!session);

  // Check if user has OpenAI key - seguindo padrão chat_sessions
  const checkForOpenAIKey = async () => {
    console.log('checkForOpenAIKey: starting check, user=', !!user, 'session=', !!session);
    
    if (!user || !session) {
      console.log('checkForOpenAIKey: no user or session, setting false');
      setHasOpenAIKey(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('checkForOpenAIKey: making API call...');
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'openai')
        .maybeSingle();

      console.log('checkForOpenAIKey: response data=', data, 'error=', error);

      if (error) {
        console.error('Error checking API key:', error);
        setHasOpenAIKey(false);
        return;
      }

      const hasKey = !!data;
      console.log('checkForOpenAIKey: setting hasOpenAIKey to', hasKey);
      setHasOpenAIKey(hasKey);
    } catch (error) {
      console.error('checkForOpenAIKey: exception', error);
      setHasOpenAIKey(false);
    } finally {
      setLoading(false);
    }
  };

  // Save API key - seguindo padrão chat_sessions
  const saveApiKey = async (provider: string, apiKey: string) => {
    console.log('saveApiKey: starting, provider=', provider, 'hasKey=', !!apiKey, 'user=', !!user, 'session=', !!session);
    
    if (!user || !session || !apiKey) {
      console.error('saveApiKey: missing requirements - user:', !!user, 'session:', !!session, 'apiKey:', !!apiKey);
      return false;
    }

    setLoading(true);
    try {
      console.log('saveApiKey: encrypting key...');
      const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET).toString();
      
      console.log('saveApiKey: making upsert call...');
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          provider,
          encrypted_key: encrypted
        });

      console.log('saveApiKey: upsert response, error=', error);

      if (error) {
        console.error('Error saving API key:', error);
        return false;
      }

      if (provider === 'openai') {
        console.log('saveApiKey: setting hasOpenAIKey to true');
        setHasOpenAIKey(true);
      }
      
      console.log('saveApiKey: success');
      return true;
    } catch (error) {
      console.error('saveApiKey: exception', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get API key (decrypted) - seguindo padrão chat_sessions
  const getApiKey = async (provider: string): Promise<string | null> => {
    console.log('getApiKey: starting, provider=', provider, 'user=', !!user, 'session=', !!session);
    
    if (!user || !session) {
      console.error('getApiKey: no user or session');
      return null;
    }

    try {
      console.log('getApiKey: making API call...');
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .maybeSingle();

      console.log('getApiKey: response data=', !!data, 'error=', error);

      if (error || !data) {
        console.log('getApiKey: no data or error, returning null');
        return null;
      }

      console.log('getApiKey: decrypting...');
      const bytes = CryptoJS.AES.decrypt(data.encrypted_key, SECRET);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      console.log('getApiKey: decryption success=', !!decrypted);
      return decrypted || null;
    } catch (error) {
      console.error('getApiKey: exception', error);
      return null;
    }
  };

  // Remove API key - seguindo padrão chat_sessions
  const removeApiKey = async (provider: string) => {
    console.log('removeApiKey: starting, provider=', provider, 'user=', !!user, 'session=', !!session);
    
    if (!user || !session) {
      console.error('removeApiKey: no user or session');
      return false;
    }

    setLoading(true);
    try {
      console.log('removeApiKey: making delete call...');
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider);

      console.log('removeApiKey: delete response, error=', error);

      if (error) {
        console.error('Error removing API key:', error);
        return false;
      }

      if (provider === 'openai') {
        console.log('removeApiKey: setting hasOpenAIKey to false');
        setHasOpenAIKey(false);
      }
      
      console.log('removeApiKey: success');
      return true;
    } catch (error) {
      console.error('removeApiKey: exception', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando user e session estiverem disponíveis - igual chat_sessions
  useEffect(() => {
    console.log('useApiKeys: useEffect triggered, user=', !!user, 'session=', !!session);
    if (user && session) {
      console.log('useApiKeys: calling checkForOpenAIKey');
      checkForOpenAIKey();
    } else {
      console.log('useApiKeys: no user/session, resetting state');
      setHasOpenAIKey(false);
    }
  }, [user, session]);

  return {
    loading,
    hasOpenAIKey,
    saveApiKey,
    getApiKey,
    removeApiKey,
    checkForOpenAIKey
  };
};