// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL não está definida nas variáveis de ambiente. Verifique NEXT_PUBLIC_SUPABASE_URL.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key não está definida nas variáveis de ambiente. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
