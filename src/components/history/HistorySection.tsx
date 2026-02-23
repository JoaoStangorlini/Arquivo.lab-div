'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Submission } from '@/types';
import Link from 'next/link';

interface HistoryItem {
    id: string;
    submission: Submission;
    progress_percent: number;
    last_accessed_at: string;
}

interface HistorySectionProps {
    history: HistoryItem[];
}

export const HistorySection = ({ history }: HistorySectionProps) => {
    if (history.length === 0) return null;

    return (
        <section className="py-12 bg-[#121212]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-brand-blue text-3xl">history</span>
                    <h2 className="text-2xl font-bold text-white">Continuar Lendo</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {history.map((item) => (
                        <Link
                            key={item.id}
                            href={`/arquivo/${item.submission.id}`}
                            className="group block bg-[#1E1E1E] rounded-2xl border border-gray-800 overflow-hidden hover:border-brand-blue/30 transition-all hover:-translate-y-1"
                        >
                            <div className="relative aspect-video bg-gray-900">
                                <img
                                    src={item.submission.media_url}
                                    alt={item.submission.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                {/* Progress Bar Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.progress_percent}%` }}
                                        className="h-full bg-brand-blue shadow-[0_0_10px_#0077ff]"
                                    ></motion.div>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 text-[10px] font-black uppercase text-white tracking-widest flex items-center justify-between">
                                    <span>{item.progress_percent}% Concluído</span>
                                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.submission.title}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.submission.authors}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
