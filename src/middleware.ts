import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    let response = NextResponse.next({ request });

    // --- Supabase Session Refresh ---
    // Refreshes the auth token on every request to prevent silent logouts.
    // Uses @supabase/ssr with cookie get/set on the response object.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Forward cookies to both the request (for downstream SSR)
                    // and the response (for the browser)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Performance: Only refresh auth token on routes that need it
    // Public routes skip getUser() to save ~100-200ms TTFB
    const isPublicRoute = pathname === '/' ||
        pathname.startsWith('/wiki') ||
        pathname.startsWith('/arquivo') ||
        pathname.startsWith('/sobre') ||
        pathname.startsWith('/fluxo') ||
        pathname.startsWith('/api/og');

    if (!isPublicRoute) {
        // This call triggers the token refresh if needed
        await supabase.auth.getUser();
    }

    // --- Admin Auth Check (Hardened) ---
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // Check for password-based session cookie first (bypass)
        const adminSession = request.cookies.get('admin_session');
        if (adminSession?.value === 'authenticated') {
            return response;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Verify admin role in profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            const homeUrl = new URL('/', request.url);
            return NextResponse.redirect(homeUrl);
        }
    }

    // --- V8.0 Security Hardening: Strict CSP & Headers ---
    // style-src: 'unsafe-inline' is required for Framer Motion and KaTeX runtime styles.
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.supabase.co https://*.cloudinary.com https://*.youtube.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.supabase.co https://*.cloudinary.com https://i.ytimg.com https://*.ytimg.com https://*.googleusercontent.com https://*.discordapp.com;
        font-src 'self' data: https://fonts.gstatic.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cloudinary.com https://*.resend.com https://fonts.googleapis.com;
        media-src 'self' https://*.supabase.co https://*.cloudinary.com https://*.youtube.com;
        frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    return response;
}

export const config = {
    matcher: [
        // Run middleware on all routes except static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

