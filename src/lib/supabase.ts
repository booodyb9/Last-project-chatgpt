import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

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
