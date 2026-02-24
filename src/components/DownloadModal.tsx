'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useHistoryBack } from '@/hooks/useHistoryBack';
import { stripMarkdownAndLatex } from '@/lib/utils';

interface DownloadModalProps {
    id: string;
    title: string;
    authors: string;
    description?: string;
    mediaUrl: string;
    onClose: () => void;
}

export const DownloadModal = ({ id, title, authors, description, mediaUrl, onClose }: DownloadModalProps) => {
    const [isDownloading, setIsDownloading] = useState<'pdf' | 'md' | 'img' | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // [B14] Native back button support
    useHistoryBack(true, onClose);

    // 1. Download as PDF (Dynamic Import)
    const handleDownloadPDF = async () => {
        setIsDownloading('pdf');
        const loadingToast = toast.loading('Gerando PDF...');

        try {
            const { jsPDF } = await import('jspdf'); // Dynamic Import
            const doc = new jsPDF();

            // Basic PDF Layout
            doc.setFontSize(22);
            doc.text(title, 20, 20);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Autor(es): ${authors}`, 20, 30);

            doc.setDrawColor(200);
            doc.line(20, 35, 190, 35);

            doc.setFontSize(11);
            doc.setTextColor(0);
            const splitText = doc.splitTextToSize(stripMarkdownAndLatex(description || ''), 170);
            doc.text(splitText, 20, 45);

            doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
            toast.success('PDF baixado!', { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar PDF', { id: loadingToast });
        } finally {
            setIsDownloading(null);
        }
    };

    // 2. Download as Markdown (Native)
    const handleDownloadMD = () => {
        setIsDownloading('md');
        try {
            const content = `# ${title}\n\n**Autores:** ${authors}\n\n---\n\n${description || ''}\n\n--- \n*Baixado do Hub de Comunicação Científica Lab-Div*`;
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Markdown baixado!');
        } catch (err) {
            toast.error('Erro ao baixar Markdown');
        } finally {
            setIsDownloading(null);
        }
    };

    // 3. Download as Social Image (Dynamic Import)
    const handleDownloadImage = async () => {
        setIsDownloading('img');
        const loadingToast = toast.loading('Gerando imagem...');

        try {
            const { toPng } = await import('html-to-image'); // Dynamic Import

            if (cardRef.current) {
                const dataUrl = await toPng(cardRef.current, {
                    quality: 0.95,
                    backgroundColor: '#121212',
                });

                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-social.png`;
                a.click();
                toast.success('Imagem gerada!', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar imagem', { id: loadingToast });
        } finally {
            setIsDownloading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-[#1E1E1E] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center size-14 bg-brand-blue/10 text-brand-blue rounded-2xl mb-2">
                            <span className="material-symbols-outlined text-3xl">download_for_offline</span>
                        </div>
                        <h2 className="text-2xl font-black text-white">Levar o conhecimento</h2>
                        <p className="text-gray-400 text-sm">Escolha como deseja baixar este conteúdo:</p>
                    </div>

                    <div className="grid gap-3">
                        {/* PDF Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadPDF}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-blue/10 border border-gray-800 hover:border-brand-blue/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-blue/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-blue transition-colors">
                                {isDownloading === 'pdf' ? (
                                    <div className="size-5 border-2 border-brand-blue border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">Documento PDF</p>
                                <p className="text-[10px] text-gray-500 font-medium">Ideal para leitura offline e impressão</p>
                            </div>
                        </button>

                        {/* Markdown Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadMD}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-yellow/10 border border-gray-800 hover:border-brand-yellow/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-yellow/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-yellow transition-colors">
                                {isDownloading === 'md' ? (
                                    <div className="size-5 border-2 border-brand-yellow border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">markdown</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">Markdown RAW</p>
                                <p className="text-[10px] text-gray-500 font-medium">Para usar em editores como Obsidian ou Notion</p>
                            </div>
                        </button>

                        {/* Image Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadImage}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-red/10 border border-gray-800 hover:border-brand-red/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-red/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-red transition-colors">
                                {isDownloading === 'img' ? (
                                    <div className="size-5 border-2 border-brand-red border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">identity_platform</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">Imagem Social (Card)</p>
                                <p className="text-[10px] text-gray-500 font-medium">Capture o card para compartilhar no Instagram</p>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>
            </motion.div>

            {/* Hidden capture card for html-to-image */}
            <div className="fixed top-[-9999px] left-[-9999px]">
                <div
                    ref={cardRef}
                    className="w-[600px] p-10 bg-[#121212] flex flex-col gap-6 font-sans text-white border-2 border-brand-blue/30 rounded-3xl"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-32 bg-brand-blue/10 rounded flex items-center justify-center">
                            <span className="text-brand-blue font-black text-xs uppercase tracking-tighter">LAB-DIV HUB</span>
                        </div>
                        <span className="material-symbols-outlined text-brand-yellow text-4xl">science</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-wrap leading-tight">{title}</h1>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-brand-blue/20"></div>
                            <p className="text-xl font-bold text-brand-blue">{authors}</p>
                        </div>
                    </div>

                    <div className="text-lg text-gray-300 leading-relaxed italic border-l-4 border-gray-800 pl-6">
                        {stripMarkdownAndLatex(description || '').substring(0, 300)}...
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-gray-500">
                        <span>Arquivo Lab-Div V3.0</span>
                        <span>hub.labdiv.if.usp.br</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
