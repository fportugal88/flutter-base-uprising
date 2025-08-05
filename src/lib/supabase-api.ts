// Client específico para o schema API
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bqkmmyjqcazjldicxddn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxa21teWpxY2F6amxkaWN4ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjEzOTUsImV4cCI6MjA2OTg5NzM5NX0.6fgU_7nsz9DCWja1W50vEicxR8ATVqcCHc3NZQI1w9Y";

export const supabaseApi = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'api'
  },
  global: {
    headers: {
      'Accept-Profile': 'api'
    }
  }
});