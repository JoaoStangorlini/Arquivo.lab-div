'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { MediaCard, MediaCardProps } from "@/components/MediaCard";
import { Megaphone, ArrowRight, UserPlus, Award, Star, ExternalLink, BookOpen, Route, Rocket, Smartphone, Gamepad2, Database, Users, Mic, Shield, Map, Layout, MessageSquare, Book, Calculator, Settings, Link2, Globe, Video, Briefcase, Accessibility, Building, ScrollText, FileText, Network } from 'lucide-react';

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
                    Um ecossistema digital criado pelo Lab-Div que reúne a divulgação científica do Instituto de Física da USP em um <strong>Fluxo</strong> interativo — indo além da simples vitrine para promover engajamento real com a comunidade. Também conecta o IFUSP como fonte colaborativa de anotações e conhecimento sobre o instituto, seus cursos e sua história, através das abas <strong>Wiki</strong>, <strong>Trilhas</strong>, <strong>Lab-Div</strong>, <strong>Colisor</strong>, <strong>Perguntas</strong> e <strong>Mapa</strong>.
                </p>
            </div>

            {/* Ramificações Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

                {/* Card 1: Influenciadores */}
                <div className="glass-card rounded-2xl p-8 flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 bg-brand-red/10 rounded-xl flex items-center justify-center mb-6">
                        <Megaphone className="w-8 h-8 text-brand-red" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Apoio aos Influenciadores</h3>
                    <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                        Mapeamos e integramos a rede de influenciadores e criadores de conteúdo vinculados ao instituto. O hub serve como uma vitrine para amplificar as vozes daqueles que já traduzem a ciência complexa do IFUSP em materiais acessíveis ao grande público, como vídeos, podcasts e posts em redes sociais.
                    </p>
                    <Link href="/colisor" className="mt-6 text-brand-red font-semibold hover:underline flex items-center gap-1">
                        Conheça os influenciadores <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Card 2: Arquivo Feito por Nós */}
                <div className="glass-card rounded-2xl p-8 flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                        <Image src="/arquivo-logo.png" alt="Logo do Arquivo" width={56} height={56} className="object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">O Arquivo Oficial</h3>
                    <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                        O coração do projeto é a construção de um grande Arquivo visual. Capturamos o cotidiano dos laboratórios, o maquinário e os bastidores das pesquisas de forma profissional. Nosso objetivo é ter um banco de imagens institucionais de alta qualidade, pronto para suprir demandas de jornalistas, designers e pesquisadores.
                    </p>
                    <Link href="/arquivo-labdiv" className="mt-6 text-brand-yellow font-semibold hover:underline flex items-center gap-1">
                        Explore o acervo <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Card 3: Envios da Comunidade */}
                <div className="glass-card rounded-2xl p-8 flex flex-col h-full hover:shadow-lg transition-shadow">
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
            <div className="glass-card rounded-[40px] p-8 md:p-12 shadow-xl relative overflow-hidden mb-20 group">
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
            <div className="glass-card rounded-[40px] p-8 md:p-16 shadow-2xl shadow-brand-blue/5 relative overflow-hidden mb-20">
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
                            <span className="text-4xl font-black text-brand-blue">~500</span>
                            <span className="text-xs font-bold text-gray-500 mt-1">Usuários Ativos</span>
                            <span className="text-[10px] text-gray-400 mt-1">*estimativa de alunos da graduação</span>
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

                <div className="glass-card rounded-3xl p-10 hover:border-brand-red/20 transition-all group h-full flex flex-col hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Star className="text-brand-red w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Grande Colisor</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        Muito mais que um site, uma rede. O Colisor integra iniciativas como o Parque CienTec, o Boletim Supernova e o DigitalLab, conectando espaços físicos e projetos de extensão do IFUSP e da USP em um só mapa de visibilidade.
                    </p>
                    <Link href="/colisor" className="text-[10px] font-black uppercase tracking-widest text-brand-red flex items-center gap-2 group/link">
                        Explorar Colisor <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="glass-card rounded-3xl p-10 hover:border-brand-yellow/20 transition-all group h-full flex flex-col hover:shadow-lg">
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

                <div className="glass-card rounded-3xl p-10 hover:border-brand-blue/20 transition-all group h-full flex flex-col hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ExternalLink className="text-brand-blue w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Mapa de Mídia</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        A geolocalização da ciência. Através do Mapa, visualizamos o alcance das nossas produções e a localização dos laboratórios, transformando dados brutos em um panorama visual do impacto científico do Instituto.
                    </p>
                    <Link href="/mapa" className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2 group/link">
                        Ver Impacto no Mapa <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="glass-card rounded-3xl p-10 hover:border-brand-red/20 transition-all group h-full flex flex-col hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Route className="text-brand-red w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Trilhas de Aprendizagem</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        Roteiros organizados por disciplina que reúnem materiais, artigos e anotações da comunidade em sequências lógicas de estudo. Acompanhe seu progresso e domine os conteúdos do currículo do IFUSP com apoio colaborativo.
                    </p>
                    <Link href="/trilhas" className="text-[10px] font-black uppercase tracking-widest text-brand-red flex items-center gap-2 group/link">
                        Ver Trilhas <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="glass-card rounded-3xl p-10 hover:border-brand-yellow/20 transition-all group h-full flex flex-col hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-brand-yellow text-2xl">science</span>
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Laboratório Pessoal</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        Seu espaço privado no Hub. Reúna suas publicações, acompanhe seu nível de radiação (XP), gerencie suas trilhas em andamento e visualize seu impacto na comunidade científica do IFUSP — tudo em um único painel personalizado.
                    </p>
                    <Link href="/lab" className="text-[10px] font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2 group/link">
                        Acessar Lab <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="glass-card rounded-3xl p-10 hover:border-brand-blue/20 transition-all group h-full flex flex-col hover:shadow-lg">
                    <div className="size-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="text-brand-blue w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-4">Wiki do IFUSP</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                        A enciclopédia colaborativa do Instituto de Física. Uma base de conhecimento construída pela comunidade com anotações, guias de sobrevivência, explicações sobre o funcionamento do instituto, seus departamentos, laboratórios e a vida acadêmica no dia a dia.
                    </p>
                    <Link href="/wiki" className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2 group/link">
                        Explorar Wiki <ArrowRight className="size-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>


            {/* Mapeamento Arquitetural: Atual e Futuro */}
            <div className="space-y-8 mt-20 mb-20 px-4 md:px-0">
                <div className="mb-12 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white flex flex-col md:flex-row items-center gap-4 mb-3 justify-center md:justify-start">
                        <Layout className="text-brand-blue w-10 h-10" />
                        Mapeamento Arquitetural
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">
                        A anatomia atual do Hub Lab-Div e nosso roadmap de expansão.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* ÁREA 1 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-blue/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-blue mb-3 inline-block px-3 py-1 bg-brand-blue/10 rounded-full w-fit">[ÁREA 1] Identidade (IAM)</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-blue shrink-0 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Autenticação & Perfis</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Gerenciamento de credenciais, personalização do laboratório pessoal e mapeamento de cursos.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Laboratório Pessoal</h4>
                                <p className="text-xs text-slate-500 flex-1">Gestão de perfil básico e configuração inicial de preferência de cursos (Bacharelado/Licenciatura).</p>
                            </div>
                            <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-blue mb-2 relative z-10">Login Único USP</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Migração para <code>hublabdiv.if.usp.br</code> e integração completa com sistemas oficiais de senha única (OAuth / Jupiter).</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 2 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-red/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-red mb-3 inline-block px-3 py-1 bg-brand-red/10 rounded-full w-fit">[ÁREA 2] Produção Multimídia</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 group-hover:bg-brand-red/10 transition-all">
                                    <Video className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Criação & Ingestão</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Fluxos de entrada de dados, envio de mídias pela comunidade e produção de estúdio.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Submissões Colaborativas</h4>
                                <p className="text-xs text-slate-500 flex-1">Formulários de captação de registros de celulares e interações assíncronas de pesquisadores (O Fluxo).</p>
                            </div>
                            <div className="bg-brand-red/5 rounded-2xl p-6 border border-brand-red/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-red mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-red mb-2 relative z-10">Conteúdo 'Padrão Ouro'</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Artigos teóricos profundos e superproduções audiovisuais institucionais gravadas em estúdio pelo Lab-Div.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 3 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-yellow/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-yellow mb-3 inline-block px-3 py-1 bg-brand-yellow/10 rounded-full w-fit">[ÁREA 3] Descoberta e Carreiras</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-yellow shrink-0 group-hover:scale-110 group-hover:bg-brand-yellow/10 transition-all">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Rotas & Vetores</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Estruturação do conhecimento para que o aluno trace sua tragetória acadêmica e profissional.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Síncrotron (Trilhas)</h4>
                                <p className="text-xs text-slate-500 flex-1">Mapa de arquivos e Trilhas Curriculares de aprendizado autodirigido para facilitar os estudos focados.</p>
                            </div>
                            <div className="bg-brand-yellow/5 rounded-2xl p-6 border border-brand-yellow/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-yellow mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-yellow mb-2 relative z-10">Catálogo de Iniciações</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Vitrine de oportunidades de pesquisa (ICs), vagas de estágios, e guia de Vetores profissionais (Olimpíadas, Mercado, Vida Acadêmica).</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 4 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-blue/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-blue mb-3 inline-block px-3 py-1 bg-brand-blue/10 rounded-full w-fit">[ÁREA 4] Experiência Transversal</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-blue shrink-0 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                                    <Accessibility className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">UX & Acessibilidade</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                A ponte entre o volume bruto de material gerado e a exibição otimizada, inclusiva e artística na interface.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Fluxo & Catálogo Core</h4>
                                <p className="text-xs text-slate-500 flex-1">Feed contínuo e interativo (Fluxo) aliado à estabilidade fundamental do repositório Padrão Ouro IFUSP.</p>
                            </div>
                            <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-blue mb-2 relative z-10">CLS Zero (TEA) & Acervo</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Design system neurodivergente focado em zerar Cumulative Layout Shift, somado a uma **Vitrine Imersiva Interativa** para História do IF.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 5 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-red/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-red mb-3 inline-block px-3 py-1 bg-brand-red/10 rounded-full w-fit">[ÁREA 5] Engajamento</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 group-hover:bg-brand-red/10 transition-all">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Interação & Conexão</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Estruturas para que as vozes do Instituto se sobreponham, se organizem e gerem conhecimento vivo.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Comunidades Radiais</h4>
                                <p className="text-xs text-slate-500 flex-1">O Fórum Grande Colisor (projetos externos) e a plataforma Perseus (Pergunte a um Cientista) via Hub.</p>
                            </div>
                            <div className="bg-brand-red/5 rounded-2xl p-6 border border-brand-red/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-red mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-red mb-2 relative z-10">App Mobile e Mentorias 1:1</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Lançamento nativo (iOS/Android) com Push Notifications, e programa conectando calouros a veteranos mentores.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 6 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-yellow/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-yellow mb-3 inline-block px-3 py-1 bg-brand-yellow/10 rounded-full w-fit">[ÁREA 6] Colaboração Institucional</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-yellow shrink-0 group-hover:scale-110 group-hover:bg-brand-yellow/10 transition-all">
                                    <Building className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Wiki & Sobrevivência</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Manutenção de guias coletivos, tutoriais de como viver e entender o ecossistema fechado do campus.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Wiki do IFUSP</h4>
                                <p className="text-xs text-slate-500 flex-1">Artigos curtos redigidos colaborativamente descrevendo centros, CAIF, instâncias colegiadas e mapas mentais do Ifusp.</p>
                            </div>
                            <div className="bg-brand-yellow/5 rounded-2xl p-6 border border-brand-yellow/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-yellow mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-yellow mb-2 relative z-10">Aba Exclusiva "O Instituto"</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">O consolidado "Guia de Sobrevivência do Calouro": burocracias desmistificadas, horários do circular, guias do Reffis e cardápios.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 7 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-blue/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-blue mb-3 inline-block px-3 py-1 bg-brand-blue/10 rounded-full w-fit">[ÁREA 7] Gamificação Pessoal</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-blue shrink-0 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                                    <ScrollText className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Mecânicas de Retenção</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Convertendo navegação diária em engajamento duradouro recompensando a absorção de conhecimento.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Energia e Níveis Core</h4>
                                <p className="text-xs text-slate-500 flex-1">Sistema base Ativo: Radiação (XP), alcance de níveis ("Quark", "Fóton", "Bóson") e conquistas iniciais de envios.</p>
                            </div>
                            <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-blue mb-2 relative z-10">Conquistas Históricas 2.0</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Tokens (badges) concedidos por explorar seções imersivas interativas (easter-eggs na Linha do Tempo e Leitura de Artigos Ouro).</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 8 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-red/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-red mb-3 inline-block px-3 py-1 bg-brand-red/10 rounded-full w-fit">[ÁREA 8] Utilitários de Graduação</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-red shrink-0 group-hover:scale-110 group-hover:bg-brand-red/10 transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Ferramentas Práticas</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Apps web internos focados em facilitar o planejamento das aulas e simplificar requerimentos dos estudantes.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Calculadora de Formatura</h4>
                                <p className="text-xs text-slate-500 flex-1">Barras de energia baseadas no catálogo oficial com visualização dedutiva de optativas eletivas x livres e defasagens do instituto.</p>
                            </div>
                            <div className="bg-brand-red/5 rounded-2xl p-6 border border-brand-red/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-red mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-red mb-2 relative z-10">Secretaria Digital</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Painel com links diretos limpos das e-secretarias, formulários de requerimento automatizados e visualizadores de equivalência abertos.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 9 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-yellow/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-yellow mb-3 inline-block px-3 py-1 bg-brand-yellow/10 rounded-full w-fit">[ÁREA 9] Gestão & Governança</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-yellow shrink-0 group-hover:scale-110 group-hover:bg-brand-yellow/10 transition-all">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Controle & Moderação</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Estrutura administrativa invisível (Backoffice) que garante a idoneidade, segurança e curadoria científica dos materiais postados na rede.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Painel Curatorial</h4>
                                <p className="text-xs text-slate-500 flex-1">Sistema de moderação fechado (RLS) para o Lab-Div aceitar, revisar e publicar fluxos submetidos pelos usuários, bloqueando fake-news.</p>
                            </div>
                            <div className="bg-brand-yellow/5 rounded-2xl p-6 border border-brand-yellow/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-yellow mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-yellow mb-2 relative z-10">Módulo Direto CCIFUSP</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Abertura controlada da moderação para equipes do instituto incluírem informes oficiais no Fluxo e na Linha Do Tempo com flag institucional.</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA 10 */}
                    <div className="glass-card rounded-[32px] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-stretch border border-white/5 hover:border-brand-blue/30 transition-all group">
                        {/* Header da Área */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-brand-blue mb-3 inline-block px-3 py-1 bg-brand-blue/10 rounded-full w-fit">[ÁREA 10] Integração Sistêmica</span>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-blue shrink-0 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                                    <Network className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight">Motores de Base USP</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Abstração do caos das matrizes de grade da Universidade em algoritmos estáveis para nutrir as demais áreas do app.
                            </p>
                        </div>
                        {/* Cards Atual/Futuro */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#11141a] rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                                <span className="text-[10px] uppercase font-black tracking-widest text-green-400 mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Status Atual</span>
                                <h4 className="font-bold text-white mb-2">Motor de Equivalências USP</h4>
                                <p className="text-xs text-slate-500 flex-1">Algoritmo operacional convertendo estruturas rígidas de disciplinas Mestra X N-Equivalentes (via raspagem e SQL Complexo).</p>
                            </div>
                            <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue mb-2 relative z-10 flex items-center gap-2"><Rocket className="w-3 h-3" /> Roadmap Futuro</span>
                                <h4 className="font-bold text-brand-blue mb-2 relative z-10">Multi-Tenant (CQ, IME, IO)</h4>
                                <p className="text-xs text-slate-400 flex-1 relative z-10">Expandir as fundações da Plataforma (atualmente hardcoded para física) para uma arquitetura SAAS interna integrando outros Pólos (Institutos) da USP.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Impacto e Conquistas Section */}
            <div className="space-y-12">
                <div
                    className="glass-card rounded-[40px] p-8 md:p-12 shadow-xl relative overflow-hidden"
                >
                    {/* Decorative background icon */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Award size={220} className="rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 bg-brand-red text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/20">
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
                                className="bg-brand-red text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group whitespace-nowrap"
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
