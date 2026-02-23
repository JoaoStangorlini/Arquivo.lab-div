'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type ReactionType = 'atom_blue' | 'bulb_yellow' | 'spark_red';

export async function toggleReaction(submissionId: string, userId: string, type: ReactionType) {
    // 1. Check if reaction already exists
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, reaction_type')
        .eq('submission_id', submissionId)
        .eq('user_id', userId)
        .single();

    try {
        if (existing) {
            // If same type, remove it (toggle off)
            if (existing.reaction_type === type) {
                await supabase
                    .from('reactions')
                    .delete()
                    .eq('id', existing.id);
            } else {
                // If different type, we need to handle the cache shift
                // The trigger handles insert/delete, so we delete then insert to ensure cache consistency
                await supabase
                    .from('reactions')
                    .delete()
                    .eq('id', existing.id);

                await supabase
                    .from('reactions')
                    .insert({ submission_id: submissionId, user_id: userId, reaction_type: type });
            }
        } else {
            // New reaction
            await supabase
                .from('reactions')
                .insert({ submission_id: submissionId, user_id: userId, reaction_type: type });
        }

        revalidatePath(`/arquivo/${submissionId}`);
        return { success: true };
    } catch (err) {
        console.error('Error toggling reaction:', err);
        return { success: false, error: err };
    }
}

export async function getUserReaction(submissionId: string, userId: string | undefined) {
    if (!userId) return null;

    const { data } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('submission_id', submissionId)
        .eq('user_id', userId)
        .single();

    return data?.reaction_type as ReactionType | null;
}
