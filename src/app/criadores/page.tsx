import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function CriadoresPage() {
    const creators = [
        {
            name: 'Prof. Pedro Alvarez',
            role: 'Pesquisador Titular & Diretor Lab-Div',
            bio: 'Físico experimental apaixonado por levar a mecânica quântica para as escolas de forma simples e visual.',
            imagePlaceholder: 'P',
            color: 'brand-blue'
        },
        {
            name: 'Ana Silva',
            role: 'Bolsista DigitalLab',
            bio: 'Estudante de Astronomia, produz os reels semanais sobre o céu de São Paulo e dicas de observação.',
            imagePlaceholder: 'A',
            color: 'brand-yellow'
        },
        {
            name: 'Lucas Martins',
            role: 'Monitor Acervo Histórico',
            bio: 'Investigador da história da física no Brasil. Responsável por digitalizar e comentar as fotos dos anos 60 do IF.',
            imagePlaceholder: 'L',
            color: 'brand-red'
        },
        {
            name: 'Mariana Costa',
            role: 'Professora Convidada',
            bio: 'Desenvolve materiais didáticos open-source com simulações computacionais em Python interativo.',
            imagePlaceholder: 'M',
            color: 'brand-blue'
        }
    ];

    const influencers = [
        {
            name: 'Agnessa',
            role: 'Estudante & TikToker',
            bio: 'Descomplicando a ciência e mostrando o dia a dia universitário de forma leve.',
            imagePlaceholder: 'A',
            color: 'brand-blue',
            platform: 'tiktok'
        },
        {
            name: 'Canoa',
            role: 'Criador de Conteúdo',
            bio: 'Curiosidades da física e vida acadêmica levadas de forma descontraída ao público.',
            imagePlaceholder: 'C',
            color: 'brand-yellow',
            platform: 'youtube'
        },
        {
            name: 'Pleade',
            role: 'YouTuber & Estudante',
            bio: 'Vídeos interativos, vlogs da rotina e dicas de estudos diretamente do IFUSP.',
            imagePlaceholder: 'P',
            color: 'brand-red',
            platform: 'youtube'
        },
        {
            name: 'Saficadafisica',
            role: 'Influenciadora Científica',
            bio: 'Popularizando a ciência com criatividade, bom humor e muito conhecimento nas redes.',
            imagePlaceholder: 'S',
            color: 'brand-blue',
            platform: 'instagram'
        },
        {
            name: 'Física na Veia',
            role: 'Canal de Divulgação',
            bio: 'Trazendo curiosidades de mecânica clássica e termodinâmica com muito visual.',
            imagePlaceholder: 'F',
            color: 'brand-yellow',
            platform: 'instagram'
        },
        {
            name: 'Astro IF',
            role: 'Astrônomos Amadores',
            bio: 'Dicas práticas de como usar telescópios e registrar astrofotografia.',
            imagePlaceholder: 'A',
            color: 'brand-red',
            platform: 'youtube'
        },
        {
            name: 'Minuto Quântico',
            role: 'TikToker',
            bio: 'Física moderna e relatividade explicadas em vídeos rápidos de 1 minuto.',
            imagePlaceholder: 'M',
            color: 'brand-blue',
            platform: 'tiktok'
        }
    ];

    const getPlatformIcon = (platform: string) => {
        if (platform === 'youtube') return (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
        );
        if (platform === 'instagram') return (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        );
        if (platform === 'tiktok') return (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.36-5.17 2.05-7.11 1.57-1.79 4.11-2.9 6.55-2.73 0 1.34.02 2.69 0 4.03-1.07-.15-2.18.06-3.12.63-1.08.66-1.85 1.83-2.02 3.1-.15 1.14.07 2.34.61 3.32.78 1.45 2.58 2.36 4.19 2.03 2.15-.46 3.65-2.42 3.65-4.66.01-4.8.01-9.61 0-14.41-.01-.57-.01-1.14-.01-1.71h.01z" /></svg>
        );
        return <span className="material-symbols-outlined text-[18px]">open_in_new</span>;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 py-12 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Criadores</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Conheça os estudantes, professores e pesquisadores que estão por trás da curadoria e produção do acervo colaborativo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {creators.map((creator, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`relative w-32 h-32 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${creator.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                    {creator.imagePlaceholder}
                                    <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{creator.name}</h3>
                                <p className={`text-sm font-semibold text-${creator.color} mb-3`}>{creator.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                                    {creator.bio}
                                </p>

                                <div className="flex gap-3 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-28 text-center max-w-2xl mx-auto mb-16">
                        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Influenciadores do <span className="text-brand-yellow">IF-USP</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Acompanhe nossos estudantes espalhando ciência criativa pelo TikTok, YouTube e outras plataformas.
                        </p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-8 no-scrollbar pl-6 md:pl-12 lg:pl-16 pr-6 md:pr-12 lg:pr-16">
                        {influencers.map((influencer, index) => (
                            <div key={index} className="flex flex-col items-center text-center group snap-center shrink-0 w-[260px] md:w-[300px] p-6 bg-white dark:bg-card-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                <div className={`relative w-28 h-28 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${influencer.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                    {influencer.imagePlaceholder}
                                    <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-brand-yellow transition-colors">{influencer.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-wider text-${influencer.color} mb-4`}>{influencer.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                    {influencer.bio}
                                </p>

                                <div className="mt-auto">
                                    <a href="#" className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-${influencer.color} hover:shadow-lg hover:shadow-${influencer.color}/30 transition-all duration-300 transform group-hover:scale-110`} title={`Acessar ${influencer.platform}`}>
                                        {getPlatformIcon(influencer.platform)}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
