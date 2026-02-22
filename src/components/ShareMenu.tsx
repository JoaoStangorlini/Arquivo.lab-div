'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareMenuProps {
    id: string;
    title: string;
    author: string;
    onClose: () => void;
}

export const ShareMenu = ({ id, title, author, onClose }: ShareMenuProps) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/arquivo/${id}`;
    const [copied, setCopied] = useState(false);

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Confira este trabalho de ${author} no Hub Lab-Div`,
                    url: url,
                });
                onClose();
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareOptions = [
        { name: 'WhatsApp', icon: 'chat_bubble', color: 'bg-green-500', link: `https://wa.me/?text=${encodeURIComponent(`${title} — ${author}\n${url}`)}` },
        { name: 'X (Twitter)', icon: 'close', color: 'bg-black', link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${author}`)}&url=${encodeURIComponent(url)}` },
        { name: 'Telegram', icon: 'send', color: 'bg-blue-400', link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-sm bg-white dark:bg-card-dark rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compartilhar</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Internal Share Section (Placeholder for follows) */}
                    <div className="mb-6">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">Sugestões Internas</p>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
                                    <span className="material-symbols-outlined">person_add</span>
                                </div>
                                <span className="text-[10px] text-gray-500 text-center">Convidar</span>
                            </div>
                            <p className="text-xs text-gray-400 italic flex items-center">Acompanhe autores para ver sugestões aqui.</p>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

                    {/* External Share Section */}
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">Compartilhar para...</p>
                        <div className="grid grid-cols-4 gap-4">
                            {shareOptions.map((opt) => (
                                <a
                                    key={opt.name}
                                    href={opt.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`${opt.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined">{opt.icon}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{opt.name}</span>
                                </a>
                            ))}

                            <button
                                onClick={copyToClipboard}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-md group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">{copied ? 'check' : 'link'}</span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                        </div>
                    </div>

                    {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                        <button
                            onClick={handleNativeShare}
                            className="w-full mt-8 py-3 bg-primary dark:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined">share</span>
                            Mais Opções Nativa
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
