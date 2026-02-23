'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, ArrowUp, User as UserIcon, Shield } from 'lucide-react';
import { EliteErrorBoundary } from '@/components/shared/EliteErrorBoundary';

interface LeaderboardEntry {
    id: string;
    full_name: string;
    avatar_url: string;
    xp: number;
    level: number;
    rank: number;
}

function LeaderboardSkeleton() {
    return (
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-2 animate-pulse">
                    <div className="h-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl" />
                </div>
            ))}
        </div>
    );
}

const List = dynamic(() => import('react-window').then(mod => mod.FixedSizeList), {
    ssr: false,
    loading: () => <LeaderboardSkeleton />
});

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, xp, level')
                    .order('xp', { ascending: false })
                    .limit(500);

                if (error) throw error;
                if (data) {
                    const ranked = data.map((item, index) => ({
                        ...item,
                        rank: index + 1
                    }));
                    setEntries(ranked);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: LeaderboardEntry[] }) => {
        if (!data || !data[index]) return null;
        const item = data[index];
        const isTop3 = item.rank <= 3;

        return (
            <div style={style} className="px-4 py-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index < 10 ? index * 0.05 : 0 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border ${isTop3
                        ? 'border-[#0055ff]/30 shadow-[0_0_15px_rgba(0,85,255,0.1)]'
                        : 'border-gray-100 dark:border-gray-800'
                        } hover:border-[#0055ff] transition-all group`}
                >
                    {/* Rank */}
                    <div className="w-8 shrink-0 flex justify-center items-center">
                        {item.rank === 1 ? (
                            <Trophy className="text-yellow-400 w-5 h-5" />
                        ) : item.rank === 2 ? (
                            <Medal className="text-gray-300 w-5 h-5" />
                        ) : item.rank === 3 ? (
                            <Medal className="text-amber-600 w-5 h-5" />
                        ) : (
                            <span className="text-gray-400 font-bold text-xs">#{item.rank}</span>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                        {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.full_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                <UserIcon size={20} />
                            </div>
                        )}
                        {isTop3 && (
                            <div className="absolute -top-1 -right-1 bg-[#0055ff] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-card-dark">
                                <Star className="text-white w-2 h-2" fill="currentColor" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 px-2 lg:px-4">
                        <h3 className="font-bold text-xs lg:text-sm truncate dark:text-gray-100 group-hover:text-[#0055ff] transition-colors line-clamp-1 overflow-hidden">
                            {item.full_name || 'Explorador Anônimo'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 font-medium capitalize">
                                Nível {item.level}
                            </span>
                            {/* Badges System (V2.7) */}
                            {item.xp > 500 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase tracking-tight">
                                    <Shield size={10} fill="currentColor" />
                                    <span>Pioneiro</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* XP Display */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <span className="text-lg font-black text-gray-900 dark:text-white">{item.xp}</span>
                            <span className="text-[10px] font-bold text-[#0055ff]">XP</span>
                        </div>
                        <div className="flex items-center gap-0.5 justify-end text-[10px] text-green-500 font-bold">
                            <ArrowUp size={10} />
                            <span>Ativo</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };



    return (
        <EliteErrorBoundary moduleName="Leaderboard">
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] pt-24 pb-12 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-12 text-center relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0055ff]/10 text-[#0055ff] rounded-full text-xs font-bold mb-4 border border-[#0055ff]/20"
                        >
                            <Trophy size={14} />
                            COMUNIDADE IFUSP
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 dark:text-white">
                            Elite do <span className="text-[#0055ff]">Hub Científico</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
                            Os maiores contribuidores do acervo. Cada submissão e interação fortalece o legado científico do Instituto.
                        </p>
                    </div>

                    {/* Leaderboard Table Header */}
                    <div className="bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl lg:flex h-[600px]">

                        {/* Sidebar Stats (Optional/Visual) */}
                        <div className="hidden lg:flex lg:w-1/3 bg-[#0055ff] p-8 flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2">Seu Ranking</h2>
                                <p className="text-white/70 text-sm mb-8">Continue contribuindo para subir no ranking global.</p>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <span className="text-white/50 text-[10px] uppercase font-bold">Total de Alunos</span>
                                        <div className="text-2xl font-black text-white">{entries.length}</div>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <span className="text-white/50 text-[10px] uppercase font-bold">Pontuação Média</span>
                                        <div className="text-2xl font-black text-white">450 XP</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex -space-x-2">
                                    {entries.slice(0, 5).map((e, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0055ff] bg-gray-200 overflow-hidden">
                                            {e.avatar_url && <img src={e.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Ranking List */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Ranking Geral</h3>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atualizado em real-time</div>
                            </div>

                            <div className="flex-1 w-full bg-white dark:bg-card-dark overflow-hidden">
                                {!isLoading ? (
                                    <List
                                        height={530}
                                        itemCount={entries.length}
                                        itemSize={84}
                                        width="100%"
                                        itemData={entries || []}
                                    >
                                        {Row as any}
                                    </List>
                                ) : entries.length === 0 && !isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                        <div className="size-20 bg-[#0055ff]/10 rounded-full flex items-center justify-center mb-6 border border-[#0055ff]/20 animate-pulse">
                                            <Trophy className="text-[#0055ff] size-10" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
                                            Arena Vazia
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                            Nenhum explorador alcançou o topo ainda. Seja o primeiro a dominar esta temporada!
                                        </p>
                                    </div>
                                ) : (
                                    <LeaderboardSkeleton />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EliteErrorBoundary>
    );
}
