import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

/**
 * Supabase client for API calls
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the base URL for edge functions
 */
export const getFunctionsUrl = () => {
  return `${supabaseUrl}/functions/v1`;
};
