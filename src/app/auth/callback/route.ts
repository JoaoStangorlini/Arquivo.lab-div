import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        // Use the cookie-aware server client so the session
        // is properly persisted in the browser via set-cookie headers
        const supabase = await createServerSupabase();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const redirectUrl = new URL(next, request.url);
            return NextResponse.redirect(redirectUrl);
        }
        console.error('Auth callback: Code exchange failed', error);
    } else {
        console.warn('Auth callback: No code provided in URL');
    }

    // Error: redirect back to login with a specific error flag
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'auth-code-error');
    return NextResponse.redirect(errorUrl);
}

