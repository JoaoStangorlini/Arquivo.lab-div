'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MediaCard, MediaCardProps } from '../MediaCard';

interface ForYouFeedProps {
    items: MediaCardProps[];
}

export const ForYouFeed = ({ items }: ForYouFeedProps) => {
    if (items.length === 0) return null;

    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
                    <div className="space-y-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-brand-red animate-pulse">auto_awesome</span>
                            <span className="text-xs font-black uppercase tracking-widest text-brand-red">Personalizado</span>
                        </div>
                        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white">Para Você</h2>
                        <p className="text-gray-500 dark:text-gray-400">Com base no seu histórico e interesses recentes.</p>
                    </div>

                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <MediaCard {...item} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
