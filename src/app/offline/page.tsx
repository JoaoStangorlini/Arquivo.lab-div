import React from 'react';
import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#121212] text-white">
            <div className="w-24 h-24 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-5xl">wifi_off</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 tracking-tight">Você está offline</h1>
            <p className="text-slate-400 text-center max-w-md mb-10 leading-relaxed">
                Parece que sua conexão com a internet foi interrompida.
                Os conteúdos do acervo precisam de conexão ativa para carregar dados do Supabase.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Tentar Novamente
                </button>

                <Link
                    href="/"
                    className="w-full py-4 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">home</span>
                    Voltar ao Início
                </Link>
            </div>

            <p className="mt-12 text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                Hub de Comunicação Científica :: IFUSP
            </p>
        </div>
    );
}
