import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    // In a Route Handler, we use the request's origin to avoid absolute URL construction issues
    // on platforms like Google App Hosting/Cloud Run
    if (code) {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Success: redirect to the 'next' destination
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
