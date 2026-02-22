'use server';

import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const CorrectionSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido"),
    submissionId: z.string().uuid("ID de submissão inválido"),
    originalText: z.string().min(1, "Texto original é obrigatório"),
    suggestedText: z.string().min(1, "Sua sugestão de melhoria é obrigatória").max(10000, "Sugestão muito longa"),
    comment: z.string().max(5000, "Comentário muito longo").optional(),
});

export type CorrectionInput = z.infer<typeof CorrectionSchema>;

export async function addCorrection(params: CorrectionInput) {
    // Validação estrita via Zod
    const validatedData = CorrectionSchema.parse(params);

    const { error } = await supabase
        .from('corrections')
        .insert({
            user_id: validatedData.userId,
            submission_id: validatedData.submissionId,
            original_text: validatedData.originalText,
            suggested_text: validatedData.suggestedText,
            comment: validatedData.comment || null,
            status: 'pendente'
        });

    if (error) {
        console.error("Erro ao inserir sugestão de correção:", error);
        throw new Error('Falha ao enviar sua sugestão. Tente novamente mais tarde.');
    }
}
