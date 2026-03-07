'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Profile, Freshman } from '@/types';

async function checkIsAdmin() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}

export async function updateProfile(updates: Partial<Profile>) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Não autorizado' };
    }

    // Get current profile status
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('review_status, pending_edits')
        .eq('id', user.id)
        .single();

    // ALL changes by users (non-admins) go to pending_edits for review.
    // The main columns always hold the last approved version.
    const updatePayload = {
        pending_edits: {
            ...(currentProfile?.pending_edits || {}),
            ...updates
        },
        review_status: 'pending'
    };

    // Special case: username/use_nickname should probably be live if they are just toggles?
    // Actually, user wants "ao editar deve ser aprovado pelo adm". So everything goes to pending.

    // BUT, we want to allow immediate nickname selection if it's already created?
    // Let's stick to the rule: ALL edits go to pending.

    const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
    }

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');
    return { success: true, data };
}

export async function approveProfile(profileId: string) {
    const supabase = await createServerSupabase();
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('Auth check error:', authError);
        return { error: `Erro de autenticação: ${authError.message}` };
    }

    if (!adminUser) {
        console.warn('No user found in session for approveProfile');
        return { error: 'Não autorizado: Sessão não encontrada' };
    }

    // Admin check
    const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();

    if (profileError) {
        console.error('Error fetching admin profile:', profileError);
        return { error: `Erro ao verificar permissões: ${profileError.message}` };
    }

    if (adminProfile?.role !== 'admin') {
        console.warn(`User ${adminUser.id} attempted admin action with role: ${adminProfile?.role}`);
        return { error: `Acesso negado: Perfil ${adminProfile?.role} não tem permissão de admin` };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (!profile) return { error: 'Perfil não encontrado' };

    const finalData = {
        ...(profile.pending_edits || {}),
        pending_edits: null,
        review_status: 'approved'
    };

    const { error } = await supabase
        .from('profiles')
        .update(finalData)
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');
    revalidatePath('/orbit'); // Revalidate orbit view too
    return { success: true };
}

export async function getProfileWithPseudonyms() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (pError) return { error: pError.message };

    // Merge pending_edits so the user sees their latest draft in the modal
    const profileWithEdits = {
        ...profile,
        ...(profile.pending_edits || {}),
        email: user.email // Inject explicit email from Auth
    };

    const { data: pseudonyms, error: psError } = await supabase
        .from('pseudonyms')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

    return {
        profile: profileWithEdits as Profile,
        pseudonyms: pseudonyms || []
    };
}

/**
 * PHASE 3: GOVERNANCE & ADMIN ACTIONS
 */

export async function deleteProfile(profileId: string) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const adminClient = createAdminSupabase();

    // Physical deletion from auth.users (cascades to public.profiles)
    const { error } = await adminClient.auth.admin.deleteUser(profileId);

    if (error) {
        console.error('Error deleting user:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/papeis');
    return { success: true };
}

export async function impersonateUser(userId: string) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const cookieStore = await cookies();

    // Set an HttpOnly cookie for impersonation
    cookieStore.set('admin_impersonating_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2, // 2 hours
        path: '/',
    });

    revalidatePath('/');
    return { success: true };
}

export async function stopImpersonation() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_impersonating_id');

    revalidatePath('/');
    return { success: true };
}

export async function toggleProfileVisibility(profileId: string, isVisible: boolean) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const adminClient = createAdminSupabase();
    const { error } = await adminClient
        .from('profiles')
        .update({ is_visible: isVisible })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    revalidatePath(`/autor/${profileId}`);
    return { success: true };
}

export async function toggleLabdivMember(profileId: string, isLabdiv: boolean) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const adminClient = createAdminSupabase();
    const { error } = await adminClient
        .from('profiles')
        .update({ is_labdiv: isLabdiv })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    return { success: true };
}

export async function updateProfileAsAdmin(profileId: string, updates: Partial<Profile>) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const adminClient = createAdminSupabase();
    const { error } = await adminClient
        .from('profiles')
        .update({
            full_name: updates.full_name,
            username: updates.username,
            bio: updates.bio,
            institute: updates.institute,
            role: updates.role,
            is_labdiv: updates.is_labdiv,
            is_visible: updates.is_visible
        })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    revalidatePath('/lab');
    return { success: true };
}

export async function uploadEnrollmentProof(formData: FormData) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const file = formData.get('proof') as File | null;
    if (!file || file.size === 0) return { error: 'Arquivo inválido' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('enrollment_proofs')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading proof:', uploadError);
        return { error: 'Falha ao fazer upload do comprovante' };
    }

    return { success: true, path: filePath };
}

export async function getEnrollmentProofUrl(path: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin Check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: 'Acesso negado' };

    // Valid for 60 seconds
    const { data, error } = await supabase.storage
        .from('enrollment_proofs')
        .createSignedUrl(path, 60);

    if (error || !data) {
        console.error('Error creating signed URL:', error);
        return { error: 'Erro ao gerar link de visualização' };
    }

    return { success: true, url: data.signedUrl };
}

export async function fetchFreshmenForAdoption() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Get IDs of freshmen who already have a pending or approved adoption
    const { data: activeAdoptions } = await supabase
        .from('adoptions')
        .select('freshman_id')
        .in('status', ['pending', 'approved']);

    const excludedIds = activeAdoptions?.map(a => a.freshman_id) || [];

    let query = supabase
        .from('profiles')
        .select('id, full_name, username, use_nickname, avatar_url, course, institute, entrance_year, bio, whatsapp, email')
        .eq('seeking_mentor', true)
        .eq('review_status', 'approved');

    if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching freshmen:', error);
        return { error: 'Erro ao buscar bixos interessados' };
    }

    return { success: true, data };
}

export async function fetchMyAdoptedFreshmen() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: adoptions, error } = await supabase
        .from('adoptions')
        .select(`
            freshman:profiles!freshman_id(id, full_name, username, use_nickname, avatar_url, course, institute, entrance_year, bio, whatsapp, email)
        `)
        .eq('mentor_id', user.id)
        .eq('status', 'approved');

    if (error) {
        console.error('Error fetching my adopted freshmen:', error);
        return { error: 'Erro ao buscar seus bixos adotados' };
    }

    // Supabase can return the joined profile as an object or an array of one element
    const flattened = (adoptions || []).map((a: any) =>
        Array.isArray(a.freshman) ? a.freshman[0] : a.freshman
    ).filter(Boolean);

    return { success: true, data: flattened as Freshman[] };
}

export async function requestAdoption(freshmanId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('adoptions')
        .insert({
            mentor_id: user.id,
            freshman_id: freshmanId,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return { error: 'Você já solicitou a adoção deste bixo' };
        console.error('Error requesting adoption:', error);
        return { error: 'Erro ao solicitar adoção' };
    }

    return { success: true, data };
}

export async function fetchAdoptions() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    let query = supabase
        .from('adoptions')
        .select(`
            *,
            mentor:profiles!mentor_id(*),
            freshman:profiles!freshman_id(*)
        `);

    if (profile?.role !== 'admin') {
        // Users see only their relevant adoptions
        query = query.or(`mentor_id.eq.${user.id},freshman_id.eq.${user.id}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching adoptions:', error);
        return { error: 'Erro ao buscar adoções' };
    }

    return { success: true, data };
}

export async function updateAdoptionStatus(adoptionId: string, status: 'approved' | 'rejected') {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Acesso negado' };

    const { error } = await supabase
        .from('adoptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', adoptionId);

    if (error) {
        console.error('Error updating adoption status:', error);
        return { error: 'Erro ao atualizar status da adoção' };
    }

    revalidatePath('/admin/adocoes');
    return { success: true };
}
