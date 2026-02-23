'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { AdminSubmissionLightbox, AdminSubmission } from '@/components/AdminSubmissionLightbox';
import { CATEGORIES } from '@/app/enviar/constants';
import { validateAISuggestionsBulk, reprocessAI } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';

interface Submission extends AdminSubmission {
    id: string;
    is_featured: boolean;
    ai_suggested_tags?: string[];
    ai_suggested_alt?: string;
    ai_status?: string;
}

export default function GerenciadorAcervoPage() {
    const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('todos');

    // Lightbox
    const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    // Edit modal
    const [editingItem, setEditingItem] = useState<Submission | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAll = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .neq('status', 'deleted')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
        } else {
            setAllSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    // Unique authors for dropdown
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

    // Filtered submissions
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

    // Bulk action state - Moved here to avoid usage before declaration
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isAllSelected = filteredSubmissions.length > 0 && selectedIds.size === filteredSubmissions.length;

    // Status badge
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'aprovado':
                return <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue dark:text-blue-400 dark:bg-blue-900/30 rounded text-[10px] font-bold uppercase tracking-wider">Aprovado</span>;
            case 'rejeitado':
                return <span className="px-2 py-0.5 bg-brand-red/10 text-brand-red dark:text-red-400 dark:bg-red-900/30 rounded text-[10px] font-bold uppercase tracking-wider">Rejeitado</span>;
            default:
                return <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow dark:text-yellow-400 dark:bg-yellow-900/30 rounded text-[10px] font-bold uppercase tracking-wider">Pendente</span>;
        }
    };

    // Lightbox navigation
    const currentIdx = selectedItem ? filteredSubmissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < filteredSubmissions.length - 1;
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (hasPrev) { setSelectedItem(filteredSubmissions[currentIdx - 1]); setModalImageIdx(0); } };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (hasNext) { setSelectedItem(filteredSubmissions[currentIdx + 1]); setModalImageIdx(0); } };

    // Actions
    const handleApprove = async (id: string, feedback?: string) => {
        const { error } = await supabase.from('submissions').update({
            status: 'aprovado',
            admin_feedback: feedback || null
        }).eq('id', id);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'aprovado', admin_feedback: feedback || s.admin_feedback } : s));
        if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'aprovado', admin_feedback: feedback || prev.admin_feedback } : null);
    };

    const handleReject = async (id: string, feedback?: string) => {
        const { error } = await supabase.from('submissions').update({
            status: 'rejeitado',
            admin_feedback: feedback || null
        }).eq('id', id);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejeitado', admin_feedback: feedback || s.admin_feedback } : s));
        if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'rejeitado', admin_feedback: feedback || prev.admin_feedback } : null);
    };

    const handleToggleFeatured = async (id: string, current: boolean) => {
        const { error } = await supabase.from('submissions').update({ is_featured: !current }).eq('id', id);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_featured: !current } : s));
    };

    // Save edit
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSaving(true);
        const { error } = await supabase.from('submissions').update({
            title: editingItem.title,
            authors: editingItem.authors,
            category: editingItem.category,
            description: editingItem.description,
        }).eq('id', editingItem.id);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            setAllSubmissions(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...editingItem } : s));
            setEditingItem(null);
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
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
        }
    };

    const handleBulkValidateAI = async () => {
        if (selectedIds.size === 0) return;
        setIsLoading(true);
        const ids = Array.from(selectedIds);

        // Regra Sênior: Server Action com Zod e RPC Atômica
        const res = await validateAISuggestionsBulk(ids);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Sugestões validadas com sucesso!');
            await fetchAll();
            setSelectedIds(new Set());
        }
        setIsLoading(false);
    };

    const handleReprocess = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await reprocessAI(id);
        if (res.error) toast.error(res.error);
        else {
            toast.success('Reprocessamento solicitado!');
            await fetchAll();
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        const { error } = await supabase.from('submissions').update({ status: 'aprovado' }).in('id', ids);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: 'aprovado' } : s));
        setSelectedIds(new Set());
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        const { error } = await supabase.from('submissions').update({ status: 'rejeitado' }).in('id', ids);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: 'rejeitado' } : s));
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Tem certeza que deseja mover ${selectedIds.size} submissões para a lixeira (Soft Delete)?`)) return;
        const ids = Array.from(selectedIds);
        const { error } = await supabase.from('submissions').update({ status: 'deleted' }).in('id', ids);
        if (error) { alert('Erro: ' + error.message); return; }
        setAllSubmissions(prev => prev.filter(s => !ids.includes(s.id)));
        setSelectedIds(new Set());
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Gerenciador de Acervo</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Gerenciador de Acervo e Autores</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Visualize, edite e filtre todas as submissões do banco de dados.</p>
            </div>

            {/* ─── Filtros Avançados ─── */}
            <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4">
                {/* Search input */}
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[22px]">person_search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por autor ou título..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue placeholder-gray-400 transition-all font-medium text-sm"
                    />
                </div>

                {/* Dropdown */}
                <div className="relative min-w-[240px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">filter_list</span>
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
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">expand_more</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="px-3 py-1.5 bg-brand-yellow/10 text-brand-yellow rounded-lg text-xs font-bold">{filteredSubmissions.filter(s => s.status === 'pendente').length} Pendentes</span>
                    <span className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold">{filteredSubmissions.filter(s => s.status === 'aprovado').length} Aprovados</span>
                    <span className="px-3 py-1.5 bg-brand-red/10 text-brand-red rounded-lg text-xs font-bold">{filteredSubmissions.filter(s => s.status === 'rejeitado').length} Rejeitados</span>
                </div>
            </div>

            {/* ─── Ações em Massa ─── */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-card-dark px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-blue transition-colors"
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isAllSelected && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
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
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full md:w-auto">
                        <button
                            onClick={handleBulkApprove}
                            className="px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">done_all</span>
                            <span className="hidden sm:inline">Aprovar Selecionados</span>
                            <span className="sm:hidden">Aprovar</span>
                        </button>
                        {Array.from(selectedIds).some(id => allSubmissions.find(s => s.id === id)?.ai_suggested_tags?.length) && (
                            <button
                                onClick={handleBulkValidateAI}
                                className="px-4 py-2 bg-[#0055ff]/10 text-[#0055ff] border border-[#0055ff]/30 hover:bg-[#0055ff]/20 animate-pulse rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                Validar Sugestões de IA
                            </button>
                        )}
                        <button
                            onClick={handleBulkReject}
                            className="px-4 py-2 bg-brand-red text-white hover:bg-brand-red/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">block</span>
                            <span className="hidden sm:inline">Rejeitar Selecionados</span>
                            <span className="sm:hidden">Rejeitar</span>
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Excluir
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Grid de Cards ─── */}
            {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="text-gray-500 animate-pulse">Carregando acervo...</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">search_off</span>
                    <p className="text-gray-500">Nenhuma submissão encontrada com os filtros atuais.</p>
                </div>
            ) : (
                <div className="masonry-grid">
                    {filteredSubmissions.map((item) => {
                        const isRejected = item.status === 'rejeitado';
                        const cardProps: MediaCardProps = {
                            id: item.id,
                            title: item.title,
                            authors: item.authors,
                            description: item.description,
                            category: item.category,
                            mediaType: item.media_type,
                            mediaUrl: item.media_url,
                        };
                        return (
                            <div key={item.id} className={`flex flex-col gap-2 relative group/card ${isRejected ? 'opacity-50 hover:opacity-80 transition-opacity' : ''}`}>
                                {/* Status badge overlay */}
                                <div className="absolute top-3 left-12 z-10 transition-all flex items-center gap-2">
                                    {getStatusBadge(item.status)}
                                    {item.ai_suggested_tags && item.ai_suggested_tags.length > 0 && (
                                        <div className="bg-[#0055ff] text-white p-1 rounded-full shadow-[0_0_10px_rgba(0,85,255,0.5)] animate-pulse" title="Sugestões de IA Pendentes">
                                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                        </div>
                                    )}
                                    {item.ai_status === 'error' && (
                                        <button
                                            onClick={(e) => handleReprocess(item.id, e)}
                                            className="bg-brand-red text-white p-1 rounded-full shadow-lg hover:scale-110 transition-all"
                                            title="IA falhou. Clique para reprocessar."
                                        >
                                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        </button>
                                    )}
                                </div>

                                {/* Edit + Star overlay */}
                                <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleFeatured(item.id, item.is_featured); }}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow ${item.is_featured
                                            ? 'bg-brand-yellow text-white'
                                            : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-brand-yellow backdrop-blur-sm'
                                            }`}
                                        title={item.is_featured ? 'Remover Destaque' : 'Marcar Destaque'}
                                    >
                                        <span className="material-symbols-outlined text-[16px]" style={item.is_featured ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingItem({ ...item }); }}
                                        className="w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-all shadow backdrop-blur-sm"
                                        title="Editar Submissão"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                    </button>
                                </div>

                                {/* Selection Checkbox */}
                                <div
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                                    className={`absolute top-3 left-3 z-[15] w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all shadow-md backdrop-blur-md border-2 ${selectedIds.has(item.id)
                                        ? 'bg-brand-blue border-brand-blue opacity-100'
                                        : 'bg-white/40 border-white/60 opacity-0 group-hover/card:opacity-100'
                                        }`}
                                >
                                    {selectedIds.has(item.id) && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>}
                                </div>

                                <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }} className="cursor-pointer">
                                    <MediaCard {...cardProps} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Lightbox ─── */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem as AdminSubmission}
                    statusType={(selectedItem.status as 'pendente' | 'aprovado' | 'rejeitado') || 'pendente'}
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onToggleFeatured={handleToggleFeatured}
                    onEdit={(item) => setEditingItem({ ...item } as Submission)}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}

            {/* ─── Edit Modal ─── */}
            {editingItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-background-dark">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">edit_document</span>
                                Editar Submissão
                            </h2>
                            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
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
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="edit-form" disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/80 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                {!isSaving && <span className="material-symbols-outlined text-[16px]">save</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
