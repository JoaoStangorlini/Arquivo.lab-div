import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";

export default function SobrePage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        O que é o <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Hub de Comunicação</span>?
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Um ecossistema digital criado pelo Lab-Div para centralizar, organizar e potencializar a divulgação científica produzida no Instituto de Física da USP.
                    </p>
                </div>

                {/* Ramificações Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

                    {/* Card 1: Influenciadores */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-brand-red/10 rounded-xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-red">campaign</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Apoio aos Criadores</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            Mapeamos e integramos a rede de influenciadores e criadores de conteúdo vinculados ao instituto. O hub serve como uma vitrine para amplificar as vozes daqueles que já traduzem a ciência complexa do IFUSP em materiais acessíveis ao grande público, como vídeos, podcasts e posts em redes sociais.
                        </p>
                        <Link href="/criadores" className="mt-6 text-brand-red font-semibold hover:underline flex items-center gap-1">
                            Conheça os criadores <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Card 2: Arquivo Feito por Nós */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-blue">folder_special</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">O Acervo Oficial</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            O coração do projeto é a construção de um grande Arquivo visual. Capturamos o cotidiano dos laboratórios, o maquinário e os bastidores das pesquisas de forma profissional. Nosso objetivo é ter um banco de imagens institucionais de alta qualidade, pronto para suprir demandas de jornalistas, designers e pesquisadores.
                        </p>
                        <Link href="/" className="mt-6 text-brand-blue font-semibold hover:underline flex items-center gap-1">
                            Explore o acervo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Card 3: Participação da Comunidade */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-brand-yellow/10 rounded-xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-yellow">group_add</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Envios da Comunidade</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            O Hub é colaborativo! Permitimos que qualquer aluno, técnico ou professor do Instituto possa enviar suas próprias fotos e vídeos do cotidiano do seu laboratório. Após uma rápida curadoria, o seu registro passa a integrar a galeria principal, ajudando a documentar a enorme produção do instituto em rede.
                        </p>
                        <Link href="/enviar" className="mt-6 text-brand-yellow font-semibold hover:underline flex items-center gap-1">
                            Envie seu material <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                </div>

                {/* Section About Lab-Div */}
                <div className="bg-gradient-to-br from-brand-blue/5 to-brand-red/5 dark:from-blue-900/10 dark:to-red-900/10 rounded-3xl p-8 md:p-12 border border-brand-blue/10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6">O Papel do Lab-Div</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                O Laboratório de Divulgação Científica do IFUSP trabalha para reduzir o abismo entre o que é produzido na academia e o que chega à sociedade.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                Este Hub é uma ferramenta desenhada para resolver um problema histórico: a falta de acessibilidade visual e narrativa sobre a pesquisa de base. Ao unificar criadores, arquivistas e a própria comunidade de pesquisadores em um só lugar, criamos um motor contínuo de difusão do conhecimento.
                            </p>
                        </div>
                        <div className="hidden md:flex w-48 h-48 bg-white dark:bg-gray-800 rounded-full items-center justify-center shadow-lg flex-shrink-0 relative overflow-hidden border-4 border-white dark:border-gray-800">
                            <div className="absolute w-20 h-24 bg-brand-blue rounded-sm top-4 left-6 z-0"></div>
                            <div className="absolute w-20 h-24 bg-brand-red rounded-sm bottom-4 right-6 z-0"></div>
                            <div className="absolute w-16 h-16 bg-brand-yellow rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-sm border-2 border-white dark:border-gray-800"></div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
