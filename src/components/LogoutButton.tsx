'use client'

import { signout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    return (
        <button
            onClick={() => signout()}
            className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors"
        >
            <LogOut className="h-4 w-4" />
            <span>Se déconnecter</span>
        </button>
    )
}
