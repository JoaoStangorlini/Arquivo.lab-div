'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    FlaskConical,
    Network,
    BookOpen,
    Route,
    HelpCircle,
    UserSearch,
    Map,
    ShieldAlert,
    MessageSquare,
    MessageCircle,
    Mail
} from 'lucide-react';
import { AppRoutes } from '@/types/navigation';
import { fetchRecentEntanglements } from '@/app/actions/submissions';
import { Avatar } from '../ui/Avatar';
import { supabase } from '@/lib/supabase';

const mainLinks = [
    { name: 'Fluxo', href: '/', icon: <LayoutGrid className="w-6 h-6" /> },
    { name: 'Lab-Div', href: '/arquivo-labdiv', icon: <FlaskConical className="w-6 h-6" /> },
    { name: 'Grande Colisor', href: '/colisor', icon: <Network className="w-6 h-6" /> },
    { name: 'Wiki', href: AppRoutes.WIKI, icon: <BookOpen className="w-6 h-6" /> },
    { name: 'Trilhas', href: '/trilhas', icon: <Route className="w-6 h-6" /> },
    { name: 'Pergunte', href: '/perguntas', icon: <HelpCircle className="w-6 h-6" /> },
    { name: 'Criadores', href: '/criadores', icon: <UserSearch className="w-6 h-6" /> },
    { name: 'Mapa', href: '/mapa', icon: <Map className="w-6 h-6" /> },
    { name: 'Sobre', href: '/sobre', icon: <HelpCircle className="w-6 h-6" /> },
];

const secondaryLinks = [
    { name: 'Painel Admin', href: '/admin', icon: <ShieldAlert className="w-5 h-5" /> },
];

export const SidebarLeft = ({ userId }: { userId?: string }) => {
    const pathname = usePathname();
    const [recentEntanglements, setRecentEntanglements] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const loadEntanglements = async () => {
        const data = await fetchRecentEntanglements();
        setRecentEntanglements(data);
        setIsLoading(false);
    };

    React.useEffect(() => {
        loadEntanglements();

        // Listen for new messages to update the recent list
        const channel = supabase
            .channel('sidebar_entanglements')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, () => {
                loadEntanglements();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <aside className="sticky top-24 h-[calc(100vh-6rem)] w-full flex flex-col gap-8 py-6 pr-4 overflow-y-auto hidden-scrollbar">
            {/* Primary Navigation */}
            <nav className="flex flex-col gap-1">
                {mainLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-brand-blue' : ''}`}>
                                {link.icon}
                            </span>
                            <span className={`font-bold text-base ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Entanglement Section */}
            <div className="px-4 mt-4">
                <Link
                    href="/emaranhamento"
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group mb-4 ${pathname === '/emaranhamento' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <Network className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-sm">Emaranhamento</span>
                        <span className="text-[9px] opacity-60 uppercase tracking-wider font-bold truncate">Conversas Ativas</span>
                    </div>
                    {recentEntanglements.length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5">
                            <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">{recentEntanglements.length}</span>
                            <div className="size-1.5 rounded-full bg-brand-blue animate-pulse" />
                        </div>
                    )}
                </Link>

                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Partículas Emaranhadas</h3>
                <div className="space-y-3">
                    {isLoading && recentEntanglements.length === 0 ? (
                        <div className="flex items-center gap-3 p-2 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <div className="flex flex-col gap-1">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-800 rounded" />
                                <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-900 rounded" />
                            </div>
                        </div>
                    ) : recentEntanglements.length > 0 ? (
                        recentEntanglements.map((profile) => (
                            <Link
                                key={profile.id}
                                href={`/emaranhamento?userId=${profile.id}`}
                                className={`flex items-center gap-3 p-2 rounded-2xl transition-all group relative border border-transparent hover:border-white/5 ${pathname === '/emaranhamento' && userId === profile.id ? 'bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <Avatar
                                    src={profile.avatar}
                                    name={profile.name}
                                    size="md"
                                    className="border border-white/10"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-brand-blue border-2 border-white dark:border-[#121212] rounded-full" />
                                <div className="flex flex-col overflow-hidden min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile.name}</span>
                                        {profile.lastAt && (
                                            <span className="text-[8px] text-gray-500 font-bold shrink-0">
                                                {new Date(profile.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium truncate italic opacity-80 group-hover:opacity-100">
                                        {profile.lastMessage || profile.handle}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex items-center gap-3 p-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500">Sem conexões ativas</span>
                                <span className="text-[10px] text-gray-400">Inicie um emaranhamento</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Suporte e Dúvidas */}
            <div className="px-4 mt-auto mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Suporte do hub</h3>
                <div className="space-y-1">
                    <a href="https://wa.me/5511968401823" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-colors group">
                        <MessageCircle className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        <span className="font-bold">WhatsApp Direto</span>
                    </a>
                    <a href="mailto:labdiv@usp.br" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-brand-red/10 hover:text-brand-red transition-colors group">
                        <Mail className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        <span className="font-bold">Enviar E-mail</span>
                    </a>
                </div>
            </div>

            {/* Secondary/Institutional Links */}
            <nav className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col gap-1">
                {secondaryLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-brand-blue transition-colors group"
                    >
                        <span className="opacity-60 group-hover:opacity-100">
                            {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
