'use client';

import React, { useMemo } from 'react';
import { Submission } from '@/types';
import { TimelineItem } from './TimelineItem';
import { motion } from 'framer-motion';

interface TimelineViewProps {
    submissions: Submission[];
}

import { useInView } from 'react-intersection-observer';

const YearGroup = ({ year, yearSubmissions }: { year: string, yearSubmissions: Submission[] }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    return (
        <div ref={ref} className="mb-16 min-h-[400px]">
            {inView ? (
                <>
                    {/* Year Sticky Header */}
                    <div className="sticky top-24 z-20 flex justify-center mb-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-6 py-2 rounded-full bg-brand-blue text-white font-black text-xl shadow-xl border-4 border-white dark:border-[#121212]"
                        >
                            {year}
                        </motion.div>
                    </div>

                    {yearSubmissions.map((submission, index) => (
                        <TimelineItem
                            key={submission.id}
                            submission={submission}
                            isLeft={index % 2 === 0}
                        />
                    ))}
                </>
            ) : (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export const TimelineView = ({ submissions }: TimelineViewProps) => {
    // ... existing logic ...
    // Separate submissions with and without event_date
    const { dated, undated } = useMemo(() => {
        const sorted = [...submissions].sort((a, b) => {
            const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
            const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
            return dateB - dateA; // Newest first
        });

        return {
            dated: sorted.filter(s => s.event_date),
            undated: sorted.filter(s => !s.event_date)
        };
    }, [submissions]);

    // Group dated by Year for sticky headers
    const groupedByYear = useMemo(() => {
        const groups: Record<number, Submission[]> = {};
        dated.forEach(s => {
            const year = new Date(s.event_date!).getFullYear();
            if (!groups[year]) groups[year] = [];
            groups[year].push(s);
        });
        return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
    }, [dated]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <header className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-blue bg-[length:200%_auto] animate-gradient-flow mb-4">
                    Linha do Tempo
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Explore a história e as mídias dos nossos laboratórios através das décadas.
                </p>
            </header>

            <div className="relative">
                {/* Central Line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue via-brand-red to-gray-200 dark:to-gray-800 opacity-20"></div>

                {groupedByYear.map(([year, yearSubmissions]) => (
                    <YearGroup key={year} year={year} yearSubmissions={yearSubmissions} />
                ))}
            </div>

            {/* No Date Section */}
            {undated.length > 0 && (
                <div className="mt-24 pt-12 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-blue">inventory_2</span>
                        Arquivo Geral (Sem Data Histórica)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {undated.map(s => (
                            <Link
                                key={s.id}
                                href={`/arquivo/${s.id}`}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] border border-transparent hover:border-brand-blue/30 transition-all flex gap-4 items-center group"
                            >
                                <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
                                    <img
                                        src={parseMediaUrl(s.media_url)[0]}
                                        alt={s.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{s.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.authors}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper to Link without full page refresh if possible
import Link from 'next/link';
import { parseMediaUrl } from '@/lib/media-utils';
