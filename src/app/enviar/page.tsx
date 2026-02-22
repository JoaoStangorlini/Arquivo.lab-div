'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSubmissionStore } from '@/store/useSubmissionStore';

// Wizard Steps
import { CategoryStep } from './components/CategoryStep';
import { FormatStep } from './components/FormatStep';
import { FormStep } from './components/FormStep';
import { Stepper } from './components/Stepper';


export default function SubmitPage() {
    const router = useRouter();
    const { currentStep, reset } = useSubmissionStore();
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/perfil');
                return;
            }
            setIsAuthChecking(false);
        };
        fetchUser();
        // Reset store on mount to ensure fresh state
        reset();
    }, [router, reset]);

    if (isAuthChecking) {
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
        <div className="relative min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px] opacity-30 -z-20"></div>
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[120px] -z-10 rotate-12"></div>
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-brand-red/10 dark:bg-brand-red/5 rounded-full blur-[120px] -z-10 -rotate-12"></div>

            {/* Sticky Minimal Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/60 dark:bg-background-dark/60 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="group flex items-center gap-3 text-gray-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-all font-semibold text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </div>
                        Sair do Envio
                    </button>

                    {/* Progress Indicator */}
                    <div className="hidden md:block w-64 lg:w-80">
                        <Stepper currentStep={currentStep} />
                    </div>

                </div>
            </header>

            <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 z-10">
                <div className="max-w-5xl mx-auto">

                    {/* Intro Section - Only visible on first step */}
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

                    {/* Step Container */}
                    <div className="relative">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                {currentStep === 'category' && <CategoryStep />}
                                {currentStep === 'format' && <FormatStep />}
                                {currentStep === 'form' && <FormStep />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </main>
        </div>
    );
}


