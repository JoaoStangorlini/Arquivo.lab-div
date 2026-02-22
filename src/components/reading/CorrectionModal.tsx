'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { addCorrection } from '@/app/actions/corrections';

interface CorrectionModalProps {
    selection: {
        text: string;
        submissionId: string;
    };
    onClose: () => void;
    onSave: () => void;
}

export function CorrectionModal({ selection, onClose, onSave }: CorrectionModalProps) {
    const [suggestedText, setSuggestedText] = useState(selection.text);
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!suggestedText.trim()) return;
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Você precisa estar logado para sugerir correções.');
                return;
            }

            await addCorrection({
                userId: user.id,
                submissionId: selection.submissionId,
                originalText: selection.text,
                suggestedText: suggestedText,
                comment: comment || undefined,
            });

            toast.success('Sugestão enviada com sucesso!');
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving correction:', error);
            toast.error('Erro ao enviar sugestão.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-red">spellcheck</span>
                            Sugerir Melhoria / Correção
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Texto Original</label>
                            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                                {selection.text}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-brand-green uppercase tracking-widest">Sua Sugestão</label>
                            <textarea
                                value={suggestedText}
                                onChange={(e) => setSuggestedText(e.target.value)}
                                className="w-full h-32 bg-green-50/30 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Comentário Adicional (Opcional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Explique por que esta mudança é necessária..."
                            className="w-full h-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                            Descartar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !suggestedText.trim()}
                            className="flex-1 px-4 py-2 bg-brand-red hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                        >
                            {isSaving ? 'Enviando...' : 'Enviar Sugestão'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
