'use client'

import { ShieldAlert, LogOut } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default function BlockedPage() {
    return (
        <main className="flex min-h-full flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Compte Bloqué
                    </h1>
                </div>

                <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                        Votre accès à UNIRIDE a été suspendu car votre note est descendue en dessous du seuil de sécurité de <strong>2 étoiles</strong>.
                    </p>
                    <p className="text-sm">
                        La sécurité et la confiance sont nos priorités. Un compte avec une note trop basse ne peut plus proposer ni réserver de trajets pour le moment.
                    </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                    <LogoutButton />
                    <Link
                        href="mailto:support@uniride.com"
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Contacter le support admin
                    </Link>
                </div>
            </div>
        </main>
    )
}
