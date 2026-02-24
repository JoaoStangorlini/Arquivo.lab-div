import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for **Client Components** ('use client').
 * Uses @supabase/ssr's createBrowserClient which automatically handles
 * cookie-based auth in the browser environment.
 */
export function createClientSupabase() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Singleton instance for backward compatibility.
 * Most client components import `supabase` from `@/lib/supabase`.
 */
export const supabase = createClientSupabase();
