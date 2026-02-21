import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function IniciativasPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="max-w-3xl mb-12">
                    <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                        Iniciativas e <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-yellow">Projetos</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Conheça os projetos ativos dentro do Instituto de Física dedicados à difusão científica e educação.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Iniciativa 1 */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                        <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-blue">science</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Lab-Div</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Iniciativa inspirada no CommLab do MIT, focada em aprimorar a comunicação científica no IFUSP. Oferece programa de tutoria entre pares para auxiliar estudantes com a escrita científica, apresentações orais e design visual de trabalhos acadêmicos – feito por quem faz física, para quem faz física.
                        </p>
                        <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-blue font-semibold group-hover:text-brand-darkBlue transition-colors">
                            Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>

                    {/* Iniciativa 2 */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                        <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-red">desktop_windows</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">DigitalLab</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                            Iniciativa com foco na criação de experiências digitais, programação e conteúdos audiovisuais voltados para a popularização da ciência na internet.
                        </p>
                        <a href="#" className="inline-flex items-center text-brand-red font-semibold group-hover:opacity-80 transition-colors">
                            Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
