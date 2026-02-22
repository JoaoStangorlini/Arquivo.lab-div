'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

interface PresentationModeProps {
    content: string;
    onClose: () => void;
}

export function PresentationMode({ content, onClose }: PresentationModeProps) {
    // Split content by "---" to create slides
    const slides = content.split(/\n---\n/).filter(s => s.trim().length > 0);
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background-dark flex flex-col items-center justify-center p-8 md:p-16"
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
                aria-label="Sair do Modo Apresentação"
            >
                <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            <div className="flex-1 w-full max-w-5xl flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        className="w-full prose prose-2xl dark:prose-invert max-w-none text-center"
                    >
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeSanitize]}>
                            {slides[currentSlide]}
                        </ReactMarkdown>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-8 mt-12 pb-8">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>

                <div className="text-gray-500 font-bold tracking-widest uppercase text-sm">
                    Slide {currentSlide + 1} / {slides.length}
                </div>

                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="fixed bottom-0 left-0 h-1.5 bg-brand-blue/20 w-full overflow-hidden">
                <motion.div
                    className="h-full bg-brand-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
            </div>
        </motion.div>
    );
}
