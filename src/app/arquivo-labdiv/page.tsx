import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { LabDivCatalogExplorer } from "@/components/LabDivCatalogExplorer";
import Link from "next/link";

export default function ArquivoLabDivPage() {
    return (
        <MainLayoutWrapper>
            <main className="flex-1 w-full animate-in fade-in duration-700">
                {/* Hero */}
                <section className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-blue/10 via-white to-brand-red/5 dark:from-brand-blue/20 dark:via-background-dark dark:to-brand-red/10 border-b border-gray-200 dark:border-gray-800 rounded-3xl mb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                                O que é o <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span>?
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                                É um laboratório de divulgação científica que produz, reúne e ajuda a criar material de divulgação científica para ajudar a melhorar a divulgação científica do IF.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-brand-blue/20 flex items-center gap-2 hover:-translate-y-1 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">language</span>
                                    Visite nosso Site
                                </a>
                            </div>
                        </div>
                        <div className="hidden md:block w-48 h-48 relative opacity-80">
                            {/* Decorative element */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-red rounded-full blur-3xl opacity-20 animate-pulse" />
                            <span className="material-symbols-outlined text-[120px] text-brand-blue drop-shadow-2xl absolute inset-0 flex items-center justify-center">library_books</span>
                        </div>
                    </div>
                </section>

                {/* Premium CTAs */}
                <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kit Div CTA */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-brand-red/10 to-transparent dark:from-brand-red/20 dark:to-card-dark rounded-3xl p-8 border border-brand-red/20 hover:border-brand-red/40 transition-colors group flex flex-col items-start">
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-brand-red text-2xl">inventory_2</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Kit Div</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
                                Ferramentas exclusivas, templates de design, guias de linguagem e assets audiovisuais da marca do IFUSP para acelerar suas produções.
                            </p>
                            <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="mt-auto px-6 py-3 bg-brand-red text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-brand-red/20">
                                Explorar Kit Div
                                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>

                        {/* Mentoria CTA */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-transparent dark:from-brand-blue/20 dark:to-card-dark rounded-3xl p-8 border border-brand-blue/20 hover:border-brand-blue/40 transition-colors group flex flex-col items-start">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                <span className="material-symbols-outlined text-[120px] text-brand-blue">psychology</span>
                            </div>
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-brand-blue text-2xl">group_add</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mentoria Premium</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-sm relative z-10">
                                Agende reuniões individuais com Veteranos do Lab-Div para revisar roteiros, artigos, refinar a didática e traçar planos de divulgação para suas pesquisas.
                            </p>
                            <Link href="/perguntas" className="mt-auto relative z-10 px-6 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform group-hover:shadow-lg group-hover:shadow-brand-blue/20">
                                Solicitar Mentoria
                                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Integration with existing archive */}
                <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                            Catálogo de Material de <span className="text-brand-yellow">Divulgação Padrão Ouro</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-brand-yellow rounded-full mb-8"></div>
                    </div>

                    <LabDivCatalogExplorer />
                </section>
            </main>
        </MainLayoutWrapper>
    );
}
