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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

  // Check if user has OpenAI key
  const checkForOpenAIKey = async () => {
    if (!user) {
      setHasOpenAIKey(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'openai')
        .maybeSingle();

      if (error) {
        console.error('Error checking API key:', error);
        setHasOpenAIKey(false);
        return;
      }

      setHasOpenAIKey(!!data);
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save API key
  const saveApiKey = async (provider: string, apiKey: string) => {
    if (!user || !apiKey) {
      console.error('User not authenticated or API key empty');
      return false;
    }

    setLoading(true);
    try {
      const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET).toString();

      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          provider,
          encrypted_key: encrypted
        });

      if (error) {
        console.error('Error saving API key:', error);
        return false;
      }

      if (provider === 'openai') {
        setHasOpenAIKey(true);
      }
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get API key (decrypted)
  const getApiKey = async (provider: string): Promise<string | null> => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      const bytes = CryptoJS.AES.decrypt(data.encrypted_key, SECRET);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  };

  // Remove API key
  const removeApiKey = async (provider: string) => {
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (error) {
        console.error('Error removing API key:', error);
        return false;
      }

      if (provider === 'openai') {
        setHasOpenAIKey(false);
      }
      return true;
    } catch (error) {
      console.error('Error removing API key:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkForOpenAIKey();
    }
  }, [user]);

  return {
    loading,
    hasOpenAIKey,
    saveApiKey,
    getApiKey,
    removeApiKey,
    checkForOpenAIKey
  };
};