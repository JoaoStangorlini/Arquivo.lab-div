'use client';

import React, { useState } from 'react';

export interface MediaCardProps {
    id: string;
    title: string;
    description?: string;
    authors: string;
    mediaType: 'image' | 'video';
    mediaUrl: string | string[]; // Can be a string or JSON array
    category?: string;
    avatarUrl?: string;
    isFeatured?: boolean;
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

export const MediaCard = ({
    title,
    description,
    authors,
    mediaType,
    mediaUrl,
    category,
    avatarUrl,
    isFeatured
}: MediaCardProps) => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const displayUrl = urls.length > 0 ? urls[currentImageIndex] : '';

    let accentClass = 'border-t-4 border-t-gray-100 dark:border-t-gray-700';
    if (category === 'Laboratórios') accentClass = 'card-accent-blue';
    else if (category === 'Pesquisadores') accentClass = 'card-accent-red';
    else if (category === 'Eventos') accentClass = 'card-accent-yellow';
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
                ) : (
                    displayUrl ? (
                        <img
                            src={displayUrl}
                            alt={`${title} - image ${currentImageIndex + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-400">broken_image</span>
                        </div>
                    )
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
                        {mediaType === 'image' && displayUrl && (
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
                            ${category === 'Laboratórios' ? 'bg-brand-blue/90 text-white shadow-brand-blue/50' :
                                category === 'Pesquisadores' ? 'bg-brand-red/90 text-white shadow-brand-red/50' :
                                    category === 'Eventos' ? 'bg-brand-yellow/90 text-black shadow-brand-yellow/50' :
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
                    <span className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wide truncate">
                        {authors}
                    </span>
                </div>
            </div>
        </div>
    );
};
