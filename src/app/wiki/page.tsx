'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ShieldCheck,
    Zap,
    Atom,
    Coins,
    Telescope,
    Brain,
    Search,
    ChevronRight,
    AlertCircle,
    Info,
    ArrowLeft,
    BookOpen,
    HeartHandshake,
    Network,
    Microscope,
    Compass
} from 'lucide-react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

// --- DATA STRUCTURE (O Síncrotron) ---
const wikiCells = [
    // --- Blue Group (Produção e Comunicação) ---
    {
        id: 'guia-de-boas-praticas',
        title: 'Guia de Boas Práticas',
        subtitle: 'Produção, Créditos e Qualidade.',
        icon: <ShieldCheck className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/guia-de-boas-praticas',
        description: 'Diretrizes oficiais para produção de mídia: como fotografar, filmar e creditar colaboradores no Hub.',
        details: [
            'Co-autoria e Créditos: Como marcar sua equipe',
            'Fotografia e Vídeo: Padrões de iluminação e enquadramento',
            'Padrões Técnicos: Tamanhos de arquivos e categorias'
        ],
        keywords: ['guia', 'boas práticas', 'manual', 'foto', 'vídeo', 'créditos', 'qualidade', 'padrões'],
        cta: 'Ver Guia de Produção'
    },
    {
        id: 'divulgacao',
        title: 'Emissão de Luz',
        subtitle: 'Toolkit de Divulgação LabDiv.',
        icon: <Telescope className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/divulgacao',
        description: 'Metodologia e ferramentas para transformar dados técnicos em impacto visual.',
        details: [
            'Mapeamento 360°, VR e vídeos imersivos',
            'Guia Visual LabDiv (Azul Elétrico) e MIT Style',
            'Toolkit de design para posters e redes sociais'
        ],
        keywords: ['divulgação', 'design', 'labdiv', '360', 'vr', 'poster', 'mídia', 'comunicação', 'impacto', 'toolkit'],
        cta: 'Gerar Impacto'
    },
    {
        id: 'extensao',
        title: 'Interações de Fronteira',
        subtitle: 'Cultura, Eventos e Grupos.',
        icon: <Network className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/extensao',
        description: 'Catálogo de grupos de extensão, eventos "Física para Todos" e projetos de cultura.',
        details: [
            'Catálogo de Grupos de Extensão IFUSP',
            'Eventos: Física para Todos e Palestras',
            'Projetos de Cultura e Proposição de Ações'
        ],
        keywords: ['extensão', 'cultura', 'eventos', 'física para todos', 'grupos', 'projetos'],
        cta: 'Explorar Fronteiras'
    },

    // --- Yellow Group (Vivência e Suporte) ---
    {
        id: 'calouro',
        title: 'Iniciação de Partículas',
        subtitle: 'Guia de Sobrevivência USP/IF.',
        icon: <Zap className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/calouro',
        description: 'Logística do campus, serviços essenciais e moradia estudantil para novos ingressantes.',
        details: [
            'Localização: Edifício Principal, Ala Central e Didática',
            'Bandejão (SAS), Júpiter Web e e-mail institucional',
            'Moradia: CRUSP (Blocos A a G) e Vida no Campus'
        ],
        keywords: ['bandejão', 'crusp', 'matão', 'sobrevivência', 'calouro', 'ajuda', 'logística', 'jupiter', 'sas'],
        cta: 'Iniciar Trajetória'
    },
    {
        id: 'protecao',
        title: 'Protocolos de Proteção',
        subtitle: 'Inclusão, Saúde Mental e Apoio.',
        icon: <HeartHandshake className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/protecao',
        description: 'Políticas de permanência, suporte a neurodiversidade (TEA) e canais de acolhimento.',
        details: [
            'Neurodiversidade: Guia Portaria PRIP 059/2024 (TEA)',
            'Apoio Psicológico: Rotas de acolhimento (IP-USP)',
            'Canais de Escuta e Grupos de Afinidade IFUSP'
        ],
        keywords: ['proteção', 'saúde mental', 'tea', 'neurodiversidade', 'acolhimento', 'prip', 'suporte', 'ajuda', 'inclusão', 'bem-estar', 'pcd'],
        cta: 'Solicitar Suporte'
    },
    {
        id: 'carreira',
        title: 'Vetores de Carreira',
        subtitle: 'O Futuro Pós-IFUSP.',
        icon: <Compass className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/carreira',
        description: 'Trajetórias acadêmicas e profissionais: Academia, Indústria, Física Médica e Educação.',
        details: [
            'Pós-Graduação: Mestrado e Doutorado',
            'Mercado de Trabalho e Inovação',
            'Física Médica, Ensino e Setor Privado'
        ],
        keywords: ['carreira', 'futuro', 'trabalho', 'indústria', 'academia', 'pós-graduação', 'ensino', 'vagas'],
        cta: 'Mapear Futuro'
    },

    // --- Red Group (Institucional e Acadêmico) ---
    {
        id: 'pesquisa',
        title: 'Sistemas de Pesquisa',
        subtitle: 'Iniciação Científica e Labs.',
        icon: <Microscope className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/pesquisa',
        description: 'Guia de Iniciação Científica, Laboratórios do IFUSP e navegação no sistema Ateneu.',
        details: [
            'Como encontrar um orientador de IC',
            'Laboratórios de Pesquisa e Infraestrutura',
            'Sistema Ateneu: Cadastro e Relatórios'
        ],
        keywords: ['pesquisa', 'ic', 'iniciação científica', 'laboratório', 'ateneu', 'orientador', 'ciência'],
        cta: 'Descobrir Labs'
    },
    {
        id: 'bolsas',
        title: 'Energia de Permanência',
        subtitle: 'Auxílios e Retenção Estudantil.',
        icon: <Coins className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/bolsas',
        description: 'Informações sobre programas de permanência, editais ativos e suporte estudantil.',
        details: [
            'PAPFE: Auxílio Permanência (PRIP)',
            'Editais 2026: Monitoria, Pró-Aluno e IC',
            'Inclusão: Apoio a grupos vulneráveis e PCDs'
        ],
        keywords: ['bolsas', 'papfe', 'permanência', 'monitoria', 'ic', 'iniciação científica', 'dinheiro', 'editais', 'auxílio', 'prip'],
        cta: 'Ver Editais Ativos'
    },
    {
        id: 'ifusp',
        title: 'Estrutura da Matéria',
        subtitle: 'Cursos, PPPs e Departamentos.',
        icon: <Atom className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/ifusp',
        description: 'Guia acadêmico sobre os cursos, governança e estrutura curricular do instituto.',
        details: [
            'Bacharelado, Licenciatura e Física Médica (PPP 2025)',
            'Governança: Papel da CG e CoCs',
            'Grade: Optativas, Eletivas e ATPAs'
        ],
        keywords: ['ppp', 'bacharelado', 'licenciatura', 'física médica', 'grade', 'optativas', 'atpa', 'comissão', 'cg', 'coc'],
        cta: 'Explorar Currículo'
    }
];

const quizCell = {
    id: 'quiz',
    title: 'Teste de Radiação',
    subtitle: 'Quiz de Conhecimento Hub.',
    icon: <Brain className="w-8 h-8" />,
    color: 'brand-red',
    href: '/wiki/quiz',
    description: 'Desafie seus conhecimentos e exploda o contador Geiger ao acertar os desafios.',
    details: [
        'Curiosidades históricas do IFUSP',
        'Desafios de física e divulgação',
        'Ranking de colisão da comunidade'
    ],
    keywords: ['quiz', 'teste', 'desafio', 'conhecimento', 'história', 'ranking', 'geiger'],
    cta: 'Iniciar Varredura'
};

// O Síncrotron Search - Slugs fixos para roteamento [slug]/page.tsx
const slugToPageId: Record<string, string> = {
    'guia-de-boas-praticas': 'guia-de-boas-praticas',
    'calouro': 'calouro',
    'ifusp': 'ifusp',
    'bolsas': 'bolsas',
    'divulgacao': 'divulgacao',
    'protecao': 'protecao',
    'extensao': 'extensao',
    'pesquisa': 'pesquisa',
    'carreira': 'carreira',
    'quiz': 'quiz'
};

export default function WikiPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // --- Search Logic (Keyword Optimized) ---
    const filteredCells = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return wikiCells;

        return wikiCells.filter(cell =>
            cell.title.toLowerCase().includes(query) ||
            cell.subtitle.toLowerCase().includes(query) ||
            cell.description.toLowerCase().includes(query) ||
            cell.keywords.some(k => k.includes(query))
        );
    }, [searchQuery]);

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen bg-[#121212] pt-12 pb-12 px-4 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">

                    {/* --- Elite Header --- */}
                    <div className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <Link href="/colisor" className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Voltar ao Colisor
                            </Link>
                        </motion.div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-14 bg-brand-blue rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-blue/20 ring-1 ring-white/10">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Biblioteca Central</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
                                    WIKI <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">HUB</span>
                                </h1>
                                <p className="text-gray-400 text-lg max-w-xl font-medium leading-relaxed">
                                    O Síncrotron de Conhecimento do IFUSP. O repositório definitivo para sobrevivência, ética e divulgação científica.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-3"
                            >
                                <button className="px-6 py-3 bg-brand-red/10 text-brand-red rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-brand-red hover:text-white transition-all flex items-center gap-2 ring-1 ring-brand-red/20 shadow-lg shadow-brand-red/10">
                                    <AlertCircle className="w-4 h-4" />
                                    Pânico (Reportar)
                                </button>
                            </motion.div>
                        </div>

                        {/* --- Search Engine --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative group max-w-2xl"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-red/20 via-brand-blue/20 to-brand-yellow/20 rounded-[24px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Acesse o conhecimento... (ex: 'Bandejão', 'Plágio', 'Física Médica')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-16 bg-[#1E1E1E] border border-white/5 focus:border-brand-blue/50 rounded-[22px] pl-16 pr-6 text-lg font-medium text-white placeholder:text-gray-600 outline-none transition-all shadow-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* --- Wiki Matrix (Grid de Elite 3x3) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <AnimatePresence mode="popLayout">
                            {filteredCells.map((cell: any, idx) => (
                                <motion.div
                                    key={cell.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                    <Link
                                        href={cell.href}
                                        className={`relative block h-full group bg-[#1E1E1E]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 hover:bg-[#1E1E1E] hover:border-${cell.color}/30 transition-all shadow-2xl overflow-hidden ${cell.glow ? 'ring-1 ring-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : ''}`}
                                    >
                                        {/* Background Glow */}
                                        <div className={`absolute -right-20 -top-20 size-64 bg-${cell.color}/5 blur-[100px] group-hover:bg-${cell.color}/10 transition-colors`}></div>

                                        <div className="relative z-10 flex flex-col h-full">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={`size-16 rounded-[24px] bg-${cell.color}/10 text-${cell.color} flex items-center justify-center ring-1 ring-${cell.color}/20 group-hover:scale-110 group-hover:ring-${cell.color}/50 transition-all duration-500`}>
                                                    {cell.icon}
                                                </div>
                                                <div className="h-2 w-12 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full bg-${cell.color}`}
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: '100%' }}
                                                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Titles */}
                                            <h3 className={`text-2xl font-black text-white mb-1 group-hover:text-${cell.color} transition-colors italic uppercase tracking-tighter`}>
                                                {cell.title}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                                                {cell.subtitle}
                                            </p>

                                            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2">
                                                {cell.description}
                                            </p>

                                            {/* Technical Details (Bullet points) */}
                                            <div className="space-y-2 mb-8">
                                                {cell.details.map((detail: string, dIdx: number) => (
                                                    <div key={dIdx} className="flex items-start gap-2 text-[11px] text-gray-500 font-bold group-hover:text-gray-300 transition-colors">
                                                        <div className={`size-1.5 rounded-full bg-${cell.color}/40 mt-1 cursor-default`} />
                                                        <span>{detail}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer Action */}
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className={`text-[10px] font-black text-${cell.color} uppercase tracking-[0.2em]`}>{cell.cta}</span>
                                                <div className={`size-8 rounded-full bg-${cell.color}/10 flex items-center justify-center text-${cell.color} group-hover:translate-x-1 transition-transform`}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tooltip Simulation (Hidden by default, reveal on interaction if needed) */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-brand-blue/90 text-white text-[10px] font-bold text-center translate-y-full group-hover:translate-y-full transition-transform">
                                            Acesse o guia técnico completo desta seção
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* --- Horizontal Quiz Banner (V4.1) --- */}
                    {!searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="relative group w-full mb-4"
                        >
                            {/* Pulsing Border Effect */}
                            <div className="absolute -inset-0.5 bg-brand-blue/30 rounded-[32px] blur opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>

                            <Link
                                href={quizCell.href}
                                className="relative flex flex-col md:flex-row items-center justify-between w-full p-8 md:p-12 rounded-[32px] bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-2xl border border-white/5 hover:border-brand-blue/40 transition-all overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="size-20 bg-brand-red/10 text-brand-red rounded-[28px] flex items-center justify-center ring-1 ring-brand-red/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-brand-red/20">
                                        {quizCell.icon}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                            <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                                                {quizCell.title}
                                            </h3>
                                            <span className="hidden md:block px-3 py-1 bg-brand-red/20 border border-brand-red/30 text-brand-red text-[10px] font-black uppercase rounded-full">Gamificação</span>
                                        </div>
                                        <p className="text-gray-400 font-medium max-w-md">
                                            {quizCell.description} <span className="text-brand-blue font-bold">Exploda o contador Geiger.</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 md:mt-0 relative z-10">
                                    <div className="px-12 py-5 bg-brand-blue text-white font-black rounded-[24px] group-hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-brand-blue/30">
                                        {quizCell.cta} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )}

                    {/* --- No Results State --- */}
                    {filteredCells.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-[#1E1E1E]/20 rounded-[40px] border border-dashed border-white/10"
                        >
                            <Info className="size-16 text-gray-700 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Colisão sem resultados</h3>
                            <p className="text-gray-500 font-medium">Não encontramos conhecimento com esse padrão. Tente palavras-chave como 'bolsa' ou 'ifusp'.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-8 text-brand-blue font-black text-xs uppercase hover:underline"
                            >
                                Resetar Síncrotron
                            </button>
                        </motion.div>
                    )}

                </div>
            </div>

            {/* Global Tooltip Styles for dynamic colors */}
            <style jsx global>{`
                .bg-brand-blue\/10 { background-color: rgba(0, 150, 255, 0.1); }
                .bg-brand-yellow\/10 { background-color: rgba(255, 193, 7, 0.1); }
                .bg-brand-red\/10 { background-color: rgba(255, 59, 48, 0.1); }
                .text-brand-blue { color: #0096FF; }
                .text-brand-yellow { color: #FFC107; }
                .text-brand-red { color: #FF3B30; }
                .border-brand-blue\/30 { border-color: rgba(0, 150, 255, 0.3); }
                .border-brand-yellow\/30 { border-color: rgba(255, 193, 7, 0.3); }
                .border-brand-red\/30 { border-color: rgba(255, 59, 48, 0.3); }
                .border-brand-blue\/50 { border-color: rgba(0, 150, 255, 0.5); }
                .border-brand-yellow\/50 { border-color: rgba(255, 193, 7, 0.5); }
                .border-brand-red\/50 { border-color: rgba(255, 59, 48, 0.5); }
                .ring-brand-blue\/20 { --tw-ring-color: rgba(0, 150, 255, 0.2); }
                .ring-brand-yellow\/20 { --tw-ring-color: rgba(255, 193, 7, 0.2); }
                .ring-brand-red\/20 { --tw-ring-color: rgba(255, 59, 48, 0.2); }
                .ring-brand-blue\/50 { --tw-ring-color: rgba(0, 150, 255, 0.5); }
                .ring-brand-yellow\/50 { --tw-ring-color: rgba(255, 193, 7, 0.5); }
                .ring-brand-red\/50 { --tw-ring-color: rgba(255, 59, 48, 0.5); }
                .bg-brand-blue { background-color: #0096FF; }
                .bg-brand-yellow { background-color: #FFC107; }
                .bg-brand-red { background-color: #FF3B30; }
                .bg-brand-blue\/40 { background-color: rgba(0, 150, 255, 0.4); }
                .bg-brand-yellow\/40 { background-color: rgba(255, 193, 7, 0.4); }
                .bg-brand-red\/40 { background-color: rgba(255, 59, 48, 0.4); }
                .bg-brand-green\/40 { background-color: rgba(16, 185, 129, 0.4); }
                .bg-brand-blue\/10 { background-color: rgba(0, 150, 255, 0.1); }
                .bg-brand-yellow\/10 { background-color: rgba(255, 193, 7, 0.1); }
                .bg-brand-red\/10 { background-color: rgba(255, 59, 48, 0.1); }
                .bg-brand-green\/10 { background-color: rgba(16, 185, 129, 0.1); }
                .bg-brand-blue\/5 { background-color: rgba(0, 150, 255, 0.05); }
                .bg-brand-yellow\/5 { background-color: rgba(255, 193, 7, 0.05); }
                .bg-brand-red\/5 { background-color: rgba(255, 59, 48, 0.05); }
                .bg-brand-green\/5 { background-color: rgba(16, 185, 129, 0.05); }
                .text-brand-green { color: #10b981; }
                .ring-brand-green\/20 { --tw-ring-color: rgba(16, 185, 129, 0.2); }
                .ring-brand-green\/50 { --tw-ring-color: rgba(16, 185, 129, 0.5); }
                .shadow-brand-blue\/20 { --tw-shadow: 0 20px 25px -5px rgba(0, 150, 255, 0.2), 0 8px 10px -6px rgba(0, 150, 255, 0.2); }
                .shadow-brand-red\/20 { --tw-shadow: 0 20px 25px -5px rgba(255, 59, 48, 0.2), 0 8px 10px -6px rgba(255, 59, 48, 0.2); }
                .shadow-brand-blue\/10 { --tw-shadow: 0 4px 6px -1px rgba(0, 150, 255, 0.1), 0 2px 4px -2px rgba(0, 150, 255, 0.1); }
                .shadow-brand-red\/10 { --tw-shadow: 0 4px 6px -1px rgba(255, 59, 48, 0.1), 0 2px 4px -2px rgba(255, 59, 48, 0.1); }
                .shadow-brand-blue\/40 { --tw-shadow: 0 20px 25px -5px rgba(0, 150, 255, 0.4), 0 10px 10px -5px rgba(0, 150, 255, 0.4); }
            `}</style>
        </MainLayoutWrapper>
    );
}
