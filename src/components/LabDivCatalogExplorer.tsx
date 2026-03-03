'use client';

import React, { useEffect, useState } from 'react';
import { fetchSubmissions } from '@/app/actions/submissions';
import { MediaCardProps } from './MediaCard';
import { FeaturedCarousel } from './FeaturedCarousel';
import { SkeletonCard } from './ui/SkeletonCard';
import { Star, Users } from 'lucide-react';

export function LabDivCatalogExplorer() {
    const [labDivItems, setLabDivItems] = useState<MediaCardProps[]>([]);
    const [mentoredItems, setMentoredItems] = useState<MediaCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch Lab-Div produced material
                const labDivRes = await fetchSubmissions({
                    page: 1,
                    limit: 10,
                    query: '#LabDiv',
                    sort: 'recentes'
                });
                setLabDivItems(labDivRes.items);

                // Fetch Mentored material
                const mentoredRes = await fetchSubmissions({
                    page: 1,
                    limit: 10,
                    query: '#MentoradosLabdiv',
                    sort: 'recentes'
                });
                setMentoredItems(mentoredRes.items);
            } catch (error) {
                console.error('Error loading Lab-Div catalog:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard />
                        <SkeletonCard className="hidden md:block" />
                        <SkeletonCard className="hidden lg:block" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-20 py-12">
            {/* Produzido pelo Lab-Div */}
            <section>
                <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                    <div className="p-2 bg-brand-blue/10 rounded-xl">
                        <Star className="w-6 h-6 text-brand-blue fill-current" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white leading-tight">
                            Produzido pelo <span className="text-brand-blue">Lab-Div</span>
                        </h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Conteúdo proprietário e oficial</p>
                    </div>
                </div>
                {labDivItems.length > 0 ? (
                    <FeaturedCarousel items={labDivItems} />
                ) : (
                    <div className="px-4 py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Nenhum rastro detectado com #LabDiv</p>
                    </div>
                )}
            </section>

            {/* Produzido com nossa ajuda / Mentorados */}
            <section>
                <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                    <div className="p-2 bg-brand-red/10 rounded-xl">
                        <Users className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white leading-tight">
                            Com nossa <span className="text-brand-red">Ajuda</span>
                        </h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Material produzido por mentorados do Lab-Div</p>
                    </div>
                </div>
                {mentoredItems.length > 0 ? (
                    <FeaturedCarousel items={mentoredItems} />
                ) : (
                    <div className="px-4 py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Nenhum rastro detectado com #MentoradosLabdiv</p>
                    </div>
                )}
            </section>
        </div>
    );
}
