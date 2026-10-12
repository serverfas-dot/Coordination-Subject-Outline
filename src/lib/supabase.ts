import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://ilrmbohjgspyrjvihesd.supabase.co';
const fallbackSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm1ib2hqZ3NweXJqdmloZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNzA3NzUsImV4cCI6MjEwNjY0Njc3NX0.mblpTopN0-VbeC0rb3IWpB1806YpxuowYw5JmJiilKQ';
const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = configuredSupabaseUrl?.startsWith('http') ? configuredSupabaseUrl : fallbackSupabaseUrl;
const supabaseAnonKey = configuredSupabaseAnonKey?.startsWith('eyJ') ? configuredSupabaseAnonKey : fallbackSupabaseAnonKey;

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
