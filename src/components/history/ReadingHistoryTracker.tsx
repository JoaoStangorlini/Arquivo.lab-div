'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ReadingHistoryTrackerProps {
    submissionId: string;
    userId: string | undefined;
}

export const ReadingHistoryTracker = ({ submissionId, userId }: ReadingHistoryTrackerProps) => {
    const progressRef = useRef(0);
    const lastUpdateRef = useRef(0);

    useEffect(() => {
        if (!userId || !submissionId) return;

        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;

            const currentProgress = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

            if (currentProgress > progressRef.current) {
                progressRef.current = currentProgress;

                // Update every 10% or if 10 seconds passed
                const now = Date.now();
                if (currentProgress >= 95 || (currentProgress - lastUpdateRef.current >= 10) || (now - lastUpdateRef.current > 10000)) {
                    updateHistory(currentProgress);
                    lastUpdateRef.current = now;
                }
            }
        };

        const updateHistory = async (progress: number) => {
            try {
                await supabase
                    .from('reading_history')
                    .upsert({
                        user_id: userId,
                        submission_id: submissionId,
                        progress_percent: progress,
                        last_accessed_at: new Date().toISOString()
                    }, { onConflict: 'user_id, submission_id' });
            } catch (err) {
                console.error('Error updating reading history:', err);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial ping
        updateHistory(0);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            // Final progress update on unmount
            if (progressRef.current > 0) {
                updateHistory(progressRef.current);
            }
        };
    }, [submissionId, userId]);

    return null; // Invisible tracker
};
