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
    whatsapp?: string | null;
    pseudonym?: string | null;
    event_year?: number | null;
    media_type?: string;
    co_authors?: string[] | null;
    testimonial?: string | null;
    alt_text?: string | null;
    quiz?: any;
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
        .select('*, profiles(avatar_url, xp, level, is_labdiv), energy_reactions, atomic_excitation', { count: 'exact' })
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
            .select('*, profiles(avatar_url, xp, level, is_labdiv), like_count')
            .eq('status', 'aprovado')
            .order('views', { ascending: false })
            .limit(6);

        if (error || !submissions) return [];

        return submissions.map(sub => ({
            post: mapToPostDTO(sub)
        }));
    },
    ['trending-submissions-v2'],
    { revalidate: 60 }
);

export const getFeaturedSubmissions = unstable_cache(
    async (limit: number = 10): Promise<{ post: PostDTO }[]> => {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('*, profiles(avatar_url, xp, level, is_labdiv)')
            .eq('status', 'aprovado')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !submissions) return [];

        return submissions.map(sub => ({
            post: mapToPostDTO(sub)
        }));
    },
    ['featured-submissions-v2'],
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

import { v2 as cloudinary } from 'cloudinary';

// Opcional: configurar globalmente se as envs estiverem disponíveis no startup
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export async function deleteSubmissionAdmin(id: string) {
    try {
        const supabaseServer = await createServerSupabase();

        // 1. Validar Admin
        const { data: { user } } = await supabaseServer.auth.getUser();
        if (!user) return { error: "Não autenticado" };

        const { data: profile } = await supabaseServer.from('profiles').select('is_labdiv').eq('id', user.id).single();
        if (!profile?.is_labdiv) return { error: "Acesso negado: Administrador necessário." };

        // 2. Buscar a mídia para deletar do Cloudinary
        const { data: sub } = await supabaseServer.from('submissions').select('media_url, media_type').eq('id', id).single();
        if (!sub) return { error: "Submissão não encontrada" };

        // 3. Deletar Arquivos Físicos do Cloudinary (se aplicável)
        if (sub.media_url && ['image', 'pdf', 'zip', 'sdocx'].includes(sub.media_type)) {
            try {
                // Ensure config is present (in case global init failed or wasn't executed)
                cloudinary.config({
                    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });

                let urls: string[] = [];
                try {
                    urls = JSON.parse(sub.media_url);
                } catch {
                    // Try parsing as simple array string if single URL or not JSON format
                    if (sub.media_url.startsWith('["') || sub.media_url.startsWith('[')) {
                        urls = JSON.parse(sub.media_url);
                    } else {
                        urls = [sub.media_url];
                    }
                }

                for (const url of urls) {
                    if (typeof url === 'string' && url.includes('cloudinary.com')) {
                        const parts = url.split('/upload/');
                        if (parts.length > 1) {
                            let publicIdPath = parts[1];
                            publicIdPath = publicIdPath.replace(/^v\d+\//, '');
                            // Remove a extensão (o Cloudinary destroy precisa só do Public ID sem a extensão por padrão para image)
                            const publicId = publicIdPath.replace(/\.[^/.]+$/, "");

                            const resourceType = ['image', 'pdf'].includes(sub.media_type) ? 'image' : 'raw';

                            await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: resourceType });
                            console.log(`Cloudinary Delete Log: Deleted ${publicId} (${resourceType})`);
                        }
                    }
                }
            } catch (mediaErr) {
                console.warn("Erro ao tentar deletar mídia do Cloudinary:", mediaErr);
                // Não bloqueia a deleção do banco se falhar a mídia
            }
        }

        // 4. Deletar do banco de dados Submissions
        const { error } = await supabaseServer.from('submissions').delete().eq('id', id);

        if (error) {
            console.error("Erro ao deletar submissão do banco:", error);
            return { error: error.message };
        }

        revalidatePath('/admin/pendentes');
        return { success: true };

    } catch (err: any) {
        console.error("Erro inesperado em deleteSubmissionAdmin:", err);
        return { error: err.message || "Erro interno do servidor." };
    }
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
    ['sidebar-tags-v2'],
    { revalidate: 60 }
);

export const getUsersInOrbit = unstable_cache(
    async (limit = 5) => {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, xp, level, is_labdiv')
            .eq('review_status', 'approved')
            .eq('is_visible', true)
            .limit(limit);

        return profiles?.map(p => ({
            id: p.id,
            name: p.full_name || 'Usuário',
            handle: p.email ? `@${p.email.split('@')[0]}` : '@usuario',
            avatar: p.avatar_url,
            xp: p.xp,
            level: p.level,
            is_labdiv: p.is_labdiv
        })) || [];
    },
    ['users-in-orbit-v2'],
    { revalidate: 60 }
);

export async function searchProfiles(query: string) {
    if (!query || query.length < 2) return [];

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, xp, level, is_labdiv')
        .eq('review_status', 'approved')
        .eq('is_visible', true)
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
        level: p.level,
        is_labdiv: p.is_labdiv
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
    console.log("Server Action: createSubmission received payload:", JSON.stringify(formData, null, 2));
    const validated = SubmissionSchema.safeParse(formData);
    if (!validated.success) {
        const fieldErrors = validated.error.flatten().fieldErrors;
        console.error("Server Action: Validation Failed!", fieldErrors);
        return {
            error: {
                validation: fieldErrors,
                message: "Falha na validação dos dados pelo servidor."
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
        quiz,
        video_url, // Excluded from DB insert as it has no column
        ...insertData
    } = validated.data;

    const co_author_ids = Array.isArray(co_authors)
        ? co_authors.map(u => typeof u === 'string' ? u : u.id).filter(Boolean)
        : [];

    // Map year to event_date
    const event_date = event_year ? `${event_year}-01-01T12:00:00Z` : null;

    // Fix: DB media_type enum is ['image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx']
    // Frontend uses 'text' for some links, but DB might expect 'link'
    let db_media_type = insertData.media_type;
    if (db_media_type as string === 'text' && (insertData.media_url?.startsWith('http') || insertData.external_link)) {
        // Only switch to 'link' if it's actually a link
        // Actually, the DB enum has 'text' AND 'link'. 
        // Let's check the schema again. DB: image, video, pdf, text, link, zip, sdocx.
        // If it's a social post link, it should probably be 'link'.
    }

    const insertPayload = {
        ...insertData,
        co_author_ids,
        event_date,
        pseudonym_id,
        quiz,
        user_id: user.id,
        status: 'pendente'
    };

    console.log("Server Action: Attempting Insert with:", JSON.stringify(insertPayload, null, 2));

    const { data, error } = await serverSupabase.from('submissions').insert([insertPayload]).select().single();

    if (error) {
        console.error("Server Action: DB Insert Failed!", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return { error: { database: [`Erro DB (${error.code}): ${error.message}`] } };
    }

    revalidatePath('/');
    revalidatePath('/admin/pendentes');

    // Notify Admins
    const { sendAdminNotification } = await import('@/lib/notifications');
    await sendAdminNotification({
        type: 'submission',
        title: data.title,
        authors: data.authors,
        category: data.category || 'Geral'
    });

    return { success: true, data };
}

export async function fetchUserSubmissions(userId: string): Promise<{ post: PostDTO }[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, profiles(avatar_url, xp, level, is_labdiv), energy_reactions, atomic_excitation')
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

import { appendFileSync } from 'fs';
import { join } from 'path';

export async function fetchRecentEntanglements() {
    const logFile = join(process.cwd(), 'entanglements_debug.log');
    const log = (msg: string) => {
        const timestamp = new Date().toISOString();
        try {
            appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
        } catch (e) { }
        console.log(`DEBUG: ${msg}`);
    };

    log("Starting fetchRecentEntanglements (HARDCODED USER MODE)");
    const supabaseServer = await createServerSupabase();

    // FOR TESTING ONLY: Hardcode Joao's ID
    const user = { id: '64f451cd-54db-44bd-814f-a91c1fc77f0a' };
    log(`Using HARDCODED User ID: ${user.id}`);

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
        .select('id, full_name, username, use_nickname, email, avatar_url, xp, level, is_labdiv')
        .in('id', allPeerIds);

    if (pError || !profiles) {
        console.error("Fetch profiles error:", pError);
        return [];
    }

    // 4. Mapeia para o formato esperado pela UI
    return profiles.map(p => {
        const conv = conversationMap.get(p.id);
        const isFollowed = followedIds.includes(p.id);

        return {
            id: p.id,
            name: (p.use_nickname && p.username) ? p.username : (p.full_name || 'Usuário'),
            handle: p.email ? `@${p.email.split('@')[0]}` : '@usuario',
            avatar: p.avatar_url,
            xp: p.xp,
            level: p.level,
            is_labdiv: p.is_labdiv,
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
