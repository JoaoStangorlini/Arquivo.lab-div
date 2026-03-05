'use server';

import { supabase } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase/server';
import { PostDTO, mapToPostDTO } from '@/dtos/media';
import { unstable_cache, revalidatePath } from 'next/cache';
import { SubmissionSchema } from '@/lib/validations';
import { z } from 'zod';

export interface AdminUpdate {
    status?: string;
    admin_feedback?: string | null;
    is_featured?: boolean;
    title?: string;
    authors?: string;
    category?: string;
    description?: string;
    tags?: string[];
    media_url?: string | string[];
    external_link?: string | null;
    technical_details?: string | null;
    is_priority?: boolean;
    event_date?: string | null;
}

export interface FetchParams {
    page: number;
    limit: number;
    query: string;
    categories?: string[];
    mediaTypes?: string[];
    sort: 'recentes' | 'antigas';
    author?: string;
    is_featured?: boolean;
    years?: number[];
}

export async function fetchSubmissions({ page, limit, query, categories, mediaTypes, sort, author, is_featured: featured, years }: FetchParams): Promise<{ items: { post: PostDTO }[], hasMore: boolean }> {
    const supabaseServer = await createServerSupabase();
    let queryBuilder = supabaseServer
        .from('submissions')
        .select('*, profiles(avatar_url, xp, level), energy_reactions, atomic_excitation', { count: 'exact' })
        .eq('status', 'aprovado');

    if (featured) queryBuilder = queryBuilder.eq('is_featured', true);
    if (categories && categories.length > 0) queryBuilder = queryBuilder.in('category', categories);
    if (author) queryBuilder = queryBuilder.eq('authors', author);
    if (mediaTypes && mediaTypes.length > 0) queryBuilder = queryBuilder.in('media_type', mediaTypes);

    if (years && years.length > 0) {
        const orConditions = years.map(y => `and(event_date.gte.${y}-01-01T00:00:00Z,event_date.lte.${y}-12-31T23:59:59Z)`).join(',');
        queryBuilder = queryBuilder.or(orConditions);
    }

    if (query) {
        if (query.startsWith('#')) {
            const tag = query.substring(1).trim();
            if (tag) queryBuilder = queryBuilder.contains('tags', [tag]);
        } else {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,authors.ilike.%${query}%`);
        }
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: sort === 'antigas' });
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: submissions, error, count } = await queryBuilder;
    if (error) {
        console.error("fetchSubmissions SQL Error:", error);
        return { items: [], hasMore: false };
    }
    if (!submissions) return { items: [], hasMore: false };

    const items = submissions.map(sub => ({
        post: mapToPostDTO(sub, undefined, (sub as any).profiles?.avatar_url)
    }));

    const hasMore = count ? from + submissions.length < count : false;
    return { items, hasMore };
}

export const fetchTrendingSubmissions = unstable_cache(
    async (): Promise<{ post: PostDTO }[]> => {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('*, profiles(avatar_url, xp, level), like_count')
            .eq('status', 'aprovado')
            .order('views', { ascending: false })
            .limit(6);

        if (error || !submissions) return [];

        return submissions.map(sub => ({
            post: mapToPostDTO(sub)
        }));
    },
    ['trending-submissions-v1'],
    { revalidate: 60 }
);

export const getFeaturedSubmissions = unstable_cache(
    async (limit: number = 10): Promise<{ post: PostDTO }[]> => {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('*, profiles(avatar_url, xp, level)')
            .eq('status', 'aprovado')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !submissions) return [];

        return submissions.map(sub => ({
            post: mapToPostDTO(sub)
        }));
    },
    ['featured-submissions-v1'],
    { revalidate: 60 }
);

export async function getUserPseudonyms() {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await serverSupabase
        .from('pseudonyms')
        .select('*')
        .eq('user_id', user.id);

    if (error) return [];
    return data;
}

export async function createPseudonym(name: string) {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await serverSupabase
        .from('pseudonyms')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, data };
}

export async function togglePseudonymActive(id: string, is_active: boolean) {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await serverSupabase
        .from('pseudonyms')
        .update({ is_active })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { success: true, data };
}

export async function deletePseudonym(id: string) {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await serverSupabase
        .from('pseudonyms')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { success: true };
}

export const getTrendingTags = unstable_cache(
    async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const { data, error } = await supabase
            .from('submissions')
            .select('tags')
            .eq('status', 'aprovado')
            .gte('created_at', oneWeekAgo.toISOString());

        if (error || !data) return [];
        const tagCounts: Record<string, number> = {};
        data.forEach(sub => sub.tags?.forEach((tag: string) => {
            const t = tag.trim();
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        }));
        return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
    },
    ['trending-tags-v5'],
    { revalidate: 3600 }
);

export const getSidebarTags = unstable_cache(
    async () => {
        const { data } = await supabase.from('submissions').select('tags').eq('status', 'aprovado').limit(100);
        const tagCounts: Record<string, number> = {};
        data?.forEach(sub => sub.tags?.forEach((tag: string) => {
            const t = tag.trim();
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        }));
        return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
    },
    ['sidebar-tags-v1'],
    { revalidate: 60 }
);

export const getUsersInOrbit = unstable_cache(
    async (limit = 5) => {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, xp, level')
            .limit(limit);

        return profiles?.map(p => ({
            id: p.id,
            name: p.full_name || 'Usuário',
            handle: p.email ? `@${p.email.split('@')[0]}` : '@usuario',
            avatar: p.avatar_url,
            xp: p.xp,
            level: p.level
        })) || [];
    },
    ['users-in-orbit-v1'],
    { revalidate: 60 }
);

export async function searchProfiles(query: string) {
    if (!query || query.length < 2) return [];

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, xp, level')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

    if (error) {
        console.error("Action searchProfiles error:", error);
        return [];
    }

    return profiles?.map(p => ({
        id: p.id,
        name: p.full_name || 'Usuário',
        handle: p.email ? `@${p.email.split('@')[0]}` : '@colaborador',
        avatar: p.avatar_url,
        xp: p.xp,
        level: p.level
    })) || [];
}

export async function followUser(followingId: string) {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const { error } = await supabaseServer
        .from('follows')
        .insert([{ follower_id: user.id, following_id: followingId }]);

    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    return { success: true };
}

export async function unfollowUser(followingId: string) {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const { error } = await supabaseServer
        .from('follows')
        .delete()
        .match({ follower_id: user.id, following_id: followingId });

    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    return { success: true };
}

export async function checkIsFollowing(followingId: string) {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return false;

    const { data } = await supabaseServer
        .from('follows')
        .select('id')
        .match({ follower_id: user.id, following_id: followingId })
        .single();

    return !!data;
}

export async function getProfileById(id: string) {
    const supabaseServer = await createServerSupabase();
    const { data } = await supabaseServer
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', id)
        .single();

    return data ? {
        id: data.id,
        name: data.full_name || 'Usuário',
        handle: data.email ? `@${data.email.split('@')[0]}` : '@usuario',
        avatar: data.avatar_url,
    } : null;
}

export async function sendMessage(recipientId: string, content: string, attachmentId?: string) {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const { error } = await supabaseServer
        .from('messages')
        .insert([{
            sender_id: user.id,
            recipient_id: recipientId,
            content,
            attachment_id: attachmentId || null,
            status: 'sent'
        }]);

    if (error) {
        console.error("Message send error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function fetchMessages(recipientId: string) {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabaseServer
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch messages error:", error);
        return [];
    }

    return data || [];
}

export async function createSubmission(formData: z.infer<typeof SubmissionSchema>) {
    console.log("Server Action: createSubmission received:", JSON.stringify(formData, null, 2));
    const validated = SubmissionSchema.safeParse(formData);

    if (!validated.success) {
        const flattened = validated.error.flatten();
        console.error("Server Action: Zod Validation Failed:", JSON.stringify(flattened.fieldErrors, null, 2));
        return {
            error: {
                ...flattened.fieldErrors,
                formErrors: flattened.formErrors
            }
        };
    }
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: { auth: ["Unauthorized"] } };

    // [GOLDEN MASTER] DB Mapping & Cleaning
    const {
        read_guide,
        accepted_cc,
        co_authors,
        event_year,
        pseudonym_id,
        new_pseudonym,
        ...insertData
    } = validated.data;

    const co_author_ids = Array.isArray(co_authors)
        ? co_authors.map(u => typeof u === 'string' ? u : u.id).filter(Boolean)
        : [];

    // Map year to event_date
    const event_date = event_year ? `${event_year}-01-01T12:00:00Z` : null;

    const { data, error } = await supabase.from('submissions').insert([{
        ...insertData,
        co_author_ids,
        event_date,
        pseudonym_id,
        user_id: user.id,
        status: 'pendente'
    }]).select().single();

    if (error) {
        console.error("Server Action: DB Insert Failed:", error);
        return { error: { database: [error.message || "Erro desconhecido no banco"] } };
    }

    revalidatePath('/');
    revalidatePath('/admin/pendentes');

    return { success: true, data };
}

export async function fetchUserSubmissions(userId: string): Promise<{ post: PostDTO }[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, profiles(avatar_url, xp, level), energy_reactions, atomic_excitation')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !submissions) return [];

    return submissions.map(sub => ({
        post: mapToPostDTO(sub)
    }));
}

export async function updateSubmissionAdmin(id: string, updates: AdminUpdate) {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: { message: 'Unauthorized' } };

    // Strict Admin Check
    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: { message: 'Forbidden' } };

    const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (!error) {
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/pendentes');
        revalidatePath('/admin/acervo');
        revalidatePath('/fluxo');
    }
    return { data, error };
}

export async function fetchAdminSubmissions(status: string) {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error || !submissions) return [];
    return submissions.map(sub => mapToPostDTO(sub));
}

export async function fetchParticlePreview(id: string) {
    const { data, error } = await supabase
        .from('submissions')
        .select('title, authors, atomic_excitation')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        title: data.title,
        author: data.authors,
        energy: data.atomic_excitation || 0
    };
}

export async function getCurrentUserId() {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    return user?.id || null;
}

export async function fetchRecentEntanglements() {
    const supabaseServer = await createServerSupabase();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return [];

    // 1. Busca mensagens para identificar conversas ativas
    const { data: messages, error: mError } = await supabaseServer
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (mError) {
        console.error("Fetch messages error:", mError);
    }

    // 2. Busca usuários que o usuário atual segue
    const { data: follows, error: fError } = await supabaseServer
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

    if (fError) {
        console.error("Fetch follows error:", fError);
    }

    // Agrupa por usuário para pegar a ÚLTIMA mensagem de cada conversa
    const conversationMap = new Map();
    messages?.forEach(m => {
        const peerId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!conversationMap.has(peerId)) {
            conversationMap.set(peerId, {
                lastMessage: m.content,
                lastAt: m.created_at
            });
        }
    });

    // Pega IDs de seguidos que ainda não estão no mapa de conversas
    const followedIds = follows?.map(f => f.following_id) || [];

    // Lista final de IDs únicos (conversas + seguidos)
    const allPeerIds = Array.from(new Set([
        ...Array.from(conversationMap.keys()),
        ...followedIds
    ]));

    if (allPeerIds.length === 0) return [];

    // 3. Busca perfis para todos esses IDs
    const { data: profiles, error: pError } = await supabaseServer
        .from('profiles')
        .select('id, full_name, email, avatar_url, xp, level')
        .in('id', allPeerIds);

    if (pError || !profiles) return [];

    // 4. Mapeia para o formato esperado pela UI
    return profiles.map(p => {
        const conv = conversationMap.get(p.id);
        const isFollowed = followedIds.includes(p.id);

        return {
            id: p.id,
            name: p.full_name || 'Usuário',
            handle: p.email ? `@${p.email.split('@')[0]}` : '@usuario',
            avatar: p.avatar_url,
            xp: p.xp,
            level: p.level,
            lastMessage: conv?.lastMessage,
            lastAt: conv?.lastAt,
            isFollowed
        };
    }).sort((a, b) => {
        // Ordena por data da última mensagem, ou coloca seguidos sem conversa no final
        if (a.lastAt && b.lastAt) return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return 0;
    });
}
