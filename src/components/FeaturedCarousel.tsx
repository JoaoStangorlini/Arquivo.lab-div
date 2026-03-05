'use client';

import React, { useRef, useState, useEffect } from 'react';
import { MediaCard, MediaCardProps } from './MediaCard';
import { m } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCarouselProps {
    items: MediaCardProps[];
    highlightQuery?: string;
}

export function FeaturedCarousel({ items, highlightQuery = '' }: FeaturedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            // Added 1px tolerance for rounding errors on some browsers
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [items]);

    if (!items || items.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative mb-16 group">
            {/* Background Decorative Glow */}
            <div className="absolute -inset-x-4 -inset-y-8 z-0 overflow-hidden pointer-events-none sm:block hidden">
                <div className="absolute top-1/2 left-1/4 size-96 bg-brand-yellow/5 rounded-full blur-[60px] animate-blob-bounce"></div>
                <div className="absolute top-0 right-1/4 size-96 bg-brand-red/5 rounded-full blur-[60px] animate-blob-bounce" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-brand-yellow rounded-full blur opacity-25 animate-premium-glow"></div>
                        <Star className="relative text-brand-red dark:text-brand-yellow w-6 h-6 animate-pulse fill-current" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] shimmer-text">
                        Destacados pelo Lab-Div
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Rolar para a esquerda"
                        disabled={!canScrollLeft}
                        className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-100 dark:disabled:hover:border-gray-800"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Rolar para a direita"
                        disabled={!canScrollRight}
                        className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-100 dark:disabled:hover:border-gray-800"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto pb-6 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {items.map((item, index) => (
                    <div
                        key={item.post.id}
                        className="min-w-[300px] md:min-w-[380px] snap-start"
                    >
                        <MediaCard post={item.post} priority={index < 2} highlightQuery={highlightQuery} />
                    </div>
                ))}
            </div>
        </div>
    );
}
