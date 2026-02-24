'use server';

import { supabase } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase/server';
import { MediaCardProps } from '@/components/MediaCard';
import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache';
import { SubmissionSchema } from '@/lib/validations';
import { z } from 'zod';

export interface FetchParams {
    page: number;
    limit: number;
    query: string;
    categories?: string[]; // Multiple categories
    mediaTypes?: string[]; // Multiple media types
    sort: 'recentes' | 'antigas';
    author?: string; // New: Filter by author name
    is_featured?: boolean; // New: Filter by featured status
    year?: number; // New: Filter by event_date year
}

export async function fetchSubmissions({ page, limit, query, categories, mediaTypes, sort, author, is_featured: featured, year }: FetchParams): Promise<{ items: MediaCardProps[], hasMore: boolean }> {
    let queryBuilder = supabase
        .from('submissions')
        .select('*, reactions_summary, kudos_total', { count: 'exact' })
        .eq('status', 'aprovado');

    // Filtering by Featured
    if (featured) {
        queryBuilder = queryBuilder.eq('is_featured', true);
    }

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

    // Filtering by Year (using event_date)
    if (year) {
        const startDate = `${year}-01-01T00:00:00Z`;
        const endDate = `${year}-12-31T23:59:59Z`;
        queryBuilder = queryBuilder.gte('event_date', startDate).lte('event_date', endDate);
    }

    if (query) {
        if (query.startsWith('#')) {
            // Precise tag search: if it starts with #, filter the tags array directly
            const tag = query.substring(1).trim();
            if (tag) {
                queryBuilder = queryBuilder.contains('tags', [tag]);
            }
        } else {
            // Normal text search
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,authors.ilike.%${query}%`);
        }
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

    // Fetch like counts is now handled by the SQL trigger and 'like_count' column.
    const submissionIds = submissions.map(s => s.id);

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
        isFeatured: sub.is_featured,
        likeCount: sub.like_count || 0,
        commentCount: commentMap[sub.id] || 0,
        saveCount: saveMap[sub.id] || 0,
        external_link: sub.external_link || null,
        created_at: sub.created_at,
        technical_details: sub.technical_details || null,
        alt_text: sub.alt_text || null,
        tags: sub.tags || [],
        views: sub.views || 0,
        reading_time: sub.reading_time || 0,
        location_lat: sub.location_lat ? Number(sub.location_lat) : null,
        location_lng: sub.location_lng ? Number(sub.location_lng) : null,
        location_name: sub.location_name || null,
        reactions_summary: sub.reactions_summary || {},
        kudos_total: sub.kudos_total || 0
    }));

    const hasMore = count ? from + submissions.length < count : false;

    return { items, hasMore };
}

export async function fetchUserSubmissions(userId: string): Promise<MediaCardProps[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('id, title, description, authors, media_type, media_url, category, is_featured, external_link, created_at, technical_details, alt_text, admin_feedback, status, tags, views, reading_time, like_count')
        .eq('user_id', userId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
        .limit(50);

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
        isFeatured: sub.is_featured,
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
        .from('submissions')
        .select('id, title, description, authors, media_type, media_url, category, is_featured, external_link, created_at, technical_details, alt_text, tags, views, reading_time, like_count')
        .eq('status', 'aprovado')
        .order('views', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

    if (error || !submissions) {
        return [];
    }

    const submissionIds = submissions.map((s: any) => s.id);

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
        isFeatured: sub.is_featured,
        likeCount: sub.like_count || 0,
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

export const getTrendingTags = unstable_cache(
    async () => {
        const { data, error } = await supabase
            .from('submissions')
            .select('tags')
            .eq('status', 'aprovado');

        if (error || !data) return [];

        const tagCounts: Record<string, number> = {};
        data.forEach(sub => {
            if (sub.tags && Array.isArray(sub.tags)) {
                sub.tags.forEach((tag: string) => {
                    const normalizedTag = tag.trim();
                    if (normalizedTag) {
                        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
                    }
                });
            }
        });

        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);
    },
    ['trending-tags'],
    { revalidate: 3600, tags: ['submissions'] }
);

export async function getFeaturedSubmissions(limit: number = 10): Promise<MediaCardProps[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('id, title, description, authors, media_type, media_url, category, is_featured, external_link, created_at, technical_details, alt_text, tags, views, reading_time')
        .eq('status', 'aprovado')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 20));

    if (error || !submissions) return [];

    return submissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.is_featured,
        tags: sub.tags || [],
        reading_time: sub.reading_time || 0,
        views: sub.views || 0,
        created_at: sub.created_at,
        likeCount: 0, // Simplified for carousel
        commentCount: 0,
        saveCount: 0
    })) as MediaCardProps[];
}

export async function createSubmission(formData: z.infer<typeof SubmissionSchema>) {
    // 1. Validate Input (Native Shielding)
    const validated = SubmissionSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    // 2. Get User ID (Session Validation) — uses cookie-aware server client
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: { auth: ["Usuário não autenticado"] } };

    // 3. Rate Limiting (Server Side Protection)
    const { data: submissions, error: countError } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    if (submissions && submissions.length >= 5) {
        return { error: { rateLimit: ["Limite de envios atingido (máx 5/hora). Tente novamente mais tarde."] } };
    }

    // 4. [I04] Intelligent Authorship - Pseudonym Limit (Max 2 per account)
    if (validated.data.use_pseudonym) {
        const { data: existingPseudonyms, error: pseudonymError } = await supabase
            .from('submissions')
            .select('authors')
            .eq('user_id', user.id)
            .eq('use_pseudonym', true);

        if (pseudonymError) return { error: { database: ["Erro ao verificar pseudônimos existentes."] } };

        const distinctPseudonyms = new Set(existingPseudonyms?.map(s => s.authors.trim().toLowerCase()) || []);
        const newPseudonym = validated.data.authors.trim().toLowerCase();

        if (!distinctPseudonyms.has(newPseudonym) && distinctPseudonyms.size >= 2) {
            return {
                error: {
                    authors: ["Você atingiu o limite de 2 pseudônimos diferentes. Por favor, use um de seus nomes já utilizados ou seu nome real."]
                }
            };
        }
    }

    // 5. Transform and Insert
    const { data, error } = await supabase
        .from('submissions')
        .insert([{
            ...validated.data,
            user_id: user.id,
            status: 'pendente', // Default status for review
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        console.error('Submission error:', error);

        // 🛡️ [GOLDEN MASTER] Pure Code Mapping
        if (error.message?.includes('LIMITE_PSEUDONIMO_ATINGIDO')) {
            return { error: { authors: ["ERR_PSEUDONYM_LIMIT"] } };
        }

        return { error: { database: ["ERR_DATABASE_GENERAL"] } };
    }

    // 5. Cache Busting
    revalidatePath('/', 'layout');

    return { success: true, data };
}

/**
 * 🛠️ updateSubmissionAdmin (Golden Master V3.6)
 * White-List Validation + Zero-Payload Protection + RLS Optimization.
 */
export async function updateSubmissionAdmin(id: string, formData: Partial<z.infer<typeof SubmissionSchema>> & { status?: string, admin_feedback?: string | null, is_featured?: boolean }) {
    const serverSupabase = await createServerSupabase();

    // 1. Proactive Session Audit
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: "AUTH_REQUIRED", message: "Sessão expirada. Por favor, faça login novamente." };

    // 2. White-List Validation (Deep Shield)
    // Somente campos autorizados passam. Status e metadados protegidos são tratados separadamente ou via RLS.
    const whiteListSchema = SubmissionSchema.pick({
        title: true,
        description: true,
        authors: true,
        category: true,
        external_link: true,
        use_pseudonym: true,
        media_url: true,
        tags: true
    }).partial();

    const validated = whiteListSchema.safeParse(formData);
    if (!validated.success) {
        return { error: "INVALID_DATA", message: validated.error.issues[0].message };
    }

    // 3. Atomic Data Preparation
    const updateData: any = { ...validated.data };

    // Campos administrativos explícitos (se fornecidos)
    if (formData.status) updateData.status = formData.status;
    if (formData.admin_feedback !== undefined) updateData.admin_feedback = formData.admin_feedback;
    if (formData.is_featured !== undefined) updateData.is_featured = formData.is_featured;

    // 4. Zero-Payload Protection (Atomic Efficiency)
    if (Object.keys(updateData).length === 0) {
        return { success: true, message: "Nenhuma alteração detectada." };
    }

    // 5. Database Mutation (RLS Optimized)
    // Confiamos no RLS do Supabase para negar a mutação se o user não for dono/admin.
    const { data, error } = await serverSupabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Update collision/permission error:', error);
        // Distinguindo entre erro de permissão (403) e outros
        if (error.code === '42501') {
            return { error: "FORBIDDEN", message: "Você não tem permissão para editar esta submissão." };
        }
        return { error: "DATABASE_ERROR", message: "Falha ao processar atualização no banco de dados." };
    }

    // 6. Cache Busting
    revalidatePath('/admin/pendentes');
    revalidatePath('/admin/acervo');
    revalidatePath(`/arquivo/${id}`);

    return { success: true, data };
}
