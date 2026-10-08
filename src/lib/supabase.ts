import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ilrmbohjgspyrjvihesd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm1ib2hqZ3NweXJqdmloZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNzA3NzUsImV4cCI6MjEwNjY0Njc3NX0.mblpTopN0-VbeC0rb3IWpB1806YpxuowYw5JmJiilKQ';

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
