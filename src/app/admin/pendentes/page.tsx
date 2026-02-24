'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { AdminSubmissionLightbox, AdminSubmission } from '@/components/AdminSubmissionLightbox';
import { CATEGORIES } from '@/app/enviar/constants';
import toast from 'react-hot-toast';
import { useNotify } from '@/hooks/useNotify';
import { z } from 'zod';
import { updateSubmissionAdmin } from '@/app/actions/submissions';
import { SubmissionSchema } from '@/lib/validations';
import { useRouter } from 'next/navigation';

const submissionSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    authors: z.string().min(1, 'Autor é obrigatório'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    tags: z.array(z.string()).optional(),
    media_url: z.string().url('URL inválida').or(z.literal('')),
    external_link: z.string().url('Link externo inválido').or(z.literal('')).optional(),
});

interface SubmissionItem extends AdminSubmission {
    id: string;
    tags?: string[];
    media_url: string;
    media_type: any;
}

/* ─── Netflix-style Carousel Row ─── */
function CarouselSection({
    title,
    icon,
    iconColor,
    items,
    maxRows,
    onCardClick,
    actions,
    emptyMessage,
}: {
    title: string;
    icon: string;
    iconColor: string;
    items: SubmissionItem[];
    maxRows: number;
    onCardClick: (item: SubmissionItem) => void;
    actions?: (item: SubmissionItem) => React.ReactNode;
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
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-gray-500">{items.length} submissão(ões)</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">inbox</span>
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
                                <span className="material-symbols-outlined">chevron_left</span>
                            </div>
                        </button>
                    )}

                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-background-light dark:from-background-dark to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">chevron_right</span>
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
                            {items.map((item) => {
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
                                    <div key={item.id} className="flex flex-col gap-2 min-w-[200px]">
                                        <div onClick={() => onCardClick(item)} className="cursor-pointer">
                                            <MediaCard {...cardProps} />
                                        </div>
                                        {actions && (
                                            <div className="flex items-center gap-1.5 px-1">
                                                {actions(item)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ─── Main Page ─── */
export default function AdminSubmissionsPage() {
    const [allSubmissions, setAllSubmissions] = useState<SubmissionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    // Editing
    const [editingItem, setEditingItem] = useState<SubmissionItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Searching & Debounce
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const notify = useNotify();

    // 1. ATOMIC SAFARI RESILIENCE & MEMORY FALLBACK
    const memoryDrafts = useRef<Record<string, string>>({});

    useEffect(() => {
        const cleanupDrafts = () => {
            try {
                const keys = Object.keys(localStorage);
                const currentUserId = user?.id;
                keys.forEach(key => {
                    if (key.startsWith('draft_submission_') && (!currentUserId || !key.includes(`_${currentUserId}_`))) {
                        localStorage.removeItem(key);
                    }
                });
            } catch (err) {
                console.warn('[V3.0 GOLDEN] LocalStorage cleanup failed (Safari Private/Quota):', err);
            }
        };

        if (typeof window !== 'undefined') {
            // Universal Shim for requestIdleCallback
            const idleShim = window.requestIdleCallback || ((cb: any) => setTimeout(cb, 50));
            idleShim(cleanupDrafts);

            // Test LocalStorage and alert user if blocked
            try {
                const testKey = '__storage_test__';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
            } catch (e) {
                toast.error('⚠️ Armazenamento local indisponível. Seu rascunho será perdido se você fechar esta aba.', {
                    id: 'storage-warning',
                    duration: 6000
                });
            }
        }
    }, [user]);

    // Fetch User Session
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const fetchAll = useCallback(async (query: string = '') => {
        setIsLoading(true);

        // [QA-A2] Scientific Search: Keep characters like '+', '-', '%', etc.
        const trimmedQuery = query.trim();

        let supabaseQuery = supabase
            .from('submissions')
            .select('*');

        if (trimmedQuery) {
            // Server-side search using ilike and or
            supabaseQuery = supabaseQuery.or(`title.ilike.%${trimmedQuery}%,authors.ilike.%${trimmedQuery}%`);
        }

        const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
            toast.error('Erro ao carregar submissões');
        } else {
            setAllSubmissions(data || []);
        }
        setIsLoading(false);
    }, []);

    // Debounce logic
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

        if (result?.error === "AUTH_REQUIRED") {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (result?.success) {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'aprovado', admin_feedback: feedback || s.admin_feedback } : s));
            if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'aprovado', admin_feedback: feedback || (prev as any).admin_feedback } : null);
            // Garbage Collection: Cleanup draft on success
            if (user) localStorage.removeItem(`draft_submission_${user.id}_${id}`);
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

        if (result?.error === "AUTH_REQUIRED") {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (result?.success) {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejeitado', admin_feedback: feedback || s.admin_feedback } : s));
            if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'rejeitado', admin_feedback: feedback || (prev as any).admin_feedback } : null);
            // Garbage Collection: Cleanup draft on success
            if (user) localStorage.removeItem(`draft_submission_${user.id}_${id}`);
        }
    };

    const handleRecover = async (id: string) => {
        const { error } = await notify.promise(updateSubmissionAdmin(id, { status: 'pendente' }), {
            loading: 'Recuperando submissão...',
            success: 'Submissão voltou para pendente',
            error: 'Erro ao recuperar submissão'
        });

        if (!error) {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'pendente' } : s));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        // 1. Zod Validation (Fail-Fast)
        const validation = submissionSchema.safeParse(editingItem);
        if (!validation.success) {
            const firstError = validation.error.issues[0].message;
            notify.error(firstError);
            return;
        }

        setIsSaving(true);
        const { data: result } = await notify.promise(updateSubmissionAdmin(editingItem.id, {
            title: editingItem.title,
            authors: editingItem.authors,
            category: editingItem.category,
            description: editingItem.description,
            tags: editingItem.tags,
            media_url: editingItem.media_url,
            external_link: editingItem.external_link,
        }), {
            loading: 'Salvando alterações...',
            success: 'Alterações salvas com sucesso!',
            error: 'Erro ao salvar alterações'
        });

        if (result?.error === "AUTH_REQUIRED") {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (result?.success) {
            setAllSubmissions(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...editingItem } : s));
            if (selectedItem?.id === editingItem.id) setSelectedItem(prev => prev ? { ...prev, ...editingItem } : null);
            // Garbage Collection: Cleanup draft on success
            if (user) localStorage.removeItem(`draft_submission_${user.id}_${editingItem.id}`);
            setEditingItem(null);
        }
        setIsSaving(false);
    };

    // 2. LIGHTWEIGHT AUTO-SAVE (MOUNT-ONLY VALIDATION & DEBOUNCED SYNC)
    useEffect(() => {
        if (!editingItem || !user) return;

        const draftKey = `draft_submission_${user.id}_${editingItem.id}`;

        // Initial Mount: Restore Draft if schema matches
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                const validation = submissionSchema.safeParse(parsed);
                if (validation.success) {
                    // Only restore if different from current state to avoid infinite loop
                    if (JSON.stringify(validation.data) !== JSON.stringify(editingItem)) {
                        // setEditingItem({ ...editingItem, ...validation.data }); // This could be tricky
                    }
                } else {
                    localStorage.removeItem(draftKey); // Self-Healing: Delete malformed draft
                }
            } catch (e) {
                localStorage.removeItem(draftKey);
            }
        }
    }, [user]); // Run only when user session is loaded

    // Debounced Sync to LocalStorage
    useEffect(() => {
        if (!editingItem || !user) return;

        const timer = setTimeout(() => {
            const draftKey = `draft_submission_${user.id}_${editingItem.id}`;
            localStorage.setItem(draftKey, JSON.stringify(editingItem));
        }, 1000);

        return () => clearTimeout(timer);
    }, [editingItem, user]);

    // Lightbox navigation
    const allForLightbox = allSubmissions;
    const currentIdx = selectedItem ? allForLightbox.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < allForLightbox.length - 1;
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (hasPrev) { setSelectedItem(allForLightbox[currentIdx - 1]); setModalImageIdx(0); } };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (hasNext) { setSelectedItem(allForLightbox[currentIdx + 1]); setModalImageIdx(0); } };

    const openCard = (item: SubmissionItem) => {
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
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        <span>Dashboard</span>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="text-brand-blue">Gerenciamento</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Mesa de Cirurgia (Admin)</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Busque, edite e revise todas as submissões em tempo real.</p>
                </div>

                <div className="w-full md:w-96 relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por título ou autor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm shadow-sm"
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined text-sm animate-spin text-brand-blue">progress_activity</span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 animate-shimmer-labdiv overflow-hidden block">
                    <span className="material-symbols-outlined text-4xl text-brand-red mb-6">hourglass_top</span>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando Torre de Controle...</p>
                </div>
            ) : (
                <>
                    {/* ─── Nível 1: Card de atalho ─── */}
                    <Link
                        href="/admin/acervo"
                        className="flex items-center gap-4 p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/40 transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">collections_bookmark</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">Gerenciador de Acervo</h3>
                            <p className="text-sm text-gray-500">Edite, filtre por autor e gerencie todas as submissões em um só lugar</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-gray-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>

                    {/* ─── Nível 2: Pendentes ─── */}
                    <CarouselSection
                        title="Submissões Pendentes"
                        icon="pending_actions"
                        iconColor="bg-brand-yellow/10 text-brand-yellow"
                        items={pendentes}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão pendente de aprovação."
                        actions={(item) => (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }} className="flex-1 px-2 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">check</span> Aprovar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleReject(item.id); }} className="flex-1 px-2 py-1.5 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">close</span> Rejeitar
                                </button>
                            </>
                        )}
                    />

                    {/* Nível 3: Rejeitados */}
                    <CarouselSection
                        title="Submissões Rejeitadas"
                        icon="block"
                        iconColor="bg-brand-red/10 text-brand-red"
                        items={rejeitados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão rejeitada."
                        actions={(item) => (
                            <button onClick={(e) => { e.stopPropagation(); handleRecover(item.id); }} className="flex-1 px-2 py-1.5 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">restore</span> Recuperar
                            </button>
                        )}
                    />

                    {/* Nível 4: Aprovados */}
                    <CarouselSection
                        title="Submissões Aprovadas"
                        icon="check_circle"
                        iconColor="bg-brand-blue/10 text-brand-blue"
                        items={aprovados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão aprovada."
                    />

                    {/* ─── Nível 5: Todos os Envios ─── */}
                    <CarouselSection
                        title="Todos os Envios"
                        icon="list"
                        iconColor="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        items={allSubmissions}
                        maxRows={4}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão encontrada."
                    />
                </>
            )}

            {/* Lightbox */}
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
                    onEdit={(item) => setEditingItem({ ...item } as SubmissionItem)}
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
                                    {editingItem.tags && editingItem.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {editingItem.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-brand-blue/5 text-brand-blue text-[10px] font-bold rounded-lg border border-brand-blue/10">
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
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
                                    <textarea
                                        rows={4}
                                        value={editingItem.description}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Link Externo / Anexos</label>
                                    <input
                                        type="text"
                                        value={editingItem.external_link || ''}
                                        onChange={e => setEditingItem({ ...editingItem, external_link: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                        placeholder="Ex: Link para PDF em nuvem, drive ou site oficial"
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
