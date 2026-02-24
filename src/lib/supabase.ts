/**
 * Backward-compatible re-export.
 * All existing `import { supabase } from '@/lib/supabase'` continue to work.
 * For server-side (Route Handlers, Server Actions), use:
 *   import { createServerSupabase } from '@/lib/supabase/server';
 */
export { supabase, createClientSupabase } from './supabase/client';
