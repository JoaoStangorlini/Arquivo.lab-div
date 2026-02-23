'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSubmissions } from '@/app/actions/submissions';
import { MediaCardProps } from '@/components/MediaCard';

const CampusMap = dynamic(() => import('@/components/map/CampusMap').then(mod => mod.CampusMap), {
    ssr: false,
    loading: () => (
        <div className="w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse flex flex-col items-center justify-center text-gray-400 gap-4">
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-20 h-20 rounded-full border-4 border-[#0055ff]/30 border-t-[#0055ff] shadow-[0_0_20px_rgba(0,85,255,0.2)]"
            />
            <span className="font-bold text-xs uppercase tracking-widest text-[#0055ff]">Navegação Gamificada</span>
        </div>
    )
});

export default function MapClient({ initialItems }: { initialItems: MediaCardProps[] }) {
    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [loading, setLoading] = useState(false);

    return (
        <main className="min-h-screen bg-[#121212] pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-red mb-4">
                        Campus Interativo
                    </h1>
                    <p className="text-gray-400">
                        Navegue pelas descobertas e registros através da geografia do Instituto.
                    </p>
                </header>

                <div className="w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
                    <CampusMap items={items} />
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-[#1E1E1E] border border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-yellow">help</span>
                        Como funciona?
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Os pontos no mapa representam locais específicos onde as mídias foram registradas ou eventos ocorreram.
                        Clique em um pino para ver o resumo e acesse a página completa para mergulhar nos detalhes.
                    </p>
                </div>
            </div>
        </main>
    );
}
