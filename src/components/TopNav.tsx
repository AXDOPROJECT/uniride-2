'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import NotificationBell from './NotificationBell'

export default function TopNav() {
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null)
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    return (
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <div className="w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                        <img src="/logo.png" alt="UR" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                        UNIRIDE
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {userId && <NotificationBell userId={userId} />}
                </div>
            </div>
        </header>
    )
}
