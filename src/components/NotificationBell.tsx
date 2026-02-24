'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, MessageCircle, Info } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type Notification = {
    id: string
    title: string
    content: string
    link: string | null
    is_read: boolean
    created_at: string
}

export default function NotificationBell({ userId }: { userId?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) setNotifications(data)
        }

        fetchNotifications()

        // Realtime subscription for incoming notifications
        const sub = supabase
            .channel('public:notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(sub)
        }
    }, [userId, supabase])

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    }

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    if (!userId) return null

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
                    <div
                        className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 dark:ring-white/10 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    Aucune notification
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 transition-colors ${notif.is_read ? 'bg-white dark:bg-slate-800 opacity-75' : 'bg-indigo-50/50 dark:bg-indigo-900/10'}`}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 flex-shrink-0 ${notif.is_read ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-sm ${notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        {notif.content}
                                                    </p>
                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-block mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                                        >
                                                            Voir les détails →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
