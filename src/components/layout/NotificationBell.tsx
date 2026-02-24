'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { fetchNotifications, markNotificationAsRead, getUnreadCount } from '@/app/actions/notifications';
import { supabase } from '@/lib/supabase';
import { useHistoryBack } from '@/hooks/useHistoryBack';

export const NotificationBell = ({ userId }: { userId: string | undefined }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // [B14] Support hardware back button to close the menu
    useHistoryBack(isOpen, () => setIsOpen(false));

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Initial fetch
        const load = async () => {
            try {
                const [list, count] = await Promise.all([
                    fetchNotifications(userId),
                    getUnreadCount(userId)
                ]);
                setNotifications(list);
                setUnreadCount(count);
            } catch (err) {
                console.error('Error loading notifications:', err);
            }
        };
        load();

        // Realtime subscription
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, async (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    const handleMarkAsRead = async (id: string) => {
        if (!userId) return;
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
            >
                <span className="material-symbols-outlined text-[26px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 size-5 bg-brand-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-background-dark">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[100] origin-top-right"
                    >
                        {!userId ? (
                            // [I01] Sininho Gatekeeper - Guest State
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="material-symbols-outlined text-3xl">login</span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fique por dentro!</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Faça login para receber notificações sobre likes, comentários e aprovações no acervo.
                                </p>
                                <Link
                                    href="/login"
                                    className="block w-full py-3 bg-brand-blue text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                >
                                    ENTRAR NO LAB-DIV
                                </Link>
                            </div>
                        ) : (
                            // Logged In State
                            <>
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Notificações</span>
                                    <button className="text-[10px] font-bold text-brand-blue hover:underline">Marcar todas como lidas</button>
                                </div>

                                <div className="max-h-96 overflow-y-auto no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400">
                                            <span className="material-symbols-outlined text-4xl opacity-20 block mb-2">notifications_off</span>
                                            <p className="text-xs font-medium">Nada por aqui ainda.</p>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <Link
                                                key={notif.id}
                                                href={notif.link || '#'}
                                                onClick={() => {
                                                    handleMarkAsRead(notif.id);
                                                    setIsOpen(false);
                                                }}
                                                className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50 relative ${!notif.is_read ? 'bg-brand-blue/5' : ''}`}
                                            >
                                                <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'kudos' ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-brand-blue/20 text-brand-blue'
                                                    }`}>
                                                    <span className="material-symbols-outlined filled">
                                                        {notif.type === 'kudos' ? 'workspace_premium' : 'sell'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight mb-0.5">{notif.title}</p>
                                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">{notif.message}</p>
                                                    <p className="text-[9px] text-gray-400 mt-1 font-medium">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="size-2 bg-brand-blue rounded-full absolute top-4 right-4" />
                                                )}
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
