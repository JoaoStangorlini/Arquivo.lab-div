'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName: string;
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (confirmText !== 'EXCLUIR') return;
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
        onClose();
        setConfirmText('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-[#1E1E1E] border border-brand-red/30 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6"
                >
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="text-brand-red w-8 h-8 animate-pulse" />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Atenção Crítica</h2>
                        <p className="text-sm text-gray-400">
                            Você está prestes a deletar <span className="text-white font-bold">{userName}</span> permanentemente do sistema USP e Lab-Div.
                        </p>
                        <p className="text-[10px] text-brand-red font-bold uppercase tracking-tighter bg-brand-red/10 py-1 rounded">
                            ESTA AÇÃO É IRREVERSÍVEL (FÍSICA)
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 text-center tracking-widest">
                            Digite <span className="text-white font-black px-2 py-0.5 bg-white/5 rounded">EXCLUIR</span> para confirmar:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Digite aqui..."
                            className="w-full bg-black/40 border border-brand-red/20 rounded-2xl px-4 py-3 text-center text-sm text-white focus:border-brand-red focus:outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={confirmText !== 'EXCLUIR' || isDeleting}
                            onClick={handleConfirm}
                            className="flex-[2] py-4 bg-brand-red hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {isDeleting ? 'Deletando...' : 'Confirmar Exclusão'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
