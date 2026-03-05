'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MediaCard } from '@/components/MediaCard';
import { AdminSubmissionLightbox } from '@/components/AdminSubmissionLightbox';
import { CATEGORIES } from '@/app/enviar/constants';
import toast from 'react-hot-toast';
import { useNotify } from '@/hooks/useNotify';
import { z } from 'zod';
import { updateSubmissionAdmin } from '@/app/actions/submissions';
import { SubmissionSchema } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import { AdminPostDTO, mapToAdminPostDTO } from '@/dtos/media';
import {
    LayoutDashboard, Search, Inbox, ChevronLeft,
    ChevronRight, Bookmark, Check, X, RotateCcw,
    FileEdit, Save, AlertTriangle, Loader2
} from 'lucide-react';

const submissionSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    authors: z.string().min(1, 'Autor é obrigatório'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    tags: z.array(z.string()).optional(),
    mediaUrl: z.string().url('URL inválida').or(z.literal('')),
    externalLink: z.string().url('Link externo inválido').or(z.literal('')).optional(),
});

/* ─── Netflix-style Carousel Row ─── */
function CarouselSection({
    title,
    icon: Icon,
    iconColor,
    items,
    maxRows,
    onCardClick,
    actions,
    emptyMessage,
}: {
    title: string;
    icon: any;
    iconColor: string;
    items: AdminPostDTO[];
    maxRows: number;
    onCardClick: (item: AdminPostDTO) => void;
    actions?: (item: AdminPostDTO) => React.ReactNode;
    emptyMessage: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            if (el) el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 220;
        const scrollAmount = cardWidth * 3;
        el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    };

    const ITEMS_PER_ROW = 10;

    return (
        <section className="relative">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-gray-500">{items.length} submissão(ões)</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-gray-500 text-sm mt-2">{emptyMessage}</p>
                </div>
            ) : (
                <div className="relative group/carousel">
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-background-light dark:from-background-dark to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform">
                                <ChevronLeft className="w-6 h-6" />
                            </div>
                        </button>
                    )}

                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-background-light dark:from-background-dark to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </button>
                    )}

                    <div ref={scrollRef} className="overflow-x-auto no-scrollbar scroll-smooth">
                        <div
                            className="grid gap-4 pb-2"
                            style={{
                                gridTemplateRows: `repeat(${Math.min(maxRows, Math.ceil(items.length / ITEMS_PER_ROW))}, auto)`,
                                gridAutoFlow: 'column',
                                gridAutoColumns: 'minmax(200px, 220px)',
                            }}
                        >
                            {items.map((item) => (
                                <div key={item.id} className="flex flex-col gap-2 min-w-[200px]">
                                    <div onClick={() => onCardClick(item)} className="cursor-pointer">
                                        <MediaCard post={item} />
                                    </div>
                                    {actions && (
                                        <div className="flex items-center gap-1.5 px-1">
                                            {actions(item)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ─── Main Page ─── */
export default function AdminSubmissionsPage() {
    const [allSubmissions, setAllSubmissions] = useState<AdminPostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<AdminPostDTO | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    // Editing
    const [editingItem, setEditingItem] = useState<AdminPostDTO | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Searching & Debounce
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const notify = useNotify();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const fetchAll = useCallback(async (query: string = '') => {
        setIsLoading(true);
        const trimmedQuery = query.trim();
        let supabaseQuery = supabase.from('submissions').select('*');
        if (trimmedQuery) {
            supabaseQuery = supabaseQuery.or(`title.ilike.%${trimmedQuery}%,authors.ilike.%${trimmedQuery}%`);
        }
        const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching submissions', error);
            toast.error('Erro ao carregar submissões');
        } else {
            setAllSubmissions((data || []).map(sub => mapToAdminPostDTO(sub)));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchAll(debouncedSearch);
    }, [debouncedSearch, fetchAll]);

    const pendentes = useMemo(() => allSubmissions.filter(s => s.status === 'pendente'), [allSubmissions]);
    const aprovados = useMemo(() => allSubmissions.filter(s => s.status === 'aprovado'), [allSubmissions]);
    const rejeitados = useMemo(() => allSubmissions.filter(s => s.status === 'rejeitado'), [allSubmissions]);

    const handleApprove = async (id: string, feedback?: string) => {
        const { data: result } = await notify.promise(updateSubmissionAdmin(id, {
            status: 'aprovado',
            admin_feedback: feedback || null
        }), {
            loading: 'Aprovando submissão...',
            success: 'Submissão aprovada!',
            error: 'Erro ao aprovar submissão'
        });

        if (result?.error) {
            notify.error(result.error.message || 'Erro ao aprovar');
            return;
        }

        if (result?.data) {
            const updated = mapToAdminPostDTO(result.data);
            setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
            if (selectedItem?.id === id) setSelectedItem(updated);
        }
    };

    const handleReject = async (id: string, feedback?: string) => {
        const { data: result } = await notify.promise(updateSubmissionAdmin(id, {
            status: 'rejeitado',
            admin_feedback: feedback || null
        }), {
            loading: 'Rejeitando submissão...',
            success: 'Submissão rejeitada',
            error: 'Erro ao rejeitar submissão'
        });

        if (result?.error) {
            notify.error(result.error.message || 'Erro ao rejeitar');
            return;
        }

        if (result?.data) {
            const updated = mapToAdminPostDTO(result.data);
            setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
            if (selectedItem?.id === id) setSelectedItem(updated);
        }
    };

    const handleRecover = async (id: string) => {
        const { data, error } = await notify.promise(updateSubmissionAdmin(id, { status: 'pendente' }), {
            loading: 'Recuperando submissão...',
            success: 'Submissão voltou para pendente',
            error: 'Erro ao recuperar submissão'
        });

        if (!error && data) {
            const updated = mapToAdminPostDTO(data);
            setAllSubmissions(prev => prev.map(s => s.id === id ? updated : s));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const validation = submissionSchema.safeParse(editingItem);
        if (!validation.success) {
            notify.error(validation.error.issues[0].message);
            return;
        }

        setIsSaving(true);
        const { data: result, error } = await notify.promise(updateSubmissionAdmin(editingItem.id, {
            title: editingItem.title,
            authors: editingItem.authors,
            category: editingItem.category,
            description: editingItem.description,
            tags: editingItem.tags,
            media_url: editingItem.mediaUrl,
            external_link: editingItem.externalLink,
        }), {
            loading: 'Salvando alterações...',
            success: 'Alterações salvas com sucesso!',
            error: 'Erro ao salvar alterações'
        });

        if (!error && result) {
            const updated = mapToAdminPostDTO(result);
            setAllSubmissions(prev => prev.map(s => s.id === editingItem.id ? updated : s));
            if (selectedItem?.id === editingItem.id) setSelectedItem(updated);
            setEditingItem(null);
        }
        setIsSaving(false);
    };

    const allForLightbox = allSubmissions;
    const currentIdx = selectedItem ? allForLightbox.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < allForLightbox.length - 1;
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (hasPrev) { setSelectedItem(allForLightbox[currentIdx - 1]); setModalImageIdx(0); } };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (hasNext) { setSelectedItem(allForLightbox[currentIdx + 1]); setModalImageIdx(0); } };

    const openCard = (item: AdminPostDTO) => {
        setSelectedItem(item);
        setModalImageIdx(0);
        setImageError(false);
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="text-brand-blue">Gerenciamento</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Mesa de Cirurgia (Admin)</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Busque, edite e revise todas as submissões em tempo real.</p>
                </div>

                <div className="w-full md:w-96 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue w-5 h-5 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por título ou autor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm shadow-sm"
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
                    <Loader2 className="w-10 h-10 text-brand-red animate-spin mb-6" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando Torre de Controle...</p>
                </div>
            ) : (
                <>
                    <Link
                        href="/admin/acervo"
                        className="flex items-center gap-4 p-5 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/40 transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                            <Bookmark className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">Gerenciador de Acervo</h3>
                            <p className="text-sm text-gray-500">Edite, filtre por autor e gerencie todas as submissões em um só lugar</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                    </Link>

                    <CarouselSection
                        title="Submissões Pendentes"
                        icon={RotateCcw}
                        iconColor="bg-brand-yellow/10 text-brand-yellow"
                        items={pendentes}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão pendente de aprovação."
                        actions={(item) => (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }} className="flex-1 px-2 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <Check className="w-4 h-4" /> Aprovar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleReject(item.id); }} className="flex-1 px-2 py-1.5 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <X className="w-4 h-4" /> Rejeitar
                                </button>
                            </>
                        )}
                    />

                    <CarouselSection
                        title="Submissões Rejeitadas"
                        icon={X}
                        iconColor="bg-brand-red/10 text-brand-red"
                        items={rejeitados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão rejeitada."
                        actions={(item) => (
                            <button onClick={(e) => { e.stopPropagation(); handleRecover(item.id); }} className="flex-1 px-2 py-1.5 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                <RotateCcw className="w-4 h-4" /> Recuperar
                            </button>
                        )}
                    />

                    <CarouselSection
                        title="Submissões Aprovadas"
                        icon={Check}
                        iconColor="bg-brand-blue/10 text-brand-blue"
                        items={aprovados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão aprovada."
                    />
                </>
            )}

            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem}
                    statusType={(selectedItem.status as 'pendente' | 'aprovado' | 'rejeitado') || 'pendente'}
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={(item) => setEditingItem(item)}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}

            {editingItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/10 dark:bg-background-dark/10 backdrop-blur-md">
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
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={editingItem.tags ? editingItem.tags.join(', ') : ''}
                                        onChange={e => {
                                            const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                                            setEditingItem({ ...editingItem, tags: tagsArray });
                                        }}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                        placeholder="Ex: física, ensaio, história"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">URL da Capa / Mídia</label>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-background-dark flex items-center justify-center">
                                            {editingItem.mediaUrl && !imageError ? (
                                                <img
                                                    src={Array.isArray(editingItem.mediaUrl) ? editingItem.mediaUrl[0] : editingItem.mediaUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <AlertTriangle className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={Array.isArray(editingItem.mediaUrl) ? editingItem.mediaUrl.join(', ') : editingItem.mediaUrl}
                                                onChange={e => {
                                                    setEditingItem({ ...editingItem, mediaUrl: e.target.value });
                                                    setImageError(false);
                                                }}
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                            />
                                        </div>
                                    </div>
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

                        <div className="px-6 py-4 bg-white/10 dark:bg-background-dark/10 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
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
