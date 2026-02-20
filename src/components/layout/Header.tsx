'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
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
                                Arquivo <span className="text-brand-blue">Lab-Div</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.05em] text-gray-400 font-semibold pt-0.5">INSTITUTO DE FÍSICA</p>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-yellow font-medium transition-colors border-b-2 border-transparent hover:border-brand-blue pb-1">Início</Link>
                        <Link href="/enviar" className="text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red font-medium transition-colors border-b-2 border-transparent hover:border-brand-red pb-1">Submeter</Link>
                        <Link href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-brand-yellow dark:hover:text-brand-blue font-medium transition-colors border-b-2 border-transparent hover:border-brand-yellow pb-1">Admin</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/enviar" className="bg-brand-blue hover:bg-brand-darkBlue text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-blue/25 transition-all transform hover:-translate-y-0.5 border-2 border-transparent hover:border-brand-yellow/50">
                            Enviar Contribuição
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button className="text-gray-500 dark:text-gray-400 focus:outline-none">
                            <span className="material-symbols-outlined text-3xl">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
