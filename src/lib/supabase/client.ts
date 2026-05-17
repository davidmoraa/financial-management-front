import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let warnedMissingEnv = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV && !warnedMissingEnv) {
      console.warn("[supabase-client] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase Auth disabled.");
      warnedMissingEnv = true;
    }
    return null;
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export const supabase = getSupabaseClient();
