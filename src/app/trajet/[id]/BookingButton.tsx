'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookRide } from '@/app/actions/requests'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function BookingButton({ rideId }: { rideId: string }) {
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleBooking = async () => {
        setIsBooking(true)
        setError(null)

        try {
            await bookRide(rideId)
            // Router will be refreshed by revalidatePath in the Server Action
            // But we do an explicit refresh to ensure instantaneous state catch-up on the client side
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue lors de la réservation.")
            setIsBooking(false)
        }
    }

    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 text-sm font-medium text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-200 dark:border-red-800/30 text-center">
                    {error}
                </div>
            )}

            <button
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
                {isBooking ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours...</>
                ) : (
                    <><CheckCircle2 className="h-5 w-5" /> Réserver ce trajet</>
                )}
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                Vous ne paierez qu'une fois la course terminée en accord avec le conducteur. (Solidaire)
            </p>
        </div>
    )
}
