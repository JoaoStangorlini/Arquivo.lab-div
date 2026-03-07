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

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
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
                }
            },
        },
    });

    // Impersonation Logic: Override getUser to return impersonated user if admin
    const impersonatedId = cookieStore.get('admin_impersonating_id')?.value;
    if (impersonatedId) {
        const originalGetUser = client.auth.getUser.bind(client.auth);
        client.auth.getUser = async (token?: string) => {
            const { data, error } = await originalGetUser(token);
            if (data.user && !error) {
                // Verify if the REAL user is actually an admin
                const { data: profile } = await client
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    // Return a "fake" user object with the impersonated ID
                    return {
                        data: {
                            user: {
                                ...data.user,
                                id: impersonatedId,
                                // @ts-ignore - custom properties for internal tracking
                                isImpersonated: true,
                                // @ts-ignore
                                adminId: data.user.id
                            }
                        },
                        error: null
                    };
                }
            }
            return { data, error } as any;
        };
    }

    return client;
}
