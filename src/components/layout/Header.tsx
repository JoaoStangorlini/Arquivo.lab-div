'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/app/actions/auth';
import { getAvatarUrl } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';
import { useSearch } from '@/providers/SearchProvider';
import { useNavigationStore } from '@/store/useNavigationStore';
import { Avatar } from '../ui/Avatar';
import { UserMinimalDTO, SearchSuggestion } from '@/types/navigation';



/**
 * V8.0 Header - Fort Knox Edition
 * Implements Layer Isolation, Strict Typing, and Sharded Navigation State.
 */
export function Header() {
    const { query, setQuery, placeholder } = useSearch();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    // Sharded UI State (V8.0 Navigation Store)
    const {
        isProfileMenuOpen,
        setProfileMenuOpen,
        isSuggestionsVisible,
        setSuggestionsVisible,
        closeAll
    } = useNavigationStore();

    const [user, setUser] = useState<UserMinimalDTO | null>(null);

    // Search Suggestions V8.0 - Optimized logic
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const fetchSuggestions = useCallback(async () => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        setIsSearchLoading(true);
        try {
            const { data } = await supabase
                .from('submissions')
                .select('id, title')
                .ilike('title', `%${query}%`)
                .eq('status', 'aprovado')
                .limit(5);
            setSuggestions((data as SearchSuggestion[]) || []);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearchLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [fetchSuggestions]);

    // Handle Clicks Outside (Defensive Strategy)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('#search-container')) {
                setSuggestionsVisible(false);
            }
            if (!target.closest('#profile-menu-container')) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [setSuggestionsVisible, setProfileMenuOpen]);

    // Auth Sync - VIP PII Protection
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || 'Usuário',
                    avatar_url: session.user.user_metadata?.avatar_url,
                    email: session.user.email || '',
                });
            } else {
                setUser(null);
            }
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || 'Usuário',
                    avatar_url: session.user.user_metadata?.avatar_url,
                    email: session.user.email || '',
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close all menus on route change
    useEffect(() => {
        closeAll();
    }, [pathname, closeAll]);

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 h-16 glass-surface z-50 transition-colors"
            >
                <div className="max-w-[1800px] mx-auto h-full px-4 flex items-center justify-between gap-4">
                    {/* Left: Branding */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={closeAll}>
                        <div className="flex items-center gap-3">
                            <div className="relative group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity animate-premium-glow"></div>
                                <img src="/labdiv-logo.png" alt="Hub Lab-Div" className="relative w-10 h-10 object-contain rounded-lg shadow-2xl" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <div className="text-2xl font-[900] tracking-tighter uppercase flex items-center gap-1 group-hover:animate-metallic-shine">
                                    <span className="text-gray-900 dark:text-white">HUB</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow opacity-90 group-hover:opacity-100 transition-opacity">LAB-DIV</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-bold text-gray-500/80 uppercase tracking-widest">Instituto de Física</span>
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-400">v3.1.5</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Middle: Defensive Search Rendering */}
                    <div className="flex-1 max-w-2xl relative group hidden md:block" id="search-container">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">search</span>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setSuggestionsVisible(true)}
                            className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-blue/30 outline-none transition-all dark:text-white"
                        />

                        {/* Search Suggestions Dropdown V8.0 */}
                        <AnimatePresence>
                            {isSuggestionsVisible && (suggestions?.length > 0 || isSearchLoading) && (
                                <m.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                                >
                                    {isSearchLoading ? (
                                        <div className="p-4 flex items-center gap-3 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            <span className="material-symbols-outlined animate-spin text-brand-blue">progress_activity</span>
                                            Pesquisando...
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        setQuery(s.title);
                                                        setSuggestionsVisible(false);
                                                    }}
                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                                                >
                                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-brand-blue transition-colors">history</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{s.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Sharded Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r border-gray-100 dark:border-white/10">


                            <div className="flex items-center gap-2">
                                <NotificationBell userId={user?.id} />

                                {user ? (
                                    <div className="relative" id="profile-menu-container">
                                        <button
                                            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-blue/20 hover:border-brand-blue/50 transition-colors"
                                        >
                                            <Avatar
                                                src={user.avatar_url}
                                                name={user.full_name}
                                                size="md"
                                                customSize="w-10 h-10"
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isProfileMenuOpen && (
                                                <m.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-[60] flex flex-col"
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {user.full_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    <Link
                                                        href="/lab"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">science</span>
                                                        Meu Laboratório
                                                    </Link>
                                                    <div className="h-[1px] bg-gray-100 dark:bg-white/10 my-1"></div>
                                                    <button
                                                        onClick={async () => {
                                                            setProfileMenuOpen(false);
                                                            await signOut();
                                                        }}
                                                        className="px-4 py-3 text-sm text-brand-red hover:bg-brand-red/10 transition-colors flex items-center gap-2 font-bold w-full text-left"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                                        Sair
                                                    </button>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link href="/login" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-blue font-semibold px-4 py-2 transition-colors">
                                        <span className="material-symbols-outlined">login</span>
                                        <span className="hidden sm:inline">Entrar</span>
                                    </Link>
                                )}
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <m.span
                                        key={theme}
                                        initial={{ y: -20, opacity: 0, rotate: -45 }}
                                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                                        exit={{ y: 20, opacity: 0, rotate: 45 }}
                                        className="material-symbols-outlined absolute text-[20px]"
                                    >
                                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                    </m.span>
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>
            </header>


        </>
    );
}
