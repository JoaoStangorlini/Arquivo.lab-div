'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionType, toggleReaction, getUserReaction } from '@/app/actions/reactions';

interface ReactionSystemProps {
    submissionId: string;
    userId: string | undefined;
    initialSummary: Record<string, number>;
}

const REACTIONS: { type: ReactionType; label: string; icon: string; color: string }[] = [
    { type: 'atom_blue', label: 'Incrível', icon: 'science', color: '#0055ff' },
    { type: 'bulb_yellow', label: 'Útil', icon: 'tips_and_updates', color: '#ffcc00' },
    { type: 'spark_red', label: 'Brilhante', icon: 'auto_awesome', color: '#ff3333' },
];

export const ReactionSystem = ({ submissionId, userId, initialSummary }: ReactionSystemProps) => {
    const [summary, setSummary] = useState(initialSummary || {});
    const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            getUserReaction(submissionId, userId).then(setActiveReaction);
        }
    }, [submissionId, userId]);

    const handleReaction = async (type: ReactionType) => {
        if (!userId) {
            // Logic for guest/login prompt could go here
            return;
        }

        if (isLoading) return;

        // --- Optimistic UI Update ---
        const prevActive = activeReaction;
        const prevSummary = { ...summary };

        let newSummary = { ...summary };
        let newActive: ReactionType | null = type;

        // If clicking same type, remove it
        if (prevActive === type) {
            newSummary[type] = Math.max((newSummary[type] || 0) - 1, 0);
            newActive = null;
        } else {
            // If switching types, remove old and add new
            if (prevActive) {
                newSummary[prevActive] = Math.max((newSummary[prevActive] || 0) - 1, 0);
            }
            newSummary[type] = (newSummary[type] || 0) + 1;
        }

        setSummary(newSummary);
        setActiveReaction(newActive);
        setIsMenuOpen(false);
        setIsLoading(true);

        // --- Backend Call ---
        const result = await toggleReaction(submissionId, userId, type);

        if (!result.success) {
            // Rollback on error
            setSummary(prevSummary);
            setActiveReaction(prevActive);
        }
        setIsLoading(false);
    };

    return (
        <div className="relative inline-flex items-center gap-2">

            {/* Summary Display */}
            <div className="flex -space-x-1.5 items-center">
                {REACTIONS.map(r => {
                    const count = summary[r.type] || 0;
                    if (count === 0) return null;
                    return (
                        <div
                            key={r.type}
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-1.5 py-0.5 rounded-full shadow-sm z-10"
                            title={`${count} ${r.label}`}
                        >
                            <span className="material-symbols-outlined text-[12px]" style={{ color: r.color }}>{r.icon}</span>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{count}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Action Button */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setIsMenuOpen(true)}
                    onClick={() => activeReaction ? handleReaction(activeReaction) : setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeReaction
                            ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                            : 'bg-gray-50 dark:bg-card-dark border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {activeReaction ? REACTIONS.find(r => r.type === activeReaction)?.icon : 'add_reaction'}
                    </span>
                    {activeReaction ? REACTIONS.find(r => r.type === activeReaction)?.label : 'Reagir'}
                </motion.button>

                {/* Reaction Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            onMouseLeave={() => setIsMenuOpen(false)}
                            className="absolute bottom-full mb-2 left-0 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl flex gap-1 z-50 origin-bottom-left"
                        >
                            {REACTIONS.map((r) => (
                                <motion.button
                                    key={r.type}
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleReaction(r.type)}
                                    className={`size-10 flex flex-col items-center justify-center rounded-xl transition-colors ${activeReaction === r.type
                                            ? 'bg-gray-100 dark:bg-gray-800'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined" style={{ color: r.color }}>{r.icon}</span>
                                    <span className="text-[8px] font-black uppercase mt-0.5" style={{ color: r.color }}>{r.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
