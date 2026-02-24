import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { submission_id, reason } = body;

        if (!submission_id || !reason) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                submission_id,
                reporter_id: user.id,
                reason,
                status: 'pendente'
            });

        if (error) {
            console.error('Supabase error inserting report:', error);
            return new NextResponse('Database error', { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating report:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
