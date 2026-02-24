'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Car, MessageCircle, User } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Accueil', href: '/', icon: Home, match: '/' },
        { name: 'Trajets', href: '/dashboard', icon: Car, match: '/dashboard' },
        { name: 'Messages', href: '/messages', icon: MessageCircle, match: '/messages' },
        { name: 'Profil', href: '/dashboard#profil', icon: User, match: '/profil' }, // Using a hash or subroute, will highlight if pathname contains profil or if we handle it
    ]

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    // Custom active logic:
                    // If dashboard, it's active. If we add a true /profil route later, this scales.
                    const isActive = pathname === item.match || (item.name === 'Trajets' && pathname === '/dashboard')
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 py-1 transition-colors",
                                isActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "fill-indigo-600/20")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium leading-none">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
