'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookRide } from '@/app/actions/requests'
import { CreditCard, Banknote, CheckCircle2, Loader2, Info } from 'lucide-react'

export default function BookingButton({ rideId, cardEligible }: { rideId: string, cardEligible: boolean }) {
    const [isBooking, setIsBooking] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleBooking = async () => {
        setIsBooking(true)
        setError(null)

        try {
            await bookRide(rideId, paymentMethod)
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

            <div className="space-y-4 mb-6">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                    Mode de paiement
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cash'
                            ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                            : 'border-slate-100 dark:border-zinc-800 text-slate-400'
                            }`}
                    >
                        <Banknote className="w-6 h-6 mb-2" />
                        <span className="text-xs font-black uppercase">Espèces</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => cardEligible && setPaymentMethod('card')}
                        disabled={!cardEligible}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${!cardEligible
                            ? 'opacity-40 cursor-not-allowed border-slate-50 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/50'
                            : paymentMethod === 'card'
                                ? 'border-brand-purple bg-brand-purple/5 text-brand-purple'
                                : 'border-slate-100 dark:border-zinc-800 text-slate-400'
                            }`}
                    >
                        <CreditCard className="w-6 h-6 mb-2" />
                        <span className="text-xs font-black uppercase">Carte</span>
                        {!cardEligible && (
                            <span className="absolute -top-2 -right-1 bg-slate-900 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black">
                                BLOQUÉ
                            </span>
                        )}
                    </button>
                </div>

                {!cardEligible && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-[10px] text-slate-500 font-bold border border-slate-100 dark:border-zinc-800">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 text-brand-purple" />
                        <p>
                            Le paiement par carte est réservé aux passagers réguliers (au moins 2 trajets avec ce conducteur).
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full flex justify-center items-center gap-2 rounded-3xl bg-brand-purple py-5 text-lg font-black text-white shadow-xl shadow-brand-purple/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
            >
                {isBooking ? (
                    <>
                        <Loader2 className="h-6 w-6 animate-spin" /> ENVOI...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="h-6 w-6" /> RÉSERVER CE TRAJET
                    </>
                )}
            </button>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                Vous ne paierez qu'une fois la course terminée en accord avec le conducteur. (Solidaire)
            </p>
        </div>
    )
}
