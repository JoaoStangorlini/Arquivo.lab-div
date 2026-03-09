'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

// Wizard Steps
import { CategoryStep } from './components/CategoryStep';
import { FormatStep } from './components/FormatStep';
import { FormStep } from './components/FormStep';
import { Stepper } from './components/Stepper';


import { useAuth } from '@/providers/AuthProvider';

export default function SubmitPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { currentStep, reset } = useSubmissionStore();
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Safety timeout to prevent permanent hang
        const timeout = setTimeout(() => {
            if (isInitializing) {
                console.warn('Submission initialization timeout');
                setIsInitializing(false);
            }
        }, 5000);

        if (!authLoading) {
            if (!user) {
                router.push('/lab');
                return;
            }

            // Initialization sequence
            // Do not call reset() unconditionally, as it breaks persistence when mobile browser suspends/resumes tab
            setIsInitializing(false);
            clearTimeout(timeout);
        }

        return () => clearTimeout(timeout);
    }, [authLoading, user, router, isInitializing]);

    if (authLoading || isInitializing) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-brand-blue border-t-transparent animate-spin"></div>
                    <p className="text-gray-500 font-medium">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    return (
        <MainLayoutWrapper focusMode={true}>
            <div className="relative min-h-screen font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden">
                {/* Background Decorative Elements */}
                <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px] opacity-30 -z-20"></div>

                {/* Custom Submit Header */}
                <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/60 dark:bg-background-dark/60 border-b border-gray-200/50 dark:border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <button onClick={() => router.push('/')} className="group flex items-center gap-3 text-gray-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-all font-semibold text-sm">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </div>
                            Sair do Envio
                        </button>

                        {/* Branding */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image src="/labdiv-logo.png" alt="Hub Lab-Div" width={32} height={32} className="relative w-8 h-8 object-contain rounded-lg" priority />
                            </div>
                            <div className="flex flex-col leading-none">
                                <div className="text-lg font-[900] tracking-tighter uppercase flex items-center gap-0.5">
                                    <span className="text-gray-900 dark:text-white">HUB</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">LAB-DIV</span>
                                </div>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Instituto de Física</span>
                            </div>
                        </div>

                        <div className="hidden md:block w-64 lg:w-80">
                            <Stepper currentStep={currentStep} />
                        </div>
                    </div>
                </header>

                <main className="relative pt-32 pb-24 z-10">
                    <div className="max-w-5xl mx-auto">
                        <AnimatePresence mode="wait">
                            {currentStep === 'category' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center mb-16 space-y-4"
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/10 dark:bg-brand-red/20 border border-brand-red/20 text-brand-red text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="material-symbols-outlined text-sm">bolt</span>
                                        Arquivo Lab-Div
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-gray-900 dark:text-white">
                                        Conte a história da <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Ciência</span>
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                                        Selecione abaixo a categoria que melhor define sua contribuição.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <AnimatePresence mode="wait" initial={false}>
                                {currentStep === 'category' && (
                                    <motion.div
                                        key="category"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CategoryStep />
                                    </motion.div>
                                )}
                                {currentStep === 'format' && (
                                    <motion.div
                                        key="format"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FormatStep />
                                    </motion.div>
                                )}
                                {(currentStep === 'basic' || currentStep === 'optional') && (
                                    <motion.div
                                        key="form-wizard"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FormStep />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        </MainLayoutWrapper>
    );
}


