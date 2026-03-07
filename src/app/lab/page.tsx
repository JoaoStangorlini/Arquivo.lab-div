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

import { User, Grid, Medal, Star, Image as ImageIcon, PlayCircle, FileText, Heart, MessageSquare, Info, Camera, ExternalLink, ShieldCheck, Play, UserPlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { RadiationBadge } from '@/components/gamification/RadiationBadge';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { RadiationTab } from '@/components/gamification/RadiationTab';
import { MatchAcademicoTab } from '@/components/profile/MatchAcademicoTab';
import { Profile } from '@/types';



import { Avatar } from '@/components/ui/Avatar';


function LabContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'publicacoes';

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
    const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState<{ post: PostDTO }[]>([]);
    const [savedPosts, setSavedPosts] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [adoptionStatus, setAdoptionStatus] = useState<'pending' | 'approved' | null>(null);


    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }
                setCurrentUser(session.user);

                // Fetch current user's profile (for authorization)
                const { data: currProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                setCurrentUserProfile(currProfile);

                // Determine target user
                const targetUserId = searchParams.get('user') || session.user.id;
                const isViewingOwn = targetUserId === session.user.id;

                // Fetch viewed profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .maybeSingle();

                setViewedProfile(profileData);

                // Auto-open Edit Profile Modal if critical info is missing (first visit essentially)
                if (isViewingOwn && profileData && !profileData.institute && !profileData.course && !profileData.bio) {
                    setIsEditModalOpen(true);
                }

                const targetSubId = targetUserId;
                const userSubs = await fetchUserSubmissions(targetSubId);
                setSubmissions(userSubs || []);

                // Fetch saved/starred posts
                const { data: saves } = await supabase
                    .from('saves')
                    .select('submission_id')
                    .eq('user_id', session.user.id);

                if (saves && saves.length > 0) {
                    const ids = saves.map(s => s.submission_id);
                    const { data: savedSubs } = await supabase
                        .from('submissions')
                        .select('id, title, authors, description, media_url, media_type, category, status, like_count, comment_count, save_count, view_count, created_at, is_featured')
                        .in('id', ids)
                        .eq('status', 'aprovado');

                    if (savedSubs) {
                        setSavedPosts(savedSubs.map(s => ({
                            id: s.id,
                            title: s.title,
                            authors: s.authors,
                            description: s.description || '',
                            mediaUrl: s.media_url,
                            mediaType: s.media_type,
                            category: s.category,
                            status: s.status,
                            likeCount: s.like_count || 0,
                            commentCount: s.comment_count || 0,
                            saveCount: s.save_count || 0,
                            viewCount: s.view_count || 0,
                            createdAt: s.created_at,
                            isFeatured: s.is_featured || false,
                        })));
                    }
                }

                // Fetch adoption status if viewing another profile
                if (targetUserId !== session.user.id) {
                    const { data: adoptionData } = await supabase
                        .from('adoptions')
                        .select('status')
                        .eq('mentor_id', session.user.id)
                        .eq('freshman_id', targetUserId)
                        .maybeSingle();

                    if (adoptionData) {
                        setAdoptionStatus(adoptionData.status as any);
                    } else {
                        setAdoptionStatus(null);
                    }
                } else {
                    setAdoptionStatus(null);
                }
            } catch (error) {
                console.error("Error loading lab data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [router, searchParams]);



    if (isLoading || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const approvedCount = submissions.filter(s => s.post.status === 'aprovado').length;


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-background-dark/30">
            <Header />
            <main className="flex-1 pt-12 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 max-w-3xl mx-auto">
                            <div className="relative shrink-0">
                                <Avatar
                                    src={viewedProfile?.avatar_url}
                                    name={(viewedProfile?.use_nickname && viewedProfile?.username) ? viewedProfile.username : (viewedProfile?.full_name || 'Usuário')}
                                    size="custom"
                                    customSize="w-32 h-32 sm:w-40 sm:h-40"
                                    xp={viewedProfile?.xp}
                                    level={viewedProfile?.level}
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-4 sm:pt-2">
                                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                                    {(viewedProfile?.use_nickname && viewedProfile?.username) ? viewedProfile.username : (viewedProfile?.full_name || 'Usuário')}
                                    <span className="text-xs font-black uppercase text-brand-blue bg-brand-blue/10 px-2 py-1 rounded">
                                        {viewedProfile?.id === currentUser.id ? 'Laboratório Pessoal' : 'Laboratório Externo'}
                                    </span>
                                    {viewedProfile && <RadiationBadge xp={viewedProfile.xp || 0} level={viewedProfile.level || 1} size="md" showTierName />}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-1">
                                    <div className="text-center sm:text-left">
                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{submissions.length}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">publicações</span>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{viewedProfile?.level || 1}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">nível</span>
                                    </div>

                                    {viewedProfile?.id === currentUser.id ? (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="sm:ml-4 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Editar Perfil
                                        </button>
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => router.push('/lab')}
                                                className="sm:ml-4 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">person</span>
                                                Meu Perfil
                                            </button>

                                            {currentUserProfile?.available_to_mentor && viewedProfile?.seeking_mentor && (
                                                <button
                                                    onClick={async () => {
                                                        if (adoptionStatus) return;
                                                        const { requestAdoption } = await import('@/app/actions/profiles');
                                                        const { toast } = await import('react-hot-toast');
                                                        const res = await requestAdoption(viewedProfile!.id);
                                                        if (res.success) {
                                                            toast.success('Solicitação de adoção enviada ao ADM!');
                                                            setAdoptionStatus('pending');
                                                        } else {
                                                            toast.error(res.error || 'Erro ao solicitar adoção');
                                                        }
                                                    }}
                                                    disabled={!!adoptionStatus}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${adoptionStatus === 'approved'
                                                        ? 'bg-green-500 text-white cursor-default'
                                                        : adoptionStatus === 'pending'
                                                            ? 'bg-gray-400 text-white cursor-default'
                                                            : 'bg-brand-yellow text-black hover:bg-brand-yellow/90 shadow-brand-yellow/20'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {adoptionStatus === 'approved' ? 'check_circle' : adoptionStatus === 'pending' ? 'schedule' : 'favorite'}
                                                    </span>
                                                    {adoptionStatus === 'approved' ? 'Adotado' : adoptionStatus === 'pending' ? 'Pedido Pendente' : 'Adotar Bixo'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    {viewedProfile?.id === currentUser.id && <p>{currentUser.email}</p>}
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {viewedProfile?.institute && (
                                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase">
                                                {viewedProfile.institute}
                                            </span>
                                        )}
                                        {viewedProfile?.course && (
                                            <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[10px] font-bold rounded uppercase">
                                                {viewedProfile.course}
                                            </span>
                                        )}
                                        {viewedProfile?.role && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded uppercase">
                                                {viewedProfile.role}
                                            </span>
                                        )}
                                        {viewedProfile?.is_usp_member && viewedProfile?.entrance_year && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-bold rounded uppercase">
                                                Ingresso: {viewedProfile.entrance_year}
                                            </span>
                                        )}
                                        {!viewedProfile?.is_usp_member && viewedProfile?.education_level && (
                                            <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red text-[10px] font-bold rounded uppercase">
                                                {viewedProfile.education_level} {viewedProfile.school_year ? `- ${viewedProfile.school_year}` : ''}
                                            </span>
                                        )}
                                        {viewedProfile?.available_to_mentor && (
                                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase border border-brand-blue/20 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 fill-current" />
                                                Mentor/Veterano
                                            </span>
                                        )}
                                        {viewedProfile?.seeking_mentor && (
                                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase border border-brand-blue/20 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">person_search</span>
                                                Bixo / Buscando Adotante
                                            </span>
                                        )}
                                        {viewedProfile?.lattes_url && (
                                            <a
                                                href={viewedProfile.lattes_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[10px] font-bold rounded uppercase hover:bg-brand-yellow/20 transition-colors flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Lattes
                                            </a>
                                        )}
                                    </div>
                                    {viewedProfile?.id === currentUser.id && viewedProfile?.review_status === 'pending' && (viewedProfile?.bio_draft || !viewedProfile?.is_public) && (
                                        <div className="mt-4 p-3 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl flex items-center gap-3 animate-pulse">
                                            <Info className="w-4 h-4 text-brand-yellow" />
                                            <p className="text-[10px] font-bold text-brand-yellow uppercase tracking-tight">
                                                Seu perfil está em análise e será publicado em breve.
                                            </p>
                                        </div>
                                    )}

                                    <p className="mt-4 text-gray-500 italic text-[13px] leading-relaxed">
                                        {viewedProfile?.bio_draft || viewedProfile?.bio || (viewedProfile?.id === currentUser.id ? "Seu laboratório pessoal está quase pronto!" : "Membro da comunidade Lab-Div.")}
                                    </p>

                                    {viewedProfile?.artistic_interests && viewedProfile.artistic_interests.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                                            <span className="text-[9px] font-black uppercase text-gray-400 block w-full mb-1">Lado Artístico / Hobbies</span>
                                            {viewedProfile.artistic_interests.map((art: string, index: number) => {
                                                const colors = [
                                                    { text: 'text-brand-blue', bg: 'bg-brand-blue/5', border: 'border-brand-blue/10' },
                                                    { text: 'text-brand-yellow', bg: 'bg-brand-yellow/5', border: 'border-brand-yellow/10' },
                                                    { text: 'text-brand-red', bg: 'bg-brand-red/5', border: 'border-brand-red/10' }
                                                ];
                                                const color = colors[index % colors.length];
                                                return (
                                                    <span key={art} className={`px-2 py-0.5 ${color.bg} ${color.text} text-[9px] font-black rounded-full border ${color.border} uppercase tracking-tighter transition-all hover:scale-105`}>
                                                        {art}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center border-t border-gray-200 dark:border-gray-800 mb-8 max-w-3xl mx-auto">
                        {[
                            { id: 'publicacoes', label: 'PUBLICAÇÕES', icon: <Grid className="w-4 h-4" /> },
                            { id: 'radiacao', label: 'RADIAÇÃO', icon: <span className="text-sm">☢️</span> },
                            ...(viewedProfile?.id === currentUser.id ? [{ id: 'match', label: 'MATCH ACADÊMICO', icon: <UserPlus className="w-4 h-4" /> }] : []),
                            { id: 'estrelados', label: 'CONSTELAÇÃO', icon: <Star className="w-4 h-4" /> },
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

                        {activeTab === 'radiacao' && viewedProfile && (
                            <RadiationTab profile={{ id: viewedProfile.id, xp: viewedProfile.xp || 0, level: viewedProfile.level || 1 }} />
                        )}

                        {activeTab === 'match' && viewedProfile?.id === currentUser.id && (
                            <MatchAcademicoTab isMentor={currentUserProfile?.available_to_mentor || false} />
                        )}

                        {activeTab === 'estrelados' && (
                            <div>
                                {savedPosts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {savedPosts.map(post => {
                                            const urls = parseMediaUrl(post.mediaUrl);
                                            const firstMedia = urls[0] || '';
                                            const isImage = post.mediaType === 'image';
                                            const isVideo = post.mediaType === 'video';

                                            let thumbUrl = '';
                                            if (isImage) {
                                                thumbUrl = getOptimizedUrl(firstMedia, 400, 70, post.category, 'image');
                                            } else if (isVideo) {
                                                thumbUrl = getYoutubeThumbnail(firstMedia);
                                            }

                                            return (
                                                <a key={post.id} href={`/arquivo/${post.id}`} className="group relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-2xl cursor-pointer border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
                                                    {thumbUrl ? (
                                                        <>
                                                            <img src={thumbUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            {isVideo && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                                        <Play className="w-6 h-6 text-white fill-current" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full bg-brand-yellow/5 dark:bg-brand-yellow/10 flex flex-col items-center justify-center p-4 text-center">
                                                            <FileText className="w-12 h-12 text-brand-yellow/50 mb-2" />
                                                            <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest leading-tight px-4">{post.title}</span>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2 right-2">
                                                        <Star className="w-5 h-5 text-brand-yellow fill-current" />
                                                    </div>

                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white">
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <Heart className="w-5 h-5 fill-current" />
                                                            <span>{post.likeCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold">
                                                            <MessageSquare className="w-5 h-5 fill-current" />
                                                            <span>{post.commentCount}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-24 h-24 mb-6 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                            <Star className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Constelação vazia</h2>
                                        <p className="text-gray-500 max-w-xs mx-auto">Clique na ⭐ estrela nos posts para adicioná-los à sua constelação.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />


            {/* Modals */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    const fetchProfile = async () => {
                        if (currentUser) {
                            const { data } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', currentUser.id)
                                .single();
                            setCurrentUserProfile(data);
                            if (viewedProfile?.id === currentUser.id) {
                                setViewedProfile(data);
                            }
                        }
                    };
                    fetchProfile();
                }}
            />
        </div>
    );
}

export default function LabPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LabContent />
        </Suspense>
    );
}
