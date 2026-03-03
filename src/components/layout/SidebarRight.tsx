'use client';

import React from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { searchProfiles, followUser, unfollowUser, checkIsFollowing } from '@/app/actions/submissions';
import { toast } from 'react-hot-toast';

interface SidebarTag {
    name: string;
    count: number;
}

interface SidebarAuthor {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
}

interface SidebarRightProps {
    tags: SidebarTag[];
    authors: SidebarAuthor[];
}

export const SidebarRight = ({ tags, authors: initialAuthors }: SidebarRightProps) => {
    const [page, setPage] = React.useState(0);
    const [activeTab, setActiveTab] = React.useState<'trending' | 'search'>('trending');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<SidebarAuthor[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());

    const tagsPerPage = 4;
    const totalPages = Math.ceil((tags.length || 1) / tagsPerPage);

    const currentTags = tags.slice(page * tagsPerPage, (page + 1) * tagsPerPage);

    // Unified check for following status
    React.useEffect(() => {
        const checkFollows = async (authors: SidebarAuthor[]) => {
            if (authors.length === 0) return;
            const followStates = await Promise.all(
                authors.map(async (author) => {
                    const isFollowing = await checkIsFollowing(author.id);
                    return { id: author.id, isFollowing };
                })
            );
            setFollowingIds(prev => {
                const next = new Set(prev);
                followStates.forEach(f => {
                    if (f.isFollowing) next.add(f.id);
                    else next.delete(f.id);
                });
                return next;
            });
        };

        checkFollows(initialAuthors);
    }, [initialAuthors]);

    React.useEffect(() => {
        const checkFollows = async (authors: SidebarAuthor[]) => {
            if (authors.length === 0) return;
            const followStates = await Promise.all(
                authors.map(async (author) => {
                    const isFollowing = await checkIsFollowing(author.id);
                    return { id: author.id, isFollowing };
                })
            );
            setFollowingIds(prev => {
                const next = new Set(prev);
                followStates.forEach(f => {
                    if (f.isFollowing) next.add(f.id);
                    else next.delete(f.id);
                });
                return next;
            });
        };

        checkFollows(searchResults);
    }, [searchResults]);

    // Fast Search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await searchProfiles(searchQuery);
                    setSearchResults(results as SidebarAuthor[]);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFollowToggle = async (id: string) => {
        const isCurrentlyFollowing = followingIds.has(id);

        // Optimistic update
        const newIds = new Set(followingIds);
        if (isCurrentlyFollowing) newIds.delete(id);
        else newIds.add(id);
        setFollowingIds(newIds);

        const res = isCurrentlyFollowing ? await unfollowUser(id) : await followUser(id);
        if (!res.success) {
            toast.error(res.error || "Erro na conexão");
            // Revert on error using the previous state (followingIds)
            setFollowingIds(followingIds);
        } else {
            toast.success(isCurrentlyFollowing ? "Conexão encerrada" : "Conexão estabelecida!");
        }
    };

    const handleNextPage = () => {
        setPage((prev) => (prev + 1) % totalPages);
    };

    return (
        <aside className="sticky top-24 h-[calc(100vh-6rem)] w-full flex flex-col gap-6 py-6 pl-4 overflow-y-auto hidden-scrollbar">
            {/* Discovery Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar Partículas..."
                    className="w-full bg-gray-100 dark:bg-card-dark border border-transparent focus:border-brand-blue/30 focus:bg-white dark:focus:bg-card-dark rounded-2xl py-3 pl-12 pr-4 text-sm font-medium transition-all outline-none"
                />
            </div>

            {/* ISÓTOPOS EM ÓRBITA */}
            <div className="bg-gray-50 dark:bg-card-dark rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-blue">Isótopos em Órbita</h3>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${page === i ? 'bg-brand-blue w-4 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-300 dark:bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[160px]">
                    <AnimatePresence mode="wait">
                        <m.div
                            key={page}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            {currentTags.length > 0 ? currentTags.map((tag) => (
                                <Link
                                    key={tag.name}
                                    href={`/?category=${tag.name}`}
                                    className="group flex flex-col hover:opacity-80 transition-opacity"
                                >
                                    <span className={`text-xs font-black transition-colors ${tag.name.length % 3 === 0 ? 'text-brand-blue' :
                                        tag.name.length % 3 === 1 ? 'text-brand-yellow' :
                                            'text-brand-red'
                                        }`}>#{tag.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{tag.count} contribuições</span>
                                </Link>
                            )) : (
                                <span className="text-xs text-gray-500 italic">Nenhum isótopo detectado...</span>
                            )}
                        </m.div>
                    </AnimatePresence>
                </div>

                <button
                    onClick={handleNextPage}
                    className="mt-4 text-xs font-bold text-brand-yellow hover:underline flex items-center gap-1 group"
                >
                    Explorar mais isótopos
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Usuários em Órbita Section */}
            <div className="bg-gray-50 dark:bg-card-dark rounded-3xl pb-5 border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'trending' ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Principais
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'search' ? 'text-brand-red border-b-2 border-brand-red bg-brand-red/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Buscar
                    </button>
                </div>

                <div className="p-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Usuários em Órbita</h3>

                    {activeTab === 'search' && (
                        <div className="relative mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nome ou @user..."
                                className="w-full bg-white dark:bg-card-dark border border-gray-200 dark:border-transparent rounded-xl py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-brand-blue transition-all"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-3 h-3 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {(activeTab === 'search' ? searchResults : initialAuthors).length > 0 ?
                            (activeTab === 'search' ? searchResults : initialAuthors).map((user) => {
                                const isFollowing = followingIds.has(user.id);
                                return (
                                    <div key={`${activeTab}-${user.id}`} className="flex items-center justify-between gap-3 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar
                                                src={user.avatar}
                                                name={user.name}
                                                size="md"
                                                customSize="size-10"
                                            />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]" title={user.name}>{user.name}</span>
                                                <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{user.handle}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => handleFollowToggle(user.id)}
                                                className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all ${isFollowing ? 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-red-500/10 hover:text-red-500' :
                                                    (user.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 3 === 0 ? 'bg-brand-blue text-white hover:scale-105 shadow-lg shadow-brand-blue/10' :
                                                        (user.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 3 === 1 ? 'bg-brand-yellow text-gray-900 hover:scale-105 shadow-lg shadow-brand-yellow/10' :
                                                            'bg-brand-red text-white hover:scale-105 shadow-lg shadow-brand-red/10'
                                                    }`}
                                            >
                                                {isFollowing ? 'Seguindo' : 'Seguir'}
                                            </button>


                                        </div>
                                    </div>
                                );
                            }) : (
                                <span className="text-xs text-gray-500 italic">
                                    {activeTab === 'search' && searchQuery.length < 2 ? 'Digite 2 caracteres para buscar...' : 'Nenhum usuário detectado.'}
                                </span>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="px-5 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-medium">
                <Link href="/manual" className="hover:underline">Privacidade</Link>
                <Link href="/manual" className="hover:underline">Termos</Link>
                <Link href="/manual" className="hover:underline">Cookies</Link>
                <span>© 2026 IFUSP Lab-Div - Hub de Comunicação Científica</span>
            </div>
        </aside>
    );
};
