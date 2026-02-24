'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('🔴 Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-brand-red/20 blur-2xl rounded-full"></div>
                    <span className="material-symbols-outlined text-6xl text-brand-red relative z-10">error</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Ops! Algo deu errado.</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Encontramos um erro inesperado. O sistema foi blindado e os dados estão seguros.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-[#0055ff] hover:bg-[#0044cc] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#0055ff]/20 active:scale-95"
                    >
                        Tentar Novamente
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl font-bold transition-all active:scale-95"
                    >
                        Voltar para Início
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg text-left overflow-auto max-h-40">
                        <code className="text-xs text-red-600 dark:text-red-400">
                            {error.message}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}
