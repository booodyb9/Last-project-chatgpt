import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ugvdoabczcnxluzxehga.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndmRvYWJjemNueGx1enhlaGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODEzMzgsImV4cCI6MjEwMDQ1NzMzOH0.aZRe56HWDhsMconCf2UnJWtAJkNU-6SjSF3Hh3WEk3w';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing; using the configured production Supabase project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveContent = async (key: string, title: string, type: string, body: string) => {
  const { error } = await supabase.from('contents').upsert({
    key,
    title,
    type,
    body,
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' });
  if (error) throw error;
};
