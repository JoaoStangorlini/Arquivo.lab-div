'use client';

import React, { useState } from 'react';
import { parseMediaUrl, formatYoutubeUrl, getDownloadUrl, getPdfViewerUrl } from '@/lib/media-utils';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
const CustomPdfViewer = dynamic(
    () => import('./CustomPdfViewer').then((mod) => mod.CustomPdfViewer),
    { ssr: false }
);

export interface AdminSubmission {
    id: string;
    title: string;
    description: string;
    authors: string;
    media_type: 'image' | 'video' | 'pdf' | 'text';
    media_url: string;
    category: string;
    created_at: string;
    is_featured?: boolean;
    status?: string;
    external_link?: string;
    technical_details?: string;
    user_id?: string;
    admin_feedback?: string;
}

interface AdminSubmissionLightboxProps {
    item: AdminSubmission;
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
    onEdit?: (item: AdminSubmission) => void;

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
    const [feedback, setFeedback] = useState(item.status === 'pendente' ? '' : (item as any).admin_feedback || '');
    const [isActioning, setIsActioning] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close modal"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {hasPrev && (
                <button
                    onClick={onPrev}
                    className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                    aria-label="Submissão Anterior"
                >
                    <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
                </button>
            )}

            {hasNext && (
                <button
                    onClick={onNext}
                    className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                    aria-label="Próxima Submissão"
                >
                    <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_right</span>
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
                            <span className="material-symbols-outlined text-3xl">chevron_left</span>
                        </button>
                    )}
                </div>
                <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                    {hasNext && (
                        <button onClick={onNext} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                            <span className="material-symbols-outlined text-3xl">chevron_right</span>
                        </button>
                    )}
                </div>

                {/* Media Section */}
                <div className={`flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group ${statusType === 'rejeitado' ? 'grayscale' : ''}`}>
                    {item.media_type === 'video' ? (
                        (() => {
                            const rawUrls = parseMediaUrl(item.media_url);
                            const videoUrl = rawUrls.length > 0 ? formatYoutubeUrl(rawUrls[0]) : '';
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
                    ) : item.media_type === 'pdf' ? (
                        (() => {
                            const rawUrls = parseMediaUrl(item.media_url);
                            const pdfUrl = rawUrls.length > 0 ? getPdfViewerUrl(rawUrls[0]) : '';
                            return pdfUrl ? (
                                <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white rounded-l-2xl md:rounded-l-3xl overflow-hidden relative">
                                    <CustomPdfViewer fileUrl={pdfUrl} />
                                </div>
                            ) : (
                                <span className="text-white">PDF não encontrado</span>
                            );
                        })()
                    ) : item.media_type === 'text' ? (
                        <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white dark:bg-gray-900 rounded-l-2xl md:rounded-l-3xl overflow-auto p-8 md:p-12">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{item.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    {item.authors}
                                </p>
                                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeSanitize]}>{item.description || ''}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ) : (
                        (() => {
                            const urls = parseMediaUrl(item.media_url);
                            if (urls.length === 0) return <span className="text-white">Imagem não encontrada</span>;

                            return (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={urls[modalImageIdx]} alt={item.title} className="max-w-full max-h-[80vh] object-contain" />
                                    {urls.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + urls.length) % urls.length) }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                            >
                                                <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % urls.length) }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                            >
                                                <span className="material-symbols-outlined text-3xl">chevron_right</span>
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
                <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-h-[50vh] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
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
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                            {item.category}
                        </span>
                        {item.is_featured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold tracking-wide uppercase">
                                Destaque
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        {item.title}
                    </h2>

                    <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                            {item.authors.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autor</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.authors}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Enviado em: {formatDate(item.created_at)}</span>
                        </div>
                    </div>

                    {item.description && item.media_type !== 'text' && (
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição do Trabalho</h3>
                            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeSanitize]}>{item.description}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {item.external_link && (
                        <div className="mt-4">
                            <a
                                href={item.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors shadow-lg hover:shadow-xl group"
                            >
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                                Acessar PDF Completo
                            </a>
                        </div>
                    )}

                    {/* ABNT Citation Button */}
                    <div className="mt-4">
                        <button
                            onClick={async () => {
                                const year = new Date(item.created_at).getFullYear();
                                const citation = `${item.authors.toUpperCase()}. ${item.title}. Hub Lab-Div IF-USP, ${year}. Disponível em: ${window.location.origin}/arquivo/${item.id}`;
                                try {
                                    await navigator.clipboard.writeText(citation);
                                } catch {
                                    const textarea = document.createElement('textarea');
                                    textarea.value = citation;
                                    document.body.appendChild(textarea);
                                    textarea.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(textarea);
                                }
                                setCiteCopied(true);
                                setTimeout(() => setCiteCopied(false), 2000);
                            }}
                            className="w-full bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">{citeCopied ? 'check' : 'format_quote'}</span>
                            {citeCopied ? 'Citação copiada!' : 'Copiar Citação ABNT'}
                        </button>
                    </div>

                    {/* Technical Details */}
                    {item.technical_details && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-brand-yellow text-[16px]">build</span>
                                Bastidores Técnicos
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                {item.technical_details}
                            </p>
                        </div>
                    )}

                    {/* Admin Feedback Input (only if pending) */}
                    {statusType === 'pendente' && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-brand-blue text-[16px]">history_edu</span>
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
                            <span className="material-symbols-outlined text-[22px]">edit</span>
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
                                    <span className="material-symbols-outlined text-[18px]">check</span> Aprovar
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
                                    <span className="material-symbols-outlined text-[18px]">close</span> Rejeitar
                                </button>
                            </>
                        )}

                        {statusType === 'aprovado' && (
                            <>
                                <button
                                    onClick={() => onToggleFeatured?.(item.id, !!item.is_featured)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/30"
                                >
                                    <span className="material-symbols-outlined text-[18px]" style={item.is_featured ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                                    {item.is_featured ? 'Remover Destaque' : 'Destacar'}
                                </button>
                                <button
                                    onClick={() => { onReject?.(item.id); onClose(); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-[18px]">block</span> Rejeitar
                                </button>
                            </>
                        )}

                        {statusType === 'rejeitado' && (
                            <button
                                onClick={() => { onApprove?.(item.id); onClose(); }}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors text-sm font-medium"
                            >
                                <span className="material-symbols-outlined text-[18px]">restore</span> Restaurar (Aprovar)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
