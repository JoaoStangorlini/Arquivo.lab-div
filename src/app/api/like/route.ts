import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateFingerprint(request: NextRequest): string {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // Simple hash: combine IP + UA into a deterministic string
    const raw = `${ip}::${userAgent}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36);
}

export async function POST(request: NextRequest) {
    try {
        const { submission_id } = await request.json();

        if (!submission_id) {
            return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
        }

        const fingerprint = generateFingerprint(request);

        // Check if already liked by this fingerprint
        const { data: existing } = await supabase
            .from('curtidas')
            .select('id')
            .eq('submission_id', submission_id)
            .eq('fingerprint', fingerprint)
            .maybeSingle();

        let liked: boolean;

        if (existing) {
            // Unlike: remove the row
            await supabase
                .from('curtidas')
                .delete()
                .eq('id', existing.id);
            liked = false;
        } else {
            // Like: insert new row
            await supabase
                .from('curtidas')
                .insert({ submission_id, fingerprint });
            liked = true;
        }

        // Get updated count
        const { count } = await supabase
            .from('curtidas')
            .select('*', { count: 'exact', head: true })
            .eq('submission_id', submission_id);

        return NextResponse.json({
            liked,
            likeCount: count || 0
        });

    } catch (error: unknown) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

