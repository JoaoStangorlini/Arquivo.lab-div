'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export function TableOfContents() {
    const [items, setItems] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Extract headings from the rendered article
    useEffect(() => {
        const contentEl = document.getElementById('submission-content');
        if (!contentEl) return;

        const headings = contentEl.querySelectorAll('h1, h2, h3');
        const tocItems: TOCItem[] = [];

        headings.forEach((heading, idx) => {
            const id = heading.id || `toc-heading-${idx}`;
            if (!heading.id) heading.id = id;

            tocItems.push({
                id,
                text: heading.textContent || '',
                level: parseInt(heading.tagName.replace('H', ''), 10),
            });
        });

        setItems(tocItems);
    }, []);

    // Intersection Observer for active heading tracking
    useEffect(() => {
        if (items.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
        );

        items.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [items]);

    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsSheetOpen(false);
        }
    }, []);

    if (items.length < 2) return null; // Don't show TOC for very short content

    return (
        <>
            {/* Desktop Sidebar TOC — hidden on mobile */}
            <nav className="hidden lg:block fixed right-8 top-32 w-56 z-40 print:hidden" aria-label="Índice">
                <div className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">toc</span>
                        Nesta Página
                    </h4>
                    <ul className="space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {items.map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => scrollTo(item.id)}
                                    className={`block w-full text-left text-xs leading-snug py-1.5 px-2 rounded-lg transition-all truncate
                                        ${item.level === 1 ? 'font-bold' : item.level === 2 ? 'pl-4 font-medium' : 'pl-6 font-normal text-[11px]'}
                                        ${activeId === item.id
                                            ? 'bg-brand-blue/10 text-brand-blue dark:text-blue-400 border-l-2 border-brand-blue'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {item.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile FAB — visible only on small screens */}
            <button
                onClick={() => setIsSheetOpen(true)}
                className="lg:hidden fixed right-4 bottom-28 z-[90] bg-brand-blue text-white rounded-full shadow-xl p-3 min-h-[48px] min-w-[48px] flex items-center justify-center hover:scale-110 active:scale-95 transition-all print:hidden"
                aria-label="Abrir índice"
            >
                <span className="material-symbols-outlined text-[22px]">toc</span>
            </button>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
                {isSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSheetOpen(false)}
                            className="lg:hidden fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm print:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed bottom-0 left-0 right-0 z-[201] bg-white dark:bg-card-dark rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-800 max-h-[70vh] overflow-hidden print:hidden"
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center py-3">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                            </div>

                            <div className="px-5 pb-2">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-blue text-lg">toc</span>
                                    Índice do Artigo
                                </h4>
                            </div>

                            <ul className="px-5 pb-8 space-y-1 overflow-y-auto max-h-[55vh]">
                                {items.map(item => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => scrollTo(item.id)}
                                            className={`block w-full text-left py-3 px-3 rounded-xl transition-all min-h-[44px]
                                                ${item.level === 1 ? 'text-sm font-bold' : item.level === 2 ? 'text-sm pl-5 font-medium' : 'text-xs pl-8 font-normal'}
                                                ${activeId === item.id
                                                    ? 'bg-brand-blue/10 text-brand-blue dark:text-blue-400'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
