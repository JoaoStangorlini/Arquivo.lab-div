'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Counts {
    pendentes: number;
    aprovados: number;
    rejeitados: number;
}

export default function AdminDashboardOverview() {
    const [counts, setCounts] = useState<Counts>({ pendentes: 0, aprovados: 0, rejeitados: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            setIsLoading(true);

            const [pendentesRes, aprovadosRes, rejeitadosRes] = await Promise.all([
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejeitado'),
            ]);

            setCounts({
                pendentes: pendentesRes.count || 0,
                aprovados: aprovadosRes.count || 0,
                rejeitados: rejeitadosRes.count || 0,
            });

            setIsLoading(false);
        }

        fetchCounts();
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Visão Geral</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Visão Geral</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Acompanhe as estatísticas gerais de submissões do Arquivo Lab-Div.</p>
                    </div>
                    {/* Decorative Elements */}
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-card-dark px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse delay-150"></div>
                        <span className="text-xs font-semibold text-gray-400 ml-2 uppercase tracking-wider">Status: Online</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando estatísticas do Supabase...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pendentes Card */}
                    <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-yellow/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-colors"></div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aguardando Avaliação</span>
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-yellow">
                                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.pendentes}</span>
                                </div>
                                <span className="text-sm font-medium text-brand-yellow mt-1 block">Submissões Pendentes</span>
                            </div>
                        </div>
                    </div>

                    {/* Aprovados Card */}
                    <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-colors"></div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Públicos</span>
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.aprovados}</span>
                                </div>
                                <span className="text-sm font-medium text-brand-blue mt-1 block">Submissões Aprovadas</span>
                            </div>
                        </div>
                    </div>

                    {/* Rejeitados Card */}
                    <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-red/10 transition-colors"></div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivados</span>
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                                    <span className="material-symbols-outlined text-2xl">block</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.rejeitados}</span>
                                </div>
                                <span className="text-sm font-medium text-brand-red mt-1 block">Submissões Rejeitadas</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
