'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SubmissionStep } from '@/store/useSubmissionStore';

interface StepperProps {
    currentStep: SubmissionStep;
}

const steps: { id: SubmissionStep; label: string }[] = [
    { id: 'category', label: 'Categoria' },
    { id: 'format', label: 'Formato' },
    { id: 'form', label: 'Detalhes' },
];

export function Stepper({ currentStep }: StepperProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">
                    Passo {currentIndex + 1} de {steps.length}: {steps[currentIndex].label}
                </span>
                <span className="text-xs font-bold text-gray-400">
                    {Math.round(progress)}% Concluído
                </span>
            </div>

            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow"
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                />
            </div>

            <div className="flex justify-between mt-3 px-1">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-brand-blue' :
                                    isActive ? 'bg-brand-yellow scale-125 ring-4 ring-brand-yellow/20' :
                                        'bg-gray-200 dark:bg-gray-700'
                                }`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
