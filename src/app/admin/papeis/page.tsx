'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
    deleteProfile,
    impersonateUser,
    toggleProfileVisibility,
    toggleLabdivMember,
    updateProfileAsAdmin
} from '@/app/actions/profiles';
import Link from 'next/link';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_usp_member: boolean;
    is_labdiv: boolean;
    is_visible: boolean;
    created_at: string;
}

const ROLES = [
    { value: 'user', label: 'Usuário Padrão', color: 'gray-500' },
    { value: 'moderador', label: 'Moderador', color: 'brand-yellow' },
    { value: 'admin', label: 'Administrador Geral', color: 'brand-red' }
];

export default function PapeisManagementPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // UI Modals State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const [editModal, setEditModal] = useState<{ isOpen: boolean; profile: Profile | null }>({
        isOpen: false,
        profile: null
    });

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
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

    const handleRoleChange = async (id: string, newRole: string) => {
        const { error } = await updateProfileAsAdmin(id, { role: newRole });
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
            toast.success('Papel atualizado!');
        }
    };

    const handleToggleLabdiv = async (id: string, current: boolean) => {
        const { error } = await toggleLabdivMember(id, !current);
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_labdiv: !current } : p));
            toast.success(current ? 'Removido do Lab-Div' : 'Adicionado ao Lab-Div');
        }
    };

    const handleToggleVisibility = async (id: string, current: boolean) => {
        const { error } = await toggleProfileVisibility(id, !current);
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_visible: !current } : p));
            toast.success(current ? 'Perfil oculto' : 'Perfil visível');
        }
    };

    const handleImpersonate = async (id: string, name: string) => {
        toast.loading(`Assumindo identidade de ${name}...`);
        const { error } = await impersonateUser(id);
        if (error) {
            toast.dismiss();
            toast.error(error);
        } else {
            window.location.href = '/lab';
        }
    };

    const handleDelete = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = async () => {
        const { id } = deleteModal;
        toast.loading('Deletando usuário...');
        const { error } = await deleteProfile(id);
        toast.dismiss();
        setDeleteModal({ ...deleteModal, isOpen: false });

        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.filter(p => p.id !== id));
            toast.success('Usuário removido permanentemente.');
        }
    };

    const filteredProfiles = profiles.filter(p =>
        (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-full">
            <header className="mb-8 shrink-0">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                    Gerenciamento de <span className="text-brand-yellow">Papéis</span>
                </h1>
                <p className="text-gray-400 mt-1">Defina níveis de autorização para membros do Lab-Div e Moderadores.</p>

                <div className="mt-6">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:border-brand-yellow/50 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="flex-1 flex justify-center py-20">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-yellow">progress_activity</span>
                </div>
            ) : profiles.length === 0 ? (
                <div className="flex-1 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">group_off</span>
                    <p className="text-gray-500 font-medium">Nenhum perfil encontrado no sistema.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto rounded-3xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100/50 dark:bg-white/5 sticky top-0 backdrop-blur-md z-10 border-b border-gray-200 dark:border-white/10">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-400">Usuário</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-400">Vínculo</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-400">Cadastro</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-400">Acesso (Role)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProfiles.map(profile => (
                                <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{profile.full_name || 'Usuário Sem Nome'}</span>
                                            <span className="text-xs text-gray-500">{profile.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${profile.is_usp_member ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'bg-white/5 text-gray-400'}`}>
                                            {profile.is_usp_member ? 'Membro USP' : 'Curioso'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-gray-500">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={profile.role || 'user'}
                                                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                    className="bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-brand-yellow/50 transition-colors w-full cursor-pointer"
                                                >
                                                    {ROLES.map(role => (
                                                        <option key={role.value} value={role.value} className="bg-neutral-900">
                                                            {role.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={() => handleToggleLabdiv(profile.id, profile.is_labdiv)}
                                                    title={profile.is_labdiv ? "Remover do Lab-Div" : "Marcar como Membro Lab-Div"}
                                                    className={`p-2 rounded-xl border transition-all ${profile.is_labdiv ? 'bg-brand-blue/20 border-brand-blue/50 text-brand-blue' : 'bg-white/5 border-white/10 text-gray-500 hover:text-brand-blue'}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleImpersonate(profile.id, profile.full_name)}
                                                    className="flex-1 py-1 px-2 rounded-lg bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-black text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-xs">login</span>
                                                    Entrar como
                                                </button>

                                                <button
                                                    onClick={() => setEditModal({ isOpen: true, profile })}
                                                    title="Editar como Administrador"
                                                    className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-brand-blue transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-xs">edit</span>
                                                </button>

                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, id: profile.id, name: profile.full_name })}
                                                    className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Deletar Permanentemente"
                                                >
                                                    <span className="material-symbols-outlined text-xs">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DeleteUserModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteConfirm}
                userName={deleteModal.name}
            />

            <EditProfileModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, profile: null })}
                // @ts-ignore
                adminMode={true}
                // @ts-ignore
                adminUserId={editModal.profile?.id}
                onSuccess={fetchProfiles}
            />
        </div>
    );
}
