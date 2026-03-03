'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MainLayoutWrapper
} from '@/components/layout/MainLayoutWrapper';
import {
    Breadcrumbs,
    TechnicalAccordion,
    DataCard,
    ActionButton,
    ContentSection
} from '@/components/wiki/WikiComponents';
import {
    ShieldCheck,
    Zap,
    Atom,
    Coins,
    Telescope,
    Brain,
    HeartHandshake,
    Network,
    Microscope,
    Compass,
    FileText,
    Calendar,
    Users,
    Download,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

// --- TECHNICAL DATA SHARD ---
const pageContent: Record<string, any> = {
    'boas-praticas': {
        title: 'Guia de Boas Práticas',
        subtitle: 'Produção, Créditos e Qualidade Hub',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Co-autoria e Créditos',
                content: 'A ciência é um esforço coletivo. No Hub de Comunicação Científica, incentivamos que você marque todos os colaboradores que participaram da criação do material. Use o campo de co-autores para buscar perfis ou cite nomes diretamente no campo de autores para garantir os devidos créditos.'
            },
            {
                title: 'Fotografia no Laboratório',
                content: 'Priorize luz natural suave. Evite o flash direto que gera reflexos indesejados em vidrarias ou metais. No enquadramento, mostre o experimento em contexto, mas capture "close-ups" dos detalhes técnicos que realmente importam para a explicação.'
            },
            {
                title: 'Produção de Vídeo',
                content: 'Estabilidade é a chave para uma boa divulgação: utilize tripés ou superfícies fixas. Garanta um áudio limpo, evitando ruídos de compressores ou ar-condicionado. Narre o processo para guiar o espectador através da colisão de ideias.'
            },
            {
                title: 'Padrões Técnicos',
                content: 'Imagens devem estar em PNG ou JPG de alta resolução (até 10MB). Para vídeos, utilize o formato MP4. Documentos técnicos e guias devem ser submetidos em PDF para garantir a integridade da formatação original.'
            },
            {
                title: 'Categorias e Objetivos',
                content: 'Cada categoria no Hub (Refração, Síncrotron, Colisor) possui objetivos distintos. Certifique-se de que sua submissão está alinhada com o propósito da seção para maximizar o impacto da sua comunicação científica.'
            }
        ],
        dates: [
            { label: 'Versão', value: 'v4.2.0' },
            { label: 'Revisão', value: 'Março/2026' }
        ],
        actions: [
            { label: 'Baixar Checklist', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Ver Exemplos', icon: <Telescope className="w-4 h-4" />, href: '#' }
        ]
    },
    'calouro': {
        title: 'Iniciação de Partículas',
        subtitle: 'Guia de Sobrevivência Matão 1371',
        icon: <Zap className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Logística do Campus',
                content: 'Navegação entre o Edifício Principal, Ala Central (Laboratórios) e Ala Didática. Dicas de horários dos circulares e segurança no período noturno.'
            },
            {
                title: 'Bandejão e SAS',
                content: 'Como carregar créditos no cartão USP via Júpiter Web ou APP. Localização das unidades de alimentação e cardápios em tempo real.'
            },
            {
                title: 'Checklist Matrícula',
                content: 'Primeiros passos no Júpiter Web, criação do e-mail @usp.br e acesso às bibliotecas virtuais e físicas do instituto.'
            }
        ],
        dates: [
            { label: 'Boas-vindas', value: 'Março/2026' },
            { label: 'Unidades SAS', value: '3 Centrais' }
        ],
        actions: [
            { label: 'Acessar Júpiter', icon: <ExternalLink className="w-4 h-4" />, href: 'https://jupiterweb.usp.br' },
            { label: 'Mapa do Matão', icon: <Download className="w-4 h-4" />, href: '#' }
        ]
    },
    'ifusp': {
        title: 'Estrutura da Matéria',
        subtitle: 'Matrizes Curriculares e Governança',
        icon: <Atom className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'PPPs 2025',
                content: 'Detalhamento dos Projetos Político-Pedagógicos para Bacharelado, Licenciatura e Física Médica. Entenda os fluxogramas técnicos sugeridos.'
            },
            {
                title: 'Comissões CG/CoC',
                content: 'O papel da Comissão de Graduação e das Comissões de Curso na vida do estudante. Saiba como protocolar requerimentos e petições.'
            },
            {
                title: 'ATPAs e Optativas',
                content: 'Guia de Atividades Teórico-Práticas Aprofundadas. Saiba como validar horas de pesquisa e extensão para integralização do curso.'
            }
        ],
        dates: [
            { label: 'PPP Atual', value: 'V.2025' },
            { label: 'Créditos Totais', value: 'Varia por curso' }
        ],
        actions: [
            { label: 'Baixar Matriz', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Portal CG IFUSP', icon: <ExternalLink className="w-4 h-4" />, href: '#' }
        ]
    },
    'bolsas': {
        title: 'Energia de Permanência',
        subtitle: 'Editais e Auxílio Estudantil',
        icon: <Coins className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'PAPFE 2026',
                content: 'O Programa de Apoio à Permanência e Formação Estudantil. Informações sobre auxílio moradia, alimentação e transporte para estudantes em vulnerabilidade.'
            },
            {
                title: 'Bolsas Monitoria',
                content: 'Oportunidades para atuar como monitor em disciplinas de graduação e laboratórios didáticos. Requisitos: Aprovação na disciplina e bom rendimento.'
            },
            {
                title: 'Iniciação Científica',
                content: 'Como ingressar em projetos de pesquisa com fomento (FAPESP, CNPq, Santander). Explore os laboratórios do IF desde o primeiro ano.'
            }
        ],
        dates: [
            { label: 'PAPFE Início', value: '12/JAN/2026' },
            { label: 'PAPFE Fim', value: '10/FEV/2026' }
        ],
        actions: [
            { label: 'Editais Ativos', icon: <Calendar className="w-4 h-4" />, href: '#' },
            { label: 'Portal PRIP', icon: <ExternalLink className="w-4 h-4" />, href: '#' }
        ]
    },
    'divulgacao': {
        title: 'Emissão de Luz',
        subtitle: 'Toolkit de Impacto Visual Hub',
        icon: <Telescope className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Visual LabDiv',
                content: 'Guia de marca: Uso do "Azul Elétrico", tipografia Outfit e padrões de design para posters acadêmicos e redes sociais.'
            },
            {
                title: 'Guia MIT Style',
                content: 'Metodologia baseada no MIT Communication Lab para simplificar dados técnicos sem perder a precisão científica.'
            },
            {
                title: 'Mídias Imersivas',
                content: 'Tutoriais para produção de vídeos 360°, realidade virtual e visualizações de dados complexos em 3D.'
            }
        ],
        dates: [
            { label: 'Toolkit V', value: '3.1.5' },
            { label: 'Linguagem', value: 'Multimodal' }
        ],
        actions: [
            { label: 'Baixar Assets', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Tutorial VR', icon: <Brain className="w-4 h-4" />, href: '#' }
        ]
    },
    'protecao': {
        title: 'Protocolos de Proteção',
        subtitle: 'Bem-estar e Pertencimento',
        icon: <HeartHandshake className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Guia Direitos TEA',
                content: 'Apoio técnico para estudantes autistas. Conheça as adaptações razoáveis e as rotas de suporte pedagógico personalizado.'
            },
            {
                title: 'Acolhimento Psicológico',
                content: 'Contatos do IP-USP (Apoio à Carreira e Saúde Mental) e rede de psicólogos voluntários no campus.'
            },
            {
                title: 'Ouvidoria de Inclusão',
                content: 'Canais seguros para denúncias de assédio, preconceito ou falha em protocolos de acessibilidade. Sigilo Garantido.'
            }
        ],
        dates: [
            { label: 'Suporte', value: '24/7 (Online)' },
            { label: 'Emergência', value: 'Ramal 9999' }
        ],
        actions: [
            { label: 'Solicitar Apoio', icon: <Users className="w-4 h-4" />, href: '#' },
            { label: 'Ler Portaria', icon: <FileText className="w-4 h-4" />, href: '#' }
        ]
    },
    'extensao': {
        title: 'Interações de Fronteira',
        subtitle: 'Cultura e Extensão IFUSP',
        icon: <Network className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Catálogo de Grupos',
                content: 'Explore os diversos grupos de extensão do instituto, desde astronomia amadora até física médica aplicada. Oportunidades para todos os períodos.'
            },
            {
                title: 'Física para Todos',
                content: 'Série de palestras e eventos de divulgação científica aberta à comunidade. Saiba como participar da organização ou sugerir novos temas.'
            },
            {
                title: 'Propor Projetos',
                content: 'Guia para estudantes que desejam criar novos projetos de cultura e extensão. Saiba como obter apoio institucional e validação de créditos.'
            }
        ],
        dates: [
            { label: 'Grupos Ativos', value: '15+ Unidades' },
            { label: 'Validação', value: 'ATPA/Ext' }
        ],
        actions: [
            { label: 'Ver Catálogo', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Próximos Eventos', icon: <Calendar className="w-4 h-4" />, href: '#' }
        ]
    },
    'quiz': {
        title: 'Teste de Radiação',
        subtitle: 'Gamificação e Conhecimento Hub',
        icon: <Brain className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Contador Geiger',
                content: 'Acerte as questões técnicas e históricas para explodir o contador Geiger no seu perfil do Hub. Quanto mais colidido seu conhecimento, maior seu impacto na comunidade.'
            },
            {
                title: 'Curiosidades IF',
                content: 'Você sabia que o acelerador Pelletron foi inaugurado em 1972? Teste seu conhecimento sobre o patrimônio científico da Rua do Matão.'
            },
            {
                title: 'Desafios de Física',
                content: 'Problemas conceituais rápidos para aquecer os neurônios entre uma aula e outra. Colisões mentais de alta energia.'
            }
        ],
        dates: [
            { label: 'Perguntas', value: '50+' },
            { label: 'Dificuldade', value: 'Síncrotron' }
        ],
        actions: [
            { label: 'Iniciar Quiz', icon: <Zap className="w-4 h-4" />, href: '#' },
            { label: 'Ver Ranking', icon: <Telescope className="w-4 h-4" />, href: '#' }
        ]
    },
    'pesquisa': {
        title: 'Sistemas de Pesquisa',
        subtitle: 'IC e Ciência Experimental',
        icon: <Microscope className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Iniciação Científica',
                content: 'O guia completo para ingressar na pesquisa. Desde a escolha do orientador até o relatório final e a apresentação no SIICUSP.'
            },
            {
                title: 'Laboratórios do IF',
                content: 'Navegação técnica pelos departamentos: Física Experimental, Nuclear, Materiais e Teórica. Conheça as linhas de pesquisa de ponta.'
            },
            {
                title: 'Sistema Ateneu',
                content: 'Tutorial de uso do sistema Ateneu para cadastro de projetos, acompanhamento de bolsas e submissão de frequências mensais.'
            }
        ],
        dates: [
            { label: 'Editais', value: 'Fluxo Contínuo' },
            { label: 'Ateneu V', value: 'Integração USP' }
        ],
        actions: [
            { label: 'Acessar Ateneu', icon: <ExternalLink className="w-4 h-4" />, href: 'https://ateneu.usp.br' },
            { label: 'Lista de Labs', icon: <Download className="w-4 h-4" />, href: '#' }
        ]
    },
    'carreira': {
        title: 'Vetores de Carreira',
        subtitle: 'Trajetórias Pós-IFUSP',
        icon: <Compass className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Carreira Acadêmica',
                content: 'O caminho do Mestrado ao Pós-Doutorado. Dicas para exames de ingresso (EUF) e busca por fomento nacional e internacional.'
            },
            {
                title: 'Física na Indústria',
                content: 'Setores de inovação: Ciência de Dados, Física Médica, Óptica de precisão e instituições financeiras. Onde os físicos colidem com o mercado.'
            },
            {
                title: 'Educação e Ensino',
                content: 'Oportunidades na Licenciatura, cursinhos populares, colégios de elite e divulgação científica profissional.'
            }
        ],
        dates: [
            { label: 'Egresso', value: 'Mapeamento 2026' },
            { label: 'Mercado', value: 'Alta Demanda' }
        ],
        actions: [
            { label: 'Guia do Egresso', icon: <FileText className="w-4 h-4" />, href: '#' },
            { label: 'Fórum Carreira', icon: <Users className="w-4 h-4" />, href: '#' }
        ]
    }
};

export default function WikiSubPage() {
    const params = useParams();
    const slug = params.slug as string;
    const content = pageContent[slug];

    if (!content) {
        return (
            <MainLayoutWrapper>
                <div className="min-h-screen bg-[#121212] pt-24 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-20 h-20 text-brand-red mx-auto mb-6 opacity-20" />
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Partícula não encontrada</h1>
                        <Link href="/wiki" className="mt-8 inline-block text-brand-blue font-black uppercase tracking-widest hover:underline">
                            Voltar ao Síncrotron
                        </Link>
                    </div>
                </div>
            </MainLayoutWrapper>
        );
    }

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen bg-[#121212] pt-16 pb-24 px-4 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">

                    <Breadcrumbs slug={slug} title={content.title} />

                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* --- Main Content Col (70%) --- */}
                        <div className="lg:w-[70%] order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-6 mb-12">
                                    <div className={`size-20 rounded-[32px] bg-${content.color}/10 text-${content.color} flex items-center justify-center ring-1 ring-${content.color}/20 shadow-2xl shadow-${content.color}/10`}>
                                        {content.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                                            {content.title}
                                        </h1>
                                        <p className="text-brand-blue text-xs font-black uppercase tracking-[0.3em]">
                                            {content.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {content.sections.map((section: any, idx: number) => (
                                    <ContentSection key={idx} title={section.title}>
                                        <TechnicalAccordion title={`Mais sobre ${section.title}`}>
                                            {section.content}
                                        </TechnicalAccordion>
                                        <p className="text-gray-400 font-medium leading-relaxed bg-white/2 p-8 rounded-[40px] border border-white/5">
                                            {section.content}
                                        </p>
                                    </ContentSection>
                                ))}
                            </motion.div>
                        </div>

                        {/* --- Sidebar Info (30%) --- */}
                        <aside className="lg:w-[30%] order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="sticky top-24 space-y-8"
                            >
                                {/* Dates/DataCards */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Métricas de Colisão</h4>
                                    {content.dates.map((date: any, idx: number) => (
                                        <DataCard key={idx} label={date.label} value={date.value} color={content.color} />
                                    ))}
                                </div>

                                {/* Actions/ActionButtons */}
                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Ações Rápidas</h4>
                                    {content.actions?.map((action: any, idx: number) => (
                                        <ActionButton key={idx} label={action.label} icon={action.icon} href={action.href} variant={idx === 0 ? 'primary' : 'secondary'} />
                                    ))}
                                </div>

                                {/* Support Card */}
                                <div className="p-8 bg-gradient-to-br from-brand-red/10 to-transparent border border-white/5 rounded-[40px] mt-12">
                                    <AlertCircle className="w-8 h-8 text-brand-red mb-4" />
                                    <h5 className="text-sm font-black text-white uppercase italic mb-2">Dúvida Técnica?</h5>
                                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-6">Utilize o botão de Pânico no topo para reportar flutuações de dados incorretas.</p>
                                    <Link href="/perguntas" className="text-xs font-black text-brand-red uppercase hover:underline">Abrir Ticket</Link>
                                </div>
                            </motion.div>
                        </aside>

                    </div>
                </div>
            </div>

            {/* Re-injecting Global Tooltip Color Classes (Defensive) */}
            <style jsx global>{`
                .ring-brand-green\/10 { --tw-ring-color: rgba(16, 185, 129, 0.1); }
                .shadow-brand-green\/10 { --tw-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -2px rgba(16, 185, 129, 0.1); }
                .bg-brand-green\/10 { background-color: rgba(16, 185, 129, 0.1); }
                .text-brand-green { color: #10b981; }
                .bg-brand-blue\/10 { background-color: rgba(0, 150, 255, 0.1); }
                .text-brand-blue { color: #0096FF; }
                .bg-brand-red\/10 { background-color: rgba(255, 59, 48, 0.1); }
                .shadow-brand-red\/10 { --tw-shadow: 0 4px 6px -1px rgba(255, 59, 48, 0.1), 0 2px 4px -2px rgba(255, 59, 48, 0.1); }
            `}</style>
        </MainLayoutWrapper>
    );
}
