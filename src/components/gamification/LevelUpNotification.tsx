'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';

export function LevelUpNotification() {
    const [levelUpData, setLevelUpData] = useState<{ old: number; new: number } | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);

                // Subscribe to profile changes
                const channel = supabase
                    .channel(`profile_changes_${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'profiles',
                            filter: `id=eq.${session.user.id}`,
                        },
                        (payload) => {
                            const oldLevel = payload.old.level;
                            const newLevel = payload.new.level;

                            if (newLevel > oldLevel) {
                                setLevelUpData({ old: oldLevel, new: newLevel });

                                // Trigger confetti for the "wow" factor
                                confetti({
                                    particleCount: 150,
                                    spread: 70,
                                    origin: { y: 0.6 },
                                    colors: ['#0055ff', '#ff0000', '#ffcc00']
                                });
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };

        fetchUser();
    }, []);

    if (!levelUpData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4"
            >
                <div className="bg-white dark:bg-card-dark border-4 border-[#0055ff] p-8 rounded-[40px] shadow-[0_0_50px_rgba(0,85,255,0.4)] max-w-sm w-full text-center relative pointer-events-auto">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-brand-blue/5 rounded-[36px] animate-pulse" />

                    <div className="relative z-10">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                            className="inline-flex items-center justify-center size-20 bg-[#0055ff] rounded-2xl mb-6 shadow-lg shadow-[#0055ff]/40"
                        >
                            <Trophy className="text-white size-10" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-2 dark:text-white uppercase tracking-tighter">
                            Subiu de Nível!
                        </h2>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-2xl font-bold text-gray-400 line-through">Lvl {levelUpData.old}</div>
                            <div className="size-10 bg-[#0055ff]/10 rounded-full flex items-center justify-center">
                                <Star className="text-[#0055ff] size-6" fill="currentColor" />
                            </div>
                            <div className="text-4xl font-black text-[#0055ff]">Lvl {levelUpData.new}</div>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                            Sua contribuição para a ciência avançou um degrau. Continue explorando!
                        </p>

                        <button
                            onClick={() => setLevelUpData(null)}
                            className="w-full py-4 bg-[#0055ff] text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0055ff]/30 flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            CONTINUAR JORNADA
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
