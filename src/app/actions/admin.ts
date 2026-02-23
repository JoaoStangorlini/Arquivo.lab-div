'use server';

import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const BulkActionSchema = z.object({
    submission_ids: z.array(z.string().uuid()).min(1, "Selecione ao menos um item"),
});

/**
 * Valida sugestões de IA em massa com proteção Zod
 */
export async function validateAISuggestionsBulk(ids: string[]) {
    // 1. Validação Strict
    const result = BulkActionSchema.safeParse({ submission_ids: ids });

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message };
    }

    // 2. Chamada RPC Atômica
    const { error } = await supabase.rpc('accept_ai_suggestions_bulk', {
        submission_ids: result.data.submission_ids
    });

    if (error) {
        console.error('Erro na RPC Bulk Validate:', error);
        return { success: false, error: 'Falha no processamento atômico do banco de dados.' };
    }

    revalidatePath('/admin/acervo');
    return { success: true };
}

/**
 * Solicita re-processamento de IA para itens com erro
 */
export async function reprocessAI(submissionId: string) {
    const { error } = await supabase
        .from('submissions')
        .update({ ai_status: 'pending' })
        .eq('id', submissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/acervo');
    return { success: true };
}
