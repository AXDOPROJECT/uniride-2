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
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 group"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 transition-all duration-300 flex items-center justify-center overflow-hidden",
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
                                    <item.icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            isActive ? "text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-[#9CA3AF]"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
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
