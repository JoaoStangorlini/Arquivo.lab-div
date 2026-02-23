'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function fetchUserCollections(userId: string) {
    const { data, error } = await supabase
        .from('collections')
        .select(`
            *,
            item_count:collection_items(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
}

export async function createCollection(userId: string, name: string, isPrivate: boolean = true) {
    const { data, error } = await supabase
        .from('collections')
        .insert({ user_id: userId, name, is_private: isPrivate })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleItemInCollection(collectionId: string, submissionId: string) {
    // Check if item is already in collection
    const { data: existing } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('submission_id', submissionId)
        .single();

    if (existing) {
        await supabase
            .from('collection_items')
            .delete()
            .eq('collection_id', collectionId)
            .eq('submission_id', submissionId);
        return { action: 'removed' };
    } else {
        await supabase
            .from('collection_items')
            .insert({ collection_id: collectionId, submission_id: submissionId });
        return { action: 'added' };
    }
}
