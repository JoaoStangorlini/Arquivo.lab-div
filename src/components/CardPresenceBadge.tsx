'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Lightweight presence badge for cards.
 * Subscribes to the same Supabase Realtime channel as PresenceIndicator
 * but renders as a compact badge suitable for grid cards.
 */
export function CardPresenceBadge({ submissionId }: { submissionId: string }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const channel = supabase.channel(`reading:${submissionId}`, {
            config: { presence: { key: 'user' } },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                setCount(Object.keys(channel.presenceState()).length);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [submissionId, isVisible]);

    return (
        <div ref={containerRef} className="absolute top-2 left-2 z-30 min-w-[20px] min-h-[20px]">
            {count > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-[10px] font-bold shadow-lg">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red"></span>
                    </span>
                    🔥 {count}
                </div>
            )}
        </div>
    );
}
