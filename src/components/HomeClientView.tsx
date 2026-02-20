'use client';

import React, { useState } from 'react';
import { MediaCard, MediaCardProps, parseMediaUrl, formatYoutubeUrl, getDownloadUrl } from './MediaCard';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
}

export const HomeClientView = ({ initialItems }: HomeClientViewProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortOrder, setSortOrder] = useState<'recentes' | 'antigas'>('recentes');
    const [selectedItem, setSelectedItem] = useState<MediaCardProps | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);
    const [visibleCount, setVisibleCount] = useState(9);

    // Parallax Mouse State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const categories = ['Todos', 'Laboratórios', 'Pesquisadores', 'Eventos', 'Uso Didático', 'Bastidores da Ciência', 'Convivência', 'Outros'];

    // Filter Logic
    let filteredItems = initialItems.filter(item => {
        const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            item.title.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            item.authors.toLowerCase().includes(searchLower);

        return matchesCategory && matchesSearch;
    });

    // Sort Logic (default is recent first from server)
    if (sortOrder === 'antigas') {
        filteredItems = [...filteredItems].reverse();
    }

    const displayedItems = filteredItems.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 9);
    };

    const openModal = (item: MediaCardProps) => {
        setSelectedItem(item);
        setModalImageIdx(0);
    };

    const currentSubmissionIndex = selectedItem ? filteredItems.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < filteredItems.length - 1;

    const handlePrevSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(filteredItems[currentSubmissionIndex - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNextSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(filteredItems[currentSubmissionIndex + 1]);
            setModalImageIdx(0);

            // Expand visibleCount if we navigate beyond the currently loaded items
            if (currentSubmissionIndex + 1 >= visibleCount) {
                setVisibleCount(prev => prev + 9);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        // Calculate normalized mouse position relative to center of screen (-1 to 1)
        if (typeof window !== 'undefined') {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePos({ x, y });
        }
    };

    return (
        <>
            <header
                className="relative pt-20 pb-32 overflow-hidden flex-shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            >
                <div className="absolute inset-0 bg-background-light dark:bg-background-dark -z-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10 dark:opacity-30 -z-10"></div>

                {/* IDV Blobs */}
                <div
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/20 dark:bg-brand-blue/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse transition-transform duration-700 ease-out z-0"
                    style={{ transform: `translate(calc(-10% + ${mousePos.x * -120}px), calc(-20% + ${mousePos.y * -120}px))` }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-brand-red/20 dark:bg-brand-red/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 transition-transform duration-700 ease-out delay-75"
                    style={{ transform: `translate(calc(-25% + ${mousePos.x * 100}px), calc(33.333% + ${mousePos.y * 100}px))` }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-brand-yellow/20 dark:bg-brand-yellow/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out delay-150"
                    style={{ transform: `translate(calc(-50% + ${mousePos.x * -160}px), calc(-50% + ${mousePos.y * -160}px))` }}
                ></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 dark:border-brand-blue/30 text-brand-blue dark:text-brand-blue text-xs font-semibold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                            Excelência em Pesquisa
                        </div>
                        <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                            A Ciência <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Acontece Aqui</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            O arquivo oficial de divulgação científica do IF-USP. Explore fotos, vídeos, textos e materiais didáticos para ficar sempre antenado nas descobertas que transformam o mundo.
                        </p>

                        <div className="relative max-w-2xl group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <span className="material-symbols-outlined text-brand-blue pl-4 text-2xl">search</span>
                                <input
                                    className="w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg"
                                    placeholder="Buscar por autor, título, descrição..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-5 space-y-2 pl-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></span>
                                Experimente o filtro <span className="font-semibold text-brand-yellow cursor-pointer hover:underline" onClick={() => setSelectedCategory('Bastidores da Ciência')}>Bastidores da Ciência</span> para ver as gambiarras e Easter eggs da ciência.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"></span>
                                Você quer levar ciência para os alunos sem se preocupar com possíveis erros? Use o filtro <span className="font-semibold text-brand-blue cursor-pointer hover:underline" onClick={() => setSelectedCategory('Uso Didático')}>Uso Didático</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 sticky top-24 z-40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
                        <div className="flex gap-2">
                            {categories.map(cat => {
                                const isActive = selectedCategory === cat;
                                let activeClass = '';

                                if (isActive) {
                                    if (cat === 'Laboratórios') activeClass = 'bg-brand-yellow hover:bg-yellow-500 border-transparent text-black font-medium shadow-md';
                                    else if (cat === 'Pesquisadores') activeClass = 'bg-brand-red hover:bg-red-600 border-transparent text-white font-medium shadow-md';
                                    else if (cat === 'Eventos') activeClass = 'bg-brand-yellow hover:bg-yellow-500 border-transparent text-black font-medium shadow-md';
                                    else if (cat === 'Convivência') activeClass = 'bg-brand-red hover:bg-red-600 border-transparent text-white font-medium shadow-md';
                                    else activeClass = 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white font-medium shadow-md'; // Todos/Outros default base
                                } else {
                                    if (cat === 'Laboratórios') activeClass = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-brand-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow';
                                    else if (cat === 'Pesquisadores') activeClass = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red';
                                    else if (cat === 'Eventos') activeClass = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-brand-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow';
                                    else if (cat === 'Convivência') activeClass = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red';
                                    else activeClass = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue';
                                }

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap border ${activeClass}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-brand-blue">Ordenar por:</span>
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

            <section className="bg-background-subtle dark:bg-background-dark py-12 transition-colors flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="masonry-grid">
                        {displayedItems.length > 0 ? (
                            displayedItems.map((item) => (
                                <div key={item.id} onClick={() => openModal(item)}>
                                    <MediaCard {...item} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">search_off</span>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhum resultado encontrado</h3>
                                <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou termo de busca.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                                    className="mt-6 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                    {visibleCount < filteredItems.length && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                className="group relative overflow-hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-gray-900 shadow-xl hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 transition-all min-w-[200px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-0 group-hover:opacity-20 dark:group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    Carregar mais
                                    <span className="material-symbols-outlined text-xl group-hover:translate-y-1 transition-transform">expand_more</span>
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox / Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    {/* Global Nav Left */}
                    {hasPrevSubmission && (
                        <button
                            onClick={handlePrevSubmission}
                            className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                            aria-label="Submissão Anterior"
                        >
                            <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
                        </button>
                    )}

                    {/* Global Nav Right */}
                    {hasNextSubmission && (
                        <button
                            onClick={handleNextSubmission}
                            className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                            aria-label="Próxima Submissão"
                        >
                            <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_right</span>
                        </button>
                    )}

                    <div
                        className="w-full max-w-5xl xl:max-w-6xl max-h-full bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-[105]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Mobile Global Nav Overlay (Visible only on small screens) */}
                        <div className="md:hidden absolute inset-y-0 left-0 w-16 z-[106] flex items-center px-1 pointer-events-none">
                            {hasPrevSubmission && (
                                <button onClick={handlePrevSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-r-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                </button>
                            )}
                        </div>
                        <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                            {hasNextSubmission && (
                                <button onClick={handleNextSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                </button>
                            )}
                        </div>

                        {/* Media Section */}
                        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group">
                            {selectedItem.mediaType === 'video' ? (
                                (() => {
                                    const rawUrls = parseMediaUrl(selectedItem.mediaUrl);
                                    const videoUrl = rawUrls.length > 0 ? formatYoutubeUrl(rawUrls[0]) : '';
                                    return videoUrl ? (
                                        <iframe
                                            src={videoUrl}
                                            className="w-full h-full min-h-[400px] aspect-video"
                                            allowFullScreen
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : (
                                        <span className="text-white">Vídeo não encontrado</span>
                                    );
                                })()
                            ) : (
                                (() => {
                                    const urls = parseMediaUrl(selectedItem.mediaUrl);
                                    if (urls.length === 0) return <span className="text-white">Imagem não encontrada</span>;

                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img src={urls[modalImageIdx]} alt={selectedItem.title} className="max-w-full max-h-[80vh] object-contain" />
                                            {urls.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + urls.length) % urls.length) }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % urls.length) }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                                    </button>

                                                    <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                                                        {urls.map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === modalImageIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(i); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })()
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-h-[50vh] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                                    {selectedItem.category}
                                </span>
                                {selectedItem.isFeatured && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold tracking-wide uppercase">
                                        Destaque
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                {selectedItem.title}
                            </h2>

                            <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                    {selectedItem.authors.substring(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autor</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.authors}</span>
                                </div>
                            </div>

                            {selectedItem.description && (
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição do Trabalho</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                        {selectedItem.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 mt-auto">
                                {selectedItem.mediaType === 'image' && (
                                    <a
                                        href={getDownloadUrl(parseMediaUrl(selectedItem.mediaUrl)[modalImageIdx])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">download</span> Baixar Agora
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};
