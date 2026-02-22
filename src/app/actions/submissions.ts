'use server';

import { supabase } from '@/lib/supabase';
import { MediaCardProps } from '@/components/MediaCard';

export interface FetchParams {
    page: number;
    limit: number;
    query: string;
    categories?: string[]; // Multiple categories
    mediaTypes?: string[]; // Multiple media types
    sort: 'recentes' | 'antigas';
    author?: string; // New: Filter by author name
}

export async function fetchSubmissions({ page, limit, query, categories, mediaTypes, sort, author }: FetchParams): Promise<{ items: MediaCardProps[], hasMore: boolean }> {
    let queryBuilder = supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('status', 'aprovado');

    // Filtering by Category
    if (categories && categories.length > 0 && !categories.includes('Todos')) {
        queryBuilder = queryBuilder.in('category', categories);
    }

    // Filtering by Author
    if (author) {
        queryBuilder = queryBuilder.eq('authors', author);
    }

    // Filtering by Media Type
    if (mediaTypes && mediaTypes.length > 0) {
        queryBuilder = queryBuilder.in('media_type', mediaTypes);
    }

    if (query) {
        // Use textSearch for better performance with GIN index on title and description,
        // or ilike as a fallback if plain search is preferred. We'll use ilike on a concatenated string
        // or multiple ilike conditions if we want partial matches without full text config.
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,authors.ilike.%${query}%`);
    }

    // Sorting
    if (sort === 'antigas') {
        queryBuilder = queryBuilder.order('created_at', { ascending: true });
    } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: submissions, error, count } = await queryBuilder;

    if (error || !submissions) {
        console.error('Error fetching submissions', error);
        return { items: [], hasMore: false };
    }

    // Fetch like counts for ONLY the returned submissions
    const submissionIds = submissions.map(s => s.id);
    const { data: likeCounts } = await supabase
        .from('curtidas')
        .select('submission_id')
        .in('submission_id', submissionIds);

    const likeMap: Record<string, number> = {};
    if (likeCounts) {
        for (const row of likeCounts) {
            likeMap[row.submission_id] = (likeMap[row.submission_id] || 0) + 1;
        }
    }

    // Fetch comment counts
    const { data: commentCounts } = await supabase
        .from('comments')
        .select('submission_id')
        .in('submission_id', submissionIds)
        .eq('status', 'aprovado');

    const commentMap: Record<string, number> = {};
    if (commentCounts) {
        for (const row of commentCounts) {
            commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1;
        }
    }

    // Fetch save counts
    const { data: saveCounts } = await supabase
        .from('saved_posts')
        .select('submission_id')
        .in('submission_id', submissionIds);

    const saveMap: Record<string, number> = {};
    if (saveCounts) {
        for (const row of saveCounts) {
            saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1;
        }
    }

    const items: MediaCardProps[] = submissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: likeMap[sub.id] || 0,
        commentCount: commentMap[sub.id] || 0,
        saveCount: saveMap[sub.id] || 0,
        external_link: sub.external_link || null,
        created_at: sub.created_at,
        technical_details: sub.technical_details || null,
        alt_text: sub.alt_text || null,
        tags: sub.tags || [],
        views: sub.views || 0,
        reading_time: sub.reading_time || 0
    }));

    const hasMore = count ? from + submissions.length < count : false;

    return { items, hasMore };
}

export async function fetchUserSubmissions(userId: string): Promise<MediaCardProps[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !submissions) {
        console.error('Error fetching user submissions', error);
        return [];
    }

    return submissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: 0, // Simplified for profile view
        external_link: sub.external_link || null,
        created_at: sub.created_at,
        technical_details: sub.technical_details || null,
        alt_text: sub.alt_text || null,
        admin_feedback: sub.admin_feedback || null,
        status: sub.status,
        tags: sub.tags || [],
        views: sub.views || 0,
        reading_time: sub.reading_time || 0
    }));
}

export async function fetchTrendingSubmissions(): Promise<MediaCardProps[]> {
    const { data: submissions, error } = await supabase
        .rpc('get_most_liked_submissions', { limit_count: 3 });

    if (error || !submissions) {
        return [];
    }

    const submissionIds = submissions.map((s: any) => s.id);
    const { data: likeCounts } = await supabase.from('curtidas').select('submission_id').in('submission_id', submissionIds);
    const likeMap: Record<string, number> = {};
    if (likeCounts) {
        for (const row of likeCounts) {
            likeMap[row.submission_id] = (likeMap[row.submission_id] || 0) + 1;
        }
    }

    const { data: commentCounts } = await supabase.from('comments').select('submission_id').in('submission_id', submissionIds).eq('status', 'aprovado');
    const commentMap: Record<string, number> = {};
    if (commentCounts) {
        for (const row of commentCounts) {
            commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1;
        }
    }

    const { data: saveCounts } = await supabase.from('saved_posts').select('submission_id').in('submission_id', submissionIds);
    const saveMap: Record<string, number> = {};
    if (saveCounts) {
        for (const row of saveCounts) {
            saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1;
        }
    }

    return submissions.map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: likeMap[sub.id] || 0,
        commentCount: commentMap[sub.id] || 0,
        saveCount: saveMap[sub.id] || 0,
        external_link: sub.external_link || null,
        created_at: sub.created_at,
        technical_details: sub.technical_details || null,
        alt_text: sub.alt_text || null,
        tags: sub.tags || [],
        views: sub.views || 0,
        reading_time: sub.reading_time || 0
    }));
}
