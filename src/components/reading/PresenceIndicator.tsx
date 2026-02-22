'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function PresenceIndicator({ submissionId }: { submissionId: string }) {
    const [presenceCount, setPresenceCount] = useState(0);

    useEffect(() => {
        const channel = supabase.channel(`reading:${submissionId}`, {
            config: {
                presence: {
                    key: 'user',
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setPresenceCount(count);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                // Handle join if needed
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                // Handle leave if needed
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [submissionId]);

    if (presenceCount <= 1) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-red/10 border border-brand-red/20 rounded-full text-brand-red text-xs font-bold"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                </span>
                🔥 {presenceCount} alunos lendo agora
            </motion.div>
        </AnimatePresence>
    );
}
