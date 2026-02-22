'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Trail {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    submissions_count?: number;
}

export default function AdminTrilhasPage() {
    const [trails, setTrails] = useState<Trail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTrails();
    }, []);

    async function fetchTrails() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('learning_trails')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Fetch submission counts for each trail
            const trailsWithCounts = await Promise.all(
                data.map(async (trail) => {
                    const { count } = await supabase
                        .from('trail_submissions')
                        .select('*', { count: 'exact', head: true })
                        .eq('trail_id', trail.id);
                    return { ...trail, submissions_count: count || 0 };
                })
            );
            setTrails(trailsWithCounts);
        }
        setIsLoading(false);
    }

    async function handleCreateTrail() {
        if (!newTitle.trim()) return;
        setIsSaving(true);

        const { error } = await supabase
            .from('learning_trails')
            .insert({ title: newTitle.trim(), description: newDescription.trim() || null });

        if (!error) {
            setNewTitle('');
            setNewDescription('');
            setShowForm(false);
            fetchTrails();
        }
        setIsSaving(false);
    }

    async function handleDeleteTrail(id: string) {
        if (!confirm('Tem certeza que deseja excluir esta trilha?')) return;
        await supabase.from('learning_trails').delete().eq('id', id);
        fetchTrails();
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Admin</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-[#0055ff]">Trilhas de Aprendizagem</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                            Trilhas de <span className="text-[#0055ff]">Aprendizagem</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Organize playlists temáticas de artigos do Hub.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#0055ff] text-white rounded-xl font-bold text-sm hover:bg-[#0044cc] transition-colors shadow-lg shadow-[#0055ff]/20"
                    >
                        <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancelar' : 'Nova Trilha'}
                    </button>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-[#0055ff]/20 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <input
                        type="text"
                        placeholder="Título da Trilha (ex: Mecânica Quântica para Iniciantes)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0055ff] focus:border-transparent outline-none transition-all"
                    />
                    <textarea
                        placeholder="Descrição opcional..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0055ff] focus:border-transparent outline-none transition-all resize-none"
                    />
                    <button
                        onClick={handleCreateTrail}
                        disabled={isSaving || !newTitle.trim()}
                        className="px-6 py-3 bg-[#0055ff] text-white rounded-xl font-bold text-sm hover:bg-[#0044cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Criando...' : 'Criar Trilha'}
                    </button>
                </div>
            )}

            {/* Trails List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#0055ff] mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando trilhas...</p>
                </div>
            ) : trails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">route</span>
                    <p className="font-bold text-lg text-gray-700 dark:text-gray-300">Nenhuma trilha criada ainda</p>
                    <p className="text-sm mt-1">Crie a primeira trilha de aprendizagem para organizar o conteúdo do Hub.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trails.map((trail) => (
                        <div
                            key={trail.id}
                            className="group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#0055ff]/30 transition-all overflow-hidden"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-[#0055ff] text-xl">route</span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{trail.title}</h3>
                                    </div>
                                    {trail.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{trail.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0055ff]">
                                            {trail.submissions_count} {trail.submissions_count === 1 ? 'artigo' : 'artigos'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(trail.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTrail(trail.id)}
                                    className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                    title="Excluir trilha"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
