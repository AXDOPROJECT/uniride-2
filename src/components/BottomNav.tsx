'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Home, Car, Bell, MessageCircle, User } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function BottomNav({ userId }: { userId?: string }) {
    const pathname = usePathname()
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        const fetchUnreadCount = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)
            
            setUnreadCount(count || 0)
        }

        fetchUnreadCount()

        const sub = supabase
            .channel('bottom-nav-notifications')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, () => {
                fetchUnreadCount()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(sub)
        }
    }, [userId, supabase])

    const navItems = [
        { name: 'Accueil', href: '/', icon: Home, match: '/' },
        { name: 'Trajets', href: '/dashboard', icon: Car, match: '/dashboard' },
        { name: 'Alertes', href: '/alertes', icon: Bell, match: '/alertes', badge: unreadCount },
        { name: 'Messages', href: '/messages', icon: MessageCircle, match: '/messages' },
        { name: 'Profil', href: '/profil', icon: User, match: '/profil' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/20 dark:border-zinc-800/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.match || (item.name === 'Trajets' && pathname.startsWith('/dashboard'))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 group relative"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 transition-all duration-300 flex items-center justify-center overflow-visible",
                                isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                            )}>
                                {item.name === 'Accueil' ? (
                                    <div className={cn(
                                        "w-6 h-6 rounded-md overflow-hidden ring-1 shadow-lg transition-all",
                                        isActive ? "ring-[#3B82F6] shadow-[#3B82F6]/50" : "ring-white/10 opacity-70"
                                    )}>
                                        <img src="/logo.png" alt="UR" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <item.icon
                                            className={cn(
                                                "w-6 h-6 transition-colors duration-300",
                                                isActive ? "text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-[#9CA3AF]"
                                            )}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-1 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black tracking-tight transition-colors duration-300",
                                isActive ? "text-[#3B82F6] drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]" : "text-[#9CA3AF]"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
