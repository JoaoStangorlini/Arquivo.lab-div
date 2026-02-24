'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/app/enviar/constants';

interface Submission {
    id: string;
    title: string;
    description: string;
    authors: string;
    category: string;
    status: string;
    created_at: string;
    is_featured: boolean;
    tags: string[];
    media_url: string;
    media_type: string;
}

export default function EditarPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Submission | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageError, setImageError] = useState(false);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions for edit', error);
        } else {
            setSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleEditClick = (item: Submission) => {
        // Create a copy to edit in the modal
        setEditingItem({ ...item });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSaving(true);
        const { error } = await supabase
            .from('submissions')
            .update({
                title: editingItem.title,
                authors: editingItem.authors,
                category: editingItem.category,
                description: editingItem.description,
                tags: editingItem.tags,
                media_url: editingItem.media_url,
                media_type: editingItem.media_type,
                status: 'pendente'
            })
            .eq('id', editingItem.id);

        if (error) {
            alert('Erro ao salvar as edições: ' + error.message);
        } else {
            // Update local state and set status to pendente
            setSubmissions(prev => prev.map(s => s.id === editingItem.id ? { ...editingItem, status: 'pendente' } : s));
            setEditingItem(null);
            alert('Registro atualizado com sucesso!');
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6 relative">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Editar Submissões</span>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Registro Completo</h1>
                <p className="text-slate-500 dark:text-slate-400">Edite os metadados textuais de qualquer submissão armazenada no banco.</p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-form-dark/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Título</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Autores</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">Categoria</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-center">Destaque</th>
                                <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Carregando registros...</td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Nenhum registro encontrado.</td>
                                </tr>
                            ) : (
                                submissions.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'aprovado' ? 'bg-brand-blue/10 text-brand-blue' :
                                                item.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate" title={item.title}>
                                            {item.title}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={item.authors}>
                                            {item.authors}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {item.category}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={async () => {
                                                    const newVal = !item.is_featured;
                                                    const { error } = await supabase
                                                        .from('submissions')
                                                        .update({ is_featured: newVal })
                                                        .eq('id', item.id);
                                                    if (error) {
                                                        console.error('Featured toggle error:', error);
                                                        alert('Erro ao alterar destaque: ' + error.message);
                                                    } else {
                                                        setSubmissions(prev => prev.map(s => s.id === item.id ? { ...s, is_featured: newVal } : s));
                                                    }
                                                }}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${item.is_featured
                                                    ? 'bg-brand-yellow/10 text-brand-yellow'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-brand-yellow'
                                                    }`}
                                                title={item.is_featured ? 'Remover Destaque' : 'Marcar como Destaque'}
                                            >
                                                <span className="material-symbols-outlined text-[16px]" style={item.is_featured ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal overlay */}
            {
                editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                        <div className="bg-white dark:bg-form-dark rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-form-dark/50">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">edit_document</span>
                                    Editar Submissão
                                </h2>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="edit-form" onSubmit={handleSave} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Título</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingItem.title}
                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-form-dark text-slate-900 dark:text-white py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Autores</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingItem.authors}
                                            onChange={e => setEditingItem({ ...editingItem, authors: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-form-dark text-slate-900 dark:text-white py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                                        <select
                                            value={editingItem.category}
                                            onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-form-dark text-slate-900 dark:text-white py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Tags (separadas por vírgula)</label>
                                        <input
                                            type="text"
                                            value={editingItem.tags ? editingItem.tags.join(', ') : ''}
                                            onChange={e => {
                                                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                                                setEditingItem({ ...editingItem, tags: tagsArray });
                                            }}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-form-dark text-slate-900 dark:text-white py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="Ex: física, ensaio, história"
                                        />
                                        {editingItem.tags && editingItem.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {editingItem.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">URL da Capa / Mídia</label>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-background-dark flex items-center justify-center">
                                                {editingItem.media_url && !imageError ? (
                                                    <img
                                                        src={editingItem.media_url}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={() => setImageError(true)}
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-gray-300">broken_image</span>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={editingItem.media_url}
                                                    onChange={e => {
                                                        setEditingItem({ ...editingItem, media_url: e.target.value });
                                                        setImageError(false);
                                                    }}
                                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                                    placeholder="Link direto da imagem (Ex: Imgur, Unsplash)"
                                                />
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                                                    [Aviso] Cole uma URL pública. No momento não suportamos upload direto de arquivos.
                                                </p>
                                                {editingItem.media_url && !editingItem.media_url.match(/\.(jpeg|jpg|gif|png|webp|avif)/i) && (
                                                    <p className="text-[10px] text-brand-red font-bold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                                        A URL pode não ser uma imagem válida.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição</label>
                                        <textarea
                                            rows={4}
                                            value={editingItem.description}
                                            onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-form-dark text-slate-900 dark:text-white py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm resize-none"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 dark:bg-form-dark/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    form="edit-form"
                                    disabled={isSaving}
                                    className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    {!isSaving && <span className="material-symbols-outlined text-[16px]">save</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
