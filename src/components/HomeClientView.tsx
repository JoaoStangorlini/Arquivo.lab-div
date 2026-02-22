'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaCard, MediaCardProps } from './MediaCard';
import { fetchSubmissions } from '@/app/actions/submissions';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
    initialHasMore: boolean;
    initialCategory?: string;
    trendingItems?: MediaCardProps[];
}

export const HomeClientView = ({ initialItems, initialHasMore, initialCategory = 'Todos', trendingItems = [] }: HomeClientViewProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const authorFilter = searchParams.get('autor');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([initialCategory]);
    const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'recentes' | 'antigas'>('recentes');

    // Pagination & Data State
    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);


    // No need for mousePos React state anymore! Using CSS Variables for performance.
    const headerRef = useRef<HTMLElement>(null);
    const filtersScrollRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const scrollFilters = (direction: 'left' | 'right') => {
        if (filtersScrollRef.current) {
            const scrollAmount = 300;
            filtersScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const categories = ['Todos', 'Laboratórios', 'Pesquisadores', 'Eventos', 'Uso Didático', 'Bastidores da Ciência', 'Convivência', 'Mural do Deu Ruim', 'Guia de Sobrevivência', 'Física Fora da Caixa', 'Impacto e Conquistas', 'Central de Anotações', 'Outros'];
    const mediaTypeOptions = [
        { label: 'Imagens', value: 'image', icon: 'image' },
        { label: 'Vídeos', value: 'video', icon: 'videocam' },
        { label: 'PDFs', value: 'pdf', icon: 'picture_as_pdf' },
        { label: 'Textos', value: 'text', icon: 'article' },
        { label: 'ZIPs', value: 'zip', icon: 'folder_zip' },
        { label: 'Notas', value: 'sdocx', icon: 'edit_note' },
    ];

    // Debounce Search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch new results when filters change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetchSubmissions({
                    page: 1,
                    limit: 12,
                    query: debouncedQuery,
                    categories: selectedCategories,
                    mediaTypes: selectedMediaTypes,
                    sort: sortOrder,
                    author: authorFilter || undefined
                });
                setItems(res.items);
                setHasMore(res.hasMore);
                setPage(1);
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiltered();
    }, [debouncedQuery, selectedCategories, selectedMediaTypes, sortOrder, authorFilter]);

    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            const res = await fetchSubmissions({
                page: nextPage,
                limit: 12,
                query: debouncedQuery,
                categories: selectedCategories,
                mediaTypes: selectedMediaTypes,
                sort: sortOrder,
                author: authorFilter || undefined
            });
            setItems(prev => [...prev, ...res.items]);
            setHasMore(res.hasMore);
            setPage(nextPage);
        } catch (err) {
            console.error("Failed to load more", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Removal of modal navigation logic

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!headerRef.current) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        headerRef.current.style.setProperty('--mouse-x', x.toString());
        headerRef.current.style.setProperty('--mouse-y', y.toString());
    };

    const handleMouseLeave = () => {
        if (!headerRef.current) return;
        headerRef.current.style.setProperty('--mouse-x', '0');
        headerRef.current.style.setProperty('--mouse-y', '0');
    };

    return (
        <>
            <header
                ref={headerRef}
                className="relative pt-20 pb-32 overflow-hidden flex-shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 bg-background-light dark:bg-background-dark -z-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10 dark:opacity-30 -z-10"></div>

                {/* IDV Blobs */}
                <div
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/30 dark:bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-blob-bounce transition-transform duration-700 ease-out z-0"
                    style={{ transform: `translate(calc(-10% + var(--mouse-x, 0) * -120px), calc(-20% + var(--mouse-y, 0) * -120px))` }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-brand-red/30 dark:bg-brand-red/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-blob-bounce transition-transform duration-700 ease-out delay-75"
                    style={{ transform: `translate(calc(-25% + var(--mouse-x, 0) * 100px), calc(33.333% + var(--mouse-y, 0) * 100px))` }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-brand-yellow/30 dark:bg-brand-yellow/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-blob-bounce transition-transform duration-700 ease-out delay-150"
                    style={{ transform: `translate(calc(-50% + var(--mouse-x, 0) * -160px), calc(-50% + var(--mouse-y, 0) * -160px))` }}
                ></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 dark:border-brand-blue/30 text-brand-blue dark:text-blue-400 text-xs font-semibold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-blue dark:bg-blue-400 animate-pulse"></span>
                            Excelência em Pesquisa
                        </div>
                        <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                            A Ciência <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Acontece Aqui</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            O arquivo oficial de divulgação científica do IF-USP. Explore fotos, vídeos, textos e materiais didáticos para ficar sempre antenado nas descobertas que transformam o mundo.
                        </p>

                        <div className="relative max-w-2xl group" ref={searchContainerRef}>
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red rounded-2xl blur opacity-20 dark:hidden group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-white dark:bg-form-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <span className="material-symbols-outlined text-brand-blue pl-4 text-2xl">search</span>
                                <input
                                    className="w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg outline-none"
                                    placeholder="Buscar por autor, título, descrição..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                />
                            </div>

                            {/* Autocomplete Dropdown */}
                            <AnimatePresence>
                                {isSearchFocused && debouncedQuery.length > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                                    >
                                        {isLoading ? (
                                            <div className="p-4 text-center text-sm font-medium text-gray-400 flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                                Buscando sugestões...
                                            </div>
                                        ) : items.length > 0 ? (
                                            <div className="flex flex-col">
                                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Sugestões Inteligentes
                                                </div>
                                                {items.slice(0, 4).map((item: MediaCardProps) => (
                                                    <div key={item.id} onClick={() => router.push(`/arquivo/${item.id}`)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors">
                                                        <span className="material-symbols-outlined text-gray-400">
                                                            {item.mediaType === 'video' ? 'play_circle' : item.mediaType === 'text' ? 'article' : item.mediaType === 'pdf' ? 'picture_as_pdf' : 'image'}
                                                        </span>
                                                        <div className="flex flex-col flex-1 truncate">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.title}</span>
                                                            <span className="text-xs text-brand-blue dark:text-blue-400 font-medium truncate">{item.authors}</span>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-300 text-sm">north_west</span>
                                                    </div>
                                                ))}
                                                <div onClick={() => setIsSearchFocused(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-center text-xs font-bold text-brand-blue dark:text-brand-yellow cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800">
                                                    Ver todos os {items.length} resultados para "{debouncedQuery}"
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-sm font-medium text-gray-500">Nenhum resultado encontrado para "{debouncedQuery}"</div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="mt-5 space-y-3 pl-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex sm:items-center gap-2 opacity-90 transition-opacity hover:opacity-100 flex-col sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></span>
                                    <span>Experimente o filtro</span>
                                </div>
                                <span className="font-semibold text-brand-yellow cursor-pointer hover:underline sm:ml-0 ml-3.5" onClick={() => setSelectedCategories(['Bastidores da Ciência'])}>Bastidores da Ciência</span>
                                <span className="sm:ml-0 ml-3.5">para ver as gambiarras e Easter eggs da ciência.</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex sm:items-center gap-2 opacity-90 transition-opacity hover:opacity-100 flex-col sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"></span>
                                    <span>Você quer levar ciência para os alunos?</span>
                                </div>
                                <span className="font-semibold text-brand-blue dark:text-blue-400 cursor-pointer hover:underline sm:ml-0 ml-3.5" onClick={() => setSelectedCategories(['Uso Didático'])}>Uso Didático</span>
                                <span className="sm:ml-0 ml-3.5">é ideal para o ensino.</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex sm:items-center gap-2 opacity-90 transition-opacity hover:opacity-100 flex-col sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"></span>
                                    <span>Procurando materiais de estudo? Explore a</span>
                                </div>
                                <span className="font-semibold text-brand-red cursor-pointer hover:underline sm:ml-0 ml-3.5" onClick={() => setSelectedCategories(['Central de Anotações'])}>Central de Anotações</span>
                                <span className="sm:ml-0 ml-3.5">para Drives e PDFs.</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Destaque da Semana & Em Alta no IFUSP Section */}
                {(() => {
                    const featuredItems = initialItems.filter(i => i.isFeatured);
                    const hasTrending = trendingItems.length > 0;

                    if (featuredItems.length === 0 && !hasTrending) return null;

                    return (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 md:pt-24">
                            {featuredItems.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-red to-brand-yellow text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            Destaque da Semana
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-r from-brand-yellow/40 to-transparent"></div>
                                    </div>
                                    <div className={`grid gap-6 ${featuredItems.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                        {featuredItems.map(item => (
                                            <div key={item.id} className="transform hover:scale-[1.02] transition-transform">
                                                <div className="relative">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                                    <div className="relative">
                                                        <MediaCard {...item} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasTrending && (
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-brand-red text-white flex-row-reverse rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                            Em Alta no IFUSP
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-r from-brand-blue/40 to-transparent"></div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                        {trendingItems.map(item => (
                                            <div key={item.id} className="transform hover:scale-[1.02] transition-transform">
                                                <MediaCard {...item} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

            </header>

            <section className="py-4 md:py-6 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-background-dark/95 sticky top-24 z-40 backdrop-blur-md shadow-sm overflow-hidden border-t border-t-gray-100 dark:border-t-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 md:space-y-4">

                    {/* Media Type Filters */}
                    <div className="flex flex-wrap items-center gap-3 pb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Formato:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {mediaTypeOptions.map(option => {
                                const isActive = selectedMediaTypes.includes(option.value);
                                let colorClass = 'brand-blue';
                                let textColor = 'text-white';
                                if (option.value === 'video') { colorClass = 'brand-yellow'; textColor = 'text-black'; }
                                if (option.value === 'pdf') { colorClass = 'brand-red'; textColor = 'text-white'; }
                                if (option.value === 'text') { colorClass = 'brand-blue'; textColor = 'text-white'; }
                                if (option.value === 'zip') { colorClass = 'brand-blue'; textColor = 'text-white'; }
                                if (option.value === 'sdocx') { colorClass = 'brand-red'; textColor = 'text-white'; }

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            if (isActive) {
                                                setSelectedMediaTypes(prev => prev.filter(t => t !== option.value));
                                            } else {
                                                setSelectedMediaTypes(prev => [...prev, option.value]);
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isActive
                                            ? `bg-${colorClass} ${textColor} border-${colorClass} shadow-md shadow-${colorClass}/20`
                                            : `bg-white dark:bg-form-dark text-gray-500 border-gray-200 dark:border-gray-700 hover:border-${colorClass} hover:text-${colorClass} hover:bg-${colorClass}/5`}`}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex items-center gap-2 w-full pt-1">
                        <span className="text-xs font-bold text-gray-400 flex-shrink-0 uppercase tracking-widest mr-2 sm:block hidden">Categorias:</span>

                        <button onClick={() => scrollFilters('left')} className="p-1.5 mr-1 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-100 hidden sm:flex shrink-0">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>

                        <div ref={filtersScrollRef} className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                            {categories.map(cat => {
                                const isActive = selectedCategories.includes(cat);
                                const isYellow = cat === 'Laboratórios' || cat === 'Eventos' || cat === 'Guia de Sobrevivência';
                                const isRed = cat === 'Pesquisadores' || cat === 'Convivência' || cat === 'Impacto e Conquistas' || cat === 'Mural do Deu Ruim';

                                let activeClass = '';
                                if (isActive) {
                                    activeClass = isYellow
                                        ? 'bg-brand-yellow hover:bg-yellow-500 border-transparent text-black font-medium shadow-md'
                                        : isRed
                                            ? 'bg-brand-red hover:bg-red-600 border-transparent text-white font-medium shadow-md'
                                            : 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white font-medium shadow-md';
                                } else {
                                    activeClass = isYellow
                                        ? 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-brand-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow'
                                        : isRed
                                            ? 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red'
                                            : 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue';
                                }

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            if (cat === 'Todos') {
                                                setSelectedCategories(['Todos']);
                                                return;
                                            }
                                            let next = [...selectedCategories];
                                            if (next.includes('Todos')) {
                                                next = [cat];
                                            } else {
                                                if (isActive) {
                                                    next = next.filter(c => c !== cat);
                                                    if (next.length === 0) next = ['Todos'];
                                                } else {
                                                    next.push(cat);
                                                }
                                            }
                                            setSelectedCategories(next);
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap border ${activeClass} shrink-0`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        <button onClick={() => scrollFilters('right')} className="p-1.5 ml-1 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-100 hidden sm:flex shrink-0">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>

                        <div className="hidden lg:flex items-center gap-2 shrink-0 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'recentes' | 'antigas')}
                                className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors outline-none"
                            >
                                <option value="recentes">Mais recentes</option>
                                <option value="antigas">Mais antigas</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
            {/* Main Feed Section */}
            <section className="bg-background-subtle dark:bg-background-dark py-12 transition-colors flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {authorFilter && (
                        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between p-6 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-primary">
                                    {authorFilter.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{authorFilter}</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Autor(a) no Arquivo Lab-Div</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95">
                                    Seguir
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    Ver tudo
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
                            <p className="text-gray-500 font-medium">Buscando itens na base de dados...</p>
                        </div>
                    ) : (
                        <>
                            {(debouncedQuery || !selectedCategories.includes('Todos') || selectedMediaTypes.length > 0) && (
                                <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                        {debouncedQuery ? `Resultados para "${debouncedQuery}"` : 'Resultados Exploratórios'}
                                        {!selectedCategories.includes('Todos') && <span className="text-brand-blue dark:text-brand-yellow font-extrabold ml-1">em {selectedCategories.join(', ')}</span>}
                                        {selectedMediaTypes.length > 0 && <span className="text-gray-400 dark:text-gray-500 font-medium ml-1">({selectedMediaTypes.map(t => mediaTypeOptions.find(o => o.value === t)?.label).join(', ')})</span>}
                                    </h2>
                                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{items.length} iten(s)</span>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div key={item.id} className="w-full">
                                            <MediaCard {...item} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">search_off</span>
                                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhum resultado encontrado</h3>
                                        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou termo de busca.</p>
                                        <button
                                            onClick={() => { setSearchQuery(''); setSelectedCategories(['Todos']); setSelectedMediaTypes([]); }}
                                            className="mt-6 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            Limpar Filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {hasMore && !isLoading && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className={`group relative overflow-hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-gray-900 shadow-xl transition-all min-w-[200px] ${isLoadingMore ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-0 group-hover:opacity-20 dark:group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {isLoadingMore ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            Carregar mais
                                            <span className="material-symbols-outlined text-xl group-hover:translate-y-1 transition-transform">expand_more</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </section >

            {/* Modal removed */}
        </>
    );
};
