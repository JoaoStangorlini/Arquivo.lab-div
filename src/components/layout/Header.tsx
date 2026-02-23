'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/app/actions/auth';
import { getAvatarUrl } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';
import { LevelUpNotification } from '../gamification/LevelUpNotification';

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Arquivo', href: '/', hoverClass: 'hover:text-brand-blue hover:border-brand-blue', activeClass: 'text-brand-blue border-brand-blue', mobileHover: 'hover:bg-brand-blue/10 hover:text-brand-blue', mobileActive: 'bg-brand-blue/10 text-brand-blue' },
        { name: 'Trilhas', href: '/trilhas', hoverClass: 'hover:text-brand-yellow hover:border-brand-yellow', activeClass: 'text-brand-yellow border-brand-yellow', mobileHover: 'hover:bg-brand-yellow/10 hover:text-brand-yellow', mobileActive: 'bg-brand-yellow/10 text-brand-yellow' },
        { name: 'Comunidade', href: '/comunidade', hoverClass: 'hover:text-brand-red hover:border-brand-red', activeClass: 'text-brand-red border-brand-red', mobileHover: 'hover:bg-brand-red/10 hover:text-brand-red', mobileActive: 'bg-brand-red/10 text-brand-red' },
        { name: 'Divulgação', href: '/iniciativas', hoverClass: 'hover:text-brand-blue hover:border-brand-blue', activeClass: 'text-brand-blue border-brand-blue', mobileHover: 'hover:bg-brand-blue/10 hover:text-brand-blue', mobileActive: 'bg-brand-blue/10 text-brand-blue' },
        { name: 'Pergunte', href: '/perguntas', hoverClass: 'hover:text-brand-red hover:border-brand-red', activeClass: 'text-brand-red border-brand-red', mobileHover: 'hover:bg-brand-red/10 hover:text-brand-red', mobileActive: 'bg-brand-red/10 text-brand-red' },
        { name: 'Criadores', href: '/criadores', hoverClass: 'hover:text-brand-yellow hover:border-brand-yellow', activeClass: 'text-brand-yellow border-brand-yellow', mobileHover: 'hover:bg-brand-yellow/10 hover:text-brand-yellow', mobileActive: 'bg-brand-yellow/10 text-brand-yellow' },
        { name: 'Mapa', href: '/mapa', hoverClass: 'hover:text-brand-blue hover:border-brand-blue', activeClass: 'text-brand-blue border-brand-blue', mobileHover: 'hover:bg-brand-blue/10 hover:text-brand-blue', mobileActive: 'bg-brand-blue/10 text-brand-blue' },
        { name: 'Sobre', href: '/sobre', hoverClass: 'hover:text-brand-red hover:border-brand-red', activeClass: 'text-brand-red border-brand-red', mobileHover: 'hover:bg-brand-red/10 hover:text-brand-red', mobileActive: 'bg-brand-red/10 text-brand-red' },
    ];


    const [user, setUser] = useState<any>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: just redirect
            window.location.href = '/';
        }
    };

    const toggleTheme = () => {
        if (isDarkMode === null) return;
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            document.cookie = "theme=dark; path=/; max-age=31536000";
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            document.cookie = "theme=light; path=/; max-age=31536000";
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-background-dark/90 border-b border-gray-200 dark:border-gray-800 border-t-4 border-t-brand-blue">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">
                        <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <div className="absolute w-7 h-9 bg-brand-blue rounded-[1px] top-0 left-0 z-0"></div>
                                <div className="absolute w-7 h-9 bg-brand-red rounded-[1px] bottom-0 right-0 z-0 translate-y-1"></div>
                                <div className="absolute w-7 h-7 bg-brand-yellow rounded-full top-3 left-3 z-20 shadow-sm border-2 border-white dark:border-transparent"></div>
                            </div>
                            <div className="flex flex-col justify-center -space-y-1">
                                <h1 className="font-sans font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                                    Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span>
                                </h1>
                                <p className="text-[10px] uppercase tracking-[0.05em] text-gray-400 font-semibold pt-0.5">INSTITUTO DE FÍSICA</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`font-medium transition-colors border-b-2 pb-1 ${isActive
                                            ? link.activeClass
                                            : `text-gray-600 dark:text-gray-300 border-transparent ${link.hoverClass}`
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex-1 lg:flex-none flex justify-end items-center gap-2 sm:gap-4">

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center overflow-hidden border-2 border-brand-blue/20">
                                            {user.user_metadata?.avatar_url ? (
                                                <img src={getAvatarUrl(user.user_metadata.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-brand-blue">person</span>
                                            )}
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400">expand_more</span>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 z-[60] animate-in fade-in zoom-in duration-200">
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || 'Usuário'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Link href="/perfil" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-blue/5 hover:text-brand-blue transition-colors">
                                                <span className="material-symbols-outlined text-lg">account_circle</span>
                                                Perfil
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">logout</span>
                                                Sair
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (

                                <Link href="/login" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-blue font-semibold px-4 py-2 transition-colors">
                                    <span className="material-symbols-outlined">login</span>
                                    <span className="hidden sm:inline">Entrar</span>
                                </Link>
                            )}

                            {/* Notifications */}
                            <NotificationBell userId={user?.id} />

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors overflow-hidden border-2 border-transparent hover:border-brand-blue/20 dark:hover:border-brand-yellow/20"
                                aria-label="Alterar tema"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isDarkMode === false && (
                                        <motion.span
                                            key="moon"
                                            initial={{ y: -30, opacity: 0, rotate: -90 }}
                                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                                            exit={{ y: 30, opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 10 }}
                                            className="material-symbols-outlined absolute"
                                        >
                                            dark_mode
                                        </motion.span>
                                    )}
                                    {isDarkMode === true && (
                                        <motion.span
                                            key="sun"
                                            initial={{ y: -30, opacity: 0, rotate: -90 }}
                                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                                            exit={{ y: 30, opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 10 }}
                                            className="material-symbols-outlined absolute"
                                        >
                                            light_mode
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isDarkMode === null && (
                                    <span className="w-5 h-5 rounded-full border-2 border-transparent border-t-brand-blue animate-spin"></span>
                                )}
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all focus:outline-none group relative shadow-sm"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Menu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 via-brand-yellow/5 to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {isMobileMenuOpen ? (
                                    <div className="relative w-6 h-6 flex items-center justify-center">
                                        <span className="absolute block w-6 h-0.5 bg-brand-blue rotate-45 transition-transform duration-300"></span>
                                        <span className="absolute block w-6 h-0.5 bg-brand-red -rotate-45 transition-transform duration-300"></span>
                                    </div>
                                ) : (
                                    <div className="relative z-10 flex flex-col gap-1.5">
                                        <span className="block w-6 h-0.5 bg-brand-blue rounded-full transition-all group-hover:translate-x-0.5"></span>
                                        <span className="block w-6 h-0.5 bg-brand-yellow rounded-full transition-all"></span>
                                        <span className="block w-6 h-0.5 bg-brand-red rounded-full transition-all group-hover:-translate-x-0.5"></span>
                                    </div>
                                )}
                            </button>


                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 shadow-xl absolute w-full left-0 top-full">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block px-5 py-3.5 rounded-xl text-base font-bold transition-all border-l-4 ${isActive
                                            ? `${link.mobileActive} border-l-current`
                                            : `text-gray-700 dark:text-gray-200 ${link.mobileHover} border-l-transparent`
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            {link.name}
                                            <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                                        </div>
                                    </Link>

                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Floating Action Button for Submissions */}
            <Link
                href="/enviar"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-blue hover:bg-brand-darkBlue text-white px-5 py-3 md:px-6 md:py-4 rounded-full font-bold shadow-xl shadow-brand-blue/30 transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-yellow/50 group"
            >
                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">add_circle</span>
                <span className="hidden sm:inline">Enviar Contribuição</span>
            </Link>
            {/* Gamification: Real-time feedback */}
            <LevelUpNotification />
        </>
    );
}
