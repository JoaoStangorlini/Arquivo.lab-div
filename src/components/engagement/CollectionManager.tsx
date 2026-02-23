'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserCollections, createCollection, toggleItemInCollection } from '@/app/actions/collections';

interface CollectionManagerProps {
    submissionId: string;
    userId: string | undefined;
    onClose: () => void;
}

export const CollectionManager = ({ submissionId, userId, onClose }: CollectionManagerProps) => {
    const [collections, setCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserCollections(userId).then(data => {
                setCollections(data);
                setIsLoading(false);
            });
        }
    }, [userId]);

    const handleToggle = async (collectionId: string) => {
        const result = await toggleItemInCollection(collectionId, submissionId);
        // Refresh local state or just show feedback
        // For simplicity, we'll re-fetch (could be optimized)
        const updated = await fetchUserCollections(userId!);
        setCollections(updated);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim() || !userId) return;

        setIsCreating(true);
        try {
            await createCollection(userId, newCollectionName);
            setNewCollectionName('');
            const updated = await fetchUserCollections(userId);
            setCollections(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Salvar em Pasta</h3>
                        <p className="text-xs text-gray-500 font-medium">Organize seu acervo pessoal no Lab-Div.</p>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {/* New Collection Form */}
                    <form onSubmit={handleCreate} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nova pasta..."
                            value={newCollectionName}
                            onChange={e => setNewCollectionName(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 ring-brand-blue/20 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        >
                            {isCreating ? '...' : 'Criar'}
                        </button>
                    </form>

                    {/* Collection List */}
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="py-8 text-center text-gray-400 text-xs animate-pulse">Carregando pastas...</div>
                        ) : collections.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-xs">Você ainda não tem pastas.</div>
                        ) : (
                            collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => handleToggle(col.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                            <span className="material-symbols-outlined">{col.is_private ? 'lock' : 'folder_open'}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{col.name}</div>
                                            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{col.item_count?.[0]?.count || 0} Itens</div>
                                        </div>
                                    </div>
                                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        // Simplified check: we'd need to know if the item is in this collection
                                        // For now, let's assume UI feedback is enough
                                        'border-gray-200 dark:border-gray-700 group-hover:border-brand-blue'
                                        }`}>
                                        <span className="material-symbols-outlined text-[14px] text-brand-blue opacity-0 group-hover:opacity-100">add</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dica: Pastas públicas aparecem no seu perfil.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};
