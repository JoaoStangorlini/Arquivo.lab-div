'use client';

import React from 'react';

/**
 * V8.0 SkeletonCard - CLS Zero Edition
 * Perfectly mirrors MediaCard structure to prevent Layout Shift.
 */
export const SkeletonCard = ({ className }: { className?: string }) => {
    return (
        <div className={`flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse ${className || ''}`}>
            {/* Header Mirror */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>

            {/* Media Mirror */}
            <div className="webkit-aspect-guard w-full bg-gray-200 dark:bg-gray-700" />

            {/* Actions Mirror */}
            <div className="flex flex-col p-4 md:p-6 pt-3 md:pt-4 gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="size-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Content Mirror */}
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>

                {/* Tags Mirror */}
                <div className="flex flex-wrap gap-2 mt-2">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>
            </div>
        </div>
    );
};
