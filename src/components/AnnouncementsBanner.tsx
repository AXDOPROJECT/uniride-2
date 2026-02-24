'use client'

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
            const { data } = await supabase
                .from('announcements')
                .select('id, message')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (data) {
                // Check if user dismissed this specific announcement
                const isDismissed = localStorage.getItem(`dismissed_announcement_${data.id}`)
                if (!isDismissed) {
                    setAnnouncement(data)
                }
            }
        }

        fetchLatestAnnouncement()
    }, [supabase])

    if (!announcement || !isVisible) return null

    const handleDismiss = () => {
        localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true')
        setIsVisible(false)
    }

    return (
        <div className="bg-indigo-600 dark:bg-indigo-900 px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-6">
                <div className="flex items-center gap-x-3 text-sm font-medium leading-6 text-white w-full">
                    <Megaphone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <p className="flex-1">{announcement.message}</p>
                </div>
                <div className="flex flex-col sm:flex-row flex-shrink-0 items-center justify-end gap-x-4">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="-m-3 p-3 focus-visible:outline-offset-[-4px] text-indigo-100 hover:text-white transition-colors"
                    >
                        <span className="sr-only">Fermer</span>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}
