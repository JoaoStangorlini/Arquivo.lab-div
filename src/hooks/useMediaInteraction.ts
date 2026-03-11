'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { toggleLike, toggleSave } from '@/app/actions/media';

interface UseMediaInteractionProps {
    id: string;
    initialLikes: number;
    initialSaves: number;
    initialLiked?: boolean;
    initialSaved?: boolean;
    userId?: string;
}

export function useMediaInteraction({ id, initialLikes, initialSaves, initialLiked = false, initialSaved = false, userId }: UseMediaInteractionProps) {
    const router = useRouter();
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(initialLiked);
    const [saves, setSaves] = useState(initialSaves);
    const [saved, setSaved] = useState(initialSaved);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // V8.0 Sync: Keep internal state in sync with props
    useEffect(() => {
        setLikes(initialLikes);
        setLiked(initialLiked);
        setSaves(initialSaves);
        setSaved(initialSaved);
    }, [initialLikes, initialLiked, initialSaves, initialSaved]);

    const lastLikeClick = useRef<number>(0);

    const checkAuth = useCallback(() => {
        if (!userId) {
            toast.error("Faça login para interagir!");
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
            return false;
        }
        return true;
    }, [userId, router]);

    const handleLike = useCallback(async () => {
        if (!checkAuth()) return;

        const now = Date.now();
        if (now - lastLikeClick.current < 1000) return;
        lastLikeClick.current = now;

        if (isLiking) return;

        // Optimistic UI
        const prevLiked = liked;
        const prevLikes = likes;
        setLiked(!prevLiked);
        setLikes(prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1);

        setIsLiking(true);
        try {
            const result = await toggleLike({ submission_id: id });
            if (result.error) {
                throw new Error(result.error);
            }
            // V8.0 Haptic Feedback (#200)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([10]);
            }
            if (!prevLiked) {
                toast.success('Curtida sincronizada!', { icon: '❤️' });
            }
            // revalidatePath handles data sync
        } catch (err: any) {
            setLiked(prevLiked);
            setLikes(prevLikes);
            toast.error(err.message || "Erro ao curtir");
        } finally {
            setIsLiking(false);
        }
    }, [id, liked, likes, isLiking, checkAuth]);

    const handleSave = useCallback(async () => {
        if (!checkAuth()) return;

        if (isSaving) return;

        const prevSaved = saved;
        const prevSaves = saves;
        setSaved(!prevSaved);
        setSaves(!prevSaved ? prevSaves + 1 : Math.max(0, prevSaves - 1));

        setIsSaving(true);
        try {
            const result = await toggleSave({ submission_id: id });
            if (result.error) throw new Error(result.error);

            // V8.0 Haptic Feedback (#200)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([8]);
            }

            if (!prevSaved) {
                toast.success('Acervo atualizado!', { icon: '📂' });
            }
        } catch (err: any) {
            setSaved(prevSaved);
            setSaves(prevSaves);
            toast.error(err.message || "Erro ao salvar");
        } finally {
            setIsSaving(false);
        }
    }, [id, saved, saves, isSaving, checkAuth]);

    return {
        likes,
        liked,
        saves,
        saved,
        isLiking,
        isSaving,
        handleLike,
        handleSave
    };
}
