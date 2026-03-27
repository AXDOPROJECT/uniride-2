'use client'

import { Bell, MessageSquare, ExternalLink, Check } from 'lucide-react'
import Link from 'next/link'
import { markNotificationAsRead } from '@/app/actions/alerts'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Notification = {
    id: string;
    title: string;
    content: string | null;
    link: string | null;
    is_read: boolean | null;
    created_at: string;
}

export default function NotificationsList({ notifications: initialNotifications }: { notifications: Notification[] }) {
    const router = useRouter()
    const [notifications, setNotifications] = useState(initialNotifications)

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        // Prevent navigation if the link portion is clicked
        e.preventDefault()
        e.stopPropagation()

        const { success } = await markNotificationAsRead(id)
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            router.refresh()
        }
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-700">
                    <Bell className="w-12 h-12" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight">C'est tout calme ici</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 font-bold">Vous n'avez aucune nouvelle notification.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {notifications.map((notif) => (
                <div 
                    key={notif.id}
                    className={`group relative flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 border ${
                        notif.is_read 
                        ? 'bg-transparent border-slate-100 dark:border-zinc-800' 
                        : 'bg-white dark:bg-zinc-800/50 border-brand-purple/20 shadow-sm shadow-brand-purple/5'
                    }`}
                >
                    <div className={`p-3 rounded-2xl ${
                        notif.is_read 
                        ? 'bg-slate-100/50 dark:bg-zinc-800 text-slate-400' 
                        : 'bg-brand-purple/10 text-brand-purple'
                    }`}>
                        <MessageSquare className="w-6 h-6" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-black uppercase tracking-tight text-sm ${
                                notif.is_read ? 'text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}>
                                {notif.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">
                                {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        
                        <p className={`text-sm font-medium leading-relaxed ${
                            notif.is_read ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                            {notif.content}
                        </p>

                        <div className="pt-2 flex items-center gap-4">
                            {notif.link && (
                                <Link 
                                    href={notif.link}
                                    onClick={() => !notif.is_read && markNotificationAsRead(notif.id)}
                                    className="text-xs font-black uppercase tracking-widest text-brand-purple flex items-center gap-1 hover:underline"
                                >
                                    Ouvrir <ExternalLink className="w-3 h-3" />
                                </Link>
                            )}
                            {!notif.is_read && (
                                <button 
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 hover:underline"
                                >
                                    Lu <Check className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {!notif.is_read && (
                        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                    )}
                </div>
            ))}
        </div>
    )
}
