"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaCardProps } from '../MediaCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { withEliteBoundary } from '../shared/EliteErrorBoundary';

interface CampusMapProps {
    items: MediaCardProps[];
}

const CampusMapBase = ({ items }: CampusMapProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const lastMapClicksRef = useRef<Record<string, number>>({});

    // Filter items that have coordinates
    const pinnedItems = items.filter(item => item.location_lat && item.location_lng);

    const selectedItem = pinnedItems.find(i => i.id === selectedId);

    return (
        <div className="w-full max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden relative bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-inner group">

            {/* Legend / Overlay */}
            <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-blue">map</span>
                    Mapa do Instituto
                </h3>
                <p className="text-xs text-gray-500 font-medium bg-white/80 dark:bg-black/40 backdrop-blur px-2 py-1 rounded-md inline-block">
                    Explore as mídias espalhadas pelo campus do IFUSP
                </p>
            </div>

            {/* Stylized SVG Map (Abstract/Grid representation for IFUSP) */}
            <svg viewBox="0 0 1000 600" className="w-full h-full text-gray-200 dark:text-gray-800/20 opacity-50">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="1000" height="600" fill="url(#grid)" />
                {/* Abstract Buildings representation */}
                <rect x="100" y="100" width="200" height="150" rx="10" fill="currentColor" fillOpacity="0.1" />
                <rect x="400" y="50" width="300" height="200" rx="10" fill="currentColor" fillOpacity="0.1" />
                <rect x="750" y="300" width="150" height="200" rx="10" fill="currentColor" fillOpacity="0.1" />
                <rect x="200" y="350" width="250" height="180" rx="10" fill="currentColor" fillOpacity="0.1" />

                {/* Lines representing walkways */}
                <path d="M 300 250 L 400 250" stroke="currentColor" strokeDasharray="5,5" />
                <path d="M 450 530 L 750 400" stroke="currentColor" strokeDasharray="5,5" />
            </svg>

            {/* Container for Event Delegation */}
            <div
                className="absolute inset-0 z-20"
                onClick={(e) => {
                    const pin = (e.target as HTMLElement).closest('[data-pin-id]');
                    if (pin) {
                        const id = pin.getAttribute('data-pin-id');
                        if (id) {
                            setSelectedId(id);
                            // Registro de Analytics: Heatmap de Clique (Regra V2.8)
                            // Otimização: Debouncing e Anonimização Total (Lei da Privacidade)
                            const item = pinnedItems.find(i => i.id === id);
                            if (item?.location_name) {
                                const buildingId = item.location_name;
                                // Debounce logic: prevent I/O storm using Ref (SSR Safe)
                                const lastClick = lastMapClicksRef.current[buildingId] || 0;
                                const now = Date.now();
                                if (now - lastClick > 5000) { // 5s gap per building
                                    lastMapClicksRef.current[buildingId] = now;

                                    supabase.from('map_interactions').insert({
                                        building_id: buildingId,
                                        interaction_type: 'click'
                                        // Explicitly excluding user_id for privacy (Native Hardening V3.0)
                                    }).then(({ error }) => {
                                        if (error) console.error('Heatmap telemetry error:', error);
                                    });
                                }
                            }
                        }
                    }
                }}
            >
                {/* Pins */}
                {pinnedItems.map((item) => {
                    const x = (item.location_lng! / 100) * 1000;
                    const y = (item.location_lat! / 100) * 600;

                    return (
                        <motion.div
                            key={item.id}
                            data-pin-id={item.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.2, zIndex: 30 }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer size-8 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1E1E1E] shadow-xl transition-colors ${selectedId === item.id ? 'bg-brand-red' : 'bg-brand-blue'}`}
                            style={{ left: `${(x / 10)}%`, top: `${(y / 6)}%` }}
                        >
                            <span className="material-symbols-outlined text-[18px] text-white pointer-events-none">
                                {item.mediaType === 'video' ? 'play_circle' : 'image'}
                            </span>

                            {/* Tooltip on Hover */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {item.title}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Selection Detail Panel */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute right-6 top-6 bottom-6 w-72 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-40 p-4 flex flex-col"
                    >
                        <button
                            onClick={() => setSelectedId(null)}
                            className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>

                        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                            <img
                                src={Array.isArray(selectedItem.mediaUrl) ? selectedItem.mediaUrl[0] : (selectedItem.mediaUrl as string)}
                                alt={selectedItem.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="text-[10px] font-black text-brand-blue uppercase mb-1">{selectedItem.location_name}</div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-snug">{selectedItem.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{selectedItem.description}</p>

                            <Link
                                href={`/arquivo/${selectedItem.id}`}
                                className="w-full py-2 bg-brand-blue text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Ver Detalhes
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export const CampusMap = withEliteBoundary(CampusMapBase, 'Campus Map');
