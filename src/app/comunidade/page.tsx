'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchSubmissions } from '@/app/actions/submissions';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { useState, useEffect } from 'react';

const communityFeatures = [
    {
        title: 'Mural do Deu Ruim',
        description: 'Falhas de laboratório, códigos quebrados e desafios que ensinam.',
        icon: 'error',
        color: 'brand-red',
        link: '/?category=Mural do Deu Ruim',
        cta: 'Ver Mural',
        placeholder: 'Em obras | Green Master',
        decoIcon: 'report_problem'
    },
    {
        title: 'Guia de Sobrevivência',
        description: 'Resumos e dicas técnicas para as matérias mais temidas do IF.',
        icon: 'auto_stories',
        color: 'brand-blue',
        link: '/?category=Guia de Sobrevivência',
        cta: 'Estudar',
        placeholder: 'Em obras | Green Master',
        decoIcon: 'school'
    },
    {
        title: 'Física Fora da Caixa',
        description: 'Entrevistas e posts sobre carreiras e vida além da academia.',
        icon: 'explore',
        color: 'brand-yellow',
        link: '/?category=Física Fora da Caixa',
        cta: 'Explorar',
        placeholder: 'Em obras | Green Master',
        decoIcon: 'rocket_launch'
    },
    {
        title: 'Central de Anotações',
        description: 'Encontre e compartilhe notas de aula, resumos e materiais de estudo.',
        icon: 'edit_note',
        color: 'brand-blue',
        link: '/?category=Central de Anotações',
        cta: 'Quero Participar',
        placeholder: 'Em obras | Green Master',
        decoIcon: 'description'
    }
];

export default function CommunityPage() {
    const [featuresContent, setFeaturesContent] = useState<Record<string, MediaCardProps[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            const results: Record<string, MediaCardProps[]> = {};
            for (const feature of communityFeatures) {
                // Fetch up to 4 items for each category
                const { items } = await fetchSubmissions({
                    page: 1,
                    limit: 4,
                    query: '',
                    categories: [feature.title],
                    sort: 'recentes'
                });
                results[feature.title] = items;
            }
            setFeaturesContent(results);
            setLoading(false);
        };
        loadContent();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-background-dark/30">
            <Header />
            <main className="flex-1 pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                            Comunidade <span className="text-brand-blue">Hub</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            O espaço para troca de experiências, colaboração e os desafios que todo mundo passa, mas ninguém conta.
                        </p>
                    </div>

                    {/* Detailed Sections List */}
                    <div className="space-y-12">
                        {communityFeatures.map((feature, idx) => (
                            <div
                                key={feature.title}
                                id={feature.title.toLowerCase().replace(/\s+/g, '-')}
                                className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                {/* Decorative background icon */}
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <span className="material-symbols-outlined text-[180px] md:text-[220px] rotate-12">{feature.decoIcon}</span>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                        <div className="max-w-2xl">
                                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4 mb-3">
                                                <div className={`w-12 h-12 bg-${feature.color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-${feature.color}/20`}>
                                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                                </div>
                                                {feature.title}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <Link
                                            href={feature.link}
                                            className={`bg-${feature.color} ${feature.color === 'brand-yellow' ? 'text-black' : 'text-white'} px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group whitespace-nowrap`}
                                        >
                                            {feature.cta}
                                            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                                        </Link>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Real items */}
                                        {featuresContent[feature.title]?.map((item) => (
                                            <div key={item.id} className="animate-in fade-in zoom-in duration-500">
                                                <MediaCard {...item} />
                                            </div>
                                        ))}

                                        {/* Placeholders for remaining slots */}
                                        {Array.from({ length: Math.max(0, 4 - (featuresContent[feature.title]?.length || 0)) }).map((_, i) => (
                                            <div
                                                key={`placeholder-${i}`}
                                                className={`aspect-[3/4] rounded-3xl bg-gray-50 dark:bg-background-dark/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-gray-300 relative group/card overflow-hidden ${loading ? 'animate-pulse' : ''}`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-200/5 dark:to-white/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                                <span className="material-symbols-outlined text-5xl mb-3 group-hover/card:scale-110 transition-transform duration-500">{feature.icon}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{feature.placeholder}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
