'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { supabase } from '@/lib/supabase';
import { QuizQuestion } from '@/types/quiz';
import { submitQuizResults } from '@/app/actions/gamification';
import { Brain, Zap, ArrowRight, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RadiationQuizPage() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [xpAccumulated, setXpAccumulated] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data, error } = await supabase
                .from('quiz_questions')
                .select('*')
                .limit(10);

            if (data) setQuestions(data);
            setLoading(false);
        };
        fetchQuestions();
    }, []);

    const handleOptionSelect = (optionIndex: number) => {
        if (showExplanation) return;
        setSelectedOption(optionIndex);
        setShowExplanation(true);

        const isCorrect = questions[currentIndex].options[optionIndex].isCorrect;
        if (isCorrect) {
            setScore(prev => prev + 1);
            setXpAccumulated(prev => prev + questions[currentIndex].points);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setSaving(true);
        const result = await submitQuizResults(score, xpAccumulated);
        setSaving(false);
        setIsFinished(true);
    };

    if (loading) {
        return (
            <MainLayoutWrapper>
                <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="size-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full"
                    />
                </div>
            </MainLayoutWrapper>
        );
    }

    if (isFinished) {
        return (
            <MainLayoutWrapper>
                <div className="min-h-screen bg-[#121212] pt-24 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-card-dark border border-white/5 p-12 rounded-[48px] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-transparent pointer-events-none" />

                            <Sparkles className="w-16 h-16 text-brand-red mx-auto mb-6" />
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                Missão Concluída
                            </h1>
                            <p className="text-gray-400 font-bold mb-12">
                                Você colidiu com o conhecimento e extraiu radiação!
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Acertos</span>
                                    <span className="text-3xl font-black text-white">{score}/{questions.length}</span>
                                </div>
                                <div className="p-6 bg-brand-red/10 rounded-3xl border border-brand-red/20">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">XP Ganho</span>
                                    <span className="text-3xl font-black text-brand-red">+{xpAccumulated} RAD</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/wiki"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all font-display"
                                >
                                    Voltar à Wiki
                                </Link>
                                <Link
                                    href="/lab?tab=radiacao"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand-red text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red/80 transition-all shadow-xl shadow-brand-red/20 font-display"
                                >
                                    Ver no Perfil <Zap className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </MainLayoutWrapper>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen bg-[#121212] pt-24 px-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Questão</span>
                                <span className="text-sm font-black text-white">{currentIndex + 1} de {questions.length}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-brand-red">Radiação Acumulada</span>
                            <span className="text-sm font-black text-brand-red">+{xpAccumulated} RAD</span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="bg-card-dark border border-white/5 p-8 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap className="w-32 h-32 text-brand-red" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-tight mb-12 relative z-10">
                                {currentQuestion.question}
                            </h2>

                            <div className="space-y-4 relative z-10 flex-1">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrect = option.isCorrect;
                                    const showAsCorrect = showExplanation && isCorrect;
                                    const showAsWrong = showExplanation && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            disabled={showExplanation}
                                            className={`w-full p-6 rounded-3xl border text-left transition-all flex items-center justify-between group
                                                ${showAsCorrect ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                                                    showAsWrong ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                                                        isSelected ? 'bg-brand-red/10 border-brand-red/50 text-brand-red' :
                                                            'bg-white/2 border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5'}
                                            `}
                                        >
                                            <span className="font-bold">{option.text}</span>
                                            {showAsCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                                            {showAsWrong && <XCircle className="w-5 h-5 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation / Footer */}
                            <AnimatePresence>
                                {showExplanation && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-8 pt-8 border-t border-white/5"
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            <AlertCircle className={`w-5 h-5 shrink-0 ${currentQuestion.options[selectedOption!].isCorrect ? 'text-green-500' : 'text-red-500'}`} />
                                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>

                                        <button
                                            onClick={nextQuestion}
                                            disabled={saving}
                                            className="w-full bg-white text-black p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'Colidindo Dados...' : currentIndex === questions.length - 1 ? 'Concluir Teste' : 'Próxima Colisão'}
                                            {!saving && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MainLayoutWrapper>
    );
}
