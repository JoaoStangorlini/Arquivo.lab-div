'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { parseMediaUrl, getYoutubeThumbnail } from '@/lib/media-utils';
import Link from 'next/link';

interface TimelineItemProps {
    submission: Submission;
    isLeft?: boolean;
}

export const TimelineItem = ({ submission, isLeft = true }: TimelineItemProps) => {
    const urls = parseMediaUrl(submission.media_url);
    const displayUrl = submission.media_type === 'video'
        ? getYoutubeThumbnail(urls[0])
        : (submission.media_type === 'pdf' ? urls[0].replace(/\.pdf$/i, '.jpg') : urls[0]);

    const date = submission.event_date ? new Date(submission.event_date) : new Date(submission.created_at);
    const formattedDate = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative flex w-full my-8 ${isLeft ? 'justify-start' : 'justify-end'}`}
        >
            {/* Central Dot */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 size-4 rounded-full bg-brand-blue border-4 border-white dark:border-[#121212] z-10 shadow-[0_0_10px_rgba(0,119,255,0.5)]"></div>

            {/* Content Card */}
            <Link
                href={`/arquivo/${submission.id}`}
                className={`w-[45%] group perspective-1000`}
            >
                <div className={`relative p-4 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:shadow-brand-blue/20 group-hover:scale-[1.02] group-hover:border-brand-blue/30`}>

                    {/* Date Tag */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-brand-blue dark:text-brand-yellow">
                            {formattedDate}
                        </span>
                        {submission.location_name && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {submission.location_name}
                            </span>
                        )}
                    </div>

                    {/* Media Preview */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt={submission.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                            </div>
                        )}
                        {submission.media_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <span className="material-symbols-outlined text-white text-3xl filled">play_circle</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                        {submission.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {submission.authors}
                    </p>

                    {/* Modern Float effect shadow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-red rounded-2xl opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
                </div>
            </Link>
        </motion.div>
    );
};
