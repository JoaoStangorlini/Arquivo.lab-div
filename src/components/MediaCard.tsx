'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Eye,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Layers,
    Play,
    Pencil,
    Rocket,
    Download,
    Star,
    Clock,
    ImageOff,
    Atom,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ScientificContent = dynamic(() => import('./ScientificContent'), {
    loading: () => <div className="h-20 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
});

import { Avatar } from './ui/Avatar';

import { parseMediaUrl, getYoutubeThumbnail, getOptimizedUrl } from '@/lib/media-utils';
const ShareMenu = dynamic(() => import('./ShareMenu').then(mod => mod.ShareMenu));
import { m, AnimatePresence } from 'framer-motion';
import { stripMarkdownAndLatex, highlightMatch } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { CardPresenceBadge } from './CardPresenceBadge';
import { supabase } from '@/lib/supabase';
const CollectionManager = dynamic(() => import('./engagement/CollectionManager').then(mod => mod.CollectionManager));
const DownloadModal = dynamic(() => import('./DownloadModal').then(mod => mod.DownloadModal));
import { MediaReaction } from './engagement/MediaReaction';
import { PostDTO } from '@/dtos/media';
import { useMediaInteraction } from '@/hooks/useMediaInteraction';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';

export interface MediaCardProps {
    post: PostDTO;
    priority?: boolean;
    isLikedByUser?: boolean;
    highlightQuery?: string;
}

import { CATEGORY_STYLES, DEFAULT_STYLE } from '@/lib/constants';

/**
 * V8.0 MediaCard - Hardened & Refactored
 * Implements DTO Enforcement and hook-based logic.
 */
export const MediaCard = React.memo(({ post, priority = false, isLikedByUser = false, highlightQuery = '' }: MediaCardProps) => {
    const { user } = useAuth();
    const userId = user?.id;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showCollectionManager, setShowCollectionManager] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showAtomAnimation, setShowAtomAnimation] = useState(false);

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const query = highlightQuery;
    const { ref: contentRef, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    const {
        likes,
        liked,
        saves,
        saved,
        handleLike,
        handleSave
    } = useMediaInteraction({
        id: post.id,
        initialLikes: post.likeCount || 0,
        initialSaves: post.saveCount || 0,
        initialLiked: isLikedByUser,
        userId
    });

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Trigger Adam animation
        setShowAtomAnimation(true);
        setTimeout(() => setShowAtomAnimation(false), 1000);

        // Give like if not already liked
        if (!liked) {
            handleLike();
        }
    };



    const urls = useMemo(() => parseMediaUrl(post.mediaUrl), [post.mediaUrl]);
    const hasMultipleImages = useMemo(() => post.mediaType === 'image' && urls.length > 1, [post.mediaType, urls.length]);
    const sizeModifierStyles = useMemo(() => hasMultipleImages ? "md:min-h-[420px] border-2 border-primary/20 shadow-primary/5" : "border-gray-100 dark:border-gray-700", [hasMultipleImages]);

    const handleNextImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % urls.length);
    }, [urls.length]);

    const handlePrevImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + urls.length) % urls.length);
    }, [urls.length]);

    const displayUrl = useMemo(() => {
        let url = urls.length > 0 ? urls[currentImageIndex] : '';
        if (post.mediaType === 'pdf' && url.toLowerCase().endsWith('.pdf')) {
            url = url.replace(/\.pdf$/i, '.jpg');
        }
        return url;
    }, [urls, currentImageIndex, post.mediaType]);

    const optimizedDisplayUrl = useMemo(() => getOptimizedUrl(displayUrl, 600, 70, post.category, post.mediaType), [displayUrl, post.category, post.mediaType]);

    // Use dynamic category styles
    const categoryStyle = post.category ? (CATEGORY_STYLES[post.category] || DEFAULT_STYLE) : DEFAULT_STYLE;
    const buttonColorClass = `${categoryStyle.bg} ${categoryStyle.text}`;

    return (
        <div
            className={`masonry-item group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-sm transition-all hover:shadow-xl border cursor-pointer gpu-isolate ${post.isFeatured ? 'border-brand-yellow/50 animate-premium-glow z-10' : 'border-gray-100 dark:border-gray-800'} ${sizeModifierStyles}`}
        >
            <CardPresenceBadge submissionId={post.id} />

            <AnimatePresence>
                {isHovered && post.description && (post.mediaType === 'text' || post.mediaType === 'pdf') && (
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-[4px] top-[48px] bottom-[140px] z-30 p-5 bg-white/95 dark:bg-card-dark/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-y-auto no-scrollbar pointer-events-none"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Prévia Rápida</span>
                        </div>
                        <ScientificContent content={post.description} />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-card-dark to-transparent"></div>
                    </m.div>
                )}
            </AnimatePresence>

            <div
                className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center gap-2">
                    <Avatar
                        src={post.avatarUrl}
                        name={post.authors}
                        size="sm"
                        className="border-2 border-white dark:border-[#1E1E1E] shadow-sm hover:scale-110 transition-transform duration-300"
                        xp={post.authorXp}
                        level={post.authorLevel}
                    />
                    <Link
                        href={post.authors.startsWith('@') ? `/?collection=${encodeURIComponent(post.authors)}` : `/?autor=${encodeURIComponent(post.authors)}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(post.authors.startsWith('@') ? `/?collection=${encodeURIComponent(post.authors)}` : `/?autor=${encodeURIComponent(post.authors)}`);
                        }}
                        className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-brand-blue transition-colors truncate max-w-[120px] sm:max-w-[180px]"
                    >
                        {post.authors}
                    </Link>
                </div>
                <div className="hover:scale-105 transition-transform active:scale-95">
                    <Link
                        href={`/arquivo/${post.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-md transition-all hover:shadow-lg whitespace-nowrap shrink-0 ${buttonColorClass}`}
                    >
                        <span className="flex items-center gap-1">
                            Página Completa
                            <ExternalLink className="w-3 h-3" />
                        </span>
                    </Link>
                </div>
            </div>

            <div
                className={`relative w-full overflow-hidden shrink-0 ${post.mediaType === 'video' || !hasMultipleImages ? 'aspect-video' : 'aspect-square'} max-h-[500px] bg-gray-100 dark:bg-gray-800 cursor-pointer select-none`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleDoubleClick}
            >
                <AnimatePresence>
                    {showAtomAnimation && (
                        <m.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                            animate={{ scale: [1.2, 1], opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.4, type: 'spring', bounce: 0.6 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none drop-shadow-2xl"
                        >
                            <Atom className="w-24 h-24 text-white fill-brand-blue/90 animate-pulse-fast drop-shadow-[0_0_15px_rgba(0,119,255,0.8)]" />
                        </m.div>
                    )}
                </AnimatePresence>

                {post.mediaType === 'video' ? (
                    <Image
                        src={urls.length > 0 ? getYoutubeThumbnail(urls[0]) : "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800"}
                        alt={post.title || "Video Thumbnail"}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover opacity-80"
                        priority={priority}
                        fetchPriority={priority ? "high" : "auto"}
                        loading={priority ? "eager" : "lazy"}
                    />
                ) : post.mediaType === 'text' || post.mediaType === 'zip' || post.mediaType === 'sdocx' ? (
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-100 dark:bg-slate-800">
                        <div className="text-sm font-medium leading-relaxed max-w-full text-slate-700 dark:text-slate-200 relative overflow-hidden h-[9rem] prose prose-sm dark:prose-invert max-w-none">
                            {post.mediaType === 'zip' ? <p className="mt-8">Conteúdo Compactado (.ZIP)</p> :
                                post.mediaType === 'sdocx' ? <p className="mt-8">Notas do Samsung Notes (.SDOCX)</p> :
                                    <div ref={contentRef}>
                                        {inView ? (
                                            <ScientificContent content={post.description || 'Texto completo'} />
                                        ) : (
                                            <div className="h-20 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
                                        )}
                                    </div>}
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent"></div>
                        </div>
                    </div>
                ) : displayUrl ? (
                    priority ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={optimizedDisplayUrl}
                                alt={`${post.title} - image ${currentImageIndex + 1}`}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover object-center"
                                priority={true}
                                fetchPriority="high"
                                loading="eager"
                            />
                        </div>
                    ) : (
                        <m.div
                            layoutId={`media-${post.id}`}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={optimizedDisplayUrl}
                                alt={`${post.title} - image ${currentImageIndex + 1}`}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                priority={priority}
                                fetchPriority="auto"
                            />
                        </m.div>
                    )
                ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <ImageOff className="w-10 h-10 text-slate-400" />
                    </div>
                )}

                {hasMultipleImages && (
                    <>
                        {/* Simplified hover effect - removed blur for better performance */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <button onClick={handlePrevImage} aria-label="Imagem Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center z-10 hover:scale-110"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={handleNextImage} aria-label="Próxima Imagem" className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center z-10 hover:scale-110"><ChevronRight className="w-5 h-5" /></button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40">
                            {urls.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                            ))}
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-lg"><Layers className="w-3 h-3" /> Galeria</div>
                    </>
                )}

                {post.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-2xl transition-transform group-hover:scale-110">
                            <Play className="w-6 h-6 fill-current" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col p-4 md:p-6 pt-3 md:pt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <MediaReaction
                            isActive={liked}
                            count={likes}
                            color="brand-blue"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLike();
                            }}
                        />
                        <Link href={`/arquivo/${post.id}#comments`} onClick={(e) => e.stopPropagation()} className="text-gray-700 dark:text-gray-200 hover:text-brand-red flex items-center gap-1.5 transition-colors">
                            <Pencil className="w-5 h-5" />
                            <span className="text-[11px] font-black tabular-nums">{post.commentCount || 0}</span>
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(true); }} aria-label="Compartilhar" className="text-gray-700 dark:text-gray-200 hover:text-brand-blue"><Rocket className="w-6 h-6" /></button>

                        {displayUrl && <button onClick={(e) => { e.stopPropagation(); setShowDownloadModal(true); }} aria-label="Baixar Arquivo" className="text-gray-700 dark:text-gray-200 hover:text-brand-yellow"><Download className="w-6 h-6" /></button>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleSave(); }} aria-label={saved ? "Remover Favorito" : "Adicionar aos Favoritos"} className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-brand-yellow">
                        <Star className={`w-6 h-6 ${saved ? 'fill-current text-brand-yellow' : ''}`} />
                        <span className="text-xs font-bold tabular-nums">{saves}</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="text-base sm:text-2xl leading-tight">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">
                            {useMemo(() => highlightMatch(post.authors, query), [post.authors, query])}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">
                            {useMemo(() => highlightMatch(post.title, query), [post.title, query])}
                        </span>
                    </div>
                    {post.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden max-h-[2.5rem] relative leading-tight">
                            {useMemo(() => stripMarkdownAndLatex(post.description!), [post.description])}
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-card-dark to-transparent"></div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    {post.category && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation(); e.preventDefault();
                                router.push(`/?type=${encodeURIComponent(post.category!)}`);
                            }}
                            className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity
                            ${categoryStyle.cardBadge}`}
                        >
                            {post.category}
                        </span>
                    )}
                    {post.isFeatured && (
                        <span className="relative overflow-hidden px-2.5 py-1 bg-gradient-to-r from-brand-red to-brand-yellow text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-[0_0_10px_rgba(230,57,70,0.3)] animate-metallic-shine">
                            <span className="relative z-10">Destaque</span>
                        </span>
                    )}
                    {post.tags?.map((tag, idx) => {
                        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const colors = [
                            'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
                            'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
                            'bg-brand-red/10 text-brand-red border-brand-red/20'
                        ];
                        // Cycle based on index + category hash for variety
                        const categoryHash = post.category ? post.category.length : 0;
                        const colorClass = colors[(idx + categoryHash) % colors.length];
                        return (
                            <React.Fragment key={idx}>
                                <span onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/?q=${tag.replace('#', '')}`); }} className={`px-2 py-0.5 ${colorClass} text-[10px] font-black rounded-md uppercase tracking-wide border transition-all hover:scale-110 cursor-pointer`}>
                                    #{highlightMatch(tag.replace('#', ''), query)}
                                </span>
                            </React.Fragment>
                        );
                    })}
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-yellow/10 text-yellow-700 dark:text-brand-yellow text-[10px] font-black rounded-md uppercase tracking-wide border border-brand-yellow/20">
                        <Clock className="w-3 h-3" /> {Math.max(1, post.readingTime || 1)} min
                    </span>
                    {post.views != null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-blue/10 text-blue-700 dark:text-brand-blue text-[10px] font-black rounded-md uppercase tracking-wide border border-brand-blue/20">
                            <Eye className="w-3 h-3" /> {post.views}
                        </span>
                    )}
                </div>
            </div>

            {showShareMenu && <ShareMenu id={post.id} title={post.title} author={post.authors} onClose={() => setShowShareMenu(false)} />}
            {showCollectionManager && <CollectionManager submissionId={post.id} userId={userId} onClose={() => setShowCollectionManager(false)} />}
            {showDownloadModal && <DownloadModal id={post.id} title={post.title} authors={post.authors} avatarUrl={post.avatarUrl} description={post.description} mediaUrl={displayUrl} onClose={() => setShowDownloadModal(false)} />}
        </div >
    );
});

MediaCard.displayName = 'MediaCard';
