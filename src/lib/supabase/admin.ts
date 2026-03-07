import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses RLS and should ONLY be used in server-side contexts
 * for administrative tasks (e.g., physical deletion of users from auth.users).
 * 
 * @IMPORTANT Never use this client on the client-side.
 */
export const createAdminSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase Admin: Missing environment variables (URL or SERVICE_ROLE_KEY)');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
