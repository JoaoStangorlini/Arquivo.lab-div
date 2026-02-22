'use server';

import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const PrivateNoteSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido"),
    submissionId: z.string().uuid("ID de submissão inválido"),
    selectionHash: z.string().min(1, "Hash de seleção é obrigatório"),
    noteText: z.string().min(1, "O texto da anotação não pode ser vazio").max(5000, "Anotação muito longa"),
});

export type PrivateNoteInput = z.infer<typeof PrivateNoteSchema>;

export async function addPrivateNote(params: PrivateNoteInput) {
    // Validação estrita via Zod
    const validatedData = PrivateNoteSchema.parse(params);

    const { error } = await supabase
        .from('private_notes')
        .insert({
            user_id: validatedData.userId,
            submission_id: validatedData.submissionId,
            selection_hash: validatedData.selectionHash,
            note_text: validatedData.noteText,
        });

    if (error) {
        console.error("Erro ao inserir anotação privada:", error);
        throw new Error('Falha ao salvar a anotação no banco de dados.');
    }
}
