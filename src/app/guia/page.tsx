import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function GuiaPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-blue prose-img:rounded-xl">
                <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <h1 className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
                        Guia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-yellow pr-2">Boas Práticas</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 lead">
                        Como capturar e compartilhar a ciência que acontece no seu laboratório da melhor forma possível.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Seção de Fotografia */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">photo_camera</span>
                            <h2 className="text-3xl m-0">Fotografia no Laboratório</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Iluminação é tudo:</strong> Se possível, fotografe equipamentos perto da janela com luz natural. Se usar luz artificial, evite o flash direto do celular para não criar reflexos em superfícies metálicas ou de vidro.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Foque no detalhe:</strong> Aproxime o celular (use a lente macro, se houver) para mostrar as texturas das placas de Petri, circuitos ou lasers.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">warning</span>
                                <div>
                                    <strong>Cuidado com o fundo:</strong> Tente remover copos de café, cadernos bagunçados ou informações sensíveis (senhas em post-its) do enquadramento antes de fotografar.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Vídeo */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-red">videocam</span>
                            <h2 className="text-3xl m-0">Gravação de VídeosCurtos</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">warning</span>
                                <div>
                                    <strong>Estabilize a imagem:</strong> Use um tripé de celular ou apoie os braços na mesa. Vídeos trêmulos atrapalham a visualização de experimentos delicados.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Formato vertical (9:16):</strong> Se a ideia for divulgar no Instagram Reels ou TikTok, grave sempre com o celular em pé. Para o YouTube clássico, use o formato horizontal.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">check_circle</span>
                                <div>
                                    <strong>Narração clara:</strong> Se for explicar algo em voz alta, encontre um momento em que as bombas de vácuo e exaustores do laboratório estejam desligados, ou aproxime bem o microfone.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Upload */}
                    <section className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <span className="material-symbols-outlined text-4xl text-brand-yellow">cloud_upload</span>
                            <h2 className="text-3xl m-0">Como Fazer o Upload para o Acervo</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">photo_library</span>
                                <div>
                                    <strong>Limites:</strong> Máximo de 10 fotos por envio e tamanho máximo de 10MB.<br />
                                    <span className="text-sm text-gray-500">Explicação: Garante que o site continue rápido e não estoure os limites do servidor.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-red mt-1">smart_display</span>
                                <div>
                                    <strong>Vídeos:</strong> Não fazer upload de vídeos diretos. Eles devem ser upados no YouTube e o link deve ser compartilhado no formulário.<br />
                                    <span className="text-sm text-gray-500">Explicação: Melhora o carregamento e aproveita o player do YouTube.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-green mt-1">person</span>
                                <div>
                                    <strong>Autoria:</strong> O usuário deve preencher nome e contato para mantermos a rede de comunicação.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">assignment_turned_in</span>
                                <div>
                                    <strong>Termo:</strong> Lembrar de assinar/marcar o termo de licenciamento no final do formulário para garantir que o material possa ser usado legalmente por professores.
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
