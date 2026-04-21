import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to check if a value is a valid, non-placeholder string
const isConfigured = (val: string | undefined | null) => {
  return val && val !== 'undefined' && val !== 'null' && val !== '';
};

export const supabaseConfigError =
  !isConfigured(supabaseUrl) || !isConfigured(supabaseAnonKey)
    ? `Missing or invalid Supabase environment variables. 
       URL: ${isConfigured(supabaseUrl) ? 'Set' : 'Missing/Invalid'}
       Key: ${isConfigured(supabaseAnonKey) ? 'Set' : 'Missing/Invalid'}
       Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel Project Settings.`
    : null;

if (supabaseConfigError) {
  console.warn('[Supabase Config]', supabaseConfigError);
}

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        flowType: "pkce",
      },
    });
