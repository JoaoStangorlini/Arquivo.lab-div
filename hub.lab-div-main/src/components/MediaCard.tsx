'use client';

import React, { useState } from 'react';

export interface MediaCardProps {
    id: string;
    title: string;
    description?: string;
    authors: string;
    mediaType: 'image' | 'video' | 'pdf' | 'text';
    mediaUrl: string | string[]; // Can be a string or JSON array
    category?: string;
    avatarUrl?: string;
    isFeatured?: boolean;
    likeCount?: number;
    external_link?: string;
}

export const parseMediaUrl = (mediaUrl: string | string[]): string[] => {
    let parsedUrls: string[] = [];
    try {
        if (Array.isArray(mediaUrl)) {
            parsedUrls = mediaUrl;
        } else if (typeof mediaUrl === 'string') {
            if (mediaUrl.startsWith('[') && mediaUrl.endsWith(']')) {
                parsedUrls = JSON.parse(mediaUrl);
            } else {
                parsedUrls = [mediaUrl];
            }
        }
    } catch {
        parsedUrls = [typeof mediaUrl === 'string' ? mediaUrl : ''];
    }
    return parsedUrls.filter(Boolean);
};

export const formatYoutubeUrl = (url: string) => {
    if (url.includes('/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export const getYoutubeThumbnail = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800";
};

export const getDownloadUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        // Cloudinary URLs typically have a version tag like /v1234567890/
        // Transformations are placed between /upload/ and this version tag.
        // We find the version tag, and rebuild the URL ignoring any existing transformations, 
        // applying ONLY the 'fl_attachment' flag to force a raw file download.
        const versionMatch = url.match(/\/v\d+\//);
        if (versionMatch) {
            const parts = url.split(versionMatch[0]);
            const uploadIndex = parts[0].indexOf('/upload/') + 8;
            const base = parts[0].substring(0, uploadIndex);

            return `${base}fl_attachment${versionMatch[0]}${parts[1]}`;
        } else {
            // Fallback if no version tag is present
            return url.replace('/upload/', '/upload/fl_attachment/')
                .replace(/f_[a-zA-Z0-9_]+\//g, '')
                .replace(/q_[a-zA-Z0-9_]+\//g, '');
        }
    }
    return url;
};

export const getPdfViewerUrl = (url: string) => {
    if (!url) return '';
    let viewerUrl = url;

    // Strip ALL Cloudinary transformations between /upload/ and the /vXXX/ version tag.
    // Cloudinary URLs look like: .../upload/f_auto,q_auto/v1234567/file.pdf
    // The transformations (f_auto,q_auto, fl_attachment, etc.) are comma-separated between /upload/ and /vXXX/.
    // We need the raw PDF without any transformations, otherwise Cloudinary converts it to WebP/JPEG.
    if (viewerUrl.includes('/upload/')) {
        viewerUrl = viewerUrl.replace(/\/upload\/.*?(\/v\d+\/)/, '/upload$1');
    }

    // If it's a generated jpg thumbnail from Cloudinary, switch it back to .pdf
    if (viewerUrl.toLowerCase().endsWith('.jpg')) {
        viewerUrl = viewerUrl.replace(/\.jpg$/i, '.pdf');
    }
    return viewerUrl;
};

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
    likeCount: initialLikeCount = 0
}: MediaCardProps) => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [likes, setLikes] = useState(initialLikeCount);
    const [isLiking, setIsLiking] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiking) return;
        setIsLiking(true);
        try {
            const res = await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_id: id }),
            });
            const data = await res.json();
            setLikes(data.likeCount);
            setLiked(data.liked);
            if (data.liked) {
                setShowLikeAnimation(true);
                setTimeout(() => setShowLikeAnimation(false), 600);
            }
        } catch (err) {
            console.error('Error liking:', err);
        } finally {
            setIsLiking(false);
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

    let accentClass = 'border-t-4 border-t-gray-100 dark:border-t-gray-700';
    if (category === 'Laboratórios') accentClass = 'card-accent-yellow';
    else if (category === 'Pesquisadores') accentClass = 'card-accent-red';
    else if (category === 'Eventos') accentClass = 'card-accent-yellow';
    else if (category === 'Convivência') accentClass = 'card-accent-red';
    else if (category) accentClass = 'card-accent-blue'; // Default for others

    return (
        <div className={`masonry-item group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer border-x border-b border-gray-100 dark:border-gray-700 ${accentClass} ${sizeModifierStyles}`}>

            {/* Visual Header / Media */}
            <div className={`relative w-full overflow-hidden shrink-0 ${mediaType === 'video' ? 'aspect-video' : (hasMultipleImages ? 'aspect-square' : 'aspect-[4/3]')}`}>
                {mediaType === 'video' ? (
                    <img
                        src={urls.length > 0 ? getYoutubeThumbnail(urls[0]) : "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800"}
                        onError={(e) => {
                            if (e.currentTarget.src.includes('maxresdefault.jpg')) {
                                e.currentTarget.src = e.currentTarget.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                            }
                        }}
                        alt="Video Thumbnail"
                        className="h-full w-full object-cover opacity-80"
                    />
                ) : mediaType === 'text' ? (
                    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/20 flex flex-col items-center justify-center p-6 text-center">
                        <span className="material-symbols-outlined text-5xl text-brand-blue/60 mb-3">article</span>
                        <p className="text-xs text-blue-800/60 dark:text-blue-300/60 line-clamp-4 leading-relaxed max-w-full">
                            {description || 'Texto completo'}
                        </p>
                    </div>
                ) : displayUrl ? (
                    <img
                        src={displayUrl}
                        alt={`${title} - image ${currentImageIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

                {category && !hasMultipleImages && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        <div className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white backdrop-blur-sm shadow-sm">
                            {category}
                        </div>
                        {mediaType === 'pdf' && (
                            <div className="rounded-full bg-brand-yellow/90 px-2 flex items-center gap-1 py-1 text-[10px] font-bold tracking-wider uppercase text-black backdrop-blur-sm shadow-sm">
                                <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF
                            </div>
                        )}
                        {(mediaType === 'image' || mediaType === 'pdf') && displayUrl && (
                            <a
                                href={getDownloadUrl(displayUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="rounded-full bg-black/60 hover:bg-black/80 p-1.5 text-white backdrop-blur-sm shadow-sm transition-colors flex items-center justify-center"
                                title="Baixar Imagem"
                            >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                            </a>
                        )}
                    </div>
                )}
                {category && hasMultipleImages && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10 pointer-events-auto">
                        <div className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white backdrop-blur-sm shadow-sm pointer-events-none">
                            {category}
                        </div>
                        {displayUrl && (
                            <a
                                href={getDownloadUrl(displayUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="rounded-full bg-black/60 hover:bg-black/80 p-1.5 text-white backdrop-blur-sm shadow-sm transition-colors flex items-center justify-center"
                                title="Baixar Imagem Atual"
                            >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className={`flex flex-col flex-1 p-5 ${hasMultipleImages ? 'bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-800' : ''}`}>
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                    {category && (
                        <div className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm 
                            ${category === 'Laboratórios' ? 'bg-brand-yellow/90 text-black shadow-brand-yellow/50' :
                                category === 'Pesquisadores' ? 'bg-brand-red/90 text-white shadow-brand-red/50' :
                                    category === 'Eventos' ? 'bg-brand-yellow/90 text-black shadow-brand-yellow/50' :
                                        category === 'Convivência' ? 'bg-brand-red/90 text-white shadow-brand-red/50' :
                                            'bg-brand-blue/90 text-white shadow-brand-blue/50'}`}
                        >
                            {category}
                        </div>
                    )}
                    {isFeatured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-brand-red to-brand-yellow text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                            Destaque
                        </span>
                    )}
                </div>

                <h3 className={`font-extrabold text-text-main dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors ${hasMultipleImages ? 'text-xl' : 'text-lg'}`}>
                    {title}
                </h3>

                {description && (
                    <p className={`text-sm text-text-muted dark:text-gray-400 mb-4 flex-1 ${hasMultipleImages ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        {description}
                    </p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center text-[10px] font-bold text-primary shrink-0 transition-transform group-hover:scale-110">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={authors} className="h-full w-full object-cover" />
                        ) : (
                            <span className="uppercase">{authors.substring(0, 2)}</span>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide truncate flex-1">
                        {authors}
                    </span>
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${liked
                            ? 'bg-brand-red/10 text-brand-red'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-brand-red hover:bg-brand-red/10'
                            }`}
                        title="Curtir"
                    >
                        <span className={`material-symbols-outlined text-[16px] transition-transform ${showLikeAnimation ? 'scale-125' : ''} ${liked ? 'filled' : ''}`} style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            favorite
                        </span>
                        {likes > 0 && <span>{likes}</span>}
                    </button>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-1.5 pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/arquivo/${id}`;
                            const text = encodeURIComponent(`${title} — Hub Lab-Div\n${url}`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-[10px] font-bold"
                        title="WhatsApp"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/arquivo/${id}`;
                            const text = encodeURIComponent(`${title} — Hub Lab-Div`);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-[10px] font-bold"
                        title="X/Twitter"
                    >
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            const btn = e.currentTarget;
                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/arquivo/${id}`;
                            try {
                                await navigator.clipboard.writeText(url);
                            } catch {
                                const ta = document.createElement('textarea');
                                ta.value = url;
                                document.body.appendChild(ta);
                                ta.select();
                                document.execCommand('copy');
                                document.body.removeChild(ta);
                            }
                            const icon = btn.querySelector('.share-icon');
                            if (icon) { icon.textContent = 'check'; setTimeout(() => { icon.textContent = 'link'; }, 1500); }
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors text-[10px] font-bold"
                        title="Copiar Link"
                    >
                        <span className="material-symbols-outlined text-[12px] share-icon">link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
