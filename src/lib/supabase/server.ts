import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for **Server-side** contexts:
 * - Route Handlers (app/api/*, app/auth/callback)
 * - Server Actions ('use server')
 * - Server Components
 *
 * This client is cookie-aware: it reads/writes auth tokens via
 * Next.js cookies(), enabling proper session persistence across
 * the SSR boundary.
 */
export async function createServerSupabase() {
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // setAll may fail in Server Components (read-only context).
                    // This is safe to ignore — cookies will still be set in
                    // Route Handlers and Server Actions where it matters.
                }
            },
        },
    });
}
