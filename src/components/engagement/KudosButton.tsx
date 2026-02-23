'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { giveKudos } from '@/app/actions/kudos';

interface KudosButtonProps {
    submissionId: string;
    senderId: string | undefined;
    receiverId: string;
    initialKudos: number;
}

export const KudosButton = ({ submissionId, senderId, receiverId, initialKudos }: KudosButtonProps) => {
    const [kudos, setKudos] = useState(initialKudos);
    const [isLoading, setIsLoading] = useState(false);
    const [showThanks, setShowThanks] = useState(false);

    const handleKudos = async () => {
        if (!senderId || senderId === receiverId) return;
        if (isLoading) return;

        setIsLoading(true);
        // Optimistic
        setKudos(prev => prev + 1);
        setShowThanks(true);

        const result = await giveKudos(submissionId, senderId, receiverId);

        if (!result.success) {
            setKudos(prev => prev - 1);
            setShowThanks(false);
        } else {
            setTimeout(() => setShowThanks(false), 3000);
        }
        setIsLoading(false);
    };

    const isSelf = senderId === receiverId;

    return (
        <div className="relative">
            <motion.button
                whileHover={!isSelf ? { scale: 1.05, backgroundColor: 'rgba(255, 179, 0, 0.1)' } : {}}
                whileTap={!isSelf ? { scale: 0.95 } : {}}
                disabled={isSelf || isLoading}
                onClick={handleKudos}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isSelf
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-brand-yellow/5 border-brand-yellow/20 text-brand-yellow hover:border-brand-yellow/40'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                </span>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-widest">Kudos</span>
                    <span className="text-xs font-bold">{kudos}</span>
                </div>
            </motion.button>

            <AnimatePresence>
                {showThanks && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: -40 }}
                        exit={{ opacity: 0, scale: 0.5, y: -60 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-brand-yellow text-black text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap shadow-xl"
                    >
                        OBRIGADO! +1 REPUTAÇÃO
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
