'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { m, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    User,
    Globe,
    Image as ImageIcon,
    ExternalLink,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Search
} from 'lucide-react';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        const { data, error } = await supabase
            .from('feedback_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setReports(data || []);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic UI Update
        const previousReports = [...reports];
        const previousSelectedReport = selectedReport;

        setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        if (selectedReport?.id === id) {
            setSelectedReport({ ...selectedReport, status: newStatus });
        }

        const { error } = await supabase
            .from('feedback_reports')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            // Revert Optimistic Update on error
            setReports(previousReports);
            setSelectedReport(previousSelectedReport);
        }
    };

    const filteredReports = reports.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    return (
        <div className="min-h-screen bg-transparent text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 bg-brand-red/10 rounded-xl flex items-center justify-center border border-brand-red/20">
                                <AlertCircle className="text-brand-red size-6" />
                            </div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Central de Anomalias</h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Gestão de Feedback e Bugs Hub Lab-Div</p>
                    </div>

                    <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                        {['all', 'open', 'in_progress', 'closed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                {f === 'all' ? 'Todos' : f === 'open' ? 'Abertos' : f === 'in_progress' ? 'Em Foco' : 'Concluídos'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List */}
                    <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 no-scrollbar">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />
                            ))
                        ) : filteredReports.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 backdrop-blur-sm">
                                <CheckCircle2 className="size-12 text-gray-700 mx-auto mb-4 opacity-20" />
                                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Sem anomalias detectadas</p>
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <m.div
                                    key={report.id}
                                    layoutId={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`p-6 rounded-[32px] border transition-all cursor-pointer group ${selectedReport?.id === report.id
                                        ? 'bg-brand-red/10 border-brand-red/30'
                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${report.type === 'bug' ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-blue/20 text-brand-blue'
                                            }`}>
                                            {report.type}
                                        </span>
                                        <span className="text-[10px] text-gray-600 font-bold uppercase">
                                            {new Date(report.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-300 line-clamp-2 mb-4 group-hover:text-white transition-colors">
                                        {report.description}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                                        <div className="flex items-center gap-2">
                                            {report.screenshot_url && <ImageIcon size={12} className="text-brand-yellow" />}
                                            <span className={report.status === 'closed' ? 'text-brand-green' : ''}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </m.div>
                            ))
                        )}
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {selectedReport ? (
                                <m.div
                                    key={selectedReport.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[40px] p-10 h-full overflow-y-auto no-scrollbar"
                                >
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Detalhes da Ocorrência</h2>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">ID: {selectedReport.id.slice(0, 8)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {['open', 'in_progress', 'closed'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(selectedReport.id, s)}
                                                    className={`size-10 rounded-xl flex items-center justify-center transition-all ${selectedReport.status === s
                                                        ? 'bg-white text-black'
                                                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                                        }`}
                                                    title={s}
                                                >
                                                    {s === 'open' ? <Clock size={18} /> : s === 'in_progress' ? <Search size={18} /> : <CheckCircle2 size={18} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Relato do Usuário</h3>
                                            <p className="text-lg font-medium text-gray-200 leading-relaxed">
                                                {selectedReport.description}
                                            </p>
                                        </div>

                                        {selectedReport.screenshot_url && (
                                            <div>
                                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Captura de Tela</h3>
                                                <a href={selectedReport.screenshot_url} target="_blank" rel="noopener noreferrer" className="block relative group rounded-3xl overflow-hidden border border-white/10">
                                                    <img src={selectedReport.screenshot_url} alt="Evidência" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink className="text-white" />
                                                    </div>
                                                </a>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Metadados de Origem</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                        <User size={14} className="text-brand-blue" />
                                                        {selectedReport.metadata?.user_email || 'Anônimo'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                        <Globe size={14} className="text-brand-blue" />
                                                        <span className="truncate">{selectedReport.metadata?.url || 'URL não capturada'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                        <Calendar size={14} className="text-brand-blue" />
                                                        {new Date(selectedReport.created_at).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Status de Operação</h3>
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${selectedReport.status === 'closed' ? 'bg-brand-green/20' : 'bg-brand-yellow/20'
                                                        }`}>
                                                        {selectedReport.status === 'closed' ? <CheckCircle2 className="text-brand-green" /> : <Clock className="text-brand-yellow" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-white">{selectedReport.status}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Detectado no Hub</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-[40px] border border-dashed border-white/5 opacity-40">
                                    <AlertCircle size={48} className="text-gray-700 mb-6" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Selecione uma anomalia para analisar</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
