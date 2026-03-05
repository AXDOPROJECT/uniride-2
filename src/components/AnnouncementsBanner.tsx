'use client'

// Cache-bust: v1772465000
import { useState, useEffect } from 'react'
import { Megaphone, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type Announcement = {
    id: string
    message: string
}

export default function AnnouncementsBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchLatestAnnouncement = async () => {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)

            if (error) {
                console.error("Error fetching announcement:", error);
                return;
            }

            if (data && data.length > 0) {
                const latest = data[0]
                const messageText = latest.message || latest.content || "";

                if (messageText) {
                    const isDismissed = localStorage.getItem(`dismissed_announcement_${latest.id}`)
                    if (!isDismissed) {
                        setAnnouncement({ id: latest.id, message: messageText })
                    }
                }
            }
        }

        fetchLatestAnnouncement()
    }, [supabase])

    const displayMessage = announcement?.message || "Bienvenue sur UNIRIDE ! Le covoiturage étudiant sécurisé et solidaire."

    if (!isVisible) return null

    const handleDismiss = () => {
        if (announcement) {
            localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true')
        }
        setIsVisible(false)
    }

    return (
        <div className="bg-slate-900 dark:bg-black border-y border-brand-lime/20 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-6">
                <div className="flex items-center gap-x-3 text-[11px] font-black leading-6 text-white uppercase tracking-wider w-full">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-brand-lime flex items-center justify-center">
                        <Megaphone className="h-3.5 w-3.5 text-black" aria-hidden="true" />
                    </div>
                    <p className="flex-1 truncate">{displayMessage}</p>
                </div>
                <div className="flex flex-shrink-0 items-center justify-end">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="sr-only">Fermer</span>
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}
