import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function OportunidadesPage() {
    const opportunities = [
        {
            type: 'Palestra',
            title: 'Introdução à Astrofísica Moderna',
            date: '15 de Outubro, 14h',
            location: 'Auditório Abrahão de Moraes',
            description: 'Palestra aberta sobre os novos descobrimentos do telescópio James Webb e os buracos negros supermassivos.',
            color: 'brand-blue',
            icon: 'campaign'
        },
        {
            type: 'Vaga',
            title: 'Bolsista de Extensão - DigitalLab',
            date: 'Inscrições até 20 de Outubro',
            location: 'Online / Híbrido',
            description: 'Vaga para estudantes de graduação interessados em produção audiovisual e gestão de mídias sociais para difusão científica.',
            color: 'brand-yellow',
            icon: 'work'
        },
        {
            type: 'Evento',
            title: 'Oficina de Construção de Foguetes',
            date: '25 de Outubro, 09h',
            location: 'Pátio Principal IF-USP',
            description: 'Oficina prática ensinando os princípios de propulsão e aerodinâmica para alunos de ensino médio da rede pública.',
            color: 'brand-red',
            icon: 'rocket_launch'
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 dark:border-gray-800 pb-6 gap-6">
                    <div className="max-w-3xl">
                        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Mural de <span className="text-brand-yellow">Oportunidades</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Fique por dentro das palestras, vagas de extensão e eventos abertos à comunidade no Instituto.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp, index) => (
                        <div key={index} className="bg-white dark:bg-card-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${opp.color}/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150`}></div>

                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <span className={`material-symbols-outlined text-${opp.color} bg-${opp.color}/10 p-2 rounded-lg`}>{opp.icon}</span>
                                <span className="text-sm font-bold tracking-wider uppercase text-gray-500">{opp.type}</span>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white leading-tight">{opp.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">calendar_today</span> {opp.date}
                            </p>

                            <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1 text-sm leading-relaxed">{opp.description}</p>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 mt-auto">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">location_on</span>
                                <span className="text-sm text-gray-500 font-medium">{opp.location}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
