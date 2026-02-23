'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function giveKudos(submissionId: string, senderId: string, receiverId: string) {
    try {
        const { data, error } = await supabase
            .from('kudos')
            .insert({
                submission_id: submissionId,
                sender_id: senderId,
                receiver_id: receiverId,
                weight: 1
            });

        if (error) throw error;

        revalidatePath(`/arquivo/${submissionId}`);
        return { success: true };
    } catch (err) {
        console.error('Error giving kudos:', err);
        return { success: false, error: err };
    }
}

export async function getAuthorReputationPoints(authorId: string) {
    const { data, error } = await supabase.rpc('get_author_reputation', { author_id: authorId });
    if (error) {
        console.error('Error fetching reputation:', error);
        return 0;
    }
    return data as number;
}
