'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserSubmissions } from '@/app/actions/submissions';
import { MediaCardProps } from '@/components/MediaCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getAvatarUrl } from '@/lib/utils';
import { PasskeyManager } from '@/components/PasskeyManager';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'publicacoes';

    const [user, setUser] = useState<any>(null);
    const [submissions, setSubmissions] = useState<MediaCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            const userSubs = await fetchUserSubmissions(session.user.id);
            setSubmissions(userSubs);
            setIsLoading(false);
        };
        loadData();
    }, [router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const feedbacks = submissions.filter(s => s.admin_feedback);
    const approvedCount = submissions.filter(s => s.status === 'aprovado').length;

    const badges = [
        { id: 'pioneiro', label: 'Pioneiro', icon: 'auto_awesome', requirement: 1, color: 'bg-blue-500', description: 'Enviou sua primeira contribuição aprovada.' },
        { id: 'frequente', label: 'Colaborador Frequente', icon: 'verified', requirement: 3, color: 'bg-green-500', description: 'Três ou mais contribuições aprovadas no acervo.' },
        { id: 'mestre', label: 'Mestre do Acervo', icon: 'military_tech', requirement: 10, color: 'bg-brand-yellow', description: 'Referência em compartilhamento científico (10+ publicações).' },
    ];

    const unlockedBadges = badges.filter(b => approvedCount >= b.requirement);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-background-dark/30">
            <Header />
            <main className="flex-1 pt-12 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header - Instagram Style */}
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 max-w-3xl mx-auto">
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-md">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={getAvatarUrl(user.user_metadata.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl sm:text-7xl text-gray-400">person</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-4 sm:pt-2">
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">{user.user_metadata?.full_name || 'Usuário'}</h1>

                                <div className="flex justify-center sm:justify-start gap-6 pt-1">
                                    <div className="text-center sm:text-left">
                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{submissions.length}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">publicações</span>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{unlockedBadges.length}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">selos</span>
                                    </div>
                                </div>

                                <div className="pt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    <p>{user.email}</p>
                                    <p className="mt-1 text-gray-500">Membro da comunidade Lab-Div.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex justify-center border-t border-gray-200 dark:border-gray-800 mb-8 max-w-3xl mx-auto">
                        {[
                            { id: 'publicacoes', label: 'PUBLICAÇÕES', icon: 'grid_on' },
                            { id: 'selos', label: 'SELOS', icon: 'military_tech' },
                            { id: 'seguranca', label: 'SEGURANÇA', icon: 'lock' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-widest transition-all ${activeTab === tab.id
                                    ? 'text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white -mt-[1px]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? 'filled' : ''}`}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto border-t-0">
                        {activeTab === 'publicacoes' && (
                            <div>
                                {submissions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {submissions.map(sub => (
                                            <a key={sub.id} href={`/arquivo/${sub.id}`} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-2xl cursor-pointer border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                                {sub.mediaType === 'image' ? (
                                                    <img src={Array.isArray(sub.mediaUrl) ? sub.mediaUrl[0] : sub.mediaUrl} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : sub.mediaType === 'video' ? (
                                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-4xl text-white/50">play_circle</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center p-4 text-center">
                                                        <span className="material-symbols-outlined text-4xl text-brand-blue/50 mb-2">article</span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-2">{sub.title}</span>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white">
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <span className="material-symbols-outlined filled text-xl">favorite</span>
                                                        <span>{Math.floor(Math.random() * 50)}</span> {/* TODO: hook up real likes */}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <span className="material-symbols-outlined filled text-xl">mode_comment</span>
                                                        <span>{Math.floor(Math.random() * 20)}</span> {/* TODO: hook up real comments */}
                                                    </div>
                                                </div>

                                                {/* Status pill if not approved */}
                                                {sub.status !== 'aprovado' && (
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider">
                                                        {sub.status === 'pendente' ? 'Análise' : sub.status}
                                                    </div>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 mb-6 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-gray-400">photo_camera</span>
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Compartilhe sua ciência</h2>
                                        <p className="text-gray-500 max-w-xs mx-auto mb-6">Quando você compartilhar artigos, fotos ou vídeos, eles aparecerão no seu perfil.</p>
                                        <button onClick={() => router.push('/enviar')} className="font-bold text-brand-blue hover:text-brand-darkBlue transition-colors">
                                            Fazer primeira submissão
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'selos' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {badges.map(badge => {
                                    const isUnlocked = approvedCount >= badge.requirement;
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`group relative overflow-hidden bg-white dark:bg-card-dark p-6 rounded-3xl border transition-all ${isUnlocked
                                                ? 'border-brand-blue/20 dark:border-brand-blue/30 shadow-lg scale-100'
                                                : 'border-gray-100 dark:border-gray-800 opacity-50 grayscale scale-95'
                                                }`}
                                        >
                                            <div className={`p-4 rounded-2xl inline-flex mb-4 transition-transform group-hover:scale-110 ${isUnlocked ? `${badge.color} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{badge.label}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{badge.description}</p>
                                            {!isUnlocked && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                        Progresso: {approvedCount} / {badge.requirement} submissões
                                                    </p>
                                                </div>
                                            )}
                                            {isUnlocked && (
                                                <div className="absolute top-4 right-4 text-green-500">
                                                    <span className="material-symbols-outlined filled text-xl">check_circle</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'seguranca' && (
                            <PasskeyManager />
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
