'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationStore } from '@/store/useNavigationStore';
import { NavItem, AppRoutes } from '@/types/navigation';
import FocusLock from 'react-focus-lock';

const navItems: (NavItem & { color?: string })[] = [
    { name: 'Fluxo', href: AppRoutes.HOME, icon: 'grain', color: 'brand-blue' },
    { name: 'Emaranhamento', href: AppRoutes.EMARANHAMENTO, icon: 'hub', color: 'brand-blue' },
    { name: 'Lançar', href: AppRoutes.ENVAR, icon: 'rocket_launch', isAction: true, color: 'brand-blue' },
    { name: 'Wiki', href: AppRoutes.WIKI, icon: 'menu_book', color: 'brand-yellow' },
    { name: 'Mais', href: '#', icon: 'add', isDrawerTrigger: true, color: 'brand-blue' },
];

const drawerLinks: (NavItem & { color?: string })[] = [
    { name: 'Laboratório Pessoal', href: AppRoutes.LAB, icon: 'science', isPrimary: true, color: 'brand-blue' },
    { name: 'Pergunte', href: AppRoutes.PERGUNTAS, icon: 'help_outline', color: 'brand-blue' },
    { name: 'Colisor', href: AppRoutes.COLISOR, icon: 'auto_awesome', color: 'brand-yellow' },
    { name: 'Trilhas', href: '/trilhas', icon: 'route', color: 'brand-red' },
    { name: 'Mapa', href: AppRoutes.MAPA, icon: 'map', color: 'brand-red' },
    { name: 'Sobre', href: '/sobre', icon: 'info', color: 'brand-blue' },
    { name: 'LabDiv', href: AppRoutes.ARQUIVO_LABDIV, icon: 'campaign', color: 'brand-blue' },
    { name: 'Painel Admin', href: AppRoutes.ADMIN, icon: 'admin_panel_settings', color: 'brand-red' },
];

/**
 * V8.0 BottomNavBar - Fort Knox Edition
 * Implements Sharded State, Touch-Action Priority, and Defensive UI Hardening.
 */
export const BottomNavBar = () => {
    const pathname = usePathname();
    const { isDrawerOpen, setDrawerOpen, closeAll } = useNavigationStore();
    const drawerRef = useRef<HTMLDivElement>(null);

    // V8.0 Body Scroll Lock Protocol
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isDrawerOpen]);

    // Close on route change
    useEffect(() => {
        closeAll();
    }, [pathname, closeAll]);

    if (!navItems?.length) return null;

    return (
        <>
            <div
                className="xl:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 h-24 bg-gradient-to-t from-white/90 dark:from-background-dark/90 via-white/40 dark:via-background-dark/40 to-transparent pointer-events-none"
                style={{ touchAction: 'pan-y' }} // V8.0 Native Scroll Performance
            >
                <nav className="max-w-md mx-auto h-16 bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl rounded-[32px] border border-white/30 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-around px-1 pointer-events-auto overflow-visible">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const activeColor = item.color || 'brand-blue';

                        {/* Central rocket button */ }
                        if (item.isAction) {
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group relative -top-6 flex flex-col items-center"
                                >
                                    <div className={`size-14 bg-${activeColor} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-${activeColor}/30 transform transition-transform active:scale-90 group-hover:-translate-y-1 border-4 border-white dark:border-gray-900`}>
                                        <span className="material-symbols-outlined text-3xl font-black">rocket_launch</span>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter text-${activeColor} mt-0.5`}>{item.name}</span>
                                </Link>
                            );
                        }

                        {/* "Mais" drawer trigger */ }
                        if (item.isDrawerTrigger) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setDrawerOpen(true)}
                                    className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-2xl transition-all ${isDrawerOpen ? `text-${activeColor}` : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    <span className={`material-symbols-outlined text-[22px] ${isDrawerOpen ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        }

                        {/* Normal nav item */ }
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-2xl transition-all relative ${isActive ? `text-${activeColor}` : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-tighter">
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div
                                        className={`absolute -bottom-1 w-1 h-1 rounded-full bg-${activeColor} animate-fade-in`}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* "Mais" Drawer Hardened V8.0 - CSS Transition Version */}
            <div
                className={`fixed inset-0 z-[110] xl:hidden transition-all duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Backdrop */}
                <div
                    onClick={() => setDrawerOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <div
                    ref={drawerRef}
                    className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[40px] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
                >
                    <FocusLock disabled={!isDrawerOpen}>
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8" />

                        <div className="grid grid-cols-1 gap-2">
                            {/* Primary: Laboratório */}
                            {drawerLinks?.filter(l => l.isPrimary).map(link => {
                                const activeColor = link.color || 'brand-blue';
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setDrawerOpen(false)}
                                        className={`flex items-center gap-4 p-4 bg-${activeColor} rounded-3xl text-white mb-4 shadow-lg shadow-${activeColor}/20`}
                                    >
                                        <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined">{link.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{link.name}</span>
                                            <span className="text-xs opacity-80">Editar dados e currículo técnico</span>
                                        </div>
                                        <span className="material-symbols-outlined ml-auto">chevron_right</span>
                                    </Link>
                                );
                            })}

                            {/* Grid of other links */}
                            <div className="grid grid-cols-2 gap-3">
                                {drawerLinks?.filter(l => !l.isPrimary).map((link) => {
                                    const activeColor = link.color || 'brand-blue';
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setDrawerOpen(false)}
                                            className={`flex flex-col gap-3 p-5 rounded-3xl border transition-all active:scale-95 ${isActive ? `bg-${activeColor}/10 border-${activeColor}/30 text-${activeColor}` : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand-blue/30 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled text-' + activeColor : 'text-' + activeColor}`}>{link.icon}</span>
                                            <span className={`text-sm font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => setDrawerOpen(false)}
                            className="w-full mt-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold rounded-2xl active:scale-[0.98] transition-all"
                        >
                            Fechar
                        </button>
                    </FocusLock>
                </div>
            </div>
        </>
    );
};
