'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserSubmissions } from '@/app/actions/submissions';
import { PostDTO } from '@/dtos/media';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getAvatarUrl } from '@/lib/utils';
import { parseMediaUrl, getYoutubeThumbnail, getOptimizedUrl } from '@/lib/media-utils';

import { PseudonymManager } from '@/components/profile/PseudonymManager';
import { User, Grid, Medal, Lock, Image as ImageIcon, PlayCircle, FileText, Heart, MessageSquare, Info, Camera, ExternalLink, ShieldCheck, Play } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import dynamic from 'next/dynamic';



function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'publicacoes';

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [submissions, setSubmissions] = useState<{ post: PostDTO }[]>([]);
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

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setProfile(profileData);



            const userSubs = await fetchUserSubmissions(session.user.id);
            setSubmissions(userSubs || []);
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

    const approvedCount = submissions.filter(s => s.post.status === 'aprovado').length;

    const badges = [
        { id: 'pioneiro', label: 'Pioneiro', icon: <Grid className="w-6 h-6" />, requirement: 1, color: 'bg-blue-500', description: 'Enviou sua primeira contribuição aprovada.' },
        { id: 'frequente', label: 'Colaborador Frequente', icon: <ShieldCheck className="w-6 h-6" />, requirement: 3, color: 'bg-green-500', description: 'Três ou mais contribuições aprovadas no acervo.' },
        { id: 'mestre', label: 'Mestre do Acervo', icon: <Medal className="w-6 h-6" />, requirement: 10, color: 'bg-brand-yellow', description: 'Referência em compartilhamento científico (10+ publicações).' },
    ];

    const unlockedBadges = badges.filter(b => approvedCount >= b.requirement);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-background-dark/30">
            <Header />
            <main className="flex-1 pt-12 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 max-w-3xl mx-auto">
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-md">
                                    <Avatar
                                        src={user.user_metadata?.avatar_url}
                                        name={user.user_metadata?.full_name}
                                        size="custom"
                                        customSize="w-32 h-32 sm:w-40 sm:h-40"
                                    />
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
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {profile?.institute && (
                                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase">
                                                {profile.institute}
                                            </span>
                                        )}
                                        {profile?.role && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded uppercase">
                                                {profile.role}
                                            </span>
                                        )}
                                        {profile?.is_usp_member && profile?.entrance_year && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-bold rounded uppercase">
                                                Ingresso: {profile.entrance_year}
                                            </span>
                                        )}
                                        {!profile?.is_usp_member && profile?.education_level && (
                                            <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red text-[10px] font-bold rounded uppercase">
                                                {profile.education_level} {profile.school_year ? `- ${profile.school_year}` : ''}
                                            </span>
                                        )}
                                        {profile?.available_to_mentor && (
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase border border-green-500/20 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 fill-current" />
                                                Mentor/Veterano
                                            </span>
                                        )}
                                        {profile?.lattes_url && (
                                            <a
                                                href={profile.lattes_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[10px] font-bold rounded uppercase hover:bg-brand-yellow/20 transition-colors flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Lattes
                                            </a>
                                        )}
                                    </div>
                                    {profile?.review_status === 'pending' && (profile?.bio_draft || !profile?.is_public) && (
                                        <div className="mt-4 p-3 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl flex items-center gap-3 animate-pulse">
                                            <Info className="w-4 h-4 text-brand-yellow" />
                                            <p className="text-[10px] font-bold text-brand-yellow uppercase tracking-tight">
                                                Seu perfil está em análise e será publicado em breve.
                                            </p>
                                        </div>
                                    )}

                                    <p className="mt-4 text-gray-500 italic text-[13px] leading-relaxed">
                                        {profile?.bio_draft || profile?.bio || "Membro da comunidade Lab-Div."}
                                    </p>

                                    {profile?.artistic_interests && profile.artistic_interests.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                                            <span className="text-[9px] font-black uppercase text-gray-400 block w-full mb-1">Lado Artístico</span>
                                            {profile.artistic_interests.map((art: string) => (
                                                <span key={art} className="px-2 py-0.5 bg-brand-red/5 text-brand-red text-[9px] font-black rounded-full border border-brand-red/10 uppercase tracking-tighter">
                                                    {art}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center border-t border-gray-200 dark:border-gray-800 mb-8 max-w-3xl mx-auto">
                        {[
                            { id: 'publicacoes', label: 'PUBLICAÇÕES', icon: <Grid className="w-4 h-4" /> },
                            { id: 'selos', label: 'SELOS', icon: <Medal className="w-4 h-4" /> },
                            { id: 'seguranca', label: 'SEGURANÇA', icon: <Lock className="w-4 h-4" /> },
                            { id: 'pseudonimos', label: 'PSEUDÔNIMOS', icon: <User className="w-4 h-4" /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-widest transition-all ${activeTab === tab.id
                                    ? 'text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white -mt-[1px]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto border-t-0">
                        {activeTab === 'publicacoes' && (
                            <div>
                                {submissions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {submissions.map(sub => {
                                            const urls = parseMediaUrl(sub.post.mediaUrl);
                                            const firstMedia = urls[0] || '';
                                            const isImage = sub.post.mediaType === 'image';
                                            const isVideo = sub.post.mediaType === 'video';

                                            let thumbUrl = '';
                                            if (isImage) {
                                                thumbUrl = getOptimizedUrl(firstMedia, 400, 70, sub.post.category, 'image');
                                            } else if (isVideo) {
                                                thumbUrl = getYoutubeThumbnail(firstMedia);
                                            }

                                            return (
                                                <a key={sub.post.id} href={`/arquivo/${sub.post.id}`} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-2xl cursor-pointer border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                                    {thumbUrl ? (
                                                        <>
                                                            <img
                                                                src={thumbUrl}
                                                                alt={sub.post.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            {isVideo && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                                        <Play className="w-6 h-6 text-white fill-current" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : sub.post.mediaType === 'pdf' ? (
                                                        <div className="w-full h-full bg-brand-yellow/5 dark:bg-brand-yellow/10 flex flex-col items-center justify-center p-4 text-center">
                                                            <FileText className="w-12 h-12 text-brand-yellow/50 mb-2" />
                                                            <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest leading-tight px-4">{sub.post.title}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full bg-brand-blue/5 dark:bg-brand-blue/10 flex flex-col items-center justify-center p-4 text-center">
                                                            <FileText className="w-12 h-12 text-brand-blue/50 mb-2" />
                                                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-tight px-4">{sub.post.title}</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white">
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <Heart className="w-5 h-5 fill-current" />
                                                            <span>{sub.post.likeCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <MessageSquare className="w-5 h-5 fill-current" />
                                                            <span>{sub.post.commentCount}</span>
                                                        </div>
                                                    </div>

                                                    {sub.post.status !== 'aprovado' && (
                                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider">
                                                            {sub.post.status === 'pendente' ? 'Análise' : sub.post.status}
                                                        </div>
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 mb-6 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                            <Camera className="w-12 h-12 text-gray-400" />
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
                                                {badge.icon}
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
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'seguranca' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold dark:text-white">Segurança da Conta</h3>
                                <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center min-h-[150px] text-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">lock</span>
                                    <p className="text-gray-500 font-medium">Você utiliza autenticação delegada do sistema (Google, GitHub ou Email Seguro). Para redefinir sua senha, solicite-a no Login.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pseudonimos' && (
                            <PseudonymManager />
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
