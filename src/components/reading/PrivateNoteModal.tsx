'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { addPrivateNote } from '@/app/actions/notes';

interface PrivateNoteModalProps {
    selection: {
        text: string;
        hash: string;
        submissionId: string;
    };
    onClose: () => void;
    onSave: () => void;
}

export function PrivateNoteModal({ selection, onClose, onSave }: PrivateNoteModalProps) {
    const [noteText, setNoteText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!noteText.trim()) return;
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Você precisa estar logado para salvar anotações.');
                return;
            }

            await addPrivateNote({
                userId: user.id,
                submissionId: selection.submissionId,
                selectionHash: selection.hash,
                noteText: noteText,
            });

            toast.success('Anotação salva!');
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving note:', error);
            toast.error('Erro ao salvar anotação.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-yellow">edit_note</span>
                            Nova Anotação Privada
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-background-dark/50 p-3 rounded-xl border-l-4 border-brand-yellow">
                        <p className="text-sm text-gray-500 italic line-clamp-2">"{selection.text}"</p>
                    </div>

                    <textarea
                        autoFocus
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Escreva sua reflexão ou nota de estudo..."
                        className="w-full h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all outline-none resize-none"
                    />

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !noteText.trim()}
                            className="flex-1 px-4 py-2 bg-brand-yellow hover:bg-yellow-600 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Nota'}
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-background-dark/30 px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Apenas você pode ver esta nota.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
