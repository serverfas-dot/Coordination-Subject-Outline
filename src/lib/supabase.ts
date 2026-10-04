import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const hasValidSupabaseConfig = (() => {
  try {
    const url = new URL(supabaseUrl);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(supabaseAnonKey);
  } catch {
    return false;
  }
})();

export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
