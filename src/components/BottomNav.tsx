'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Car, Bell, MessageCircle, User } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Accueil', href: '/', icon: Home, match: '/' },
        { name: 'Trajets', href: '/dashboard', icon: Car, match: '/dashboard' },
        { name: 'Alertes', href: '/alertes', icon: Bell, match: '/alertes' },
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
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95",
                                isActive
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden",
                                isActive ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30 scale-110" : "bg-transparent text-slate-400"
                            )}>
                                {item.name === 'Accueil' ? (
                                    <img
                                        src="/logo.png"
                                        alt="UR"
                                        className={cn(
                                            "w-6 h-6 object-cover rounded-md",
                                            !isActive && "grayscale opacity-70"
                                        )}
                                    />
                                ) : (
                                    <item.icon
                                        className="w-6 h-6"
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black tracking-tight transition-colors duration-300",
                                isActive ? "text-brand-purple dark:text-indigo-400 uppercase" : "text-slate-500 dark:text-zinc-500"
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
