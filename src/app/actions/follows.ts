'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function toggleTagFollow(userId: string, tagName: string) {
    const { data: existing } = await supabase
        .from('tag_follows')
        .select('*')
        .eq('user_id', userId)
        .eq('tag_name', tagName)
        .single();

    if (existing) {
        await supabase
            .from('tag_follows')
            .delete()
            .eq('user_id', userId)
            .eq('tag_name', tagName);
        return { action: 'unfollowed' };
    } else {
        await supabase
            .from('tag_follows')
            .insert({ user_id: userId, tag_name: tagName });
        return { action: 'followed' };
    }
}

export async function checkTagFollow(userId: string | undefined, tagName: string) {
    if (!userId) return false;
    const { data } = await supabase
        .from('tag_follows')
        .select('*')
        .eq('user_id', userId)
        .eq('tag_name', tagName)
        .single();
    return !!data;
}
