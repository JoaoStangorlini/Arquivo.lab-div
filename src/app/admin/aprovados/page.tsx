'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { AdminSubmissionLightbox, AdminSubmission } from '@/components/AdminSubmissionLightbox';

// Inherit from AdminSubmission structure that the Lightbox expects
interface Submission extends AdminSubmission {
    id: string;
}

export default function AprovadosPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const fetchAprovados = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
        } else {
            setSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAprovados();
    }, []);

    const handleReject = async (id: string) => {
        if (!confirm('Deseja mover esta submissão para as Negadas?')) return;

        const { error } = await supabase
            .from('submissions')
            .update({ status: 'rejeitado' })
            .eq('id', id);

        if (error) {
            alert('Erro: ' + error.message);
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        const { error } = await supabase
            .from('submissions')
            .update({ is_featured: !currentFeatured })
            .eq('id', id);

        if (error) {
            alert('Erro ao alterar destaque: ' + error.message);
        } else {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_featured: !currentFeatured } : s));
        }
    };

    const currentSubmissionIndex = selectedItem ? submissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < submissions.length - 1;

    const handlePrevSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNextSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex + 1]);
            setModalImageIdx(0);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Aprovados</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Submissões Aprovadas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Itens que estão atualmente visíveis para o público.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold border border-brand-blue/20">
                        {submissions.length} Públicos
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Carregando itens...</div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">inbox</span>
                        <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum item aprovado.</h3>
                    </div>
                ) : (
                    <div className="masonry-grid">
                        {submissions.map((item) => {
                            const cardProps: MediaCardProps = {
                                id: item.id,
                                title: item.title,
                                authors: item.authors,
                                description: item.description,
                                category: item.category,
                                mediaType: item.media_type,
                                mediaUrl: item.media_url,
                                isFeatured: (item as any).is_featured ?? false,
                            };
                            return (
                                <div key={item.id} className="flex flex-col gap-3">
                                    <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }}>
                                        <MediaCard {...cardProps} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleFeatured(item.id, (item as any).is_featured ?? false)}
                                            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${(item as any).is_featured
                                                ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 hover:bg-brand-yellow/20'
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-brand-yellow hover:border-brand-yellow/30'
                                                }`}
                                            title={(item as any).is_featured ? 'Remover Destaque' : 'Marcar como Destaque'}
                                        >
                                            <span className="material-symbols-outlined text-[18px]" style={(item as any).is_featured ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                                            <span>{(item as any).is_featured ? 'Destaque' : 'Destacar'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium"
                                            title="Remover e rejeitar"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">block</span>
                                            <span>Rejeitar</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Global Admin Modal replacing ~170 lines of duplicate UI code */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem as AdminSubmission}
                    statusType="aprovado"
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrevSubmission}
                    hasNext={hasNextSubmission}
                    onPrev={handlePrevSubmission}
                    onNext={handleNextSubmission}
                    onReject={handleReject}
                    onToggleFeatured={handleToggleFeatured}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}
        </div>
    );
}
