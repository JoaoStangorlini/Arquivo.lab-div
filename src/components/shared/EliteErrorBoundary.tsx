'use client';

import React, { Component, ErrorInfo, ReactNode, startTransition } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    moduleName?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class EliteErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`EliteErrorBoundary caught an error in module [${this.props.moduleName || 'Unknown'}]:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-8 rounded-3xl bg-white dark:bg-card-dark border-2 border-[#0055ff]/10 shadow-xl overflow-hidden relative group">
                    {/* Background Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055ff]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#0055ff]/10 transition-all" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="size-16 bg-[#0055ff]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#0055ff]/20"
                        >
                            <AlertCircle className="text-[#0055ff] size-8" />
                        </motion.div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                            Módulo em Manutenção
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-8">
                            O módulo {this.props.moduleName ? `[${this.props.moduleName}]` : 'técnico'} encontrou uma instabilidade. Nossa IA já está ciente.
                        </p>

                        <button
                            onClick={() => {
                                // Execute optional callback (e.g., router.refresh) first to invalidate cache
                                this.props.onReset?.();

                                // Wrap state reset in a transition to prevent race condition with Next.js refresh
                                startTransition(() => {
                                    this.setState({ hasError: false, error: undefined });
                                });
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0055ff] text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0055ff]/20"
                        >
                            <RefreshCcw size={14} />
                            RECONECTAR MÓDULO
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * withEliteBoundary HOC
 * Encapsule seu componente em um EliteErrorBoundary de forma elegante.
 */
export function withEliteBoundary<P extends object>(
    Component: React.ComponentType<P>,
    moduleName: string
) {
    return function WrappedWithEliteBoundary(props: P) {
        const router = useRouter();

        const handleReset = () => {
            // Hard Refresh to clear possibly poisoned client-side cache
            router.refresh();
        };

        return (
            <EliteErrorBoundary moduleName={moduleName} onReset={handleReset}>
                <Component {...props} />
            </EliteErrorBoundary>
        );
    };
}
