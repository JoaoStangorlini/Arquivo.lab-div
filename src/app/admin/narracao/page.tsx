'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MediaCard } from '@/components/MediaCard';
import { PostDTO, mapToPostDTO } from '@/dtos/media';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, Mic, Clock, RefreshCw,
    AlertCircle, FileText
} from 'lucide-react';

function CarouselSection({
    title,
    items,
    onAction
}: {
    title: string;
    items: PostDTO[];
    onAction: (id: string, description: string) => void
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white px-2 border-l-4 border-brand-blue">{title} ({items.length})</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm px-4 py-8 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-xl w-full border border-dashed border-gray-200 dark:border-gray-800">Nenhum item encontrado nesta categoria.</p>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="min-w-[300px] bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
                            <MediaCard post={item} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Descrição para Narração</label>
                                <textarea
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark dark:text-white resize-none h-20"
                                    defaultValue={item.description}
                                    onBlur={(e) => onAction(item.id, e.target.value)}
                                    placeholder="Adicione uma descrição clara para acessibilidade..."
                                />
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-brand-blue font-medium">Salva automaticamente ao sair do campo</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default function AdminNarracaoPage() {
    const [submissions, setSubmissions] = useState<PostDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data } = await supabase.from('submissions').select('*').eq('status', 'aprovado').order('created_at', { ascending: false });
        setSubmissions((data || []).map(s => mapToPostDTO(s)));
        setLoading(false);
    };

    useEffect(() => { fetchSubmissions(); }, []);

    const pendentes = useMemo(() => submissions.filter(s => !s.description || s.description.trim().length < 10), [submissions]);
    const comNarracao = useMemo(() => submissions.filter(s => s.description && s.description.trim().length >= 10), [submissions]);

    const handleUpdateDescription = async (id: string, description: string) => {
        const { error } = await supabase.from('submissions').update({ description }).eq('id', id);
        if (error) {
            toast.error('Erro ao atualizar descrição');
        } else {
            // Update local state without refetching for smoothness
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, description } : s));
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">
            <div>
                <Link href="/admin" className="text-brand-blue text-sm flex items-center gap-1 hover:underline mb-2 font-bold">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Admin
                </Link>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Painel de Narração & Acessibilidade</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie as descrições de texto que alimentam o sintetizador de voz (TTS).</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="w-10 h-10 animate-spin text-brand-blue" />
                    <span className="text-gray-500 font-medium">Carregando acervo...</span>
                </div>
            ) : (
                <>
                    <CarouselSection title="Pendentes / Curtas" items={pendentes} onAction={handleUpdateDescription} />
                    <CarouselSection title="Com Narração Completa" items={comNarracao} onAction={handleUpdateDescription} />
                </>
            )}
        </div>
    );
}
