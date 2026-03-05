'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard } from '@/components/MediaCard';
import { AdminSubmissionLightbox } from '@/components/AdminSubmissionLightbox';
import { CATEGORIES } from '@/app/enviar/constants';
import { fetchAdminSubmissions, updateSubmissionAdmin } from '@/app/actions/submissions';
import { AdminPostDTO, mapToAdminPostDTO } from '@/dtos/media';
import {
    LayoutDashboard, Search, Filter, UserSearch,
    CheckCircle, XCircle, Clock, Trash2,
    CheckCheck, Sparkles, RefreshCw, ChevronDown,
    FileEdit, X, Save, AlertTriangle, Loader2, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GerenciadorAcervoPage() {
    const [allSubmissions, setAllSubmissions] = useState<AdminPostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('todos');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Lightbox
    const [selectedItem, setSelectedItem] = useState<AdminPostDTO | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    // Edit modal
    const [editingItem, setEditingItem] = useState<AdminPostDTO | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        // Using common fetcher for consistency
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .neq('status', 'deleted')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Erro ao carregar acervo');
        } else {
            setAllSubmissions((data || []).map(sub => mapToAdminPostDTO(sub)));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const uniqueAuthors = useMemo(() => {
        const authorsSet = new Set<string>();
        allSubmissions.forEach(s => {
            s.authors.split(',').forEach(a => {
                const trimmed = a.trim();
                if (trimmed) authorsSet.add(trimmed);
            });
        });
        return Array.from(authorsSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [allSubmissions]);

    const filteredSubmissions = useMemo(() => {
        let result = allSubmissions;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.authors.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q)
            );
        }
        if (selectedAuthor && selectedAuthor !== 'todos') {
            result = result.filter(s =>
                s.authors.toLowerCase().includes(selectedAuthor.toLowerCase())
            );
        }
        return result;
    }, [allSubmissions, searchQuery, selectedAuthor]);

    const isAllSelected = filteredSubmissions.length > 0 && selectedIds.size === filteredSubmissions.length;

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'aprovado':
                return <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
            case 'rejeitado':
                return <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>;
            default:
                return <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
        }
    };

    const currentIdx = selectedItem ? filteredSubmissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < filteredSubmissions.length - 1;
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (hasPrev) { setSelectedItem(filteredSubmissions[currentIdx - 1]); setModalImageIdx(0); } };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (hasNext) { setSelectedItem(filteredSubmissions[currentIdx + 1]); setModalImageIdx(0); } };

    const handleApprove = async (id: string, feedback?: string) => {
        const { error, data } = await updateSubmissionAdmin(id, { status: 'aprovado', admin_feedback: feedback || null });
        if (error) { toast.error('Erro ao aprovar'); return; }
        const updated = mapToAdminPostDTO(data);
        setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
        if (selectedItem?.id === id) setSelectedItem(updated);
        toast.success('Aprovado');
    };

    const handleReject = async (id: string, feedback?: string) => {
        const { error, data } = await updateSubmissionAdmin(id, { status: 'rejeitado', admin_feedback: feedback || null });
        if (error) { toast.error('Erro ao rejeitar'); return; }
        const updated = mapToAdminPostDTO(data);
        setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
        if (selectedItem?.id === id) setSelectedItem(updated);
        toast.success('Rejeitado');
    };

    const handleToggleFeatured = async (id: string, current: boolean) => {
        const { error, data } = await updateSubmissionAdmin(id, { is_featured: !current });
        if (error) { toast.error('Erro no destaque'); return; }
        const updated = mapToAdminPostDTO(data);
        setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
        toast.success(updated.isFeatured ? 'Destaque ativado' : 'Destaque removido');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSaving(true);
        const { error, data } = await updateSubmissionAdmin(editingItem.id, {
            title: editingItem.title,
            authors: editingItem.authors,
            category: editingItem.category,
            description: editingItem.description,
            tags: editingItem.tags,
            external_link: editingItem.externalLink,
            event_date: editingItem.eventDate,
        });

        if (error) {
            toast.error('Erro ao salvar');
        } else {
            const updated = mapToAdminPostDTO(data);
            setAllSubmissions(prev => prev.map(s => s.id === editingItem.id ? updated : s));
            setEditingItem(null);
            toast.success('Alterações salvas');
        }
        setIsSaving(false);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return;
        const { error } = await supabase.from('submissions').update({ status: 'aprovado' }).in('id', Array.from(selectedIds));
        if (error) { toast.error('Erro no processamento'); return; }
        await fetchAll();
        setSelectedIds(new Set());
        toast.success('Itens aprovados em massa');
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0) return;
        const { error } = await supabase.from('submissions').update({ status: 'rejeitado' }).in('id', Array.from(selectedIds));
        if (error) { toast.error('Erro no processamento'); return; }
        await fetchAll();
        setSelectedIds(new Set());
        toast.success('Itens rejeitados');
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Excluir permanentemente ${selectedIds.size} submissões?`)) return;
        const { error } = await supabase.from('submissions').update({ status: 'deleted' }).in('id', Array.from(selectedIds));
        if (error) { toast.error('Erro ao deletar'); return; }
        await fetchAll();
        setSelectedIds(new Set());
        toast.success('Itens excluídos');
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Gerenciador de Acervo</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Gerenciador de Acervo e Autores</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Visualize, edite e filtre todas as submissões do banco de dados.</p>
            </div>

            {/* Filtros */}
            <div className="bg-white/5 dark:bg-card-dark/5 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por autor ou título..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue placeholder-gray-400 transition-all font-medium text-sm"
                    />
                </div>

                <div className="relative min-w-[240px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm font-medium appearance-none cursor-pointer"
                    >
                        <option value="todos">Todos os autores ({allSubmissions.length})</option>
                        {uniqueAuthors.map(author => (
                            <option key={author} value={author}>{author}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="px-3 py-1.5 bg-brand-yellow/10 text-brand-yellow rounded-lg text-xs font-bold">{filteredSubmissions.filter(s => s.status === 'pendente').length} Pendentes</span>
                    <span className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold">{filteredSubmissions.filter(s => s.status === 'aprovado').length} Aprovados</span>
                </div>
            </div>

            {/* Ações em Massa */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/5 dark:bg-card-dark/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-blue transition-colors"
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isAllSelected && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                        {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                    {selectedIds.size > 0 && (
                        <span className="text-sm font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full whitespace-nowrap">
                            {selectedIds.size} selecionados
                        </span>
                    )}
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                        <button onClick={handleBulkApprove} className="px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <CheckCheck className="w-4 h-4" /> Aprovar
                        </button>
                        <button onClick={handleBulkReject} className="px-4 py-2 bg-brand-red text-white hover:bg-brand-red/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Rejeitar
                        </button>
                        <button onClick={handleBulkDelete} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                )}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-blue mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando Banco de Dados...</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-20 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <XCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nada encontrado.</p>
                </div>
            ) : (
                <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubmissions.map((item) => (
                        <div key={item.id} className={`flex flex-col gap-2 relative group/card ${item.status === 'rejeitado' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="absolute top-3 left-12 z-10 transition-all flex items-center gap-2">
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleFeatured(item.id, item.isFeatured); }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow ${item.isFeatured ? 'bg-brand-yellow text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-400'}`}
                                >
                                    <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                                    className="w-8 h-8 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-600 hover:text-brand-blue flex items-center justify-center transition-all"
                                >
                                    <FileEdit className="w-4 h-4" />
                                </button>
                            </div>

                            <div
                                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                                className={`absolute top-3 left-3 z-[15] w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all shadow-md border-2 ${selectedIds.has(item.id) ? 'bg-brand-blue border-brand-blue opacity-100' : 'bg-white/40 border-white/60 opacity-0 group-hover/card:opacity-100'}`}
                            >
                                {selectedIds.has(item.id) && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                            </div>

                            <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }} className="cursor-pointer">
                                <MediaCard post={item} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem}
                    statusType={(selectedItem.status as any) || 'pendente'}
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onToggleFeatured={handleToggleFeatured}
                    onEdit={setEditingItem}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-background-dark">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileEdit className="w-6 h-6 text-brand-blue" />
                                Editar Submissão
                            </h2>
                            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="edit-form" onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Título</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.title}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Autores</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.authors}
                                        onChange={e => setEditingItem({ ...editingItem, authors: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Categoria</label>
                                    <select
                                        value={editingItem.category}
                                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
                                    <textarea
                                        rows={4}
                                        value={editingItem.description}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Ano (AAAA)</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={editingItem.eventDate ? editingItem.eventDate.substring(0, 4) : ''}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setEditingItem({ ...editingItem, eventDate: val ? `${val}-01-01T12:00:00Z` : undefined });
                                        }}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                        placeholder="Ex: 2024"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (Separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={editingItem.tags?.join(', ') || ''}
                                        onChange={e => setEditingItem({ ...editingItem, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                        placeholder="ciencia, fisica, astronomia"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Link Externo</label>
                                    <input
                                        type="url"
                                        value={editingItem.externalLink || ''}
                                        onChange={e => setEditingItem({ ...editingItem, externalLink: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                                {editingItem.whatsapp && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contato (WhatsApp)</label>
                                        <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 py-2.5 px-4 text-sm font-mono select-all">
                                            {editingItem.whatsapp}
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="edit-form" disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/80 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                {!isSaving && <Save className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
