import { createClient } from '@supabase/supabase-js';

// Using relative '/supabase-api' so Vite proxies the request (bypasses ISP browser blocking)
const supabaseUrl = window.location.origin + '/supabase-api';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
