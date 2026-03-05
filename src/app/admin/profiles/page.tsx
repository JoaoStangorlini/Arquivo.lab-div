'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { approveProfile, getEnrollmentProofUrl } from '@/app/actions/profiles';
import { Loader2, Check, X, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    institute: string;
    role: string;
    review_status: string;
    bio: string;
    is_usp_member: boolean;
    created_at: string;
    username?: string;
    use_nickname?: boolean;
    lattes_url?: string;
    usp_status?: string;
    entrance_year?: number;
    course?: string;
    whatsapp?: string;
    artistic_interests?: string[];
    education_level?: string;
    major?: string;
    available_to_mentor: boolean;
    seeking_mentor: boolean;
    usp_proof_url?: string;
    pending_edits?: any;
}

export default function ProfileApprovalPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('review_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Erro ao carregar perfis.");
        } else {
            setProfiles(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleApprove = async (id: string) => {
        setIsProcessing(id);
        const res = await approveProfile(id);
        if (res.success) {
            toast.success("Perfil aprovado!");
            setProfiles(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error(res.error || "Erro ao aprovar perfil.");
        }
        setIsProcessing(null);
    };

    const handleReject = async (id: string) => {
        setIsProcessing(id);
        const { error } = await supabase
            .from('profiles')
            .update({
                review_status: 'rejected',
                pending_edits: null
            })
            .eq('id', id);

        if (error) {
            toast.error("Erro ao rejeitar perfil.");
        } else {
            toast.success("Perfil rejeitado.");
            setProfiles(prev => prev.filter(p => p.id !== id));
        }
        setIsProcessing(null);
    };

    const handleViewProof = async (path: string) => {
        const loadingToast = toast.loading('Gerando link seguro...');
        const res = await getEnrollmentProofUrl(path);
        if (res.success && res.url) {
            toast.dismiss(loadingToast);
            window.open(res.url, '_blank', 'noopener,noreferrer');
        } else {
            toast.dismiss(loadingToast);
            toast.error(res.error || 'Erro ao carregar comprovante');
        }
    };

    const renderDiff = (current: any, pending: any, label: string) => {
        // Only skip if the field is not present in updates or hasn't changed
        // We normalize null/undefined/false to a comparable state
        const normalize = (val: any) => {
            if (val === true) return 'SIM';
            if (val === false) return 'NÃO';
            return val || '';
        };

        const normalizedCurrent = normalize(current);
        const normalizedPending = pending === undefined ? normalizedCurrent : normalize(pending);

        if (normalizedCurrent === normalizedPending) return null;

        const isLongText = typeof normalizedPending === 'string' && normalizedPending.length > 50;
        const isRemoval = normalizedPending === '' && normalizedCurrent !== '';

        return (
            <div className={`space-y-2 bg-white/5 p-4 rounded-2xl border ${isRemoval ? 'border-brand-red/20' : 'border-brand-green/20'} ${isLongText ? 'col-span-full' : ''}`}>
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0055ff]">{label}</p>
                    {isRemoval && (
                        <span className="text-[8px] font-black bg-brand-red/20 text-brand-red px-2 py-0.5 rounded uppercase">Removendo Content</span>
                    )}
                </div>

                <div className={`grid ${isLongText ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
                    <div className="space-y-1">
                        <span className="text-[8px] uppercase text-gray-500 font-bold block">Valor Atual</span>
                        <div className="text-xs text-gray-400 bg-white/[0.02] p-2 rounded-lg border border-white/5 min-h-[1.5rem] break-words">
                            {normalizedCurrent || <span className="italic opacity-40">(vazio)</span>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[8px] uppercase text-brand-green font-bold block">Novo Valor</span>
                        <div className="text-xs text-white bg-brand-green/5 p-2 rounded-lg border border-brand-green/20 min-h-[1.5rem] break-words font-medium">
                            {normalizedPending || <span className="text-brand-red italic opacity-60">(vazio/remover)</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Aprovação de <span className="text-brand-blue">Perfis</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium uppercase tracking-tight">Revise as edições de perfil para garantir a integridade da rede.</p>
                </div>
                <div className="px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-blue" />
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{profiles.length} Pendentes</span>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md border border-dashed border-white/10 rounded-[32px]">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nenhum perfil aguardando revisão</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-white/5 dark:bg-card-dark/5 backdrop-blur-md border border-white/5 rounded-[32px] overflow-hidden group hover:border-brand-blue/30 transition-all duration-300">
                            <div className="p-8 flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                                            <span className="text-xl font-black text-brand-blue uppercase">{profile.full_name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">{profile.full_name || 'Usuário Sem Nome'}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{profile.email}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${profile.is_usp_member ? 'bg-brand-blue/20 text-brand-blue' : 'bg-gray-800 text-gray-500'}`}>
                                                    {profile.is_usp_member ? 'Membro USP' : 'Curioso'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {profile.pending_edits ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <p className="text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Info className="w-3 h-3" /> Mudanças Propostas
                                                </p>
                                                <span className="text-[8px] font-black bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded uppercase">Revisão Necessária</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderDiff(profile.bio, profile.pending_edits.bio, 'Biografia')}
                                                {renderDiff(profile.username, profile.pending_edits.username, 'Apelido (Nickname)')}
                                                {renderDiff(profile.institute, profile.pending_edits.institute, 'Instituto / Afiliação')}
                                                {renderDiff(profile.course, profile.pending_edits.course, 'Curso / Habilitação')}
                                                {renderDiff(profile.whatsapp, profile.pending_edits.whatsapp, 'WhatsApp')}
                                                {renderDiff(profile.entrance_year, profile.pending_edits.entrance_year, 'Ano de Ingresso')}
                                                {renderDiff(profile.artistic_interests?.join(', '), profile.pending_edits.artistic_interests?.join(', '), 'Hobbies e Artes')}
                                                {renderDiff(profile.lattes_url, profile.pending_edits.lattes_url, 'URL Lattes')}
                                                {renderDiff(profile.available_to_mentor, profile.pending_edits.available_to_mentor, 'Quero Adotar Bixo')}
                                                {renderDiff(profile.seeking_mentor, profile.pending_edits.seeking_mentor, 'Bixo querendo Adoção')}

                                                {profile.pending_edits.use_nickname !== undefined && profile.pending_edits.use_nickname !== profile.use_nickname && (
                                                    <div className="bg-white/5 p-4 rounded-2xl border border-brand-blue/20 col-span-full flex items-center justify-between group/toggle">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Visibilidade do Apelido</span>
                                                            <span className="text-[9px] text-gray-500 font-medium">Define se o nome real ou apelido aparece nos posts</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[8px] font-bold text-gray-500 uppercase">De: {profile.use_nickname ? 'SIM' : 'NÃO'}</span>
                                                            <span className="material-symbols-outlined text-sm text-gray-600">arrow_forward</span>
                                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${profile.pending_edits.use_nickname ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-gray-800 text-gray-400'}`}>
                                                                Para: {profile.pending_edits.use_nickname ? 'SIM' : 'NÃO'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-brand-blue/5 rounded-[24px] border border-brand-blue/10 border-dashed text-center">
                                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em]">Novo Cadastro Detectado</p>
                                            <p className="text-[9px] text-gray-500 mt-1 uppercase">Revise as informações básicas acima antes de aprovar.</p>
                                        </div>
                                    )}

                                </div>

                                <div className="flex flex-row lg:flex-col gap-3 shrink-0 lg:w-48 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                                    {(profile.pending_edits?.usp_proof_url || profile.usp_proof_url) && (
                                        <button
                                            onClick={() => handleViewProof(profile.pending_edits?.usp_proof_url || profile.usp_proof_url!)}
                                            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-brand-blue font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-brand-blue/20"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Ver Comprovante
                                        </button>
                                    )}
                                    <button
                                        disabled={isProcessing === profile.id}
                                        onClick={() => handleApprove(profile.id)}
                                        className="flex-1 py-4 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                    >
                                        {isProcessing === profile.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Aprovar
                                    </button>
                                    <button
                                        disabled={isProcessing === profile.id}
                                        onClick={() => handleReject(profile.id)}
                                        className="flex-1 py-4 rounded-2xl bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Rejeitar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
