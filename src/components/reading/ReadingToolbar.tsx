'use client';

import React, { useState } from 'react';
import { useReadingExperience } from './ReadingExperienceProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { exportElementToPDF } from '@/lib/pdf-export';
import { toast } from 'react-hot-toast';

export function ReadingToolbar({ submissionTitle, submissionId, authors }: { submissionTitle: string; submissionId: string; authors: string }) {
    const {
        isFocusMode, setFocusMode,
        isPresentationMode, setPresentationMode,
        isAudioPlaying, setAudioPlaying,
        setAudioLanguage
    } = useReadingExperience();

    const [isVisible, setIsVisible] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [showTtsPopup, setShowTtsPopup] = useState(false);
    const [citeCopied, setCiteCopied] = useState(false);

    const handleCopyCitation = async () => {
        const year = new Date().getFullYear();
        const citation = `${authors.toUpperCase()}. ${submissionTitle}. Hub Lab-Div IF-USP, ${year}. Disponível em: ${window.location.origin}/arquivo/${submissionId}`;
        try {
            await navigator.clipboard.writeText(citation);
            setCiteCopied(true);
            toast.success('Citação ABNT copiada!');
            setTimeout(() => setCiteCopied(false), 2000);
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = citation;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCiteCopied(true);
            toast.success('Citação ABNT copiada!');
            setTimeout(() => setCiteCopied(false), 2000);
        }
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${isFocusMode ? 'focus-toolbar' : ''}`}>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 sm:gap-4"
            >
                {/* Focus Mode Toggle */}
                <ToolbarButton
                    icon={isFocusMode ? 'visibility' : 'filter_center_focus'}
                    label={isFocusMode ? 'Ver Tudo' : 'Modo Foco'}
                    active={isFocusMode}
                    onClick={() => setFocusMode(!isFocusMode)}
                    color="brand-blue"
                />

                {/* Presentation Mode Toggle */}
                <ToolbarButton
                    icon="present_to_all"
                    label="Slides"
                    active={isPresentationMode}
                    onClick={() => setPresentationMode(!isPresentationMode)}
                    color="brand-yellow"
                />

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Audio/TTS Toggle with Popover */}
                <div className="relative flex items-center">
                    <ToolbarButton
                        icon={isAudioPlaying ? 'stop_circle' : 'volume_up'}
                        label={isAudioPlaying ? 'Parar' : 'Ouvir'}
                        active={isAudioPlaying}
                        onClick={() => {
                            if (isAudioPlaying) {
                                setAudioPlaying(false);
                            } else {
                                setShowTtsPopup(!showTtsPopup);
                            }
                        }}
                        color="brand-red"
                    />

                    <AnimatePresence>
                        {showTtsPopup && !isAudioPlaying && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 w-64 z-[110]"
                            >
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-red text-lg">record_voice_over</span>
                                    Leitura Dinâmica
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">Escolha o idioma (fórmulas matemáticas serão omitidas).</p>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            setAudioLanguage('pt-BR');
                                            setAudioPlaying(true);
                                            setShowTtsPopup(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                    >
                                        <span className="text-lg">🇧🇷</span> Ouvir em Português
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAudioLanguage('en-US');
                                            setAudioPlaying(true);
                                            setShowTtsPopup(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                    >
                                        <span className="text-lg">🇺🇸</span> Listen in English
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ABNT Citation Button */}
                <ToolbarButton
                    icon={citeCopied ? 'check' : 'format_quote'}
                    label={citeCopied ? 'Copiado' : 'Citar'}
                    onClick={handleCopyCitation}
                    color="gray-500"
                    active={citeCopied}
                />

                {/* PDF Export Button */}
                <ToolbarButton
                    icon={isExporting ? 'hourglass_empty' : 'picture_as_pdf'}
                    label={isExporting ? 'Gerando...' : 'PDF'}
                    onClick={async () => {
                        if (isExporting) return;
                        setIsExporting(true);
                        const loadingToast = toast.loading('Gerando PDF...', { icon: '📄' });
                        try {
                            await exportElementToPDF('submission-content', `${submissionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
                            toast.success('PDF gerado com sucesso!', { id: loadingToast });
                        } catch (error) {
                            toast.error('Erro ao gerar PDF da submissão.', { id: loadingToast });
                        } finally {
                            setIsExporting(false);
                        }
                    }}
                    color="gray-500"
                    active={isExporting}
                />
            </motion.div>
        </div>
    );
}

function ToolbarButton({
    icon,
    label,
    onClick,
    active = false,
    color = "brand-blue"
}: {
    icon: string;
    label: string;
    onClick: () => void;
    active?: boolean;
    color?: string;
}) {
    const colorClasses: Record<string, string> = {
        'brand-blue': 'text-brand-blue hover:bg-brand-blue/10 border-brand-blue/20',
        'brand-yellow': 'text-brand-yellow hover:bg-brand-yellow/10 border-brand-yellow/20',
        'brand-red': 'text-brand-red hover:bg-brand-red/10 border-brand-red/20',
        'gray-500': 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-w-0 gap-2 px-3 py-2 rounded-full transition-all group relative ${active ? 'bg-gray-100 dark:bg-gray-800 shadow-inner' : ''
                }`}
            title={label}
        >
            <span className={`material-symbols-outlined text-[20px] ${active ? 'fill-current' : ''} ${colorClasses[color].split(' ')[0]}`}>
                {icon}
            </span>
            <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {label}
            </span>

            {active && (
                <motion.div
                    layoutId="active-pill"
                    className={`absolute inset-0 rounded-full border-2 ${colorClasses[color].split(' ')[2]} opacity-50`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    );
}
