'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Visão Geral', href: '/admin', icon: 'pie_chart' },
        { name: 'Pendentes', href: '/admin/pendentes', icon: 'assignment' },
        { name: 'Aprovados', href: '/admin/aprovados', icon: 'check_circle' },
        { name: 'Negadas', href: '/admin/negadas', icon: 'cancel' },
        { name: 'Filtrar por Autor', href: '/admin/autores', icon: 'person_search' },
        { name: 'Editar Submissões', href: '/admin/editar', icon: 'edit_square' },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans antialiased min-h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-gray-800 z-[60]">
                <div className="font-bold text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-blue">admin_panel_settings</span>
                    Admin<span className="text-brand-yellow">Panel</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-gray-800 rounded-lg focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 bg-neutral-900 border-r border-gray-800 flex-col justify-between shrink-0 h-[calc(100vh-73px)] md:h-screen overflow-hidden md:sticky top-0 absolute inset-x-0 bottom-0 z-50 md:z-40 transition-colors shadow-2xl`}>
                {/* Interactive Background Elements for Sidebar */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-red/10 dark:hidden rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                <div className="flex flex-col gap-4 p-6 relative z-10">
                    <div className="flex items-center gap-3 pb-6 border-b border-gray-800 transition-colors">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <div className="absolute w-6 h-7 bg-brand-blue rounded-[1px] top-0 left-0 z-0"></div>
                                <div className="absolute w-6 h-7 bg-brand-red rounded-[1px] bottom-0 right-0 z-0 translate-y-1"></div>
                                <div className="absolute w-6 h-6 bg-brand-yellow rounded-full top-2 left-2 z-20 shadow-sm border border-transparent"></div>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-white text-lg font-bold leading-tight truncate">Admin<span className="text-brand-yellow">Panel</span></h1>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">Lab-Div USP</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive
                                        ? 'bg-brand-blue border border-brand-blue/50 text-white shadow-lg shadow-brand-blue/20'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-800 transition-colors relative z-10">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-400 rounded-xl hover:bg-gray-800 hover:text-brand-red transition-colors border border-transparent group focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-brand-red transition-colors">logout</span>
                        <span>Sair do Painel</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-screen relative bg-background-light dark:bg-background-dark">
                {children}
            </main>
        </div>
    );
}
