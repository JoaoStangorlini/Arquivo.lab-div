'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Arquivo', href: '/' },
        { name: 'Sobre', href: '/sobre' },
        { name: 'Iniciativas', href: '/iniciativas' },
        { name: 'Oportunidades', href: '/oportunidades' },
        { name: 'Criadores', href: '/criadores' },
        { name: 'Guia', href: '/guia' },
        { name: 'Admin', href: '/admin' },
    ];

    return (
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
                                Hub <span className="text-brand-blue">Lab-Div</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.05em] text-gray-400 font-semibold pt-0.5">INSTITUTO DE FÍSICA</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`font-medium transition-colors border-b-2 pb-1 ${isActive
                                        ? 'text-brand-blue border-brand-blue'
                                        : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-brand-blue hover:border-brand-blue'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/enviar" className="bg-brand-blue hover:bg-brand-darkBlue text-white px-4 py-2 text-sm sm:px-5 sm:py-2.5 rounded-full font-semibold shadow-lg shadow-brand-blue/25 transition-all transform hover:-translate-y-0.5 border-2 border-transparent hover:border-brand-yellow/50 whitespace-nowrap">
                            Enviar Contribuição
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden text-gray-500 hover:text-brand-blue dark:text-gray-400 focus:outline-none p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined text-3xl">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
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
                                    className={`block px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                                        ? 'bg-brand-blue/10 text-brand-blue'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-blue'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
