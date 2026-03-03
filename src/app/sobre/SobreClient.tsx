'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { MediaCard, MediaCardProps } from "@/components/MediaCard";
import { Megaphone, ArrowRight, UserPlus, Award, Star, ExternalLink } from 'lucide-react';

interface SobreClientProps {
    initialTestimonials: MediaCardProps[];
}

export function SobreClient({ initialTestimonials }: SobreClientProps) {
    return (
        <MainLayoutWrapper>

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
                        <Megaphone className="w-8 h-8 text-brand-red" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Apoio aos Criadores</h3>
                    <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                        Mapeamos e integramos a rede de influenciadores e criadores de conteúdo vinculados ao instituto. O hub serve como uma vitrine para amplificar as vozes daqueles que já traduzem a ciência complexa do IFUSP em materiais acessíveis ao grande público, como vídeos, podcasts e posts em redes sociais.
                    </p>
                    <Link href="/criadores" className="mt-6 text-brand-red font-semibold hover:underline flex items-center gap-1">
                        Conheça os criadores <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Card 2: Arquivo Feito por Nós */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                        <Image src="/arquivo-logo.png" alt="Logo do Arquivo" width={56} height={56} className="object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">O Arquivo Oficial</h3>
                    <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                        O coração do projeto é a construção de um grande Arquivo visual. Capturamos o cotidiano dos laboratórios, o maquinário e os bastidores das pesquisas de forma profissional. Nosso objetivo é ter um banco de imagens institucionais de alta qualidade, pronto para suprir demandas de jornalistas, designers e pesquisadores.
                    </p>
                    <Link href="/arquivo-labdiv" className="mt-6 text-brand-blue font-semibold hover:underline flex items-center gap-1">
                        Explore o acervo <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Card 3: Envios da Comunidade */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 bg-brand-yellow/10 rounded-xl flex items-center justify-center mb-6">
                        <UserPlus className="w-8 h-8 text-brand-yellow" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Envios da Comunidade</h3>
                    <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                        O Hub é colaborativo! Estudantes, técnicos e docentes do IFUSP podem submeter registros visuais do cotidiano de seus laboratórios. Integramos o conhecimento de base em uma rede viva de registros autênticos.
                    </p>
                    <Link href="/enviar" className="mt-6 text-brand-yellow font-semibold hover:underline flex items-center gap-1">
                        Envie seu material <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
            {/* O Fluxo Section */}
            <div className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden mb-20 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-colors"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-6">
                            Motor de Engajamento
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                            O Fluxo <span className="text-brand-blue text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-red">Interativo</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
                            Não somos apenas uma vitrine; somos uma conversa viva. O **Fluxo** integra o material produzido pelo Lab-Div, a excelência das nossas mentorias e a espontaneidade da comunidade em uma timeline dinâmica.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-white/5 hover:border-brand-blue/20 transition-colors">
                                <h4 className="text-brand-blue font-black uppercase tracking-widest text-[9px] mb-2">Padrão Ouro</h4>
                                <p className="text-xs text-gray-500">Material oficial produzido com o rigor visual do Lab-Div.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-white/5 hover:border-brand-red/20 transition-colors">
                                <h4 className="text-brand-red font-black uppercase tracking-widest text-[9px] mb-2">Mentorados</h4>
                                <p className="text-xs text-gray-500">Conteúdo potencializado por nossas diretrizes técnicas.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-white/5 hover:border-brand-yellow/20 transition-colors">
                                <h4 className="text-brand-yellow font-black uppercase tracking-widest text-[9px] mb-2">Comunidade</h4>
                                <p className="text-xs text-gray-500">Os bastidores reais do IFUSP contados por quem os vive.</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/" className="shrink-0 w-full md:w-auto bg-brand-blue text-white px-10 py-6 rounded-3xl font-black uppercase italic tracking-tighter hover:scale-105 hover:shadow-2xl hover:shadow-brand-blue/20 transition-all flex items-center justify-center gap-3">
                        Entrar no Fluxo
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* Project Overview Card (Premium) */}
            <div className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-16 shadow-2xl shadow-brand-blue/5 border border-gray-100 dark:border-gray-800 relative overflow-hidden mb-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-16">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                            O Futuro da <br />
                            <span className="text-brand-blue">Comunicação</span> Científica
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            <p>
                                O Hub Lab-Div não é apenas um repositório; é um motor de visibilidade. Nosso objetivo é transformar a ciência "invisível" que acontece nos laboratórios em narrativas visuais potentes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <h4 className="text-brand-red font-black uppercase tracking-widest text-xs mb-3">Nossa Missão</h4>
                                    <p className="text-sm">Humanizar a ciência do IFUSP através de conteúdos autênticos, aproximando pesquisadores e sociedade.</p>
                                </div>
                                <div>
                                    <h4 className="text-brand-yellow font-black uppercase tracking-widest text-xs mb-3">Nossa Meta 2026</h4>
                                    <p className="text-sm">Alcançar 100% dos laboratórios do IF cadastrados e 5.000 registros históricos preservados.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="w-full lg:w-72 shrink-0 grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-center text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Comunidade</span>
                            <span className="text-4xl font-black text-brand-blue">247</span>
                            <span className="text-xs font-bold text-gray-500 mt-1">Usuários Ativos</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-center text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Acervo Digital</span>
                            <span className="text-4xl font-black text-brand-red">1.2k</span>
                            <span className="text-xs font-bold text-gray-500 mt-1">Posts & Mídias</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section About Lab-Div */}
            <div className="bg-gradient-to-br from-brand-blue/5 to-brand-red/5 dark:from-blue-900/10 dark:to-red-900/10 rounded-3xl p-8 md:p-12 border border-brand-blue/10 mb-20">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white uppercase italic tracking-tighter">
                            O Papel do <span className="text-brand-blue">Lab-Div</span>
                        </h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                            O Laboratório de Divulgação Científica do IFUSP atua como o motor técnico e curatorial desta plataforma. Nosso trabalho se estende da produção de conteúdo "Padrão Ouro" à moderação, suporte e mentoria contínua para garantir a qualidade da comunicação.
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            Desenvolvemos o Hub para resolver a falta de acessibilidade visual sobre a pesquisa de base. Ao unificar criadores, arquivistas e pesquisadores, o Lab-Div garante que a ciência produzida no instituto não apenas exista, mas seja vista, compreendida e compartilhada.
                        </p>
                        <Link href="/arquivo-labdiv" className="inline-flex items-center text-brand-blue font-black hover:text-brand-blue/80 transition-colors mt-8 group uppercase text-xs tracking-widest">
                            Conhecer o trabalho <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="hidden md:flex w-48 h-48 rounded-2xl items-center justify-center flex-shrink-0 overflow-hidden bg-white/50 dark:bg-white/5 p-8">
                        <Image src="/labdiv-logo.png" alt="Logo do Lab-Div" width={192} height={192} className="object-contain" />
                    </div>
                </div>
            </div>

            {/* Ecosystem Sections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 px-4 md:px-0">

                {/* Grande Colisor Explanation row */}
                <div className="lg:col-span-3 mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Ecossistema em Expansão</h3>
                    <div className="h-px bg-gradient-to-r from-brand-blue/20 via-brand-red/20 to-transparent w-full mb-8"></div>
                </div>

                <div className="bg-white/5 dark:bg-card-dark rounded-3xl p-10 border border-gray-100 dark:border-gray-800 hover:border-brand-blue/20 transition-all group h-full flex flex-col shadow-sm hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Star className="text-brand-blue w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Grande Colisor</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        Muito mais que um site, uma rede. O Colisor integra iniciativas como o Parque CienTec, o Boletim Supernova e o DigitalLab, conectando espaços físicos e projetos de extensão do IFUSP e da USP em um só mapa de visibilidade.
                    </p>
                    <Link href="/colisor" className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2 group/link">
                        Explorar Colisor <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="bg-white/5 dark:bg-card-dark rounded-3xl p-10 border border-gray-100 dark:border-gray-800 hover:border-brand-red/20 transition-all group h-full flex flex-col shadow-sm hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ExternalLink className="text-brand-red w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Mapa de Mídia</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        A geolocalização da ciência. Através do Mapa, visualizamos o alcance das nossas produções e a localização dos laboratórios, transformando dados brutos em um panorama visual do impacto científico do Instituto.
                    </p>
                    <Link href="/mapa" className="text-[10px] font-black uppercase tracking-widest text-brand-red flex items-center gap-2 group/link">
                        Ver Impacto no Mapa <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="bg-white/5 dark:bg-card-dark rounded-3xl p-10 border border-gray-100 dark:border-gray-800 hover:border-brand-yellow/20 transition-all group h-full flex flex-col shadow-sm hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Megaphone className="text-brand-yellow w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Perguntas a um Cientista</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        Ponte direta entre a dúvida e a descoberta. Esta seção permite que a comunidade interaja diretamente com pesquisadores, humanizando o processo científico e quebrando barreiras através do diálogo aberto.
                    </p>
                    <Link href="/perguntas" className="text-[10px] font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2 group/link">
                        Fazer uma Pergunta <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Dynamic Impacto e Conquistas Section */}
            <div className="space-y-12">
                <div
                    className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                >
                    {/* Decorative background icon */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Award size={220} className="rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 bg-brand-yellow text-black rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                                        <Star className="w-7 h-7" />
                                    </div>
                                    Impacto e Conquistas
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                    Resultados alcançados, prêmios e histórias de sucesso que inspiram a nossa comunidade.
                                </p>
                            </div>
                            <Link
                                href="/?category=Impacto e Conquistas"
                                className="bg-brand-yellow text-black px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group whitespace-nowrap"
                            >
                                Ver todas as conquistas
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {initialTestimonials.length > 0 ? (
                                initialTestimonials.map((item) => (
                                    <div key={item.post.id}>
                                        <MediaCard post={item.post} />
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={`placeholder-${i}`}
                                        className="aspect-[3/4] rounded-3xl bg-gray-50 dark:bg-background-dark/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-gray-300 relative group/card overflow-hidden"
                                    >
                                        <Award size={48} className="mb-3 group-hover/card:scale-110 transition-transform duration-500" />
                                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Conquista em breve</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </MainLayoutWrapper>
    );
}
