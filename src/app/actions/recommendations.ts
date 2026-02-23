'use server';

import { supabase } from '@/lib/supabase';
import { MediaCardProps } from '@/components/MediaCard';

export async function getForYouRecommendations(userId: string | undefined): Promise<MediaCardProps[]> {
    if (!userId) {
        // Return latest featured if no user
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(4);
        return (data || []) as any;
    }

    // 1. Get user's most read categories and tags
    const { data: history } = await supabase
        .from('reading_history')
        .select(`
            submission_id,
            submissions (
                category,
                tags
            )
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(10);

    if (!history || history.length === 0) {
        // Fallback to trending
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .order('views', { ascending: false })
            .limit(4);
        return (data || []) as any;
    }

    const categories = Array.from(new Set(history.map((h: any) => h.submissions.category).filter(Boolean)));
    const tags = Array.from(new Set(history.flatMap((h: any) => h.submissions.tags || []))).slice(0, 5);

    // 2. Fetch submissions matching these categories or tags, excluding already read
    const readIds = history.map((h: any) => h.submission_id);

    let query = supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .not('id', 'in', `(${readIds.join(',')})`);

    if (categories.length > 0) {
        query = query.in('category', categories);
    }

    // Simplification: categories OR tags is hard in Supabase JS without OR filters on different tables/complex logic.
    // We'll prioritize categories and then sort by relevance.

    const { data: recommendations, error } = await query
        .order('created_at', { ascending: false })
        .limit(4);

    if (error || !recommendations || recommendations.length < 2) {
        // Fallback if not enough targeted recommendations
        const { data: fallback } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .not('id', 'in', `(${readIds.join(',')})`)
            .order('views', { ascending: false })
            .limit(4);
        return (fallback || []) as any;
    }

    return recommendations as any;
}
