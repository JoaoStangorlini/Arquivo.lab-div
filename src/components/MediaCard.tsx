'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseMediaUrl, formatYoutubeUrl, getYoutubeThumbnail, getDownloadUrl, getPdfViewerUrl } from '@/lib/media-utils';
import { ShareMenu } from './ShareMenu';
import { motion, AnimatePresence } from 'framer-motion';

export interface MediaCardProps {
    id: string;
    title: string;
    description?: string;
    authors: string;
    mediaType: 'image' | 'video' | 'pdf' | 'text' | 'zip' | 'sdocx';
    mediaUrl: string | string[]; // Can be a string or JSON array
    category?: string;
    avatarUrl?: string;
    isFeatured?: boolean;
    likeCount?: number;
    external_link?: string;
    created_at?: string;
    technical_details?: string;
    alt_text?: string;
    status?: 'pendente' | 'aprovado' | 'rejeitado';
    admin_feedback?: string;
    tags?: string[];
    reading_time?: number;
    views?: number;
    commentCount?: number;
    saveCount?: number;
}

// Utility functions moved to @/lib/media-utils.ts

export const MediaCard = ({
    id,
    title,
    description,
    authors,
    mediaType,
    mediaUrl,
    category,
    avatarUrl,
    isFeatured,
    likeCount: initialLikeCount = 0,
    alt_text,
    tags,
    reading_time,
    views,
    commentCount = 0,
    saveCount = 0
}: MediaCardProps) => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [likes, setLikes] = useState(initialLikeCount);
    const [isLiking, setIsLiking] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saves, setSaves] = useState(saveCount);
    const [comments, setComments] = useState(commentCount);
    const [isSaving, setIsSaving] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const lastLikeClick = useRef<number>(0);

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 300); // Intent Delay of 300ms
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
    };

    const handleLike = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        // Throttling to prevent spam (1s)
        const now = Date.now();
        if (now - lastLikeClick.current < 1000) return;
        lastLikeClick.current = now;

        if (isLiking) return;

        // Optimistic UI
        const prevLiked = liked;
        const prevLikes = likes;

        setLiked(!prevLiked);
        setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);

        if (!prevLiked) {
            setShowLikeAnimation(true);
            setTimeout(() => setShowLikeAnimation(false), 600);
        }

        setIsLiking(true);
        try {
            const res = await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_id: id }),
            });
            const data = await res.json();
            // Sync with server just in case
            setLikes(data.likeCount);
            setLiked(data.liked);
        } catch (err) {
            console.error('Error liking:', err);
            // Revert state on failure
            setLiked(prevLiked);
            setLikes(prevLikes);
        } finally {
            setIsLiking(false);
        }
    }, [id, liked, likes, isLiking]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!liked) {
            handleLike();
            setShowHeartOverlay(true);
            setTimeout(() => setShowHeartOverlay(false), 800);
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaving) return;

        // Optimistic UI
        const prevSaved = saved;
        const prevSaves = saves;
        setSaved(!prevSaved);
        setSaves(!prevSaved ? prevSaves + 1 : Math.max(0, prevSaves - 1));

        setIsSaving(true);
        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_id: id }),
            });
            const data = await res.json();
            setSaved(data.saved);
        } catch (err) {
            console.error('Error saving:', err);
            setSaved(prevSaved);
            setSaves(prevSaves);
        } finally {
            setIsSaving(false);
        }
    };

    // Normalize mediaUrl to array
    const urls = parseMediaUrl(mediaUrl);
    const hasMultipleImages = mediaType === 'image' && urls.length > 1;

    // Advanced Exibition logic: larger grid item
    const sizeModifierStyles = hasMultipleImages ? "md:min-h-[420px] border-2 border-primary/20 shadow-primary/5" : "border-gray-100 dark:border-gray-700";

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent modal opening
        setCurrentImageIndex((prev) => (prev + 1) % urls.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + urls.length) % urls.length);
    };

    // Prevent rendering entirely broken images if URLs array is somehow empty
    // For PDFs uploaded to Cloudinary, replacing .pdf with .jpg gets the rasterized first page!
    let displayUrl = urls.length > 0 ? urls[currentImageIndex] : '';
    if (mediaType === 'pdf' && displayUrl.toLowerCase().endsWith('.pdf')) {
        displayUrl = displayUrl.replace(/\.pdf$/i, '.jpg');
    }

    const categoryStyles = {
        'Laboratórios': 'card-accent-yellow',
        'Pesquisadores': 'card-accent-red',
        'Eventos': 'card-accent-yellow',
        'Convivência': 'card-accent-red',
    } as Record<string, string>;

    const colorNum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3;
    const buttonColorClass = ['bg-brand-blue text-white', 'bg-brand-red text-white', 'bg-brand-yellow text-gray-900'][colorNum];
    return (
        <div
            className={`masonry-item group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-sm transition-all hover:shadow-xl border border-gray-100 dark:border-gray-800 ${sizeModifierStyles}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Hover Preview Overlay */}
            <AnimatePresence>
                {isHovered && description && (mediaType === 'text' || mediaType === 'pdf') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-[4px] top-[48px] bottom-[140px] z-30 p-5 bg-white/95 dark:bg-card-dark/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-y-auto no-scrollbar pointer-events-none"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-brand-blue dark:text-brand-yellow text-sm">visibility</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Prévia Rápida</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                            {description.length > 300 ? description.substring(0, 300) + '...' : description}
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-card-dark to-transparent"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instagram Style Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-[10px] font-bold text-primary dark:text-blue-400 shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={authors} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                            <span className="uppercase">{authors.substring(0, 2)}</span>
                        )}
                    </div>
                    <Link
                        href={`/?autor=${encodeURIComponent(authors)}`}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-brand-blue transition-colors"
                    >
                        {authors}
                    </Link>
                </div>
                <Link
                    href={`/arquivo/${id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-md transition-all hover:scale-105 hover:shadow-lg hover:opacity-90 ${buttonColorClass}`}
                >
                    <span className="flex items-center gap-1">
                        Abrir página completa
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </span>
                </Link>
            </div>

            {/* Visual Header / Media */}
            <div
                className={`relative w-full overflow-hidden shrink-0 ${mediaType === 'video' ? 'aspect-video' : (hasMultipleImages ? 'aspect-square' : 'aspect-[4/3]')}`}
                onDoubleClick={handleDoubleClick}
            >
                {/* Double-click Heart Animation Overlay */}
                {showHeartOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none text-white">
                        <span className="material-symbols-outlined text-8xl filled animate-heart-pop drop-shadow-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                        </span>
                    </div>
                )}
                {mediaType === 'video' ? (
                    <img
                        src={urls.length > 0 ? getYoutubeThumbnail(urls[0]) : "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800"}
                        onError={(e) => {
                            if (e.currentTarget.src.includes('maxresdefault.jpg')) {
                                e.currentTarget.src = e.currentTarget.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                            }
                        }}
                        alt={alt_text || "Video Thumbnail"}
                        className="h-full w-full object-cover opacity-80"
                        loading="lazy"
                    />
                ) : mediaType === 'text' || mediaType === 'zip' || mediaType === 'sdocx' ? (
                    <div className={`h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-100 dark:bg-slate-800`}>
                        <p className={`text-sm font-medium leading-relaxed max-w-full text-slate-700 dark:text-slate-200 line-clamp-6`}>
                            {mediaType === 'zip' ? 'Conteúdo Compactado (.ZIP)' :
                                mediaType === 'sdocx' ? 'Notas do Samsung Notes (.SDOCX)' :
                                    (description || 'Texto completo').replace(/[#*>\-_`~\[\]]/g, '').replace(/\n{2,}/g, ' ').trim()}
                        </p>
                    </div>
                ) : displayUrl ? (
                    <img
                        src={displayUrl}
                        alt={alt_text || `${title} - image ${currentImageIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400">broken_image</span>
                    </div>
                )}

                {/* Multiple Images Carousel Controls */}
                {hasMultipleImages && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>

                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
                        >
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/30 backdrop-blur-md">
                            {urls.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                                />
                            ))}
                        </div>

                        {/* Highlight Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider rounded backdrop-blur-md shadow-lg">
                            <span className="material-symbols-outlined text-[12px]">filter_none</span> Galeria
                        </div>
                    </>
                )}

                {mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined filled text-2xl">play_arrow</span>
                        </div>
                    </div>
                )}

            </div>

            {/* Instagram Style Interactions & Content */}
            <div className="flex flex-col p-4 pt-3">
                {/* Action Bar */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-[18px]">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`transition-all active:scale-90 relative flex items-center justify-center ${liked ? 'text-brand-red' : 'text-gray-700 dark:text-gray-200 hover:text-brand-red'}`}
                        >
                            <span className="material-symbols-outlined text-[32px]">
                                favorite
                            </span>
                            {likes > 0 && (
                                <span className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold pb-0.5 ${liked ? 'text-brand-red' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {likes > 99 ? '99+' : likes}
                                </span>
                            )}
                        </button>
                        <Link href={`/arquivo/${id}#comments`} onClick={(e) => e.stopPropagation()} className="text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-transform active:scale-90 relative flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px]">chat_bubble</span>
                            {comments > 0 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold pb-1.5 opacity-90">
                                    {comments}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowShareMenu(true);
                            }}
                            className="text-gray-700 dark:text-gray-200 hover:text-brand-yellow font-bold transition-transform active:scale-90"
                        >
                            <span className="material-symbols-outlined text-[32px]">send</span>
                        </button>
                        {displayUrl && (
                            <a
                                href={getDownloadUrl(displayUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-gray-700 dark:text-gray-200 hover:text-green-500 transition-transform active:scale-90"
                            >
                                <span className="material-symbols-outlined text-[32px]">download</span>
                            </a>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`transition-all active:scale-90 relative flex items-center justify-center ${saved ? 'text-brand-blue' : 'text-gray-700 dark:text-gray-200 hover:text-brand-blue'}`}
                    >
                        <span className={`material-symbols-outlined text-[32px]`}>
                            bookmark
                        </span>
                        {saves > 0 && (
                            <span className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold pt-1 opacity-90 ${saved ? 'text-brand-blue' : 'text-gray-700 dark:text-gray-200'}`}>
                                {saves}
                            </span>
                        )}
                    </button>
                </div>

                {/* Caption Block */}
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">{authors}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{title}</span>
                    </div>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Bottom Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {category && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide 
                            ${['Laboratórios', 'Eventos', 'Uso Didático'].includes(category) ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20' :
                                ['Pesquisadores', 'Convivência', 'Mural do Deu Ruim'].includes(category) ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' :
                                    'bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20 dark:border-blue-400/20'}`}
                        >
                            {category}
                        </span>
                    )}
                    {isFeatured && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-brand-red/10 to-brand-yellow/10 text-brand-red text-[10px] font-bold rounded-md uppercase tracking-wide border border-brand-red/20">
                            Destaque
                        </span>
                    )}
                    {tags && tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-md uppercase tracking-wide border border-gray-200 dark:border-gray-700">
                            #{tag.replace('#', '')}
                        </span>
                    ))}
                    {reading_time ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-blue/5 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow text-[10px] font-bold rounded-md uppercase tracking-wide border border-brand-blue/10 dark:border-brand-yellow/20">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {reading_time} min
                        </span>
                    ) : null}
                    {views != null ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-md uppercase tracking-wide border border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined text-[12px]">visibility</span>
                            {views}
                        </span>
                    ) : null}
                </div>
            </div>

            {showShareMenu && (
                <ShareMenu
                    id={id}
                    title={title}
                    author={authors}
                    onClose={() => setShowShareMenu(false)}
                />
            )}
        </div>
    );
};
