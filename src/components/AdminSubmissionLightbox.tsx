'use client';

import React, { useState } from 'react';
import { parseMediaUrl, formatYoutubeUrl, getDownloadUrl, getPdfViewerUrl } from '@/lib/media-utils';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { AdminPostDTO } from '@/dtos/media';
import {
    X, ChevronLeft, ChevronRight, User, Sparkles,
    CheckCircle, RefreshCw, ExternalLink, Quote,
    Wrench, History, Edit, Check, Ban, Link2, Trash2, Plus
} from 'lucide-react';
import { fetchAllTrails, fetchSubmissionTrails, linkSubmissionToTrail, unlinkSubmissionFromTrail } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';
import { AdminQuizEditor } from './AdminQuizEditor';



interface AdminSubmissionLightboxProps {
    item: AdminPostDTO;
    onClose: () => void;

    // Global Navigation
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;

    // Actions
    onApprove?: (id: string, feedback?: string) => void;
    onReject?: (id: string, feedback?: string) => void;
    onToggleFeatured?: (id: string, current: boolean) => void;
    onEdit?: (item: AdminPostDTO) => void;

    // Local State controls passed from parent 
    modalImageIdx: number;
    setModalImageIdx: React.Dispatch<React.SetStateAction<number>>;

    // Status visual badges context
    statusType: 'pendente' | 'aprovado' | 'rejeitado';
}

export function AdminSubmissionLightbox({
    item, onClose, hasPrev, hasNext, onPrev, onNext,
    onApprove, onReject, onToggleFeatured, onEdit,
    modalImageIdx, setModalImageIdx, statusType
}: AdminSubmissionLightboxProps) {

    const [citeCopied, setCiteCopied] = useState(false);
    const [feedback, setFeedback] = useState(statusType === 'pendente' ? '' : item.adminFeedback || '');
    const [isActioning, setIsActioning] = useState(false);
    const [showQuizEditor, setShowQuizEditor] = useState(false);
    const [localQuiz, setLocalQuiz] = useState<any[] | null>(item.quiz || null);

    // Trail Management State
    const [allTrails, setAllTrails] = useState<any[]>([]);
    const [linkedTrails, setLinkedTrails] = useState<any[]>([]);
    const [selectedTrailId, setSelectedTrailId] = useState<string>('');
    const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0);
    const [isTrailsLoading, setIsTrailsLoading] = useState(false);

    // Deletion State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    React.useEffect(() => {
        async function loadTrailsData() {
            setIsTrailsLoading(true);
            const [trailsRes, linkedRes] = await Promise.all([
                fetchAllTrails(),
                fetchSubmissionTrails(item.id)
            ]);

            if (trailsRes.success) setAllTrails(trailsRes.data || []);
            if (linkedRes.success) setLinkedTrails(linkedRes.data || []);
            setIsTrailsLoading(false);
        }
        loadTrailsData();
    }, [item.id]);

    const handleLinkTrail = async () => {
        if (!selectedTrailId) return;
        setIsActioning(true);
        const res = await linkSubmissionToTrail(item.id, selectedTrailId, selectedTopicIndex);
        if (res.success) {
            toast.success('Vinculado à trilha!');
            const linkedRes = await fetchSubmissionTrails(item.id);
            if (linkedRes.success) setLinkedTrails(linkedRes.data || []);
        } else {
            toast.error('Erro ao vincular: ' + res.error);
        }
        setIsActioning(false);
    };

    const handleUnlinkTrail = async (linkId: string, trailId: string) => {
        setIsActioning(true);
        const res = await unlinkSubmissionFromTrail(linkId, trailId);
        if (res.success) {
            toast.success('Vínculo removido');
            setLinkedTrails(prev => prev.filter(l => l.id !== linkId));
        } else {
            toast.error('Erro ao remover: ' + res.error);
        }
        setIsActioning(false);
    };

    const selectedTrail = allTrails.find(t => t.id === selectedTrailId);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Import dynamicaction to prevent circular/server deps if any, but since it's a server action, it's better to import at top or call directly.
            // But we don't have it imported at the top, let's just import it dynamically or we can just import it at the top.
            // For now, let's import it inline.
            const { deleteSubmissionAdmin } = await import('@/app/actions/submissions');

            const res = await deleteSubmissionAdmin(item.id);
            if (res.success) {
                toast.success('Submissão e arquivos removidos com sucesso!');
                onClose(); // Fechar o modal após deletar
            } else {
                toast.error(res.error || 'Erro ao deletar submissão.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro inesperado.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
                onClick={onClose}
            >
                <button
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    aria-label="Close modal"
                >
                    <X className="w-8 h-8" />
                </button>

                {hasPrev && (
                    <button
                        onClick={onPrev}
                        className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                        aria-label="Submissão Anterior"
                    >
                        <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" />
                    </button>
                )}

                {hasNext && (
                    <button
                        onClick={onNext}
                        className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                        aria-label="Próxima Submissão"
                    >
                        <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" />
                    </button>
                )}

                <div
                    className="w-full max-w-5xl xl:max-w-6xl max-h-full bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-[105]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Mobile Global Nav Overlay */}
                    <div className="md:hidden absolute inset-y-0 left-0 w-16 z-[106] flex items-center px-1 pointer-events-none">
                        {hasPrev && (
                            <button onClick={onPrev} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-r-lg p-2 backdrop-blur-sm transition-colors">
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        )}
                    </div>
                    <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                        {hasNext && (
                            <button onClick={onNext} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        )}
                    </div>

                    {/* Media Section */}
                    <div className={`flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group ${statusType === 'rejeitado' ? 'grayscale' : ''}`}>
                        {item.mediaType === 'video' ? (
                            (() => {
                                const rawUrl = Array.isArray(item.mediaUrl) ? item.mediaUrl[0] : item.mediaUrl;
                                const videoUrl = rawUrl ? formatYoutubeUrl(rawUrl) : '';
                                return videoUrl ? (
                                    <iframe
                                        src={videoUrl}
                                        className="w-full h-full min-h-[400px] aspect-video"
                                        allowFullScreen
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <span className="text-white">Vídeo não encontrado</span>
                                );
                            })()
                        ) : item.mediaType === 'pdf' ? (
                            (() => {
                                const rawUrl = Array.isArray(item.mediaUrl) ? item.mediaUrl[0] : item.mediaUrl;
                                const pdfUrl = rawUrl ? getPdfViewerUrl(rawUrl) : '';
                                return pdfUrl ? (
                                    <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white rounded-l-2xl md:rounded-l-3xl overflow-hidden relative">
                                        <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800">
                                            <span className="material-symbols-outlined text-6xl text-brand-blue mb-4">description</span>
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">Visualização de PDF Otimizada</p>
                                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                                                <ExternalLink className="w-5 h-5" />
                                                Abrir PDF em Nova Aba
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-white">PDF não encontrado</span>
                                );
                            })()
                        ) : item.mediaType === 'text' ? (
                            <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white dark:bg-gray-900 rounded-l-2xl md:rounded-l-3xl overflow-auto p-8 md:p-12">
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{item.title}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {item.authors}
                                    </p>
                                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{item.description || ''}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            (() => {
                                const urls = Array.isArray(item.mediaUrl) ? item.mediaUrl : [item.mediaUrl];
                                if (!urls.length || !urls[0]) return <span className="text-white">Imagem não encontrada</span>;

                                return (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img src={urls[modalImageIdx]} alt={item.title} className="max-w-full max-h-[80vh] object-contain" />
                                        {urls.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + urls.length) % urls.length) }}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                >
                                                    <ChevronLeft className="w-8 h-8" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % urls.length) }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                >
                                                    <ChevronRight className="w-8 h-8" />
                                                </button>

                                                <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                                                    {urls.map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === modalImageIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                                            onClick={(e) => { e.stopPropagation(); setModalImageIdx(i); }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })()
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto space-y-6 max-h-[50vh] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap items-center gap-2">
                            {statusType === 'aprovado' && (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold tracking-wide uppercase">
                                    Aprovado
                                </span>
                            )}
                            {statusType === 'rejeitado' && (
                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold tracking-wide uppercase line-through">
                                    Rejeitado
                                </span>
                            )}
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                                {item.category}
                            </span>
                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold tracking-wide uppercase">
                                Formato: {item.format || item.mediaType}
                            </span>
                            {item.isFeatured && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold tracking-wide uppercase">
                                    Destaque
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                            {item.title}
                        </h2>

                        <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                            <div className="size-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-sm uppercase shrink-0">
                                {item.authors.substring(0, 2)}
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autor Principal</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {item.authors}
                                    {item.pseudonym && <span className="text-[10px] font-normal text-brand-blue ml-2 italic">(Usa Pseudônimo: {item.pseudonym})</span>}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Ano: {item.eventYear || 'N/A'} • Enviado: {formatDate(item.createdAt)}</span>
                            </div>
                        </div>

                        {item.coAuthors && item.coAuthors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Co-autores</h3>
                                <div className="flex flex-wrap gap-2">
                                    {item.coAuthors.map((ca, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                                            {ca}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.whatsapp && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                                <span className="material-symbols-outlined text-green-500 text-lg">call</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">WhatsApp</span>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{item.whatsapp}</span>
                                </div>
                            </div>
                        )}

                        {item.description && item.mediaType !== 'text' && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest border-l-2 border-brand-red pl-2">Descrição do Trabalho</h3>
                                <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{item.description}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {item.altText && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Texto Alternativo (Acessibilidade)</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{item.altText}"</p>
                            </div>
                        )}

                        {item.testimonial && (
                            <div className="p-4 bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl relative mt-4 mb-2">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Quote className="w-8 h-8 text-brand-yellow" />
                                </div>
                                <h3 className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">comment</span>
                                    Depoimento do Autor
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                    "{item.testimonial}"
                                </p>
                            </div>
                        )}

                        {/* Quiz Section */}
                        {localQuiz && Array.isArray(localQuiz) && localQuiz.length > 0 ? (
                            <div className="p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl space-y-4">
                                <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                    Mini Quiz de Engajamento
                                </h3>
                                <div className="space-y-4">
                                    {localQuiz.map((q: any, i: number) => (
                                        <div key={i} className="space-y-2 pb-3 border-b border-brand-blue/5 last:border-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{i + 1}. {q.question}</p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {q.options?.map((opt: string, oi: number) => (
                                                    <div key={oi} className={`text-[10px] px-2.5 py-1.5 rounded-lg border flex items-center justify-between ${oi === q.correct_option ? 'bg-green-500/10 border-green-500/30 text-green-600 font-bold' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500'}`}>
                                                        <span>{opt}</span>
                                                        {oi === q.correct_option && <span className="material-symbols-outlined text-xs">check_circle</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-60">
                                <span className="material-symbols-outlined text-gray-400">quiz</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sem Quiz cadastrado</span>
                            </div>
                        )}

                        {/* AI Suggestions Section */}
                        {(item.aiSuggestedTags?.length || item.aiSuggestedAlt) && (
                            <div className="p-4 bg-[#0055ff]/5 border border-[#0055ff]/20 rounded-2xl space-y-3">
                                <h3 className="text-[10px] font-black text-[#0055ff] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#0055ff]" />
                                    Sugestões da Inteligência
                                </h3>

                                {item.aiSuggestedTags && item.aiSuggestedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.aiSuggestedTags.map((tag: string) => (
                                            <span key={tag} className="px-2 py-0.5 bg-[#0055ff]/10 text-[#0055ff] border border-[#0055ff]/20 rounded-md text-[10px] font-medium border-dashed">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {item.aiSuggestedAlt && (
                                    <p className="text-[11px] text-gray-500 italic leading-snug border-l-2 border-[#0055ff]/30 pl-2">
                                        Alt sugerido: "{item.aiSuggestedAlt}"
                                    </p>
                                )}

                                <button
                                    onClick={async () => {
                                        setIsActioning(true);
                                        // @ts-ignore
                                        const { error } = await window.supabase.rpc('accept_ai_suggestions', { submission_id: item.id });
                                        if (error) alert(error.message);
                                        else window.location.reload();
                                        setIsActioning(false);
                                    }}
                                    className="w-full py-2 bg-[#0055ff] text-white text-[10px] font-bold rounded-lg hover:bg-[#0055ff]/80 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Aceitar e Mesclar Sugestões
                                </button>

                                {item.aiStatus === 'error' && (
                                    <button
                                        onClick={async () => {
                                            setIsActioning(true);
                                            const { reprocessAI } = await import('@/app/actions/admin');
                                            const res = await reprocessAI(item.id);
                                            if (res.error) alert(res.error);
                                            else window.location.reload();
                                            setIsActioning(false);
                                        }}
                                        className="w-full py-2 bg-brand-red text-white text-[10px] font-bold rounded-lg hover:bg-brand-red/80 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Tentar IA Novamente
                                    </button>
                                )}
                            </div>
                        )}

                        {item.externalLink && (
                            <div className="mt-4">
                                <a
                                    href={item.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors shadow-lg hover:shadow-xl group"
                                >
                                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Acessar PDF Completo
                                </a>
                            </div>
                        )}

                        {/* Quiz Management Button */}
                        <div className="mt-4">
                            <button
                                onClick={() => setShowQuizEditor(true)}
                                className={`w-full font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors text-sm ${localQuiz && localQuiz.length > 0
                                    ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30'
                                    : 'bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base">quiz</span>
                                {localQuiz && localQuiz.length > 0
                                    ? `Editar Quiz (${localQuiz.length} pergunta${localQuiz.length > 1 ? 's' : ''})`
                                    : 'Criar Quiz'
                                }
                            </button>
                        </div>

                        {/* Technical Details */}
                        {item.technicalDetails && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <Wrench className="w-4 h-4 text-brand-yellow" />
                                    Bastidores Técnicos
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                    {item.technicalDetails}
                                </p>
                            </div>
                        )}

                        {/* Trail Management Section */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                                <Link2 className="w-4 h-4 text-brand-blue" />
                                Gerenciar em Trilhas
                            </h3>

                            {/* Current Links */}
                            {linkedTrails.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vinculado a:</p>
                                    <div className="space-y-1.5">
                                        {linkedTrails.map((link) => (
                                            <div key={link.id} className="flex items-center justify-between p-2 bg-brand-blue/5 rounded-lg border border-brand-blue/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-brand-blue uppercase">{link.learning_trails?.course_code}</span>
                                                    <span className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-1">{link.learning_trails?.title}</span>
                                                    <span className="text-[9px] text-gray-400 italic">Tópico {link.topic_index + 1}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleUnlinkTrail(link.id, link.trail_id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                                                    title="Remover vínculo"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Link */}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Selecionar Trilha</label>
                                    <select
                                        value={selectedTrailId}
                                        onChange={(e) => {
                                            setSelectedTrailId(e.target.value);
                                            setSelectedTopicIndex(0);
                                        }}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    >
                                        <option value="">Escolha uma disciplina...</option>
                                        {allTrails.map((trail) => (
                                            <option key={trail.id} value={trail.id}>
                                                {trail.course_code} - {trail.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedTrail && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Tópico da Ementa</label>
                                        <select
                                            value={selectedTopicIndex}
                                            onChange={(e) => setSelectedTopicIndex(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        >
                                            {selectedTrail.program?.map((topic: string, i: number) => (
                                                <option key={i} value={i}>
                                                    {i + 1}. {topic}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    disabled={!selectedTrailId || isActioning}
                                    onClick={handleLinkTrail}
                                    className="w-full py-2 bg-brand-blue text-white text-[10px] font-bold rounded-lg hover:bg-brand-blue/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Plus size={14} />
                                    Vincular Material
                                </button>
                            </div>
                        </div>

                        {/* Admin Feedback Input (only if pending) */}
                        {statusType === 'pendente' && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <History className="w-4 h-4 text-brand-blue" />
                                    Retorno ao Autor (Opcional)
                                </h3>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Dê uma dica ou explique o motivo da decisão..."
                                    className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue outline-none transition-all min-h-[100px] text-gray-700 dark:text-gray-300"
                                />
                            </div>
                        )}

                        {/* Main Edit Action */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => onEdit?.(item)}
                                className="w-full bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-bold py-3.5 flex items-center justify-center gap-2 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                <Edit className="w-5 h-5" />
                                Editar Informações
                            </button>
                        </div>

                        <div className="pt-4 flex flex-wrap gap-2">
                            {/* Dynamic Action Buttons based on status */}
                            {statusType === 'pendente' && (
                                <>
                                    <button
                                        disabled={isActioning}
                                        onClick={async () => {
                                            setIsActioning(true);
                                            await onApprove?.(item.id, feedback);
                                            setIsActioning(false);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <Check className="w-5 h-5" /> Aprovar
                                    </button>
                                    <button
                                        disabled={isActioning}
                                        onClick={async () => {
                                            setIsActioning(true);
                                            await onReject?.(item.id, feedback);
                                            setIsActioning(false);
                                            onClose();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <Ban className="w-5 h-5" /> Rejeitar
                                    </button>
                                </>
                            )}

                            {statusType === 'aprovado' && (
                                <>
                                    <button
                                        onClick={() => onToggleFeatured?.(item.id, !!item.isFeatured)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/30"
                                    >
                                        <Sparkles className={`w-5 h-5 ${item.isFeatured ? 'fill-current text-brand-yellow' : ''}`} />
                                        {item.isFeatured ? 'Remover Destaque' : 'Destacar'}
                                    </button>
                                    <button
                                        onClick={() => { onReject?.(item.id); onClose(); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium"
                                    >
                                        <Ban className="w-5 h-5" /> Rejeitar
                                    </button>
                                </>
                            )}

                            {statusType === 'rejeitado' && (
                                <div className="w-full flex flex-col gap-2">
                                    <button
                                        onClick={() => { onApprove?.(item.id); onClose(); }}
                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors text-sm font-medium"
                                    >
                                        <RefreshCw className="w-5 h-5" /> Restaurar (Aprovar)
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-5 h-5" /> Deletar Definitivamente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz Editor Modal */}
            {
                showQuizEditor && (
                    <AdminQuizEditor
                        submissionId={item.id}
                        submissionTitle={item.title}
                        initialQuiz={localQuiz}
                        onClose={() => setShowQuizEditor(false)}
                        onSaved={(quiz) => setLocalQuiz(quiz)}
                    />
                )
            }

            {/* Confirmation Modal for Permanent Deletion */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-form-dark p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Deleção Permanente</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Tem certeza que deseja excluir permanentemente esta submissão?
                                <br /><br />
                                <strong className="text-red-600 dark:text-red-400">Esta ação NÃO PODE ser desfeita.</strong> Os arquivos físicos associados serão apagados do servidor.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                            Excluindo...
                                        </>
                                    ) : (
                                        'Sim, Excluir'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
